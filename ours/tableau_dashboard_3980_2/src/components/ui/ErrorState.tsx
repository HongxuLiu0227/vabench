import React from 'react';

interface ErrorStateProps {
  error: string;
  onRetry?: () => void;
}

/**
 * Accessible error state component
 * Provides proper ARIA attributes and error recovery options
 */
export const ErrorState: React.FC<ErrorStateProps> = ({ error, onRetry }) => {
  return (
    <div
      role="alert"
      aria-live="assertive"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        gap: '1rem',
        height: '100%',
        width: '100%',
        backgroundColor: '#fff5f5',
        border: '1px solid #fed7d7',
        borderRadius: '4px'
      }}
    >
      {/* Error icon */}
      <svg
        width="48"
        height="48"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#c53030"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        style={{ flexShrink: 0 }}
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>

      <div style={{ textAlign: 'center', maxWidth: '400px' }}>
        <h3
          style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#c53030',
            margin: '0 0 0.5rem 0'
          }}
        >
          Error Loading Data
        </h3>
        <p
          style={{
            fontSize: '14px',
            color: '#742a2a',
            margin: '0 0 1rem 0',
            lineHeight: '1.5'
          }}
        >
          {error}
        </p>
      </div>

      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            padding: '0.5rem 1rem',
            fontSize: '14px',
            fontWeight: '500',
            color: '#fff',
            backgroundColor: '#c53030',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            transition: 'background-color 0.2s',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#9b2c2c';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#c53030';
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.3" />
          </svg>
          Try Again
        </button>
      )}
    </div>
  );
};
