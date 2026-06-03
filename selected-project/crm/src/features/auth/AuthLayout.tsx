import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import './AuthLayout.css';

const { Content } = Layout;

const AuthLayout = () => {
  return (
    <Layout className="auth-layout">
      <Content>
        <Outlet />
      </Content>
    </Layout>
  );
};

export default AuthLayout;