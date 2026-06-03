import { Outlet } from 'react-router-dom';
import { Layout } from 'antd';

const { Content } = Layout;

export default function MainLayout() {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Content style={{ padding: '24px' }}>
        <Outlet />
      </Content>
    </Layout>
  );
}