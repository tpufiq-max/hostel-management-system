import { useState, useCallback } from 'react';

export const useNotification = () => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now();
    const notification = { id, message, type };
    
    setNotifications(prev => [...prev, notification]);
    
    if (duration) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }
    
    return id;
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  }, []);

  const success = useCallback((message, duration) => 
    addNotification(message, 'success', duration), [addNotification]);
  
  const error = useCallback((message, duration) => 
    addNotification(message, 'error', duration), [addNotification]);
  
  const info = useCallback((message, duration) => 
    addNotification(message, 'info', duration), [addNotification]);
  
  const warning = useCallback((message, duration) => 
    addNotification(message, 'warning', duration), [addNotification]);

  return {
    notifications,
    addNotification,
    removeNotification,
    success,
    error,
    info,
    warning
  };
};
