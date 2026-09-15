import React from 'react';

interface LoadingStateProps {
  message?: string;
}

/**
 * Accessible loading state component
 * Provides proper ARIA attributes and visual feedback
 */
export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading data...'
}) => {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        gap: '1rem',
        height: '100%',
        width: '100%'
      }}
    >
      {/* Animated spinner */}
      <div
        style={{
          width: '40px',
          height: '40px',
          border: '4px solid #e0e0e0',
          borderTop: '4px solid #1f77b4',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}
        aria-hidden="true"
      />
      <span
        style={{
          fontSize: '14px',
          color: '#666',
          textAlign: 'center'
        }}
      >
        {message}
      </span>
      {/* Inject keyframes for spin animation */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
