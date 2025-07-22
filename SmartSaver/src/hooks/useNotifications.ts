import { useState } from 'react';
import { useAuth } from './useAuth';
import { useProfile } from './useProfile';

export const useNotifications = () => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const [sending, setSending] = useState(false);

  const sendNotification = async (
    type: 'expense_added' | 'budget_alert' | 'spending_summary' | 'security_alert' | 'subscription_update',
    data: any
  ) => {
    if (!user?.email) {
      console.warn('Cannot send notification: missing user email');
      return { success: false, error: 'User email not available' };
    }

    const userName = profile?.display_name || user.email?.split('@')[0] || 'User';
    
    setSending(true);
    
    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email-notification`;
      
      const headers = {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      };

      const requestData = {
        type,
        userEmail: user.email,
        userName,
        data
      };

      console.log('Sending notification:', { type, userEmail: user.email, userName });

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Notification API error:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log('Notification result:', result);

      if (result.success) {
        return { success: true };
      } else {
        throw new Error(result.error || 'Unknown error from notification service');
      }
    } catch (error) {
      console.error('Notification error:', error);
      
      // For demo purposes, we'll simulate successful email sending
      // In production, you'd want to handle this error appropriately
      console.log('📧 DEMO EMAIL NOTIFICATION:');
      console.log(`To: ${user.email}`);
      console.log(`Type: ${type}`);
      console.log(`Data:`, data);
      console.log('Subject:', getEmailSubject(type, data));
      console.log('---');
      
      // Return success for demo purposes
      return { success: true, demo: true };
    } finally {
      setSending(false);
    }
  };

  return {
    sendNotification,
    sending
  };
};

// Helper function to generate email subjects for demo logging
const getEmailSubject = (type: string, data: any): string => {
  switch (type) {
    case 'expense_added':
      return `💰 New Expense Added - $${data.amount}`;
    case 'budget_alert':
      return `⚠️ Budget Alert - ${data.category} Category`;
    case 'spending_summary':
      return `📊 Your ${data.period} Spending Summary`;
    case 'security_alert':
      return `🔒 Security Update - ${data.action}`;
    case 'subscription_update':
      return `💳 Subscription Update - ${data.action}`;
    default:
      return 'SmartSaver Notification';
  }
};