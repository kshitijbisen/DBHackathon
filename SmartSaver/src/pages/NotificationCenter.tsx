import React, { useState } from 'react';
import { 
  Bell, 
  Settings, 
  AlertTriangle, 
  DollarSign, 
  Calendar,
  Shield,
  TrendingUp,
  Plus,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  CheckCircle,
  X,
  Filter,
  Search
} from 'lucide-react';
import { useNotificationSystem } from '../hooks/useNotificationSystem';
import { Notification, AlertRule } from '../types/notifications';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const NotificationCenter: React.FC = () => {
  const {
    preferences,
    notifications,
    alertRules,
    recurringBills,
    loading,
    updatePreferences,
    createAlertRule,
    updateAlertRule,
    deleteAlertRule,
    markNotificationAsRead,
    dismissNotification,
    testNotification,
    getNotificationSummary
  } = useNotificationSystem();

  const [activeTab, setActiveTab] = useState<'notifications' | 'settings' | 'rules'>('notifications');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateRule, setShowCreateRule] = useState(false);

  const summary = getNotificationSummary();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'low_balance':
        return <DollarSign className="w-5 h-5 text-orange-500" />;
      case 'suspicious_activity':
        return <Shield className="w-5 h-5 text-red-500" />;
      case 'overspending':
        return <TrendingUp className="w-5 h-5 text-red-500" />;
      case 'recurring_bill':
        return <Calendar className="w-5 h-5 text-blue-500" />;
      case 'large_transaction':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 border-red-300 text-red-800';
      case 'high':
        return 'bg-orange-100 border-orange-300 text-orange-800';
      case 'medium':
        return 'bg-blue-100 border-blue-300 text-blue-800';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesType = filterType === 'all' || notification.type === filterType;
    const matchesSearch = searchQuery === '' || 
      notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const handleTestNotification = async (type: string) => {
    await testNotification(type);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="text-gray-600 mt-4">Loading notification center...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Notification Center</h1>
          <p className="text-gray-600">Manage your alerts, preferences, and stay informed about your finances</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Unread</p>
                <p className="text-2xl font-bold text-gray-900">{summary.unread_count}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Bell className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Urgent</p>
                <p className="text-2xl font-bold text-gray-900">{summary.urgent_count}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Rules</p>
                <p className="text-2xl font-bold text-gray-900">{summary.alert_rules_active}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                <Settings className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Upcoming Bills</p>
                <p className="text-2xl font-bold text-gray-900">{recurringBills.length}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'notifications', label: 'Notifications', icon: Bell },
                { id: 'settings', label: 'Preferences', icon: Settings },
                { id: 'rules', label: 'Alert Rules', icon: AlertTriangle }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-purple-500 text-purple-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-6">
            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                {/* Filters */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search notifications..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="all">All Types</option>
                      <option value="low_balance">Low Balance</option>
                      <option value="suspicious_activity">Suspicious Activity</option>
                      <option value="overspending">Overspending</option>
                      <option value="recurring_bill">Recurring Bills</option>
                      <option value="large_transaction">Large Transactions</option>
                    </select>
                  </div>
                  
                  <button
                    onClick={() => handleTestNotification('low_balance')}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Test Notification
                  </button>
                </div>

                {/* Notifications List */}
                <div className="space-y-4">
                  {filteredNotifications.length === 0 ? (
                    <div className="text-center py-12">
                      <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No Notifications</h3>
                      <p className="text-gray-600">You're all caught up! No notifications match your current filters.</p>
                    </div>
                  ) : (
                    filteredNotifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 rounded-xl border transition-all duration-200 hover:shadow-md ${
                          notification.read_at ? 'bg-gray-50 border-gray-200' : 'bg-white border-purple-200'
                        }`}
                      >
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0">
                            {getNotificationIcon(notification.type)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className={`font-semibold ${notification.read_at ? 'text-gray-700' : 'text-gray-900'}`}>
                                {notification.title}
                              </h3>
                              <div className="flex items-center space-x-2">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(notification.priority)}`}>
                                  {notification.priority}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {new Date(notification.created_at).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            
                            <p className={`text-sm mb-3 ${notification.read_at ? 'text-gray-600' : 'text-gray-700'}`}>
                              {notification.message}
                            </p>
                            
                            <div className="flex items-center space-x-3">
                              {!notification.read_at && (
                                <button
                                  onClick={() => markNotificationAsRead(notification.id)}
                                  className="text-xs text-purple-600 hover:text-purple-700 font-medium"
                                >
                                  Mark as Read
                                </button>
                              )}
                              
                              {!notification.dismissed_at && (
                                <button
                                  onClick={() => dismissNotification(notification.id)}
                                  className="text-xs text-gray-600 hover:text-gray-700 font-medium"
                                >
                                  Dismiss
                                </button>
                              )}
                              
                              <div className="flex items-center space-x-1 text-xs text-gray-500">
                                {notification.channels_sent.map((channel) => (
                                  <span key={channel} className="bg-gray-100 px-2 py-1 rounded">
                                    {channel}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && preferences && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Channels</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { key: 'email_enabled', label: 'Email Notifications', icon: '📧' },
                      { key: 'push_enabled', label: 'Push Notifications', icon: '🔔' },
                      { key: 'sms_enabled', label: 'SMS Notifications', icon: '📱' },
                      { key: 'in_app_enabled', label: 'In-App Notifications', icon: '💬' }
                    ].map((channel) => (
                      <div key={channel.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{channel.icon}</span>
                          <span className="font-medium text-gray-900">{channel.label}</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={preferences[channel.key as keyof NotificationPreferences] as boolean}
                            onChange={(e) => updatePreferences({ [channel.key]: e.target.checked })}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Alert Thresholds</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Low Balance Threshold
                        </label>
                        <input
                          type="number"
                          value={preferences.low_balance_threshold}
                          onChange={(e) => updatePreferences({ low_balance_threshold: parseFloat(e.target.value) })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Large Transaction Threshold
                        </label>
                        <input
                          type="number"
                          value={preferences.large_transaction_threshold}
                          onChange={(e) => updatePreferences({ large_transaction_threshold: parseFloat(e.target.value) })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Alert Rules Tab */}
            {activeTab === 'rules' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Custom Alert Rules</h3>
                  <button
                    onClick={() => setShowCreateRule(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Rule</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {alertRules.length === 0 ? (
                    <div className="text-center py-12">
                      <AlertTriangle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No Alert Rules</h3>
                      <p className="text-gray-600 mb-6">Create custom rules to get notified about specific financial events</p>
                      <button
                        onClick={() => setShowCreateRule(true)}
                        className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-200"
                      >
                        Create Your First Rule
                      </button>
                    </div>
                  ) : (
                    alertRules.map((rule) => (
                      <div key={rule.id} className="p-4 bg-white border border-gray-200 rounded-xl">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h4 className="font-semibold text-gray-900">{rule.name}</h4>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                rule.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                              }`}>
                                {rule.is_active ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                            {rule.description && (
                              <p className="text-sm text-gray-600 mb-2">{rule.description}</p>
                            )}
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <span>Type: {rule.rule_type}</span>
                              <span>Channels: {rule.notification_channels.join(', ')}</span>
                              {rule.last_triggered_at && (
                                <span>Last triggered: {new Date(rule.last_triggered_at).toLocaleDateString()}</span>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => updateAlertRule(rule.id, { is_active: !rule.is_active })}
                              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                              {rule.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteAlertRule(rule.id)}
                              className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter;