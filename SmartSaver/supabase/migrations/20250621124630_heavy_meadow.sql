/*
  # Multi-Account Aggregation Schema
  
  1. New Tables
    - `connected_accounts` - Stores linked bank accounts, credit cards, and crypto wallets
    - `account_transactions` - Stores transactions from all connected accounts
    - `account_categories` - Maps transaction categories across different institutions
    - `sync_logs` - Tracks synchronization status and errors
    
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access their own data
    
  3. Features
    - Support for multiple account types (checking, savings, credit, crypto)
    - Institution mapping and metadata
    - Transaction categorization and enrichment
    - Sync status tracking
*/

-- Connected Accounts Table
CREATE TABLE IF NOT EXISTS connected_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  institution_id text NOT NULL,
  institution_name text NOT NULL,
  account_id text NOT NULL, -- External account ID from provider
  account_name text NOT NULL,
  account_type text NOT NULL CHECK (account_type IN ('checking', 'savings', 'credit', 'investment', 'crypto', 'loan', 'mortgage')),
  account_subtype text,
  currency text NOT NULL DEFAULT 'USD',
  balance numeric(15,2),
  available_balance numeric(15,2),
  credit_limit numeric(15,2),
  last_synced_at timestamptz,
  sync_status text NOT NULL DEFAULT 'pending' CHECK (sync_status IN ('pending', 'syncing', 'success', 'error', 'disconnected')),
  provider text NOT NULL CHECK (provider IN ('plaid', 'yodlee', 'salt_edge', 'manual')),
  provider_account_id text NOT NULL,
  access_token_encrypted text, -- Encrypted access token
  is_active boolean NOT NULL DEFAULT true,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, provider, provider_account_id)
);

-- Account Transactions Table
CREATE TABLE IF NOT EXISTS account_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id uuid NOT NULL REFERENCES connected_accounts(id) ON DELETE CASCADE,
  transaction_id text NOT NULL, -- External transaction ID from provider
  amount numeric(15,2) NOT NULL,
  currency text NOT NULL DEFAULT 'USD',
  description text NOT NULL,
  merchant_name text,
  category_primary text,
  category_detailed text,
  transaction_type text NOT NULL CHECK (transaction_type IN ('debit', 'credit', 'transfer', 'fee', 'interest')),
  transaction_date date NOT NULL,
  posted_date date,
  pending boolean NOT NULL DEFAULT false,
  location jsonb, -- Store location data if available
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(account_id, transaction_id)
);

-- Account Categories Mapping
CREATE TABLE IF NOT EXISTS account_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL,
  provider_category text NOT NULL,
  smartsaver_category text NOT NULL,
  confidence_score numeric(3,2) DEFAULT 1.0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(provider, provider_category)
);

-- Sync Logs Table
CREATE TABLE IF NOT EXISTS sync_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id uuid REFERENCES connected_accounts(id) ON DELETE CASCADE,
  sync_type text NOT NULL CHECK (sync_type IN ('full', 'incremental', 'balance_only')),
  status text NOT NULL CHECK (status IN ('started', 'success', 'error', 'partial')),
  transactions_synced integer DEFAULT 0,
  error_message text,
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  metadata jsonb DEFAULT '{}'
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_connected_accounts_user_id ON connected_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_connected_accounts_provider ON connected_accounts(provider);
CREATE INDEX IF NOT EXISTS idx_connected_accounts_sync_status ON connected_accounts(sync_status);
CREATE INDEX IF NOT EXISTS idx_account_transactions_user_id ON account_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_account_transactions_account_id ON account_transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_account_transactions_date ON account_transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_account_transactions_category ON account_transactions(category_primary);
CREATE INDEX IF NOT EXISTS idx_sync_logs_user_id ON sync_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_sync_logs_account_id ON sync_logs(account_id);

-- Enable RLS
ALTER TABLE connected_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for connected_accounts
CREATE POLICY "Users can view own connected accounts"
  ON connected_accounts
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own connected accounts"
  ON connected_accounts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own connected accounts"
  ON connected_accounts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own connected accounts"
  ON connected_accounts
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for account_transactions
CREATE POLICY "Users can view own account transactions"
  ON account_transactions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own account transactions"
  ON account_transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own account transactions"
  ON account_transactions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own account transactions"
  ON account_transactions
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for account_categories (public read)
CREATE POLICY "Anyone can view account categories"
  ON account_categories
  FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for sync_logs
CREATE POLICY "Users can view own sync logs"
  ON sync_logs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sync logs"
  ON sync_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Update triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_connected_accounts_updated_at
    BEFORE UPDATE ON connected_accounts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_account_transactions_updated_at
    BEFORE UPDATE ON account_transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert default category mappings
INSERT INTO account_categories (provider, provider_category, smartsaver_category) VALUES
-- Plaid categories
('plaid', 'Food and Drink', 'Food'),
('plaid', 'Restaurants', 'Food'),
('plaid', 'Groceries', 'Food'),
('plaid', 'Transportation', 'Transport'),
('plaid', 'Gas Stations', 'Transport'),
('plaid', 'Public Transportation', 'Transport'),
('plaid', 'Entertainment', 'Entertainment'),
('plaid', 'Recreation', 'Entertainment'),
('plaid', 'Shopping', 'Shopping'),
('plaid', 'General Merchandise', 'Shopping'),
('plaid', 'Healthcare', 'Healthcare'),
('plaid', 'Medical', 'Healthcare'),
('plaid', 'Rent', 'Rent'),
('plaid', 'Utilities', 'Utilities'),
('plaid', 'Travel', 'Travel'),
('plaid', 'Education', 'Education'),
-- Yodlee categories
('yodlee', 'FOOD_AND_DINING', 'Food'),
('yodlee', 'AUTOMOTIVE', 'Transport'),
('yodlee', 'ENTERTAINMENT', 'Entertainment'),
('yodlee', 'SHOPPING', 'Shopping'),
('yodlee', 'HEALTHCARE', 'Healthcare'),
('yodlee', 'UTILITIES', 'Utilities'),
('yodlee', 'TRAVEL', 'Travel'),
('yodlee', 'EDUCATION', 'Education'),
-- Salt Edge categories
('salt_edge', 'food', 'Food'),
('salt_edge', 'transport', 'Transport'),
('salt_edge', 'entertainment', 'Entertainment'),
('salt_edge', 'shopping', 'Shopping'),
('salt_edge', 'healthcare', 'Healthcare'),
('salt_edge', 'utilities', 'Utilities'),
('salt_edge', 'travel', 'Travel'),
('salt_edge', 'education', 'Education')
ON CONFLICT (provider, provider_category) DO NOTHING;