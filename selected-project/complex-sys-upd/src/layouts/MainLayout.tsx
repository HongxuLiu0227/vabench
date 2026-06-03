import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Breadcrumb } from 'antd';
import { HomeOutlined, DashboardOutlined, UserOutlined, ProjectOutlined, SettingOutlined, BarChartOutlined } from '@ant-design/icons';
import './MainLayout.css';

const { Header, Content, Footer, Sider } = Layout;

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Map routes to menu keys
  const routeToKey: Record<string, string> = {
    '/': '1',
    '/dashboard': '2',
    '/profile': '3',
    '/projects': '4',
    '/analytics': '5',
    '/settings': '6',
  };
  const keyToRoute: Record<string, string> = {
    '1': '/',
    '2': '/dashboard',
    '3': '/profile',
    '4': '/projects',
    '5': '/analytics',
    '6': '/settings',
  };
  // Find the current menu key based on the current path
  const selectedKey = routeToKey[location.pathname] || '1';

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
        <div className="logo" />
        <Menu
          theme="dark"
          selectedKeys={[selectedKey]}
          mode="inline"
          onClick={({ key }) => {
            const route = keyToRoute[key];
            if (route) navigate(route);
          }}
        >
          <Menu.Item key="1" icon={<HomeOutlined />}>Home</Menu.Item>
          <Menu.Item key="2" icon={<DashboardOutlined />}>Dashboard</Menu.Item>
          <Menu.Item key="3" icon={<UserOutlined />}>User Profile</Menu.Item>
          <Menu.Item key="4" icon={<ProjectOutlined />}>Project Management</Menu.Item>
          <Menu.Item key="5" icon={<BarChartOutlined />}>Analytics</Menu.Item>
          <Menu.Item key="6" icon={<SettingOutlined />}>Settings</Menu.Item>
        </Menu>
      </Sider>
      <Layout className="site-layout">
        <Header className="site-layout-background" style={{ padding: 0 }} />
        <Content style={{ margin: '0 16px' }}>
          <Breadcrumb style={{ margin: '16px 0' }}>
            <Breadcrumb.Item>App</Breadcrumb.Item>
            <Breadcrumb.Item>Current Page</Breadcrumb.Item>
          </Breadcrumb>
          <div className="site-layout-background" style={{ padding: 24, minHeight: 360 }}>
            <Outlet />
          </div>
        </Content>
        <Footer style={{ textAlign: 'center' }}>App Dashboard ©2023</Footer>
      </Layout>
    </Layout>
  );
};
export default MainLayout;
