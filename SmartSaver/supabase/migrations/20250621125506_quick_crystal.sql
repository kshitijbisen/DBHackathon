/*
  # Real-Time Notifications & Alerts System
  
  1. New Tables
    - `notification_preferences` - User notification settings
    - `alert_rules` - Configurable alert conditions
    - `notifications` - Notification history and status
    - `spending_patterns` - ML-based spending pattern analysis
    
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    
  3. Features
    - Low balance alerts
    - Suspicious activity detection
    - Recurring bill reminders
    - Overspending alerts
    - Custom spending thresholds
*/

-- Notification Preferences Table
CREATE TABLE IF NOT EXISTS notification_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Notification channels
  email_enabled boolean NOT NULL DEFAULT true,
  push_enabled boolean NOT NULL DEFAULT true,
  sms_enabled boolean NOT NULL DEFAULT false,
  in_app_enabled boolean NOT NULL DEFAULT true,
  
  -- Alert types
  low_balance_enabled boolean NOT NULL DEFAULT true,
  low_balance_threshold numeric(10,2) DEFAULT 100.00,
  
  suspicious_activity_enabled boolean NOT NULL DEFAULT true,
  suspicious_threshold_multiplier numeric(3,2) DEFAULT 3.0, -- 3x normal spending
  
  overspending_enabled boolean NOT NULL DEFAULT true,
  overspending_threshold_percent numeric(3,2) DEFAULT 0.20, -- 20% over budget
  
  recurring_bills_enabled boolean NOT NULL DEFAULT true,
  recurring_bills_days_ahead integer DEFAULT 3,
  
  large_transaction_enabled boolean NOT NULL DEFAULT true,
  large_transaction_threshold numeric(10,2) DEFAULT 500.00,
  
  weekly_summary_enabled boolean NOT NULL DEFAULT true,
  monthly_summary_enabled boolean NOT NULL DEFAULT true,
  
  -- Quiet hours
  quiet_hours_enabled boolean NOT NULL DEFAULT false,
  quiet_hours_start time DEFAULT '22:00:00',
  quiet_hours_end time DEFAULT '08:00:00',
  quiet_hours_timezone text DEFAULT 'UTC',
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  UNIQUE(user_id)
);

-- Alert Rules Table (for custom user-defined rules)
CREATE TABLE IF NOT EXISTS alert_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  name text NOT NULL,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  
  -- Rule conditions
  rule_type text NOT NULL CHECK (rule_type IN ('spending_limit', 'balance_threshold', 'category_limit', 'merchant_alert', 'time_based')),
  
  -- Conditions (JSON for flexibility)
  conditions jsonb NOT NULL DEFAULT '{}',
  -- Examples:
  -- {"category": "Food", "amount": 200, "period": "weekly"}
  -- {"merchant": "Amazon", "frequency": "daily"}
  -- {"account_type": "checking", "balance_below": 500}
  
  -- Actions
  notification_channels text[] DEFAULT ARRAY['email', 'push'],
  custom_message text,
  
  -- Frequency control
  max_notifications_per_day integer DEFAULT 5,
  last_triggered_at timestamptz,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Notification details
  type text NOT NULL CHECK (type IN ('low_balance', 'suspicious_activity', 'overspending', 'recurring_bill', 'large_transaction', 'custom_alert', 'weekly_summary', 'monthly_summary', 'security_alert')),
  title text NOT NULL,
  message text NOT NULL,
  
  -- Priority and urgency
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  urgency_score integer DEFAULT 50 CHECK (urgency_score >= 0 AND urgency_score <= 100),
  
  -- Related data
  related_account_id uuid REFERENCES connected_accounts(id),
  related_transaction_id uuid REFERENCES account_transactions(id),
  related_alert_rule_id uuid REFERENCES alert_rules(id),
  
  -- Delivery status
  channels_sent text[] DEFAULT ARRAY[]::text[],
  email_sent boolean DEFAULT false,
  email_sent_at timestamptz,
  push_sent boolean DEFAULT false,
  push_sent_at timestamptz,
  sms_sent boolean DEFAULT false,
  sms_sent_at timestamptz,
  
  -- User interaction
  read_at timestamptz,
  dismissed_at timestamptz,
  action_taken text, -- 'viewed', 'dismissed', 'acted_upon'
  
  -- Metadata
  metadata jsonb DEFAULT '{}',
  expires_at timestamptz,
  
  created_at timestamptz DEFAULT now()
);

-- Spending Patterns Table (for ML-based analysis)
CREATE TABLE IF NOT EXISTS spending_patterns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Pattern identification
  pattern_type text NOT NULL CHECK (pattern_type IN ('daily_average', 'weekly_average', 'monthly_average', 'category_average', 'merchant_frequency', 'time_of_day', 'day_of_week')),
  category text,
  merchant_name text,
  
  -- Pattern data
  average_amount numeric(10,2),
  frequency_count integer,
  time_pattern jsonb, -- Store time-based patterns
  
  -- Statistical data
  standard_deviation numeric(10,2),
  confidence_score numeric(3,2) DEFAULT 0.5,
  sample_size integer DEFAULT 0,
  
  -- Date range for pattern
  pattern_start_date date,
  pattern_end_date date,
  last_updated_at timestamptz DEFAULT now(),
  
  created_at timestamptz DEFAULT now()
);

-- Recurring Bills Table
CREATE TABLE IF NOT EXISTS recurring_bills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Bill details
  name text NOT NULL,
  merchant_name text,
  category text DEFAULT 'Utilities',
  
  -- Amount and frequency
  amount numeric(10,2),
  amount_variance numeric(10,2) DEFAULT 0, -- Allow for slight variations
  frequency text NOT NULL CHECK (frequency IN ('weekly', 'bi_weekly', 'monthly', 'quarterly', 'yearly')),
  
  -- Scheduling
  next_due_date date NOT NULL,
  last_paid_date date,
  
  -- Detection settings
  auto_detected boolean DEFAULT false,
  confidence_score numeric(3,2) DEFAULT 1.0,
  
  -- Notification settings
  remind_days_before integer DEFAULT 3,
  is_active boolean DEFAULT true,
  
  -- Metadata
  account_id uuid REFERENCES connected_accounts(id),
  transaction_pattern jsonb, -- Store pattern that identified this bill
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_read_at ON notifications(read_at);
CREATE INDEX IF NOT EXISTS idx_alert_rules_user_id ON alert_rules(user_id);
CREATE INDEX IF NOT EXISTS idx_alert_rules_active ON alert_rules(is_active);
CREATE INDEX IF NOT EXISTS idx_spending_patterns_user_id ON spending_patterns(user_id);
CREATE INDEX IF NOT EXISTS idx_spending_patterns_type ON spending_patterns(pattern_type);
CREATE INDEX IF NOT EXISTS idx_recurring_bills_user_id ON recurring_bills(user_id);
CREATE INDEX IF NOT EXISTS idx_recurring_bills_due_date ON recurring_bills(next_due_date);

-- Enable RLS
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE spending_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_bills ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notification_preferences
CREATE POLICY "Users can manage own notification preferences"
  ON notification_preferences
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for alert_rules
CREATE POLICY "Users can manage own alert rules"
  ON alert_rules
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for notifications
CREATE POLICY "Users can view own notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
  ON notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for spending_patterns
CREATE POLICY "Users can view own spending patterns"
  ON spending_patterns
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can manage spending patterns"
  ON spending_patterns
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for recurring_bills
CREATE POLICY "Users can manage own recurring bills"
  ON recurring_bills
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Update triggers
CREATE TRIGGER update_notification_preferences_updated_at
    BEFORE UPDATE ON notification_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_alert_rules_updated_at
    BEFORE UPDATE ON alert_rules
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recurring_bills_updated_at
    BEFORE UPDATE ON recurring_bills
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert default notification preferences for existing users
INSERT INTO notification_preferences (user_id)
SELECT id FROM auth.users
WHERE id NOT IN (SELECT user_id FROM notification_preferences)
ON CONFLICT (user_id) DO NOTHING;

-- Function to calculate spending patterns
CREATE OR REPLACE FUNCTION calculate_spending_patterns(target_user_id uuid)
RETURNS void AS $$
BEGIN
  -- Calculate daily average spending
  INSERT INTO spending_patterns (user_id, pattern_type, average_amount, sample_size, pattern_start_date, pattern_end_date)
  SELECT 
    target_user_id,
    'daily_average',
    AVG(ABS(amount)),
    COUNT(*),
    MIN(transaction_date),
    MAX(transaction_date)
  FROM account_transactions 
  WHERE user_id = target_user_id 
    AND transaction_type = 'debit'
    AND transaction_date >= CURRENT_DATE - INTERVAL '30 days'
  HAVING COUNT(*) > 5
  ON CONFLICT DO NOTHING;

  -- Calculate category averages
  INSERT INTO spending_patterns (user_id, pattern_type, category, average_amount, sample_size, pattern_start_date, pattern_end_date)
  SELECT 
    target_user_id,
    'category_average',
    category_primary,
    AVG(ABS(amount)),
    COUNT(*),
    MIN(transaction_date),
    MAX(transaction_date)
  FROM account_transactions 
  WHERE user_id = target_user_id 
    AND transaction_type = 'debit'
    AND category_primary IS NOT NULL
    AND transaction_date >= CURRENT_DATE - INTERVAL '60 days'
  GROUP BY category_primary
  HAVING COUNT(*) > 3
  ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- Function to detect recurring bills
CREATE OR REPLACE FUNCTION detect_recurring_bills(target_user_id uuid)
RETURNS void AS $$
BEGIN
  -- Detect monthly recurring transactions
  INSERT INTO recurring_bills (user_id, name, merchant_name, amount, frequency, next_due_date, auto_detected, confidence_score)
  SELECT DISTINCT
    target_user_id,
    COALESCE(merchant_name, description),
    merchant_name,
    AVG(ABS(amount)),
    'monthly',
    CURRENT_DATE + INTERVAL '1 month',
    true,
    CASE 
      WHEN COUNT(*) >= 3 THEN 0.9
      WHEN COUNT(*) = 2 THEN 0.7
      ELSE 0.5
    END
  FROM account_transactions
  WHERE user_id = target_user_id
    AND transaction_type = 'debit'
    AND transaction_date >= CURRENT_DATE - INTERVAL '90 days'
    AND (merchant_name IS NOT NULL OR description ILIKE '%bill%' OR description ILIKE '%payment%')
  GROUP BY COALESCE(merchant_name, description), merchant_name
  HAVING COUNT(*) >= 2
    AND STDDEV(ABS(amount)) < (AVG(ABS(amount)) * 0.1) -- Amount variance < 10%
  ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql;