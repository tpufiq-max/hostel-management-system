import React from 'react';
import Notification from './Notification';

export default function NotificationContainer({ notifications, onRemove }) {
  return (
    <div className="fixed top-4 right-4 z-50 max-w-md space-y-2">
      {notifications.map(notification => (
        <Notification
          key={notification.id}
          notification={notification}
          onClose={() => onRemove(notification.id)}
        />
      ))}
    </div>
  );
}
