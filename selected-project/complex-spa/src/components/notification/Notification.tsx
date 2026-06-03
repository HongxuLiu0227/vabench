import React, { useState } from 'react';
import './Notification.css';

type NotificationType = 'success' | 'error' | 'info' | 'warning';

interface NotificationProps {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  dismissible?: boolean;
  onDismiss?: (id: string) => void;
}

const Notification: React.FC<NotificationProps> = ({
  id,
  type,
  title,
  message,
  timestamp,
  dismissible = true,
  onDismiss,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleDismiss = () => {
    setIsVisible(false);
    if (onDismiss) {
      onDismiss(id);
    }
  };

  if (!isVisible) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <span className="notification-icon success">✓</span>;
      case 'error':
        return <span className="notification-icon error">✕</span>;
      case 'warning':
        return <span className="notification-icon warning">⚠</span>;
      default:
        return <span className="notification-icon info">i</span>;
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`notification ${type}`}>
      <div className="notification-header">
        {getIcon()}
        <h3 className="notification-title">{title}</h3>
        {dismissible && (
          <button className="notification-dismiss" onClick={handleDismiss}>
            ×
          </button>
        )}
      </div>
      <div className="notification-body">
        <p>{message}</p>
      </div>
      <div className="notification-footer">
        <span className="notification-timestamp">{formatTime(timestamp)}</span>
      </div>
    </div>
  );
};

export default Notification;