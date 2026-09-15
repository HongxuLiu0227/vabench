import React from 'react';

export const LoadingSpinner: React.FC = () => {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      flexDirection: 'column',
      gap: '20px'
    }}>
      <div style={{
        border: '4px solid #f3f3f3',
        borderTop: '4px solid #4169E1',
        borderRadius: '50%',
        width: '40px',
        height: '40px',
        animation: 'spin 1s linear infinite'
      }} />
      <p style={{ color: '#666', fontSize: '16px' }}>Loading dashboard data...</p>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export const ErrorMessage: React.FC<{ error: Error }> = ({ error }) => {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      flexDirection: 'column',
      gap: '20px',
      padding: '20px'
    }}>
      <div style={{
        color: '#d32f2f',
        fontSize: '18px',
        textAlign: 'center'
      }}>
        <strong>Error loading dashboard</strong>
      </div>
      <div style={{
        color: '#666',
        fontSize: '14px',
        textAlign: 'center',
        maxWidth: '500px'
      }}>
        {error.message}
      </div>
    </div>
  );
};
