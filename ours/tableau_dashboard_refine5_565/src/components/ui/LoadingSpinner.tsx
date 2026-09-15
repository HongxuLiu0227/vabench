interface LoadingSpinnerProps {
  size?: number;
  message?: string;
}

export default function LoadingSpinner({ size = 40, message = 'Loading...' }: LoadingSpinnerProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={message}
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '12px',
        width: '100%',
        height: '100%',
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 50 50"
        aria-hidden="true"
        style={{
          animation: 'spin 1s linear infinite',
        }}
      >
        <circle
          cx="25"
          cy="25"
          r="20"
          fill="none"
          stroke="#4e79a7"
          strokeWidth="4"
          strokeDasharray="31.4 31.4"
          strokeLinecap="round"
        />
      </svg>
      <span
        style={{
          fontSize: '14px',
          color: '#666',
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
}
