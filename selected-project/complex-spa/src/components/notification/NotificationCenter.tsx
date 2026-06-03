import React, { useState, useEffect } from 'react';
import { BellOutlined } from '@ant-design/icons';
import { Badge, List, Popover, Button } from 'antd';
import './Notification.css';

type Notification = {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'info' | 'warning' | 'error' | 'success';
};

const NotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Mock data fetch
    const mockNotifications: Notification[] = [
      {
        id: '1',
        title: 'New Message',
        message: 'You have received a new message from John Doe',
        timestamp: '2 minutes ago',
        read: false,
        type: 'info'
      },
      {
        id: '2',
        title: 'System Update',
        message: 'Scheduled maintenance will occur tonight at 2 AM',
        timestamp: '1 hour ago',
        read: false,
        type: 'warning'
      },
      {
        id: '3',
        title: 'Payment Received',
        message: 'Your invoice #12345 has been paid',
        timestamp: '3 hours ago',
        read: true,
        type: 'success'
      }
    ];

    setNotifications(mockNotifications);
    setUnreadCount(mockNotifications.filter(n => !n.read).length);
  }, []);

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? {...n, read: true} : n)
    );
    setUnreadCount(prev => prev - 1);
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({...n, read: true})));
    setUnreadCount(0);
  };

  const notificationContent = (
    <div className="notification-popover">
      <div className="notification-header">
        <h4>Notifications</h4>
        <Button type="link" size="small" onClick={markAllAsRead}>
          Mark all as read
        </Button>
      </div>
      <List
        itemLayout="horizontal"
        dataSource={notifications}
        renderItem={item => (
          <List.Item 
            className={`notification-item ${item.read ? '' : 'unread'}`}
            onClick={() => markAsRead(item.id)}
          >
            <List.Item.Meta
              title={<span className={`notification-title ${item.type}`}>{item.title}</span>}
              description={<>
                <div>{item.message}</div>
                <div className="notification-time">{item.timestamp}</div>
              </>}
            />
          </List.Item>
        )}
      />
      <div className="notification-footer">
        <Button type="link" size="small">View All</Button>
      </div>
    </div>
  );

  return (
    <Popover 
      placement="bottomRight" 
      content={notificationContent}
      trigger="click"
      visible={visible}
      onVisibleChange={setVisible}
    >
      <Badge count={unreadCount}>
        <BellOutlined className="notification-icon" />
      </Badge>
    </Popover>
  );
};

export default NotificationCenter;