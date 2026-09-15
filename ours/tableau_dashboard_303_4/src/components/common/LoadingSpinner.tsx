import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
  subMessage?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Loading...',
  subMessage
}) => {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading content"
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#e0d490',
        padding: '20px'
      }}
    >
      {/* Accessible loading spinner */}
      <div
        style={{
          width: '50px',
          height: '50px',
          border: '5px solid #f3f3f3',
          borderTop: '5px solid #820000',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '20px'
        }}
        aria-hidden="true"
      />
      <div
        style={{
          fontSize: '18px',
          fontWeight: 'bold',
          color: '#820000',
          marginBottom: '10px',
          textAlign: 'center'
        }}
      >
        {message}
      </div>
      {subMessage && (
        <div
          style={{
            fontSize: '14px',
            color: '#666',
            textAlign: 'center'
          }}
        >
          {subMessage}
        </div>
      )}

      {/* Add keyframes for spinner animation */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

interface ErrorDisplayProps {
  message: string;
  details?: string;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  message,
  details
}) => {
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
        backgroundColor: '#e0d490',
        padding: '20px'
      }}
    >
      <div
        style={{
          fontSize: '48px',
          marginBottom: '20px',
          color: '#820000'
        }}
        aria-hidden="true"
      >
        ⚠️
      </div>
      <div
        style={{
          fontSize: '20px',
          fontWeight: 'bold',
          color: '#820000',
          marginBottom: '10px',
          textAlign: 'center'
        }}
      >
        {message}
      </div>
      {details && (
        <div
          style={{
            fontSize: '14px',
            color: '#666',
            textAlign: 'center',
            maxWidth: '500px'
          }}
        >
          {details}
        </div>
      )}
    </div>
  );
};

interface EmptyStateProps {
  message?: string;
  subMessage?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  message = 'No data available',
  subMessage
}) => {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        minHeight: '200px',
        padding: '40px',
        textAlign: 'center'
      }}
    >
      <div
        style={{
          fontSize: '48px',
          marginBottom: '20px',
          opacity: 0.5
        }}
        aria-hidden="true"
      >
        📊
      </div>
      <div
        style={{
          fontSize: '16px',
          fontWeight: 'bold',
          color: '#666',
          marginBottom: '10px'
        }}
      >
        {message}
      </div>
      {subMessage && (
        <div
          style={{
            fontSize: '14px',
            color: '#999'
          }}
        >
          {subMessage}
        </div>
      )}
    </div>
  );
};
