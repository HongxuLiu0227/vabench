/**
 * LoadingState Component
 * Accessible loading indicator with proper ARIA attributes
 */

import React from 'react';

interface LoadingStateProps {
  message?: string;
}

const LoadingState: React.FC<LoadingStateProps> = ({ message = 'Loading dashboard...' }) => {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      style={{
        backgroundColor: '#000000',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: 'Calibri, sans-serif',
        color: '#fff',
        fontSize: '18px',
        padding: '20px',
      }}
    >
      <div
        style={{
          width: '50px',
          height: '50px',
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #4a4a4a',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '20px',
        }}
      />
      <p style={{ margin: 0 }}>{message}</p>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LoadingState;
