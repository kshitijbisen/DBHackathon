import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Expense } from '../types';
import { useAuth } from './useAuth';
import { useNotifications } from './useNotifications';

export const useExpenses = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { sendNotification } = useNotifications();

  const fetchExpenses = async () => {
    if (!user) {
      setExpenses([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (fetchError) {
        console.error('Supabase fetch error:', fetchError);
        throw new Error(`Database error: ${fetchError.message}`);
      }

      const formattedExpenses: Expense[] = (data || []).map(expense => ({
        id: expense.id,
        amount: expense.amount,
        category: expense.category,
        date: expense.date,
        notes: expense.notes || undefined,
      }));

      setExpenses(formattedExpenses);
      setError(null);
    } catch (err) {
      console.error('Error fetching expenses:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch expenses. Please check your connection.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const addExpense = async (expenseData: Omit<Expense, 'id'>) => {
    if (!user) return { error: 'User not authenticated' };

    try {
      const { data, error } = await supabase
        .from('expenses')
        .insert({
          user_id: user.id,
          amount: expenseData.amount,
          category: expenseData.category,
          date: expenseData.date,
          notes: expenseData.notes || null,
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase insert error:', error);
        throw new Error(`Database error: ${error.message}`);
      }

      const newExpense: Expense = {
        id: data.id,
        amount: data.amount,
        category: data.category,
        date: data.date,
        notes: data.notes || undefined,
      };

      setExpenses(prev => [newExpense, ...prev]);

      // Send email notification for expense added
      try {
        await sendNotification('expense_added', {
          amount: newExpense.amount,
          category: newExpense.category,
          date: newExpense.date,
          notes: newExpense.notes
        });
      } catch (notificationError) {
        console.warn('Failed to send expense notification:', notificationError);
        // Don't fail the expense creation if notification fails
      }

      return { data: newExpense, error: null };
    } catch (err) {
      console.error('Error adding expense:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to add expense';
      setError(errorMessage);
      return { error: errorMessage };
    }
  };

  const updateExpense = async (id: string, updates: Partial<Omit<Expense, 'id'>>) => {
    if (!user) return { error: 'User not authenticated' };

    try {
      const { data, error } = await supabase
        .from('expenses')
        .update({
          amount: updates.amount,
          category: updates.category,
          date: updates.date,
          notes: updates.notes || null,
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Supabase update error:', error);
        throw new Error(`Database error: ${error.message}`);
      }

      const updatedExpense: Expense = {
        id: data.id,
        amount: data.amount,
        category: data.category,
        date: data.date,
        notes: data.notes || undefined,
      };

      setExpenses(prev => prev.map(exp => exp.id === id ? updatedExpense : exp));
      return { data: updatedExpense, error: null };
    } catch (err) {
      console.error('Error updating expense:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update expense';
      setError(errorMessage);
      return { error: errorMessage };
    }
  };

  const deleteExpense = async (id: string) => {
    if (!user) return { error: 'User not authenticated' };

    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Supabase delete error:', error);
        throw new Error(`Database error: ${error.message}`);
      }

      setExpenses(prev => prev.filter(exp => exp.id !== id));
      return { error: null };
    } catch (err) {
      console.error('Error deleting expense:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete expense';
      setError(errorMessage);
      return { error: errorMessage };
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [user]);

  return {
    expenses,
    loading,
    error,
    addExpense,
    updateExpense,
    deleteExpense,
    refetch: fetchExpenses,
  };
};