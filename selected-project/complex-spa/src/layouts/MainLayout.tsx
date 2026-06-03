import { Outlet } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import { UserOutlined, DashboardOutlined, CalendarOutlined, BarChartOutlined, NotificationOutlined, FileOutlined } from '@ant-design/icons';
import './MainLayout.css';

const { Header, Sider, Content } = Layout;

export const MainLayout = () => {
  return (
    <Layout className="main-layout">
      <Sider width={250} className="sidebar">
        <div className="logo">Dashboard</div>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={['1']}
          items={[
            {
              key: '1',
              icon: <DashboardOutlined />,
              label: 'Dashboard',
            },
            {
              key: '2',
              icon: <UserOutlined />,
              label: 'Users',
            },
            {
              key: '3',
              icon: <CalendarOutlined />,
              label: 'Calendar',
            },
            {
              key: '4',
              icon: <BarChartOutlined />,
              label: 'Analytics',
            },
            {
              key: '5',
              icon: <NotificationOutlined />,
              label: 'Notifications',
            },
            {
              key: '6',
              icon: <FileOutlined />,
              label: 'Documents',
            },
          ]}
        />
      </Sider>
      <Layout>
        <Header className="header">
          <div className="header-content">
            <h1>Admin Dashboard</h1>
          </div>
        </Header>
        <Content className="content">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};
