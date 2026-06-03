import React, { useState } from 'react';
import { FiAlertCircle, FiCheckCircle, FiX } from 'react-icons/fi';
import styles from './NotificationBanner.module.css';

type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface NotificationBannerProps {
  type: NotificationType;
  message: string;
  dismissible?: boolean;
}

export const NotificationBanner = ({ type, message, dismissible = true }: NotificationBannerProps) => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <FiCheckCircle className={styles.icon} />;
      case 'error':
        return <FiAlertCircle className={styles.icon} />;
      case 'warning':
        return <FiAlertCircle className={styles.icon} />;
      case 'info':
        return <FiAlertCircle className={styles.icon} />;
      default:
        return null;
    }
  };

  return (
    <div className={`${styles.notification} ${styles[type]}`}>
      <div className={styles.content}>
        {getIcon()}
        <span className={styles.message}>{message}</span>
      </div>
      {dismissible && (
        <button className={styles.closeButton} onClick={() => setIsVisible(false)}>
          <FiX />
        </button>
      )}
    </div>
  );
};