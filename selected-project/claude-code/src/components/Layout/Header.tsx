import React from 'react';
import { Layout, Button, Space, Avatar, Dropdown, Badge, Input } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
  MessageOutlined,
  SearchOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAppContext } from '../../context/AppContext';

const { Header: AntHeader } = Layout;
const { Search } = Input;

interface HeaderProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const AppHeader: React.FC<HeaderProps> = ({ collapsed, setCollapsed }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { state } = useAppContext();

  const handleSearch = (value: string) => {
    if (value.trim()) {
      navigate(`/search?q=${encodeURIComponent(value)}`);
    }
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile',
      onClick: () => navigate('/profile'),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
      onClick: () => navigate('/settings'),
    },
    ...(user?.role === 'admin' ? [{
      key: 'admin',
      icon: <SettingOutlined />,
      label: 'Admin Dashboard',
      onClick: () => navigate('/admin'),
    }] : []),
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: logout,
    },
  ];

  return (
    <AntHeader
      style={{
        padding: '0 24px',
        background: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={() => setCollapsed(!collapsed)}
          style={{
            fontSize: '16px',
            width: 64,
            height: 64,
          }}
        />
        <div
          style={{
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#1890ff',
            marginLeft: '16px',
          }}
        >
          Social Network
        </div>
      </div>

      <div style={{ flex: 1, maxWidth: '400px', margin: '0 24px' }}>
        <Search
          placeholder="Search users, posts, hashtags..."
          allowClear
          enterButton={<SearchOutlined />}
          size="middle"
          onSearch={handleSearch}
        />
      </div>

      <Space size="middle">
        <Badge count={state.notifications.unreadCount} size="small">
          <Button
            type="text"
            icon={<BellOutlined />}
            onClick={() => navigate('/notifications')}
            style={{ fontSize: '16px' }}
          />
        </Badge>

        <Badge count={0} size="small">
          <Button
            type="text"
            icon={<MessageOutlined />}
            onClick={() => navigate('/messages')}
            style={{ fontSize: '16px' }}
          />
        </Badge>

        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
          <Space style={{ cursor: 'pointer' }}>
            <Avatar
              size="small"
              src={user?.profilePicture}
              icon={!user?.profilePicture && <UserOutlined />}
            />
            <span style={{ fontWeight: 500 }}>
              {user?.fullName || user?.username}
            </span>
          </Space>
        </Dropdown>
      </Space>
    </AntHeader>
  );
};

export default AppHeader;