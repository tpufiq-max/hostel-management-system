import React, { useEffect } from 'react';

const Notification = ({ notification, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const typeStyles = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  };

  const iconMap = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
    warning: '⚠',
  };

  return (
    <div className={`mb-3 p-4 rounded-lg border-2 flex items-start gap-3 animate-slideIn ${typeStyles[notification.type] || typeStyles.info}`}>
      <span className={`text-xl font-bold flex-shrink-0`}>
        {iconMap[notification.type]}
      </span>
      <div className="flex-1">
        <p className="font-medium">{notification.message}</p>
      </div>
      <button
        onClick={onClose}
        className="text-lg font-bold opacity-50 hover:opacity-100 transition-opacity"
      >
        ×
      </button>
    </div>
  );
};

export default Notification;
