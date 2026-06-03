import React from 'react';

export const AccessLogs = () => {
  const accessLogs = [
    {
      id: '1',
      date: '2023-04-20 14:30:22',
      ip: '192.168.1.45',
      location: 'New York, US',
      device: 'Chrome on macOS',
      action: 'Login'
    },
    {
      id: '2',
      date: '2023-04-19 09:15:10',
      ip: '203.0.113.76',
      location: 'London, UK',
      device: 'Firefox on Windows',
      action: 'Password change'
    },
    {
      id: '3',
      date: '2023-04-18 22:05:33',
      ip: '198.51.100.23',
      location: 'Tokyo, JP',
      device: 'Safari on iOS',
      action: 'API access'
    }
  ];

  return (
    <div className="access-logs">
      <h3>Recent Access Logs</h3>
      <div className="logs-table">
        <div className="logs-header">
          <div>Date</div>
          <div>IP Address</div>
          <div>Location</div>
          <div>Device</div>
          <div>Action</div>
        </div>
        {accessLogs.map(log => (
          <div key={log.id} className="log-entry">
            <div>{log.date}</div>
            <div>{log.ip}</div>
            <div>{log.location}</div>
            <div>{log.device}</div>
            <div>{log.action}</div>
          </div>
        ))}
      </div>
    </div>
  );
};