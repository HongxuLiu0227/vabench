interface EmptyStateProps {
  message?: string;
}

export default function EmptyState({ message = 'No data available' }: EmptyStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '12px',
        padding: '20px',
        textAlign: 'center',
      }}
    >
      <svg
        width="48"
        height="48"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#999"
        strokeWidth="2"
        aria-hidden="true"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <line x1="9" y1="9" x2="15" y2="9" />
        <line x1="9" y1="13" x2="15" y2="13" />
        <line x1="9" y1="17" x2="13" y2="17" />
      </svg>
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
  );
}
