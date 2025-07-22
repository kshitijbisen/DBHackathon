import React from 'react';
import { useNotificationSystem } from '../hooks/useNotificationSystem';
import NotificationToast from './NotificationToast';
import { ErrorBoundary } from './ErrorBoundary';

export const NotificationContainer: React.FC = () => {
  return (
    <ErrorBoundary>
      <NotificationContainerContent />
    </ErrorBoundary>
  );
};

const NotificationContainerContent: React.FC = () => {
  const { notifications, markNotificationAsRead, dismissNotification } = useNotificationSystem();

  // Only show unread, non-dismissed notifications
  const activeNotifications = notifications.filter(
    notification => !notification.read_at && !notification.dismissed_at
  );

  if (activeNotifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {activeNotifications.slice(0, 3).map((notification) => (
        <NotificationToast
          key={notification.id}
          notification={notification}
          onRead={() => markNotificationAsRead(notification.id)}
          onDismiss={() => dismissNotification(notification.id)}
        />
      ))}
    </div>
  );
};

export default NotificationContainer