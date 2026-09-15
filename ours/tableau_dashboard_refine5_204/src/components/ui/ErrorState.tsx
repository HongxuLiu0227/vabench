/**
 * Accessible error state component
 */

import React from 'react';

interface ErrorStateProps {
  message: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ message }) => {
  return (
    <div
      role="alert"
      aria-live="assertive"
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '16px',
        color: '#d9534f',
        padding: '20px',
        textAlign: 'center',
        gap: '12px',
      }}
    >
      <svg
        width="50"
        height="50"
        viewBox="0 0 50 50"
        aria-hidden="true"
        fill="none"
        stroke="#d9534f"
        strokeWidth="2"
      >
        <circle cx="25" cy="25" r="20" />
        <line x1="17" y1="17" x2="33" y2="33" />
        <line x1="33" y1="17" x2="17" y2="33" />
      </svg>
      <div>
        <strong>Error:</strong> {message}
      </div>
      <div style={{ fontSize: '14px', color: '#666' }}>
        Please refresh the page to try again
      </div>
    </div>
  );
};
