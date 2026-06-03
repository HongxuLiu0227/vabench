import React from 'react';
import { Card, Typography } from 'antd';
import { DashboardOutlined } from '@ant-design/icons';

const { Title } = Typography;

const AdminDashboard: React.FC = () => {
  return (
    <Card>
      <div style={{ textAlign: 'center', padding: '60px' }}>
        <DashboardOutlined style={{ fontSize: '64px', color: '#1890ff' }} />
        <Title level={3} style={{ marginTop: '24px' }}>
          Admin Dashboard
        </Title>
        <p style={{ fontSize: '16px', color: '#666' }}>
          Admin features coming soon!
        </p>
        <p style={{ fontSize: '14px', color: '#999' }}>
          You'll have access to user management, content moderation, reports, and system analytics.
        </p>
      </div>
    </Card>
  );
};

export default AdminDashboard;