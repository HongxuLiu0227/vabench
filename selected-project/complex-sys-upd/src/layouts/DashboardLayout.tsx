import { Outlet } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import { DashboardOutlined, UserOutlined, ProjectOutlined, SettingOutlined, BarChartOutlined } from '@ant-design/icons';
import './DashboardLayout.css';

const { Header, Sider, Content } = Layout;

const DashboardLayout = () => {
  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'User Profile',
    },
    {
      key: 'projects',
      icon: <ProjectOutlined />,
      label: 'Project Management',
    },
    {
      key: 'analytics',
      icon: <BarChartOutlined />,
      label: 'Analytics',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
    },
  ];

  return (
    <Layout className="dashboard-layout">
      <Sider width={250} theme="light" breakpoint="lg" collapsedWidth="0">
        <div className="logo-container">
          <h1>ProjectHub</h1>
        </div>
        <Menu
          theme="light"
          mode="inline"
          defaultSelectedKeys={['dashboard']}
          items={menuItems}
        />
      </Sider>
      <Layout>
        <Header className="dashboard-header">
          <div className="header-content">
            <h2>Welcome back, Admin</h2>
            <div className="header-actions">
              <button className="notification-btn">
                <span className="badge">3</span>
                <i className="icon-bell" />
              </button>
              <div className="user-avatar">
                <img src="/avatar.png" alt="User" />
              </div>
            </div>
          </div>
        </Header>
        <Content className="dashboard-content">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};
export default DashboardLayout;
