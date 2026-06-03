import React, { useState } from 'react';

export const NotificationToggles = () => {
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: false,
    weeklyDigest: true
  });

  const handleToggle = (key: string) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof notifications]
    }));
  };

  return (
    <div className="notification-toggles">
      <h3>Notification Preferences</h3>
      <div className="toggle-group">
        <label>
          <input 
            type="checkbox" 
            checked={notifications.email} 
            onChange={() => handleToggle('email')} 
          />
          Email Notifications
        </label>
        <label>
          <input 
            type="checkbox" 
            checked={notifications.push} 
            onChange={() => handleToggle('push')} 
          />
          Push Notifications
        </label>
        <label>
          <input 
            type="checkbox" 
            checked={notifications.sms} 
            onChange={() => handleToggle('sms')} 
          />
          SMS Alerts
        </label>
        <label>
          <input 
            type="checkbox" 
            checked={notifications.weeklyDigest} 
            onChange={() => handleToggle('weeklyDigest')} 
          />
          Weekly Digest
        </label>
      </div>
    </div>
  );
};