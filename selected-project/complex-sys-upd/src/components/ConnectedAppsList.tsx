import React from 'react';

export const ConnectedAppsList = () => {
  const connectedApps = [
    {
      id: '1',
      name: 'Slack',
      logo: 'slack-logo.png',
      permissions: ['Read messages', 'Post messages'],
      connectedSince: '2022-11-05'
    },
    {
      id: '2',
      name: 'Google Drive',
      logo: 'drive-logo.png',
      permissions: ['View files', 'Upload files'],
      connectedSince: '2023-01-20'
    },
    {
      id: '3',
      name: 'GitHub',
      logo: 'github-logo.png',
      permissions: ['Read repositories', 'Manage webhooks'],
      connectedSince: '2023-03-15'
    }
  ];

  const disconnectApp = (id: string) => {
    // Implementation would go here
  };

  return (
    <div className="connected-apps-list">
      <h3>Connected Applications</h3>
      <div className="apps-grid">
        {connectedApps.map(app => (
          <div key={app.id} className="app-card">
            <div className="app-header">
              <img src={app.logo} alt={app.name} />
              <h4>{app.name}</h4>
            </div>
            <div className="app-details">
              <p><strong>Permissions:</strong> {app.permissions.join(', ')}</p>
              <p><strong>Connected since:</strong> {app.connectedSince}</p>
            </div>
            <button 
              className="disconnect-btn" 
              onClick={() => disconnectApp(app.id)}
            >
              Disconnect
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};