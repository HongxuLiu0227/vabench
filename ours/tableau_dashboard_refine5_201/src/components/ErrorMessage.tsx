import React from 'react';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onRetry }) => {
  return (
    <div
      role="alert"
      aria-live="assertive"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        height: '100%',
        width: '100%',
        textAlign: 'center',
        color: '#d32f2f',
        backgroundColor: '#ffebee',
        border: '1px solid #ef9a9a',
        borderRadius: '4px',
        margin: '8px'
      }}
    >
      <svg
        width="40"
        height="40"
        viewBox="0 0 40 40"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        style={{
          marginBottom: '12px'
        }}
      >
        <circle
          cx="20"
          cy="20"
          r="18"
          fill="none"
          stroke="#d32f2f"
          strokeWidth="2"
        />
        <text
          x="20"
          y="28"
          textAnchor="middle"
          fontSize="20"
          fill="#d32f2f"
          fontWeight="bold"
        >
          !
        </text>
      </svg>
      <p
        style={{
          margin: '0 0 12px 0',
          fontSize: '14px',
          fontWeight: '500',
          fontFamily: 'Arial, sans-serif'
        }}
      >
        {message}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            padding: '8px 16px',
            backgroundColor: '#d32f2f',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '14px',
            cursor: 'pointer',
            fontFamily: 'Arial, sans-serif',
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#b71c1c';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#d32f2f';
          }}
        >
          Retry
        </button>
      )}
    </div>
  );
};
