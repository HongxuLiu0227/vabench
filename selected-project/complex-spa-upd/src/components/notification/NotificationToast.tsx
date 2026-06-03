import React, { useState, useEffect } from 'react';
import { FiAlertCircle, FiCheckCircle, FiInfo, FiX } from 'react-icons/fi';
import styles from './NotificationToast.module.css';

type ToastType = 'success' | 'error' | 'info';

interface NotificationToastProps {
  type: ToastType;
  message: string;
  autoDismiss?: boolean;
  dismissTime?: number;
}

export const NotificationToast = ({
  type = 'info',
  message,
  autoDismiss = true,
  dismissTime = 5000,
}: NotificationToastProps) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (!autoDismiss) return;

    const timer = setTimeout(() => {
      setIsVisible(false);
    }, dismissTime);

    return () => clearTimeout(timer);
  }, [autoDismiss, dismissTime]);

  if (!isVisible) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <FiCheckCircle className={styles.icon} />;
      case 'error':
        return <FiAlertCircle className={styles.icon} />;
      case 'info':
        return <FiInfo className={styles.icon} />;
      default:
        return null;
    }
  };

  return (
    <div className={`${styles.toast} ${styles[type]}`}>
      <div className={styles.content}>
        {getIcon()}
        <span className={styles.message}>{message}</span>
      </div>
      <button className={styles.closeButton} onClick={() => setIsVisible(false)}>
        <FiX />
      </button>
    </div>
  );
};