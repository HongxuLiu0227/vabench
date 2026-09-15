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
        gap: '20px',
        padding: '20px',
      }}
    >
      <div
        style={{
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          backgroundColor: '#fee',
          border: '3px solid #f44',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          fontSize: '32px',
          color: '#f44',
          fontWeight: 'bold',
        }}
      >
        !
      </div>
      <h2 style={{ color: '#333', margin: 0 }}>Error Loading Data</h2>
      <p style={{ color: '#666', fontSize: '16px', textAlign: 'center', maxWidth: '500px' }}>
        {message}
      </p>
      <button
        onClick={() => window.location.reload()}
        style={{
          padding: '10px 20px',
          backgroundColor: '#1f77b4',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '500',
        }}
      >
        Retry
      </button>
    </div>
  );
}
