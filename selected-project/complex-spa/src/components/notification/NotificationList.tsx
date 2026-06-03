import React, { useState } from 'react';
import Notification from './Notification';
import './Notification.css';

interface NotificationItem {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
}

const NotificationList: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: '1',
      type: 'success',
      title: 'Payment Received',
      message: 'Your payment of $249.00 has been processed successfully.',
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      isRead: false,
    },
    {
      id: '2',
      type: 'info',
      title: 'New Feature Available',
      message: 'Check out our new dashboard analytics feature now live!',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      isRead: true,
    },
    {
      id: '3',
      type: 'warning',
      title: 'Scheduled Maintenance',
      message: 'System maintenance scheduled for tomorrow at 2:00 AM EST.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      isRead: false,
    },
    {
      id: '4',
      type: 'error',
      title: 'Login Attempt Failed',
      message: 'There was an unsuccessful login attempt to your account.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
      isRead: true,
    },
  ]);

  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  const handleDismiss = (id: string) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  const markAllAsRead = () => {
    setNotifications(
      notifications.map((n) => ({
        ...n,
        isRead: true,
      }))
    );
  };

  const filteredNotifications = showUnreadOnly
    ? notifications.filter((n) => !n.isRead)
    : notifications;

  return (
    <div className="notification-list">
      <div className="notification-list-header">
        <h3>Notifications</h3>
        <div className="notification-list-actions">
          <button
            className={`filter-toggle ${showUnreadOnly ? 'active' : ''}`}
            onClick={() => setShowUnreadOnly(!showUnreadOnly)}
          >
            {showUnreadOnly ? 'Show All' : 'Unread Only'}
          </button>
          <button className="mark-all-read" onClick={markAllAsRead}>
            Mark All as Read
          </button>
        </div>
      </div>
      <div className="notification-list-items">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((notification) => (
            <Notification
              key={notification.id}
              {...notification}
              onDismiss={handleDismiss}
            />
          ))
        ) : (
          <div className="empty-notifications">
            No notifications to display
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationList;