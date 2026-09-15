/**
 * Accessible loading state component
 */

import React from 'react';

interface LoadingStateProps {
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ message = 'Loading dashboard...' }) => {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '16px',
        color: '#666',
        gap: '16px',
      }}
    >
      <svg
        width="50"
        height="50"
        viewBox="0 0 50 50"
        aria-hidden="true"
        style={{
          animation: 'spin 1s linear infinite',
        }}
      >
        <circle
          cx="25"
          cy="25"
          r="20"
          fill="none"
          stroke="#4e79a7"
          strokeWidth="4"
          strokeDasharray="80"
          strokeDashoffset="60"
        />
      </svg>
      <span>{message}</span>
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};
