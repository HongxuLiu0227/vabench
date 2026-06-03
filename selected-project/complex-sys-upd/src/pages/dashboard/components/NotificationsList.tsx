import React, { useState, useEffect } from 'react';
import { BellOutlined } from '@ant-design/icons';
import { List, Badge, Button, Dropdown, Menu } from 'antd';
import type { MenuProps } from 'antd';

type Notification = {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'system' | 'alert' | 'message';
};

const NotificationsList: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'New project assigned',
      message: 'You have been assigned to the Marketing Dashboard project',
      timestamp: '2023-05-15T10:30:00',
      read: false,
      type: 'system'
    },
    {
      id: '2',
      title: 'Server maintenance',
      message: 'Scheduled maintenance tonight from 2AM to 4AM EST',
      timestamp: '2023-05-14T16:45:00',
      read: true,
      type: 'alert'
    },
    {
      id: '3',
      title: 'New message from Sarah',
      message: 'Can you review the latest design mockups?',
      timestamp: '2023-05-14T09:15:00',
      read: false,
      type: 'message'
    },
    {
      id: '4',
      title: 'Weekly report ready',
      message: 'Your weekly analytics report is now available',
      timestamp: '2023-05-13T08:00:00',
      read: true,
      type: 'system'
    }
  ]);

  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const count = notifications.filter(n => !n.read).length;
    setUnreadCount(count);
  }, [notifications]);

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    );
  };

  const items: MenuProps['items'] = [
    {
      key: '1',
      label: 'Mark all as read',
      onClick: markAllAsRead
    },
    {
      key: '2',
      label: 'Notification settings',
      onClick: () => console.log('Navigate to settings')
    }
  ];

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Dropdown
      overlay={(
        <Menu>
          <Menu.ItemGroup title={`${unreadCount} unread notifications`}>
            <List
              dataSource={notifications}
              renderItem={item => (
                <Menu.Item 
                  key={item.id}
                  onClick={() => markAsRead(item.id)}
                  style={{
                    backgroundColor: !item.read ? '#f6ffed' : 'inherit',
                    padding: '8px 16px',
                    maxWidth: '350px'
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ fontWeight: 'bold' }}>{item.title}</div>
                    <div style={{ color: '#666' }}>{item.message}</div>
                    <div style={{ fontSize: '0.8em', color: '#999' }}>
                      {formatTime(item.timestamp)}
                    </div>
                  </div>
                </Menu.Item>
              )}
            />
          </Menu.ItemGroup>
          <Menu.Divider />
          {items.map(item => (
            <Menu.Item key={item.key} {...item} />
          ))}
        </Menu>
      )}
      placement="bottomRight"
      trigger={['click']}
    >
      <Badge count={unreadCount}>
        <Button 
          type="text" 
          icon={<BellOutlined style={{ fontSize: '18px' }} />} 
          style={{ marginRight: '16px' }}
        />
      </Badge>
    </Dropdown>
  );
};

export default NotificationsList;