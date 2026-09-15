import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message = 'Loading...' }) => {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading data"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        height: '100%',
        width: '100%',
        textAlign: 'center'
      }}
    >
      <svg
        width="40"
        height="40"
        viewBox="0 0 40 40"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          animation: 'spin 1s linear infinite'
        }}
        aria-hidden="true"
      >
        <circle
          cx="20"
          cy="20"
          r="18"
          fill="none"
          stroke="#4e79a7"
          strokeWidth="3"
          strokeDasharray="85"
          strokeLinecap="round"
        />
      </svg>
      <span
        style={{
          marginTop: '12px',
          fontSize: '14px',
          color: '#666',
          fontFamily: 'Arial, sans-serif'
        }}
      >
        {message}
      </span>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
