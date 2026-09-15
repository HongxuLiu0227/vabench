import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message = 'Loading...' }) => {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={message}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        minHeight: '200px',
        flexDirection: 'column',
        gap: '12px',
      }}
    >
      <svg
        width="40"
        height="40"
        viewBox="0 0 40 40"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        style={{
          animation: 'spin 1s linear infinite',
        }}
      >
        <circle
          cx="20"
          cy="20"
          r="16"
          fill="none"
          stroke="#3182bd"
          strokeWidth="4"
          strokeOpacity="0.3"
        />
        <path
          d="M20 4 A16 16 0 0 1 36 20"
          fill="none"
          stroke="#3182bd"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </svg>
      <span
        style={{
          fontSize: '14px',
          color: '#666',
          fontFamily: 'Inter, system-ui, sans-serif',
        }}
      >
        {message}
      </span>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner;
