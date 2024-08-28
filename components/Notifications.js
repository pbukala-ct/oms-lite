// components/Notifications.js
import React, { useState, useCallback } from 'react';

const NotificationItem = ({ type, message, onClose, index }) => {
    const baseStyle = {
      position: 'relative',
      marginBottom: '1rem',
      padding: '1rem',
      borderRadius: '0.25rem',
      maxWidth: '20rem',
      width: '100%',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    };

  const typeStyles = {
    success: { backgroundColor: '#10B981', color: 'white' },
    error: { backgroundColor: '#EF4444', color: 'white' },
    info: { backgroundColor: '#3B82F6', color: 'white' },
    warning: { backgroundColor: '#F59E0B', color: 'white' },
  };

  const style = { ...baseStyle, ...typeStyles[type] };

  return (
    <div style={style}>
      <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>{type.charAt(0).toUpperCase() + type.slice(1)}</p>
      <p>{message}</p>
      <button 
        onClick={onClose}
        style={{
          position: 'absolute',
          top: '0.5rem',
          right: '0.5rem',
          background: 'none',
          border: 'none',
          color: 'white',
          cursor: 'pointer',
        }}
      >
        ×
      </button>
    </div>
  );
};

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((type, message) => {
    console.log('Adding notification:', { type, message });
    const id = Date.now();
    setNotifications(prev => [...prev, { id, type, message }]);

    setTimeout(() => {
      setNotifications(prev => prev.filter(notification => notification.id !== id));
    }, 5000);
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const NotificationsComponent = () => (
    <div style={{
      position: 'fixed',
      top: '4rem', // Adjust this value based on your top panel height
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 1000,
      width: '100%',
      maxWidth: '30rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}>
      {notifications.map(({ id, type, message }, index) => (
        <NotificationItem
          key={id}
          type={type}
          message={message}
          onClose={() => removeNotification(id)}
          index={index}
        />
      ))}
    </div>
  );

  return {
    NotificationsComponent,
    showSuccess: (message) => addNotification('success', message),
    showError: (message) => addNotification('error', message),
    showInfo: (message) => addNotification('info', message),
    showWarning: (message) => addNotification('warning', message),
  };
};