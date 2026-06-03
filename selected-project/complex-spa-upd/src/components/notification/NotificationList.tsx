import React, { useState } from 'react';
import { FiBell, FiCheck, FiTrash2 } from 'react-icons/fi';
import styles from './NotificationList.module.css';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'alert' | 'message' | 'system';
}

export const NotificationList = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: '1',
      title: 'New message',
      message: 'You have received a new message from Sarah Johnson',
      time: '10 min ago',
      read: false,
      type: 'message',
    },
    {
      id: '2',
      title: 'System update',
      message: 'Scheduled maintenance will occur tomorrow at 2:00 AM',
      time: '1 hour ago',
      read: true,
      type: 'system',
    },
    {
      id: '3',
      title: 'Security alert',
      message: 'Unusual login attempt detected from a new device',
      time: '3 hours ago',
      read: false,
      type: 'alert',
    },
  ]);

  const markAsRead = (id: string) => {
    setNotifications(
      notifications.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter((notification) => notification.id !== id));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleWrapper}>
          <FiBell className={styles.bellIcon} />
          <h3 className={styles.title}>Notifications</h3>
          {unreadCount > 0 && <span className={styles.badge}>{unreadCount}</span>}
        </div>
      </div>

      <div className={styles.list}>
        {notifications.length === 0 ? (
          <div className={styles.empty}>No notifications</div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`${styles.item} ${!notification.read ? styles.unread : ''} ${
                styles[notification.type]
              }`}
            >
              <div className={styles.content}>
                <h4 className={styles.itemTitle}>{notification.title}</h4>
                <p className={styles.message}>{notification.message}</p>
                <span className={styles.time}>{notification.time}</span>
              </div>
              <div className={styles.actions}>
                {!notification.read && (
                  <button
                    className={styles.actionButton}
                    onClick={() => markAsRead(notification.id)}
                    aria-label="Mark as read"
                  >
                    <FiCheck />
                  </button>
                )}
                <button
                  className={styles.actionButton}
                  onClick={() => deleteNotification(notification.id)}
                  aria-label="Delete notification"
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};