import { Layout } from 'antd';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import DashboardPage from './pages/dashboard';
import ProfilePage from './pages/profile';
import AnalyticsPage from './pages/analytics';
import ProjectsPage from './pages/projects';
import SettingsPage from './pages/settings';
import AppHeader from './components/ui/AppHeader';
import AppSider from './components/ui/AppSider';
import './App.css';

const { Content } = Layout;

function App() {
  return (
    <BrowserRouter>
      <Layout style={{ minHeight: '100vh' }}>
        <AppSider />
        <Layout>
          <AppHeader />
          <Content style={{ margin: '24px 16px', padding: 24, background: '#fff' }}>
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/projects" element={<ProjectsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </Content>
        </Layout>
      </Layout>
    </BrowserRouter>
  );
}

export default App;