import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  X, 
  AlertTriangle, 
  DollarSign, 
  Calendar,
  Shield,
  TrendingUp,
  CheckCircle,
  Settings,
  MoreHorizontal
} from 'lucide-react';
import { useNotificationSystem } from '../hooks/useNotificationSystem';
import { Notification } from '../types/notifications';

const NotificationBar: React.FC = () => {
  const { notifications, markNotificationAsRead, dismissNotification, getNotificationSummary } = useNotificationSystem();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const summary = getNotificationSummary();
  const unreadNotifications = notifications.filter(n => !n.read_at && !n.dismissed_at);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'low_balance':
        return <DollarSign className="w-4 h-4 text-orange-500" />;
      case 'suspicious_activity':
        return <Shield className="w-4 h-4 text-red-500" />;
      case 'overspending':
        return <TrendingUp className="w-4 h-4 text-red-500" />;
      case 'recurring_bill':
        return <Calendar className="w-4 h-4 text-blue-500" />;
      case 'large_transaction':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default:
        return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500';
      case 'high':
        return 'bg-orange-500';
      case 'medium':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const handleMarkAsRead = async (notification: Notification) => {
    await markNotificationAsRead(notification.id);
  };

  const handleDismiss = async (notification: Notification) => {
    await dismissNotification(notification.id);
  };

  const handleMarkAllAsRead = async () => {
    for (const notification of unreadNotifications) {
      await markNotificationAsRead(notification.id);
    }
    setIsDropdownOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.notification-dropdown')) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isDropdownOpen]);

  return (
    <div className="fixed top-4 right-4 z-50 notification-dropdown">
      {/* Bell Icon Button */}
      <div className="relative">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="relative p-2 bg-white rounded-full shadow-lg border border-gray-200 hover:bg-gray-50 transition-all duration-200 hover:shadow-xl"
        >
          <Bell className="w-6 h-6 text-gray-700" />
          {summary.unread_count > 0 && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
              {summary.unread_count > 9 ? '9+' : summary.unread_count}
            </div>
          )}
        </button>

        {/* Dropdown Panel - YouTube Style */}
        <div className={`absolute top-full right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 transition-all duration-200 ease-out ${
          isDropdownOpen 
            ? 'opacity-100 visible transform translate-y-0' 
            : 'opacity-0 invisible transform -translate-y-2'
        }`}>
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Notifications
              </h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium px-2 py-1 rounded hover:bg-blue-50 transition-colors"
                >
                  Mark all as read
                </button>
                <button className="p-1 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100 transition-colors">
                  <Settings className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {unreadNotifications.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No new notifications</h3>
                <p className="text-sm text-gray-500">You're all caught up!</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {unreadNotifications.slice(0, 10).map((notification) => (
                  <div
                    key={notification.id}
                    className="px-4 py-4 hover:bg-gray-50 transition-colors group"
                  >
                    <div className="flex items-start space-x-3">
                      {/* Icon */}
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0 pr-2">
                            <h4 className="text-sm font-medium text-gray-900 mb-1 leading-tight">
                              {notification.title}
                            </h4>
                            <p className="text-sm text-gray-600 leading-relaxed mb-2">
                              {notification.message}
                            </p>
                            <div className="flex items-center space-x-3">
                              <span className="text-xs text-gray-500">
                                {formatTimeAgo(notification.created_at)}
                              </span>
                              <div className={`w-2 h-2 rounded-full ${getPriorityColor(notification.priority)}`}></div>
                              <span className="text-xs text-gray-500 capitalize">
                                {notification.priority}
                              </span>
                            </div>
                          </div>
                          
                          {/* Actions */}
                          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleMarkAsRead(notification)}
                              className="p-1.5 text-gray-400 hover:text-green-600 rounded hover:bg-green-50 transition-colors"
                              title="Mark as read"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDismiss(notification)}
                              className="p-1.5 text-gray-400 hover:text-red-600 rounded hover:bg-red-50 transition-colors"
                              title="Dismiss"
                            >
                              <X className="w-4 h-4" />
                            </button>
                            <button className="p-1.5 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100 transition-colors">
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {unreadNotifications.length > 0 && (
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 rounded-b-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  {unreadNotifications.length > 10 
                    ? `Showing 10 of ${unreadNotifications.length} notifications`
                    : `${unreadNotifications.length} notification${unreadNotifications.length !== 1 ? 's' : ''}`
                  }
                </span>
                <button className="text-xs text-blue-600 hover:text-blue-700 font-medium hover:underline">
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationBar;