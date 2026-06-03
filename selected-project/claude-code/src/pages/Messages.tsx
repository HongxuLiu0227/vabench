import React from 'react';
import { Card, Typography } from 'antd';
import { MessageOutlined } from '@ant-design/icons';

const { Title } = Typography;

const Messages: React.FC = () => {
  return (
    <Card>
      <div style={{ textAlign: 'center', padding: '60px' }}>
        <MessageOutlined style={{ fontSize: '64px', color: '#1890ff' }} />
        <Title level={3} style={{ marginTop: '24px' }}>
          Messages
        </Title>
        <p style={{ fontSize: '16px', color: '#666' }}>
          Direct messaging feature coming soon!
        </p>
        <p style={{ fontSize: '14px', color: '#999' }}>
          You'll be able to send private messages to your friends with real-time delivery.
        </p>
      </div>
    </Card>
  );
};

export default Messages;