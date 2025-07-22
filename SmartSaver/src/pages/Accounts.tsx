import React, { useState } from 'react';
import { 
  Plus, 
  Building2, 
  CreditCard, 
  Wallet, 
  TrendingUp, 
  RefreshCw, 
  Filter,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  Clock,
  Loader2
} from 'lucide-react';
import { useAccounts } from '../hooks/useAccounts';
import { ConnectedAccount, AccountFilter } from '../types/accounts';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const Accounts: React.FC = () => {
  const { 
    accounts, 
    transactions, 
    loading, 
    error, 
    syncAccount, 
    fetchTransactions,
    getAccountSummary 
  } = useAccounts();
  
  const [showBalances, setShowBalances] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<AccountFilter>({});
  const [syncingAccounts, setSyncingAccounts] = useState<Set<string>>(new Set());
  const [showConnectModal, setShowConnectModal] = useState(false);

  const summary = getAccountSummary();

  const handleSync = async (accountId: string) => {
    setSyncingAccounts(prev => new Set(prev).add(accountId));
    await syncAccount(accountId);
    setSyncingAccounts(prev => {
      const newSet = new Set(prev);
      newSet.delete(accountId);
      return newSet;
    });
  };

  const handleSyncAll = async () => {
    const accountsToSync = accounts.filter(acc => acc.sync_status !== 'syncing');
    for (const account of accountsToSync) {
      await handleSync(account.id);
    }
  };

  const getAccountIcon = (type: string) => {
    switch (type) {
      case 'checking':
      case 'savings':
        return Building2;
      case 'credit':
        return CreditCard;
      case 'crypto':
        return Wallet;
      default:
        return TrendingUp;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'syncing':
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-500" />;
    }
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatAccountType = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="text-gray-600 mt-4">Loading your accounts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Connected Accounts</h1>
            <p className="text-gray-600">Manage all your financial accounts in one place</p>
          </div>
          
          <div className="flex items-center space-x-4 mt-4 lg:mt-0">
            <button
              onClick={() => setShowBalances(!showBalances)}
              className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {showBalances ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span>{showBalances ? 'Hide' : 'Show'} Balances</span>
            </button>
            
            <button
              onClick={handleSyncAll}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Sync All</span>
            </button>
            
            <button
              onClick={() => setShowConnectModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200"
            >
              <Plus className="w-4 h-4" />
              <span>Connect Account</span>
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Balance</p>
                <p className="text-2xl font-bold text-gray-900">
                  {showBalances ? formatCurrency(summary.totalBalance) : '••••••'}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Available</p>
                <p className="text-2xl font-bold text-gray-900">
                  {showBalances ? formatCurrency(summary.totalAvailable) : '••••••'}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Wallet className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Credit Limit</p>
                <p className="text-2xl font-bold text-gray-900">
                  {showBalances ? formatCurrency(summary.totalCredit) : '••••••'}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Connected Accounts</p>
                <p className="text-2xl font-bold text-gray-900">{accounts.length}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {summary.syncStatus.accountsNeedingSync} need sync
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Accounts List */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Your Accounts</h2>
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <select className="text-sm border border-gray-300 rounded-lg px-3 py-1">
                  <option>All Institutions</option>
                  {Object.keys(summary.accountsByInstitution).map(institution => (
                    <option key={institution}>{institution}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {accounts.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Connected Accounts</h3>
              <p className="text-gray-600 mb-6">Connect your bank accounts, credit cards, and crypto wallets to get started</p>
              <button
                onClick={() => setShowConnectModal(true)}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-200"
              >
                Connect Your First Account
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {accounts.map((account) => {
                const Icon = getAccountIcon(account.account_type);
                const isSyncing = syncingAccounts.has(account.id);
                
                return (
                  <div key={account.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{account.account_name}</h3>
                          <p className="text-sm text-gray-600">{account.institution_name}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                              {formatAccountType(account.account_type)}
                            </span>
                            <span className="text-xs text-gray-500">•</span>
                            <span className="text-xs text-gray-500">{account.currency}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="flex items-center space-x-3 mb-2">
                          {getStatusIcon(account.sync_status)}
                          <button
                            onClick={() => handleSync(account.id)}
                            disabled={isSyncing}
                            className="p-2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                          >
                            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                          </button>
                        </div>
                        
                        {showBalances && (
                          <div className="space-y-1">
                            {account.balance !== null && (
                              <p className="font-semibold text-gray-900">
                                {formatCurrency(account.balance, account.currency)}
                              </p>
                            )}
                            {account.available_balance !== null && account.available_balance !== account.balance && (
                              <p className="text-sm text-gray-600">
                                Available: {formatCurrency(account.available_balance, account.currency)}
                              </p>
                            )}
                            {account.credit_limit && (
                              <p className="text-sm text-gray-600">
                                Limit: {formatCurrency(account.credit_limit, account.currency)}
                              </p>
                            )}
                          </div>
                        )}
                        
                        {account.last_synced_at && (
                          <p className="text-xs text-gray-500 mt-1">
                            Last sync: {new Date(account.last_synced_at).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Transactions */}
        {transactions.length > 0 && (
          <div className="mt-8 bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Recent Transactions</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {transactions.slice(0, 10).map((transaction) => (
                <div key={transaction.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">{transaction.description}</h3>
                      {transaction.merchant_name && (
                        <p className="text-sm text-gray-600">{transaction.merchant_name}</p>
                      )}
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                          {transaction.category_primary || 'Uncategorized'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(transaction.transaction_date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${
                        transaction.transaction_type === 'credit' ? 'text-green-600' : 'text-gray-900'
                      }`}>
                        {transaction.transaction_type === 'credit' ? '+' : '-'}
                        {formatCurrency(Math.abs(transaction.amount), transaction.currency)}
                      </p>
                      {transaction.pending && (
                        <span className="text-xs text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full">
                          Pending
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Connect Account Modal */}
        {showConnectModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Connect New Account</h3>
              
              <div className="space-y-4">
                <button className="w-full p-4 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors text-left">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Bank Account</h4>
                      <p className="text-sm text-gray-600">Connect checking, savings, or investment accounts</p>
                    </div>
                  </div>
                </button>
                
                <button className="w-full p-4 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors text-left">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Credit Card</h4>
                      <p className="text-sm text-gray-600">Track credit card spending and balances</p>
                    </div>
                  </div>
                </button>
                
                <button className="w-full p-4 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors text-left">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Wallet className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Crypto Wallet</h4>
                      <p className="text-sm text-gray-600">Monitor cryptocurrency holdings</p>
                    </div>
                  </div>
                </button>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowConnectModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-200">
                  Continue
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Accounts;