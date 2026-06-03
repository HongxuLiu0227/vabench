import React from 'react';
import { Card, Typography } from 'antd';
import { SettingOutlined } from '@ant-design/icons';

const { Title } = Typography;

const Settings: React.FC = () => {
  return (
    <Card>
      <div style={{ textAlign: 'center', padding: '60px' }}>
        <SettingOutlined style={{ fontSize: '64px', color: '#1890ff' }} />
        <Title level={3} style={{ marginTop: '24px' }}>
          Settings
        </Title>
        <p style={{ fontSize: '16px', color: '#666' }}>
          Settings and privacy controls coming soon!
        </p>
        <p style={{ fontSize: '14px', color: '#999' }}>
          You'll be able to configure privacy settings, notification preferences, and account security.
        </p>
      </div>
    </Card>
  );
};

export default Settings;