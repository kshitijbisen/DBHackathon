export interface ConnectedAccount {
  id: string;
  user_id: string;
  institution_id: string;
  institution_name: string;
  account_id: string;
  account_name: string;
  account_type: 'checking' | 'savings' | 'credit' | 'investment' | 'crypto' | 'loan' | 'mortgage';
  account_subtype?: string;
  currency: string;
  balance?: number;
  available_balance?: number;
  credit_limit?: number;
  last_synced_at?: string;
  sync_status: 'pending' | 'syncing' | 'success' | 'error' | 'disconnected';
  provider: 'plaid' | 'yodlee' | 'salt_edge' | 'manual';
  provider_account_id: string;
  is_active: boolean;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface AccountTransaction {
  id: string;
  user_id: string;
  account_id: string;
  transaction_id: string;
  amount: number;
  currency: string;
  description: string;
  merchant_name?: string;
  category_primary?: string;
  category_detailed?: string;
  transaction_type: 'debit' | 'credit' | 'transfer' | 'fee' | 'interest';
  transaction_date: string;
  posted_date?: string;
  pending: boolean;
  location?: Record<string, any>;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface SyncLog {
  id: string;
  user_id: string;
  account_id?: string;
  sync_type: 'full' | 'incremental' | 'balance_only';
  status: 'started' | 'success' | 'error' | 'partial';
  transactions_synced: number;
  error_message?: string;
  started_at: string;
  completed_at?: string;
  metadata: Record<string, any>;
}

export interface AccountFilter {
  institutions?: string[];
  accountTypes?: string[];
  currencies?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  categories?: string[];
  amountRange?: {
    min: number;
    max: number;
  };
}

export interface AccountSummary {
  totalBalance: number;
  totalAvailable: number;
  totalCredit: number;
  accountsByType: Record<string, number>;
  accountsByInstitution: Record<string, number>;
  recentTransactions: AccountTransaction[];
  syncStatus: {
    lastSync: string;
    accountsNeedingSync: number;
    totalAccounts: number;
  };
}