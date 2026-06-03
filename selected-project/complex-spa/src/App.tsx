import React from 'react';
import { Layout, Menu } from 'antd';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import {
  DashboardOutlined,
} from '@ant-design/icons';

import './App.css';
import Dashboard from './pages/Dashboard';

const { Header, Content, Sider } = Layout;

const App: React.FC = () => {
  return (
    <Router>
      <Layout style={{ minHeight: '100vh' }}>
        <Sider collapsible>
          <div className="logo" />
          <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline">
            <Menu.Item key="1" icon={<DashboardOutlined />}>
              <Link to="/">Dashboard</Link>
            </Menu.Item>
          </Menu>
        </Sider>
        <Layout className="site-layout">
          <Header className="site-layout-background" style={{ padding: 0 }} />
          <Content style={{ margin: '0 16px' }}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
            </Routes>
          </Content>
        </Layout>
      </Layout>
    </Router>
  );
};

export default App;