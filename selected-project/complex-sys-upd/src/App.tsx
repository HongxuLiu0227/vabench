import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';
import DashboardPage from './pages/dashboard';
import UserProfilePage from './pages/user-profile';
import AnalyticsPage from './pages/analytics';
import ProjectManagementPage from './pages/project-management';
import SettingsPage from './pages/settings/SettingsPage';
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <Router>
            <Routes>
              <Route path="/" element={<MainLayout />}>
                <Route index element={<DashboardPage />} />
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="profile" element={<UserProfilePage />} />
                <Route path="analytics" element={<AnalyticsPage />} />
                <Route path="projects" element={<ProjectManagementPage />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>
              <Route path="/auth" element={<AuthLayout />}>
                {/* Auth routes will be added here */}
              </Route>
            </Routes>
          </Router>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;