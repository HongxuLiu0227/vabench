interface ErrorProps {
  error: Error;
}

export function Error({ error }: ErrorProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        padding: '20px',
        textAlign: 'center',
      }}
    >
      <h2 style={{ color: '#d32f2f', marginBottom: '16px' }}>Error Loading Dashboard</h2>
      <p style={{ fontSize: '16px', color: '#555' }}>{error.message}</p>
      <p style={{ fontSize: '14px', color: '#777', marginTop: '8px' }}>
        Please check the console for more details.
      </p>
    </div>
  );
}
