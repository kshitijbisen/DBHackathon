export interface NotificationPreferences {
  id: string;
  user_id: string;
  
  // Notification channels
  email_enabled: boolean;
  push_enabled: boolean;
  sms_enabled: boolean;
  in_app_enabled: boolean;
  
  // Alert types
  low_balance_enabled: boolean;
  low_balance_threshold: number;
  
  suspicious_activity_enabled: boolean;
  suspicious_threshold_multiplier: number;
  
  overspending_enabled: boolean;
  overspending_threshold_percent: number;
  
  recurring_bills_enabled: boolean;
  recurring_bills_days_ahead: number;
  
  large_transaction_enabled: boolean;
  large_transaction_threshold: number;
  
  weekly_summary_enabled: boolean;
  monthly_summary_enabled: boolean;
  
  // Quiet hours
  quiet_hours_enabled: boolean;
  quiet_hours_start: string;
  quiet_hours_end: string;
  quiet_hours_timezone: string;
  
  created_at: string;
  updated_at: string;
}

export interface AlertRule {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  is_active: boolean;
  rule_type: 'spending_limit' | 'balance_threshold' | 'category_limit' | 'merchant_alert' | 'time_based';
  conditions: Record<string, any>;
  notification_channels: string[];
  custom_message?: string;
  max_notifications_per_day: number;
  last_triggered_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'low_balance' | 'suspicious_activity' | 'overspending' | 'recurring_bill' | 'large_transaction' | 'custom_alert' | 'weekly_summary' | 'monthly_summary' | 'security_alert';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  urgency_score: number;
  
  // Related data
  related_account_id?: string;
  related_transaction_id?: string;
  related_alert_rule_id?: string;
  
  // Delivery status
  channels_sent: string[];
  email_sent: boolean;
  email_sent_at?: string;
  push_sent: boolean;
  push_sent_at?: string;
  sms_sent: boolean;
  sms_sent_at?: string;
  
  // User interaction
  read_at?: string;
  dismissed_at?: string;
  action_taken?: string;
  
  metadata: Record<string, any>;
  expires_at?: string;
  created_at: string;
}

export interface SpendingPattern {
  id: string;
  user_id: string;
  pattern_type: 'daily_average' | 'weekly_average' | 'monthly_average' | 'category_average' | 'merchant_frequency' | 'time_of_day' | 'day_of_week';
  category?: string;
  merchant_name?: string;
  average_amount?: number;
  frequency_count?: number;
  time_pattern?: Record<string, any>;
  standard_deviation?: number;
  confidence_score: number;
  sample_size: number;
  pattern_start_date?: string;
  pattern_end_date?: string;
  last_updated_at: string;
  created_at: string;
}

export interface RecurringBill {
  id: string;
  user_id: string;
  name: string;
  merchant_name?: string;
  category: string;
  amount?: number;
  amount_variance: number;
  frequency: 'weekly' | 'bi_weekly' | 'monthly' | 'quarterly' | 'yearly';
  next_due_date: string;
  last_paid_date?: string;
  auto_detected: boolean;
  confidence_score: number;
  remind_days_before: number;
  is_active: boolean;
  account_id?: string;
  transaction_pattern?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface NotificationSummary {
  unread_count: number;
  urgent_count: number;
  recent_notifications: Notification[];
  alert_rules_active: number;
  last_notification_at?: string;
}