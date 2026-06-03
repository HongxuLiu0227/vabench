import React, { useState } from 'react';

export const SecuritySettings = () => {
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [loginAlerts, setLoginAlerts] = useState(true);

  return (
    <div className="security-settings">
      <h3>Security Settings</h3>
      <div className="security-options">
        <label>
          <input 
            type="checkbox" 
            checked={twoFactorAuth} 
            onChange={() => setTwoFactorAuth(!twoFactorAuth)} 
          />
          Enable Two-Factor Authentication
        </label>
        <label>
          <input 
            type="checkbox" 
            checked={loginAlerts} 
            onChange={() => setLoginAlerts(!loginAlerts)} 
          />
          Receive Login Alerts
        </label>
      </div>
      <div className="security-status">
        <p>Last password change: 3 months ago</p>
        <p>Active sessions: 2 devices</p>
      </div>
    </div>
  );
};