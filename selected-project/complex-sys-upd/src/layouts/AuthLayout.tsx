import React from 'react';
import { Outlet } from 'react-router-dom';
import { Layout, theme } from 'antd';
import './AuthLayout.css';

const { Content } = Layout;

const AuthLayout = () => {
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  return (
    <Layout className="auth-layout">
      <Content
        style={{
          padding: '24px',
          minHeight: '100vh',
          background: colorBgContainer,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <div className="auth-container">
          <Outlet />
        </div>
      </Content>
    </Layout>
  );
};
export default AuthLayout;