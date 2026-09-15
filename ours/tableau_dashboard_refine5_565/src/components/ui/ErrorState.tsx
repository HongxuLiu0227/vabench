interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export default function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div
      role="alert"
      aria-live="assertive"
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '16px',
        padding: '20px',
        textAlign: 'center',
      }}
    >
      <svg
        width="48"
        height="48"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#e15759"
        strokeWidth="2"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      <div>
        <p
          style={{
            fontSize: '16px',
            fontWeight: 'bold',
            color: '#333',
            margin: '0 0 8px 0',
          }}
        >
          Error Loading Data
        </p>
        <p
          style={{
            fontSize: '14px',
            color: '#666',
            margin: 0,
          }}
        >
          {message}
        </p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            padding: '8px 16px',
            fontSize: '14px',
            fontWeight: '500',
            color: '#fff',
            backgroundColor: '#4e79a7',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            transition: 'background-color 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#3d6a99';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#4e79a7';
          }}
        >
          Retry
        </button>
      )}
    </div>
  );
}
