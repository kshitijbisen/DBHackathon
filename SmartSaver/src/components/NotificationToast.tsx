import React, { useState, useEffect } from 'react';
import { 
  X, 
  AlertTriangle, 
  DollarSign, 
  Calendar,
  Shield,
  TrendingUp,
  Bell,
  CheckCircle
} from 'lucide-react';
import { Notification } from '../types/notifications';

interface NotificationToastProps {
  notification: Notification;
  onDismiss: () => void;
  onMarkAsRead: () => void;
  autoHide?: boolean;
  duration?: number;
}

const NotificationToast: React.FC<NotificationToastProps> = ({
  notification,
  onDismiss,
  onMarkAsRead,
  autoHide = true,
  duration = 5000
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Animate in
    const timer = setTimeout(() => setIsVisible(true), 100);
    
    // Auto hide
    if (autoHide) {
      const hideTimer = setTimeout(() => {
        handleDismiss();
      }, duration);
      
      return () => {
        clearTimeout(timer);
        clearTimeout(hideTimer);
      };
    }
    
    return () => clearTimeout(timer);
  }, [autoHide, duration]);

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

  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-50 border-red-200 shadow-red-100';
      case 'high':
        return 'bg-orange-50 border-orange-200 shadow-orange-100';
      case 'medium':
        return 'bg-blue-50 border-blue-200 shadow-blue-100';
      default:
        return 'bg-gray-50 border-gray-200 shadow-gray-100';
    }
  };

  const handleDismiss = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onDismiss();
    }, 300);
  };

  const handleMarkAsRead = () => {
    onMarkAsRead();
    handleDismiss();
  };

  return (
    <div className={`transform transition-all duration-300 ease-in-out ${
      isVisible && !isLeaving 
        ? 'translate-x-0 opacity-100 scale-100' 
        : 'translate-x-full opacity-0 scale-95'
    }`}>
      <div className={`max-w-sm w-full bg-white rounded-xl border shadow-lg ${getPriorityStyles(notification.priority)}`}>
        {/* Priority indicator */}
        <div className={`h-1 rounded-t-xl ${
          notification.priority === 'urgent' ? 'bg-red-500' :
          notification.priority === 'high' ? 'bg-orange-500' :
          notification.priority === 'medium' ? 'bg-blue-500' : 'bg-gray-500'
        }`} />
        
        <div className="p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 mt-1">
              {getNotificationIcon(notification.type)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-sm font-semibold text-gray-900 truncate">
                  {notification.title}
                </h3>
                <button
                  onClick={handleDismiss}
                  className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <p className="text-sm text-gray-700 mb-3 leading-relaxed">
                {notification.message}
              </p>
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  {new Date(notification.created_at).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleMarkAsRead}
                    className="flex items-center space-x-1 text-xs text-green-600 hover:text-green-700 font-medium transition-colors"
                  >
                    <CheckCircle className="w-3 h-3" />
                    <span>Mark Read</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationToast;