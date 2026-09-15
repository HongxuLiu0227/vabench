import React from 'react';

interface ErrorStateProps {
  title?: string;
  message: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Error',
  message,
}) => {
  return (
    <div
      role="alert"
      aria-live="assertive"
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
      }}
    >
      <div
        style={{
          textAlign: 'center',
          color: '#d32f2f',
          padding: '20px',
          backgroundColor: '#ffebee',
          borderRadius: '8px',
          maxWidth: '400px',
        }}
      >
        <svg
          aria-hidden="true"
          style={{
            width: '48px',
            height: '48px',
            margin: '0 auto 16px',
            fill: '#d32f2f',
          }}
          viewBox="0 0 24 24"
        >
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
        </svg>
        <div
          style={{
            fontSize: '24px',
            marginBottom: '16px',
            fontWeight: 'bold',
          }}
        >
          {title}
        </div>
        <div style={{ fontSize: '16px' }}>{message}</div>
      </div>
    </div>
  );
};
