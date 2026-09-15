/**
 * ErrorState Component
 * Accessible error display with proper ARIA attributes
 */

import React from 'react';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

const ErrorState: React.FC<ErrorStateProps> = ({ message, onRetry }) => {
  return (
    <div
      role="alert"
      aria-live="assertive"
      style={{
        backgroundColor: '#000000',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: 'Calibri, sans-serif',
        color: '#ff6b6b',
        fontSize: '16px',
        padding: '20px',
        textAlign: 'center',
      }}
    >
      <p style={{ margin: '0 0 20px 0', maxWidth: '600px' }}>{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            backgroundColor: '#4a4a4a',
            color: '#fff',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '2px',
            fontSize: '16px',
            cursor: 'pointer',
            transition: 'background-color 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#5a5a5a';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#4a4a4a';
          }}
        >
          Retry
        </button>
      )}
    </div>
  );
};

export default ErrorState;
