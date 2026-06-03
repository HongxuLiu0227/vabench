import React from 'react';
import { Card, Typography } from 'antd';
import { BellOutlined } from '@ant-design/icons';

const { Title } = Typography;

const Notifications: React.FC = () => {
  return (
    <Card>
      <div style={{ textAlign: 'center', padding: '60px' }}>
        <BellOutlined style={{ fontSize: '64px', color: '#1890ff' }} />
        <Title level={3} style={{ marginTop: '24px' }}>
          Notifications
        </Title>
        <p style={{ fontSize: '16px', color: '#666' }}>
          Real-time notifications feature coming soon!
        </p>
        <p style={{ fontSize: '14px', color: '#999' }}>
          You'll receive notifications for friend requests, likes, comments, and messages.
        </p>
      </div>
    </Card>
  );
};

export default Notifications;