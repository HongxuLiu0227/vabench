import { useState, useEffect } from 'react';
import { notification } from 'antd';

type NotificationType = 'success' | 'info' | 'warning' | 'error';

interface NotificationConfig {
  type: NotificationType;
  message: string;
  description?: string;
  duration?: number;
  placement?: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';
}

export const useNotification = () => {
  const [api, contextHolder] = notification.useNotification();
  const [notifications, setNotifications] = useState<NotificationConfig[]>([]);

  const showNotification = (config: NotificationConfig) => {
    api[config.type]({
      message: config.message,
      description: config.description,
      duration: config.duration || 4.5,
      placement: config.placement || 'topRight',
    });
    setNotifications((prev) => [...prev, config]);
  };

  const showSuccess = (message: string, description?: string) => {
    showNotification({
      type: 'success',
      message,
      description,
    });
  };

  const showError = (message: string, description?: string) => {
    showNotification({
      type: 'error',
      message,
      description,
    });
  };

  const showWarning = (message: string, description?: string) => {
    showNotification({
      type: 'warning',
      message,
      description,
    });
  };

  const showInfo = (message: string, description?: string) => {
    showNotification({
      type: 'info',
      message,
      description,
    });
  };

  return {
    contextHolder,
    showNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    notifications,
  };
};
