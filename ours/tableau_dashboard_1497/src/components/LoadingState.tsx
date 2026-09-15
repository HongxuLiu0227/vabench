import React from 'react';

interface LoadingStateProps {
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading dashboard...'
}) => {
  return (
    <div
      className="dashboard-container"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="loading">
        <svg
          width="50"
          height="50"
          viewBox="0 0 50 50"
          aria-hidden="true"
          style={{
            animation: 'spin 1s linear infinite',
            marginRight: '15px'
          }}
        >
          <circle
            cx="25"
            cy="25"
            r="20"
            fill="none"
            stroke="#333"
            strokeWidth="4"
            strokeDasharray="31.4 31.4"
            strokeLinecap="round"
          />
        </svg>
        <span>{message}</span>
      </div>
      <style>{`
        @keyframes spin {
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};
