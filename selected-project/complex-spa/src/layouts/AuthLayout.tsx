import React from 'react';
import { Outlet } from 'react-router-dom';
import './AuthLayout.css';

const AuthLayout: React.FC = () => {
  return (
    <div className="auth-layout">
      <div className="auth-container">
        <div className="auth-header">
          <h1>Company Name</h1>
          <p>Welcome back! Please sign in to continue.</p>
        </div>
        <div className="auth-content">
          <Outlet />
        </div>
        <div className="auth-footer">
          <p>© 2023 Company Name. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;