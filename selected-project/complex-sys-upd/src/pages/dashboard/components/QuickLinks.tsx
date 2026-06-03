import React from 'react';
import { Link } from 'react-router-dom';
import { RocketOutlined, FileOutlined, TeamOutlined, SettingOutlined, DashboardOutlined } from '@ant-design/icons';
import { Card, Space } from 'antd';

interface QuickLink {
  title: string;
  icon: React.ReactNode;
  path: string;
  description: string;
}

const QuickLinks: React.FC = () => {
  const links: QuickLink[] = [
    {
      title: 'New Project',
      icon: <RocketOutlined />,
      path: '/project-management',
      description: 'Start a new project template'
    },
    {
      title: 'Reports',
      icon: <FileOutlined />,
      path: '/analytics',
      description: 'View latest analytics reports'
    },
    {
      title: 'Team',
      icon: <TeamOutlined />,
      path: '/user-profile',
      description: 'Manage team members'
    },
    {
      title: 'Settings',
      icon: <SettingOutlined />,
      path: '/settings',
      description: 'Configure application settings'
    },
    {
      title: 'Dashboard',
      icon: <DashboardOutlined />,
      path: '/dashboard',
      description: 'Return to main dashboard'
    }
  ];

  return (
    <Card title="Quick Actions" bordered={false}>
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        {links.map((link) => (
          <Link to={link.path} key={link.title}>
            <Card hoverable>
              <Space>
                {link.icon}
                <div>
                  <h4>{link.title}</h4>
                  <p>{link.description}</p>
                </div>
              </Space>
            </Card>
          </Link>
        ))}
      </Space>
    </Card>
  );
};

export default QuickLinks;