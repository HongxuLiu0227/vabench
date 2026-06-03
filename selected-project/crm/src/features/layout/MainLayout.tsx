import { Layout, Menu } from 'antd';
import { Link, Outlet } from 'react-router-dom';
import {
  UserOutlined,
  ShoppingCartOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import './MainLayout.css';

const { Header, Sider, Content } = Layout;

const MainLayout = ({ children }: { children?: React.ReactNode }) => {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible>
        <div className="logo" />
        <Menu theme="dark" mode="inline" defaultSelectedKeys={['1']}>
          <Menu.Item key="1" icon={<UserOutlined />}>
            <Link to="/customers">Customers</Link>
          </Menu.Item>
          <Menu.Item key="2" icon={<ShoppingCartOutlined />}>
            <Link to="/deals">Deals</Link>
          </Menu.Item>
          <Menu.Item key="3" icon={<CheckCircleOutlined />}>
            <Link to="/tasks">Tasks</Link>
          </Menu.Item>
        </Menu>
      </Sider>
      <Layout className="site-layout">
        <Header className="site-layout-background" style={{ padding: 0 }} />
        <Content style={{ margin: '16px' }}>
          <div className="site-layout-background" style={{ padding: 24, minHeight: 360 }}>
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;