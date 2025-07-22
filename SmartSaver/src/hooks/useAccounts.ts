import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ConnectedAccount, AccountTransaction, AccountFilter, AccountSummary } from '../types/accounts';
import { useAuth } from './useAuth';

export const useAccounts = () => {
  const [accounts, setAccounts] = useState<ConnectedAccount[]>([]);
  const [transactions, setTransactions] = useState<AccountTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchAccounts = async () => {
    if (!user) {
      setAccounts([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from('connected_accounts')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw new Error(`Database error: ${fetchError.message}`);
      }

      setAccounts(data || []);
    } catch (err) {
      console.error('Error fetching accounts:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch accounts';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async (filter?: AccountFilter) => {
    if (!user) {
      setTransactions([]);
      return;
    }

    try {
      let query = supabase
        .from('account_transactions')
        .select(`
          *,
          connected_accounts!inner(
            institution_name,
            account_name,
            account_type
          )
        `)
        .eq('user_id', user.id)
        .order('transaction_date', { ascending: false });

      // Apply filters
      if (filter?.dateRange) {
        query = query
          .gte('transaction_date', filter.dateRange.start)
          .lte('transaction_date', filter.dateRange.end);
      }

      if (filter?.categories && filter.categories.length > 0) {
        query = query.in('category_primary', filter.categories);
      }

      if (filter?.amountRange) {
        query = query
          .gte('amount', filter.amountRange.min)
          .lte('amount', filter.amountRange.max);
      }

      const { data, error: fetchError } = await query.limit(1000);

      if (fetchError) {
        throw new Error(`Database error: ${fetchError.message}`);
      }

      setTransactions(data || []);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch transactions';
      setError(errorMessage);
    }
  };

  const addAccount = async (accountData: Partial<ConnectedAccount>) => {
    if (!user) return { error: 'User not authenticated' };

    try {
      const { data, error } = await supabase
        .from('connected_accounts')
        .insert({
          user_id: user.id,
          ...accountData,
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      setAccounts(prev => [data, ...prev]);
      return { data, error: null };
    } catch (err) {
      console.error('Error adding account:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to add account';
      setError(errorMessage);
      return { error: errorMessage };
    }
  };

  const updateAccount = async (id: string, updates: Partial<ConnectedAccount>) => {
    if (!user) return { error: 'User not authenticated' };

    try {
      const { data, error } = await supabase
        .from('connected_accounts')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      setAccounts(prev => prev.map(acc => acc.id === id ? data : acc));
      return { data, error: null };
    } catch (err) {
      console.error('Error updating account:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update account';
      setError(errorMessage);
      return { error: errorMessage };
    }
  };

  const deleteAccount = async (id: string) => {
    if (!user) return { error: 'User not authenticated' };

    try {
      const { error } = await supabase
        .from('connected_accounts')
        .update({ is_active: false })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      setAccounts(prev => prev.filter(acc => acc.id !== id));
      return { error: null };
    } catch (err) {
      console.error('Error deleting account:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete account';
      setError(errorMessage);
      return { error: errorMessage };
    }
  };

  const syncAccount = async (accountId: string) => {
    if (!user) return { error: 'User not authenticated' };

    try {
      // Update sync status to 'syncing'
      await updateAccount(accountId, { sync_status: 'syncing' });

      // Call sync service
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sync-account`;
      
      const headers = {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({ accountId })
      });

      if (!response.ok) {
        throw new Error('Failed to sync account');
      }

      const result = await response.json();
      
      // Update sync status based on result
      await updateAccount(accountId, { 
        sync_status: result.success ? 'success' : 'error',
        last_synced_at: new Date().toISOString()
      });

      return { error: null };
    } catch (err) {
      console.error('Error syncing account:', err);
      await updateAccount(accountId, { sync_status: 'error' });
      const errorMessage = err instanceof Error ? err.message : 'Failed to sync account';
      setError(errorMessage);
      return { error: errorMessage };
    }
  };

  const getAccountSummary = (): AccountSummary => {
    const totalBalance = accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);
    const totalAvailable = accounts.reduce((sum, acc) => sum + (acc.available_balance || 0), 0);
    const totalCredit = accounts
      .filter(acc => acc.account_type === 'credit')
      .reduce((sum, acc) => sum + (acc.credit_limit || 0), 0);

    const accountsByType = accounts.reduce((acc, account) => {
      acc[account.account_type] = (acc[account.account_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const accountsByInstitution = accounts.reduce((acc, account) => {
      acc[account.institution_name] = (acc[account.institution_name] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const recentTransactions = transactions.slice(0, 10);

    const lastSync = accounts.reduce((latest, acc) => {
      if (!acc.last_synced_at) return latest;
      return !latest || new Date(acc.last_synced_at) > new Date(latest) 
        ? acc.last_synced_at 
        : latest;
    }, '');

    const accountsNeedingSync = accounts.filter(acc => 
      acc.sync_status === 'error' || 
      !acc.last_synced_at ||
      new Date(acc.last_synced_at) < new Date(Date.now() - 24 * 60 * 60 * 1000) // 24 hours ago
    ).length;

    return {
      totalBalance,
      totalAvailable,
      totalCredit,
      accountsByType,
      accountsByInstitution,
      recentTransactions,
      syncStatus: {
        lastSync,
        accountsNeedingSync,
        totalAccounts: accounts.length
      }
    };
  };

  useEffect(() => {
    fetchAccounts();
  }, [user]);

  useEffect(() => {
    if (accounts.length > 0) {
      fetchTransactions();
    }
  }, [accounts]);

  return {
    accounts,
    transactions,
    loading,
    error,
    addAccount,
    updateAccount,
    deleteAccount,
    syncAccount,
    fetchTransactions,
    getAccountSummary,
    refetch: fetchAccounts,
  };
};