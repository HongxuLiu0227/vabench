import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Layout, theme } from 'antd';
import Header from './Header';
import Sider from './Sider';

const { Content } = Layout;

const AppLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header collapsed={collapsed} setCollapsed={setCollapsed} />
      <Layout>
        <Sider collapsed={collapsed} />
        <Layout style={{ padding: '0 24px 24px' }}>
          <Content
            style={{
              padding: 24,
              margin: 0,
              minHeight: 280,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default AppLayout;