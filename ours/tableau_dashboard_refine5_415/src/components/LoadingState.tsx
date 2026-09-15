export const LoadingState: React.FC = () => {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px',
        color: '#666',
      }}
    >
      <div>Loading dashboard data...</div>
    </div>
  );
};

export const ErrorState: React.FC<{ error: string }> = ({ error }) => {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '16px',
        color: '#d62728',
        textAlign: 'center',
        padding: '20px',
      }}
    >
      <div>
        <div style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '10px' }}>Error loading data</div>
        <div>{error}</div>
      </div>
    </div>
  );
};
