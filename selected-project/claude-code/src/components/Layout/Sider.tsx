import React from 'react';
import { Layout, Menu } from 'antd';
import {
  HomeOutlined,
  UserOutlined,
  MessageOutlined,
  BellOutlined,
  SearchOutlined,
  SettingOutlined,
  DashboardOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const { Sider: AntSider } = Layout;

interface SiderProps {
  collapsed: boolean;
}

const AppSider: React.FC<SiderProps> = ({ collapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const menuItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: 'Home',
    },
    {
      key: '/profile',
      icon: <UserOutlined />,
      label: 'Profile',
    },
    {
      key: '/messages',
      icon: <MessageOutlined />,
      label: 'Messages',
    },
    {
      key: '/notifications',
      icon: <BellOutlined />,
      label: 'Notifications',
    },
    {
      key: '/search',
      icon: <SearchOutlined />,
      label: 'Search',
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: 'Settings',
    },
    ...(user?.role === 'admin' ? [{
      key: '/admin',
      icon: <DashboardOutlined />,
      label: 'Admin',
    }] : []),
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  return (
    <AntSider
      trigger={null}
      collapsible
      collapsed={collapsed}
      style={{
        background: '#fff',
        boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
      }}
    >
      <div
        style={{
          height: '32px',
          margin: '16px',
          background: 'rgba(255, 255, 255, 0.2)',
          borderRadius: '6px',
        }}
      />
      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        items={menuItems}
        onClick={handleMenuClick}
        style={{
          borderRight: 0,
          background: '#fff',
        }}
      />
    </AntSider>
  );
};

export default AppSider;