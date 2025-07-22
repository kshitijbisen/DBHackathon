import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { 
  NotificationPreferences, 
  AlertRule, 
  Notification, 
  RecurringBill,
  NotificationSummary 
} from '../types/notifications';
import { useAuth } from './useAuth';

export const useNotificationSystem = () => {
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [alertRules, setAlertRules] = useState<AlertRule[]>([]);
  const [recurringBills, setRecurringBills] = useState<RecurringBill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const channelRef = useRef<any>(null);

  const fetchPreferences = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        // Create default preferences
        const { data: newPrefs, error: createError } = await supabase
          .from('notification_preferences')
          .insert({ user_id: user.id })
          .select()
          .single();

        if (createError) throw createError;
        setPreferences(newPrefs);
      } else {
        setPreferences(data);
      }
    } catch (err) {
      console.error('Error fetching preferences:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch preferences');
    }
  };

  const fetchNotifications = async (limit = 50) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      setNotifications(data || []);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch notifications');
    }
  };

  const fetchAlertRules = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('alert_rules')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAlertRules(data || []);
    } catch (err) {
      console.error('Error fetching alert rules:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch alert rules');
    }
  };

  const fetchRecurringBills = async () => {
    if (!user) return;

    try {
      // Check if Supabase client is properly configured
      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }

      const { data, error } = await supabase
        .from('recurring_bills')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('next_due_date', { ascending: true });

      if (error) throw error;
      setRecurringBills(data || []);
    } catch (err) {
      console.error('Error fetching recurring bills:', err);
      // Don't set the main error state for this specific fetch failure
      // Just log it and continue with empty array
      setRecurringBills([]);
    }
  };

  const updatePreferences = async (updates: Partial<NotificationPreferences>) => {
    if (!user || !preferences) return { error: 'No preferences to update' };

    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      setPreferences(data);
      return { data, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update preferences';
      setError(errorMessage);
      return { error: errorMessage };
    }
  };

  const createAlertRule = async (rule: Omit<AlertRule, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return { error: 'User not authenticated' };

    try {
      const { data, error } = await supabase
        .from('alert_rules')
        .insert({
          user_id: user.id,
          ...rule
        })
        .select()
        .single();

      if (error) throw error;
      setAlertRules(prev => [data, ...prev]);
      return { data, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create alert rule';
      setError(errorMessage);
      return { error: errorMessage };
    }
  };

  const updateAlertRule = async (id: string, updates: Partial<AlertRule>) => {
    if (!user) return { error: 'User not authenticated' };

    try {
      const { data, error } = await supabase
        .from('alert_rules')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      setAlertRules(prev => prev.map(rule => rule.id === id ? data : rule));
      return { data, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update alert rule';
      setError(errorMessage);
      return { error: errorMessage };
    }
  };

  const deleteAlertRule = async (id: string) => {
    if (!user) return { error: 'User not authenticated' };

    try {
      const { error } = await supabase
        .from('alert_rules')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      setAlertRules(prev => prev.filter(rule => rule.id !== id));
      return { error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete alert rule';
      setError(errorMessage);
      return { error: errorMessage };
    }
  };

  const markNotificationAsRead = async (id: string) => {
    if (!user) return { error: 'User not authenticated' };

    try {
      const { data, error } = await supabase
        .from('notifications')
        .update({ 
          read_at: new Date().toISOString(),
          action_taken: 'viewed'
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      setNotifications(prev => prev.map(notif => notif.id === id ? data : notif));
      return { data, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to mark notification as read';
      setError(errorMessage);
      return { error: errorMessage };
    }
  };

  const dismissNotification = async (id: string) => {
    if (!user) return { error: 'User not authenticated' };

    try {
      const { data, error } = await supabase
        .from('notifications')
        .update({ 
          dismissed_at: new Date().toISOString(),
          action_taken: 'dismissed'
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      setNotifications(prev => prev.map(notif => notif.id === id ? data : notif));
      return { data, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to dismiss notification';
      setError(errorMessage);
      return { error: errorMessage };
    }
  };

  const testNotification = async (type: string) => {
    if (!user) return { error: 'User not authenticated' };

    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/notification-engine`;
      
      const headers = {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          type: 'test_notification',
          userId: user.id,
          testMode: true
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send test notification');
      }

      const result = await response.json();
      
      // Refresh notifications to show the new test notification
      await fetchNotifications();
      
      return { data: result, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send test notification';
      setError(errorMessage);
      return { error: errorMessage };
    }
  };

  const getNotificationSummary = (): NotificationSummary => {
    const unread_count = notifications.filter(n => !n.read_at && !n.dismissed_at).length;
    const urgent_count = notifications.filter(n => n.priority === 'urgent' && !n.read_at && !n.dismissed_at).length;
    const recent_notifications = notifications.filter(n => !n.dismissed_at).slice(0, 5);
    const alert_rules_active = alertRules.filter(r => r.is_active).length;
    const last_notification_at = notifications.find(n => !n.dismissed_at)?.created_at;

    return {
      unread_count,
      urgent_count,
      recent_notifications,
      alert_rules_active,
      last_notification_at
    };
  };

  const setupRealtimeSubscription = () => {
    if (!user) return () => {};

    try {
      // Use a stable channel name based on user ID
      const channelName = `notifications:${user.id}`;

      // Clean up existing channel if it exists
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }

      // Check for and remove any existing channels with the same name
      const existingChannels = supabase.getChannels();
      const existingChannel = existingChannels.find(ch => ch.topic === channelName);
      if (existingChannel) {
        supabase.removeChannel(existingChannel);
      }

      // Create a new channel with the stable name
      const channel = supabase.channel(channelName);

      // Set up the postgres changes listener
      channel.on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          setNotifications(prev => [payload.new as Notification, ...prev]);
        }
      );

      // Check if channel is already subscribed before subscribing
      if (channel.state !== 'subscribed' && channel.state !== 'joining') {
        // Subscribe to the channel
        channel.subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log('Successfully subscribed to notifications channel');
          } else if (status === 'CHANNEL_ERROR') {
            console.error('Error subscribing to notifications channel');
          }
        });
      }

      // Store the channel reference
      channelRef.current = channel;

      // Return cleanup function
      return () => {
        if (channelRef.current) {
          supabase.removeChannel(channelRef.current);
          channelRef.current = null;
        }
      };
    } catch (err) {
      console.error('Error setting up realtime subscription:', err);
      return () => {}; // Return empty cleanup function
    }
  };

  useEffect(() => {
    if (user) {
      setLoading(true);
      setError(null); // Clear any previous errors
      
      // Fetch data with proper error handling
      Promise.allSettled([
        fetchPreferences(),
        fetchNotifications(),
        fetchAlertRules(),
        fetchRecurringBills()
      ]).then((results) => {
        // Check if any critical operations failed
        const criticalFailures = results.slice(0, 3).filter(result => result.status === 'rejected');
        if (criticalFailures.length > 0) {
          console.error('Some critical operations failed:', criticalFailures);
        }
      }).finally(() => {
        setLoading(false);
      });

      // Setup real-time subscription with error handling
      const unsubscribe = setupRealtimeSubscription();
      return unsubscribe;
    } else {
      // Clean up when user logs out
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    }
  }, [user]);

  return {
    preferences,
    notifications,
    alertRules,
    recurringBills,
    loading,
    error,
    updatePreferences,
    createAlertRule,
    updateAlertRule,
    deleteAlertRule,
    markNotificationAsRead,
    dismissNotification,
    testNotification,
    getNotificationSummary,
    refetch: () => {
      setError(null);
      Promise.allSettled([
        fetchPreferences(),
        fetchNotifications(),
        fetchAlertRules(),
        fetchRecurringBills()
      ]);
    }
  };
};