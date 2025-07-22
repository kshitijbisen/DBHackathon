/*
  # Real-Time Notification Engine
  
  This function monitors financial activity and triggers intelligent notifications:
  - Low balance alerts
  - Suspicious activity detection
  - Overspending alerts
  - Recurring bill reminders
  - Large transaction alerts
*/

import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface NotificationRequest {
  type: 'check_all' | 'check_user' | 'test_notification';
  userId?: string;
  testMode?: boolean;
}

interface AlertCondition {
  type: string;
  threshold?: number;
  timeframe?: string;
  comparison?: 'greater_than' | 'less_than' | 'equal_to';
}

const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const sendEmailNotification = async (userEmail: string, userName: string, notification: any) => {
  try {
    const emailApiUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/send-email-notification`;
    
    const response = await fetch(emailApiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: notification.type,
        userEmail,
        userName,
        data: notification.metadata
      })
    });

    return response.ok;
  } catch (error) {
    console.error('Failed to send email notification:', error);
    return false;
  }
};

const createNotification = async (
  userId: string,
  type: string,
  title: string,
  message: string,
  priority: string = 'medium',
  metadata: any = {},
  relatedAccountId?: string,
  relatedTransactionId?: string
) => {
  try {
    const { data: notification, error } = await supabaseClient
      .from('notifications')
      .insert({
        user_id: userId,
        type,
        title,
        message,
        priority,
        urgency_score: priority === 'urgent' ? 90 : priority === 'high' ? 70 : 50,
        metadata,
        related_account_id: relatedAccountId,
        related_transaction_id: relatedTransactionId,
        channels_sent: ['in_app']
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to create notification:', error);
      return null;
    }

    // Get user preferences and email
    const { data: user } = await supabaseClient.auth.admin.getUserById(userId);
    const { data: preferences } = await supabaseClient
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    // Send email if enabled
    if (preferences?.email_enabled && user?.user?.email) {
      const emailSent = await sendEmailNotification(
        user.user.email,
        user.user.email.split('@')[0],
        notification
      );

      if (emailSent) {
        await supabaseClient
          .from('notifications')
          .update({
            email_sent: true,
            email_sent_at: new Date().toISOString(),
            channels_sent: [...notification.channels_sent, 'email']
          })
          .eq('id', notification.id);
      }
    }

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
};

const checkLowBalanceAlerts = async (userId?: string) => {
  try {
    let query = supabaseClient
      .from('connected_accounts')
      .select(`
        *,
        notification_preferences!inner(*)
      `)
      .eq('is_active', true)
      .not('balance', 'is', null);

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data: accounts, error } = await query;

    if (error) {
      console.error('Error fetching accounts for low balance check:', error);
      return;
    }

    for (const account of accounts || []) {
      const preferences = account.notification_preferences;
      
      if (preferences.low_balance_enabled && 
          account.balance < preferences.low_balance_threshold) {
        
        // Check if we've already sent a notification recently
        const { data: recentNotifications } = await supabaseClient
          .from('notifications')
          .select('id')
          .eq('user_id', account.user_id)
          .eq('type', 'low_balance')
          .eq('related_account_id', account.id)
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

        if (!recentNotifications || recentNotifications.length === 0) {
          await createNotification(
            account.user_id,
            'low_balance',
            `Low Balance Alert - ${account.account_name}`,
            `Your ${account.account_name} balance is $${account.balance.toFixed(2)}, which is below your threshold of $${preferences.low_balance_threshold.toFixed(2)}.`,
            'high',
            {
              account_name: account.account_name,
              current_balance: account.balance,
              threshold: preferences.low_balance_threshold,
              institution: account.institution_name
            },
            account.id
          );
        }
      }
    }
  } catch (error) {
    console.error('Error in checkLowBalanceAlerts:', error);
  }
};

const checkSuspiciousActivity = async (userId?: string) => {
  try {
    // Get recent transactions (last 24 hours)
    let query = supabaseClient
      .from('account_transactions')
      .select(`
        *,
        connected_accounts!inner(user_id, account_name, institution_name),
        spending_patterns!left(average_amount, standard_deviation)
      `)
      .gte('transaction_date', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .eq('transaction_type', 'debit');

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data: transactions, error } = await query;

    if (error) {
      console.error('Error fetching transactions for suspicious activity check:', error);
      return;
    }

    for (const transaction of transactions || []) {
      // Get user's spending patterns
      const { data: patterns } = await supabaseClient
        .from('spending_patterns')
        .select('*')
        .eq('user_id', transaction.user_id)
        .eq('pattern_type', 'category_average')
        .eq('category', transaction.category_primary);

      if (patterns && patterns.length > 0) {
        const pattern = patterns[0];
        const suspiciousThreshold = pattern.average_amount * 3; // 3x normal spending

        if (Math.abs(transaction.amount) > suspiciousThreshold) {
          // Get user preferences
          const { data: preferences } = await supabaseClient
            .from('notification_preferences')
            .select('*')
            .eq('user_id', transaction.user_id)
            .single();

          if (preferences?.suspicious_activity_enabled) {
            await createNotification(
              transaction.user_id,
              'suspicious_activity',
              'Unusual Spending Detected',
              `A transaction of $${Math.abs(transaction.amount).toFixed(2)} in ${transaction.category_primary} is ${(Math.abs(transaction.amount) / pattern.average_amount).toFixed(1)}x your normal spending for this category.`,
              'urgent',
              {
                transaction_amount: Math.abs(transaction.amount),
                category: transaction.category_primary,
                normal_amount: pattern.average_amount,
                multiplier: Math.abs(transaction.amount) / pattern.average_amount,
                merchant: transaction.merchant_name,
                description: transaction.description
              },
              transaction.account_id,
              transaction.id
            );
          }
        }
      }
    }
  } catch (error) {
    console.error('Error in checkSuspiciousActivity:', error);
  }
};

const checkRecurringBillReminders = async (userId?: string) => {
  try {
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

    let query = supabaseClient
      .from('recurring_bills')
      .select(`
        *,
        notification_preferences!inner(*)
      `)
      .eq('is_active', true)
      .lte('next_due_date', threeDaysFromNow.toISOString().split('T')[0]);

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data: bills, error } = await query;

    if (error) {
      console.error('Error fetching recurring bills:', error);
      return;
    }

    for (const bill of bills || []) {
      const preferences = bill.notification_preferences;
      
      if (preferences.recurring_bills_enabled) {
        const daysUntilDue = Math.ceil(
          (new Date(bill.next_due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysUntilDue <= bill.remind_days_before) {
          // Check if we've already sent a reminder for this bill
          const { data: recentNotifications } = await supabaseClient
            .from('notifications')
            .select('id')
            .eq('user_id', bill.user_id)
            .eq('type', 'recurring_bill')
            .eq('metadata->>bill_id', bill.id)
            .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

          if (!recentNotifications || recentNotifications.length === 0) {
            await createNotification(
              bill.user_id,
              'recurring_bill',
              `Bill Reminder - ${bill.name}`,
              `Your ${bill.name} bill of $${bill.amount?.toFixed(2) || 'TBD'} is due ${daysUntilDue === 0 ? 'today' : `in ${daysUntilDue} day${daysUntilDue > 1 ? 's' : ''}`}.`,
              daysUntilDue === 0 ? 'urgent' : 'medium',
              {
                bill_id: bill.id,
                bill_name: bill.name,
                amount: bill.amount,
                due_date: bill.next_due_date,
                days_until_due: daysUntilDue,
                merchant: bill.merchant_name
              }
            );
          }
        }
      }
    }
  } catch (error) {
    console.error('Error in checkRecurringBillReminders:', error);
  }
};

const checkLargeTransactions = async (userId?: string) => {
  try {
    // Get transactions from the last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    let query = supabaseClient
      .from('account_transactions')
      .select(`
        *,
        connected_accounts!inner(user_id, account_name, institution_name),
        notification_preferences!inner(*)
      `)
      .gte('created_at', oneHourAgo.toISOString());

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data: transactions, error } = await query;

    if (error) {
      console.error('Error fetching transactions for large transaction check:', error);
      return;
    }

    for (const transaction of transactions || []) {
      const preferences = transaction.notification_preferences;
      
      if (preferences.large_transaction_enabled && 
          Math.abs(transaction.amount) >= preferences.large_transaction_threshold) {
        
        await createNotification(
          transaction.user_id,
          'large_transaction',
          `Large Transaction Alert`,
          `A ${transaction.transaction_type === 'credit' ? 'deposit' : 'charge'} of $${Math.abs(transaction.amount).toFixed(2)} was processed on your ${transaction.connected_accounts.account_name}.`,
          'medium',
          {
            transaction_amount: Math.abs(transaction.amount),
            transaction_type: transaction.transaction_type,
            account_name: transaction.connected_accounts.account_name,
            merchant: transaction.merchant_name,
            description: transaction.description,
            threshold: preferences.large_transaction_threshold
          },
          transaction.account_id,
          transaction.id
        );
      }
    }
  } catch (error) {
    console.error('Error in checkLargeTransactions:', error);
  }
};

const generateTestNotification = async (userId: string, type: string) => {
  const testNotifications = {
    low_balance: {
      title: 'Test: Low Balance Alert',
      message: 'This is a test notification for low balance alerts. Your checking account balance is below your threshold.',
      priority: 'high',
      metadata: { test: true, account_name: 'Test Checking', current_balance: 50, threshold: 100 }
    },
    suspicious_activity: {
      title: 'Test: Suspicious Activity Detected',
      message: 'This is a test notification for suspicious activity detection. An unusual transaction was detected.',
      priority: 'urgent',
      metadata: { test: true, transaction_amount: 500, category: 'Shopping', multiplier: 5.0 }
    },
    large_transaction: {
      title: 'Test: Large Transaction Alert',
      message: 'This is a test notification for large transactions. A charge of $750 was processed.',
      priority: 'medium',
      metadata: { test: true, transaction_amount: 750, account_name: 'Test Credit Card' }
    },
    recurring_bill: {
      title: 'Test: Bill Reminder',
      message: 'This is a test notification for bill reminders. Your electric bill is due in 2 days.',
      priority: 'medium',
      metadata: { test: true, bill_name: 'Electric Bill', amount: 120, days_until_due: 2 }
    }
  };

  const notification = testNotifications[type as keyof typeof testNotifications];
  if (notification) {
    await createNotification(
      userId,
      type,
      notification.title,
      notification.message,
      notification.priority,
      notification.metadata
    );
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
    const { type, userId, testMode }: NotificationRequest = await req.json();

    console.log(`Processing notification check: ${type}${userId ? ` for user ${userId}` : ''}`);

    if (testMode && userId) {
      await generateTestNotification(userId, type);
      return new Response(
        JSON.stringify({ success: true, message: 'Test notification sent' }),
        {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        },
      );
    }

    // Run all notification checks
    await Promise.all([
      checkLowBalanceAlerts(userId),
      checkSuspiciousActivity(userId),
      checkRecurringBillReminders(userId),
      checkLargeTransactions(userId)
    ]);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Notification checks completed',
        timestamp: new Date().toISOString()
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      },
    );
  } catch (error) {
    console.error('Notification engine error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to process notifications'
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