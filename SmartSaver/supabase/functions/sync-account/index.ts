/*
  # Account Sync Service
  
  This function handles synchronization of account data from various providers:
  - Plaid for US bank accounts
  - Yodlee for international banking
  - Salt Edge for European banks
  - Manual entry for crypto and other accounts
*/

import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface SyncRequest {
  accountId: string;
  syncType?: 'full' | 'incremental' | 'balance_only';
}

interface PlaidTransaction {
  transaction_id: string;
  amount: number;
  date: string;
  name: string;
  merchant_name?: string;
  category: string[];
  account_id: string;
  pending: boolean;
}

interface YodleeTransaction {
  id: string;
  amount: { amount: number; currency: string };
  date: string;
  description: { original: string };
  merchant?: { name: string };
  category: string;
  accountId: string;
  status: string;
}

const mapPlaidCategory = (categories: string[]): string => {
  const categoryMap: { [key: string]: string } = {
    'Food and Drink': 'Food',
    'Restaurants': 'Food',
    'Groceries': 'Food',
    'Transportation': 'Transport',
    'Gas Stations': 'Transport',
    'Entertainment': 'Entertainment',
    'Shopping': 'Shopping',
    'Healthcare': 'Healthcare',
    'Rent': 'Rent',
    'Utilities': 'Utilities',
    'Travel': 'Travel',
    'Education': 'Education'
  };

  for (const category of categories) {
    if (categoryMap[category]) {
      return categoryMap[category];
    }
  }
  return 'Other';
};

const syncPlaidAccount = async (account: any, supabase: any): Promise<{ success: boolean; transactionCount: number; error?: string }> => {
  try {
    // Mock Plaid API call - in production, use actual Plaid client
    const mockTransactions: PlaidTransaction[] = [
      {
        transaction_id: 'plaid_tx_1',
        amount: -25.50,
        date: '2024-01-15',
        name: 'Starbucks Coffee',
        merchant_name: 'Starbucks',
        category: ['Food and Drink', 'Restaurants', 'Coffee'],
        account_id: account.provider_account_id,
        pending: false
      },
      {
        transaction_id: 'plaid_tx_2',
        amount: -85.00,
        date: '2024-01-14',
        name: 'Shell Gas Station',
        merchant_name: 'Shell',
        category: ['Transportation', 'Gas Stations'],
        account_id: account.provider_account_id,
        pending: false
      },
      {
        transaction_id: 'plaid_tx_3',
        amount: 2500.00,
        date: '2024-01-13',
        name: 'Direct Deposit Payroll',
        category: ['Deposit', 'Payroll'],
        account_id: account.provider_account_id,
        pending: false
      }
    ];

    let syncedCount = 0;

    for (const transaction of mockTransactions) {
      const { error } = await supabase
        .from('account_transactions')
        .upsert({
          user_id: account.user_id,
          account_id: account.id,
          transaction_id: transaction.transaction_id,
          amount: transaction.amount,
          currency: 'USD',
          description: transaction.name,
          merchant_name: transaction.merchant_name,
          category_primary: mapPlaidCategory(transaction.category),
          category_detailed: transaction.category.join(' > '),
          transaction_type: transaction.amount > 0 ? 'credit' : 'debit',
          transaction_date: transaction.date,
          pending: transaction.pending,
          metadata: { provider: 'plaid', original_category: transaction.category }
        }, {
          onConflict: 'account_id,transaction_id'
        });

      if (!error) {
        syncedCount++;
      }
    }

    // Update account balance (mock data)
    await supabase
      .from('connected_accounts')
      .update({
        balance: 2450.75,
        available_balance: 2450.75,
        last_synced_at: new Date().toISOString(),
        sync_status: 'success'
      })
      .eq('id', account.id);

    return { success: true, transactionCount: syncedCount };
  } catch (error) {
    console.error('Plaid sync error:', error);
    return { success: false, transactionCount: 0, error: error.message };
  }
};

const syncYodleeAccount = async (account: any, supabase: any): Promise<{ success: boolean; transactionCount: number; error?: string }> => {
  try {
    // Mock Yodlee API call
    const mockTransactions: YodleeTransaction[] = [
      {
        id: 'yodlee_tx_1',
        amount: { amount: -45.20, currency: 'USD' },
        date: '2024-01-15',
        description: { original: 'Amazon Purchase' },
        merchant: { name: 'Amazon' },
        category: 'SHOPPING',
        accountId: account.provider_account_id,
        status: 'POSTED'
      },
      {
        id: 'yodlee_tx_2',
        amount: { amount: -120.00, currency: 'USD' },
        date: '2024-01-14',
        description: { original: 'Electric Bill Payment' },
        category: 'UTILITIES',
        accountId: account.provider_account_id,
        status: 'POSTED'
      }
    ];

    let syncedCount = 0;

    for (const transaction of mockTransactions) {
      const { error } = await supabase
        .from('account_transactions')
        .upsert({
          user_id: account.user_id,
          account_id: account.id,
          transaction_id: transaction.id,
          amount: transaction.amount.amount,
          currency: transaction.amount.currency,
          description: transaction.description.original,
          merchant_name: transaction.merchant?.name,
          category_primary: transaction.category.toLowerCase().replace('_', ' '),
          transaction_type: transaction.amount.amount > 0 ? 'credit' : 'debit',
          transaction_date: transaction.date,
          pending: transaction.status === 'PENDING',
          metadata: { provider: 'yodlee', original_category: transaction.category }
        }, {
          onConflict: 'account_id,transaction_id'
        });

      if (!error) {
        syncedCount++;
      }
    }

    return { success: true, transactionCount: syncedCount };
  } catch (error) {
    console.error('Yodlee sync error:', error);
    return { success: false, transactionCount: 0, error: error.message };
  }
};

const syncCryptoAccount = async (account: any, supabase: any): Promise<{ success: boolean; transactionCount: number; error?: string }> => {
  try {
    // Mock crypto API call (could integrate with CoinGecko, CoinMarketCap, etc.)
    const mockTransactions = [
      {
        transaction_id: 'crypto_tx_1',
        amount: 0.025,
        currency: 'BTC',
        description: 'Bitcoin Purchase',
        transaction_date: '2024-01-15',
        usd_value: 1250.00
      },
      {
        transaction_id: 'crypto_tx_2',
        amount: -0.01,
        currency: 'BTC',
        description: 'Bitcoin Transfer',
        transaction_date: '2024-01-14',
        usd_value: -500.00
      }
    ];

    let syncedCount = 0;

    for (const transaction of mockTransactions) {
      const { error } = await supabase
        .from('account_transactions')
        .upsert({
          user_id: account.user_id,
          account_id: account.id,
          transaction_id: transaction.transaction_id,
          amount: transaction.usd_value,
          currency: 'USD',
          description: transaction.description,
          category_primary: 'Investment',
          transaction_type: transaction.amount > 0 ? 'credit' : 'debit',
          transaction_date: transaction.transaction_date,
          pending: false,
          metadata: { 
            provider: 'crypto', 
            crypto_amount: transaction.amount,
            crypto_currency: transaction.currency
          }
        }, {
          onConflict: 'account_id,transaction_id'
        });

      if (!error) {
        syncedCount++;
      }
    }

    return { success: true, transactionCount: syncedCount };
  } catch (error) {
    console.error('Crypto sync error:', error);
    return { success: false, transactionCount: 0, error: error.message };
  }
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { accountId, syncType = 'incremental' }: SyncRequest = await req.json();

    if (!accountId) {
      throw new Error('Account ID is required');
    }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get account details
    const { data: account, error: accountError } = await supabaseClient
      .from('connected_accounts')
      .select('*')
      .eq('id', accountId)
      .single();

    if (accountError || !account) {
      throw new Error('Account not found');
    }

    // Log sync start
    const { data: syncLog } = await supabaseClient
      .from('sync_logs')
      .insert({
        user_id: account.user_id,
        account_id: accountId,
        sync_type: syncType,
        status: 'started',
        started_at: new Date().toISOString()
      })
      .select()
      .single();

    // Update account sync status
    await supabaseClient
      .from('connected_accounts')
      .update({ sync_status: 'syncing' })
      .eq('id', accountId);

    let result: { success: boolean; transactionCount: number; error?: string };

    // Sync based on provider
    switch (account.provider) {
      case 'plaid':
        result = await syncPlaidAccount(account, supabaseClient);
        break;
      case 'yodlee':
        result = await syncYodleeAccount(account, supabaseClient);
        break;
      case 'salt_edge':
        // Similar implementation for Salt Edge
        result = { success: true, transactionCount: 0 };
        break;
      case 'manual':
        if (account.account_type === 'crypto') {
          result = await syncCryptoAccount(account, supabaseClient);
        } else {
          result = { success: true, transactionCount: 0 };
        }
        break;
      default:
        throw new Error(`Unsupported provider: ${account.provider}`);
    }

    // Update sync log
    await supabaseClient
      .from('sync_logs')
      .update({
        status: result.success ? 'success' : 'error',
        transactions_synced: result.transactionCount,
        error_message: result.error,
        completed_at: new Date().toISOString()
      })
      .eq('id', syncLog.id);

    // Update account sync status
    await supabaseClient
      .from('connected_accounts')
      .update({
        sync_status: result.success ? 'success' : 'error',
        last_synced_at: new Date().toISOString()
      })
      .eq('id', accountId);

    return new Response(
      JSON.stringify({
        success: result.success,
        transactionCount: result.transactionCount,
        error: result.error
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      },
    );
  } catch (error) {
    console.error('Sync account error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to sync account'
      }),
      {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      },
    );
  }
});