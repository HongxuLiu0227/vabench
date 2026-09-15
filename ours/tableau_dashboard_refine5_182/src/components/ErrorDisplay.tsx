interface ErrorDisplayProps {
  message: string;
}

export function ErrorDisplay({ message }: ErrorDisplayProps) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        flexDirection: 'column',
        gap: '16px',
        padding: '20px',
      }}
      role="alert"
      aria-live="assertive"
    >
      <div
        style={{
          backgroundColor: '#fee',
          border: '1px solid #fcc',
          borderRadius: '4px',
          padding: '16px',
          maxWidth: '500px',
        }}
      >
        <h3 style={{ margin: '0 0 8px 0', color: '#c00' }}>Error</h3>
        <p style={{ margin: 0, color: '#666' }}>{message}</p>
      </div>
    </div>
  );
}
