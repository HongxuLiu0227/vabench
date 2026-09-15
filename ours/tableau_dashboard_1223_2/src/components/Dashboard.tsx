import { useData } from '../hooks/useData';
import { MarketPenetration } from './MarketPenetration';

export function Dashboard() {
  const { data, loading, error } = useData();

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          fontFamily: 'Arial, sans-serif',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              border: '4px solid #f3f3f3',
              borderTop: '4px solid #3498db',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 20px',
            }}
          />
          <p style={{ color: '#666', fontSize: '16px' }}>Loading dashboard...</p>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          fontFamily: 'Arial, sans-serif',
        }}
      >
        <div style={{ textAlign: 'center', color: '#e74c3c' }}>
          <h2>Error Loading Data</h2>
          <p>{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
        padding: '8px',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <div
        style={{
          maxWidth: '650px',
          minWidth: '420px',
          margin: '0 auto',
          backgroundColor: 'white',
          borderRadius: '4px',
          padding: '20px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        }}
      >
        {/* Dashboard Title */}
        <h1
          style={{
            fontSize: '24px',
            fontWeight: '600',
            color: '#333',
            marginBottom: '24px',
            textAlign: 'center',
          }}
        >
          Dashboard 3
        </h1>

        {/* Market Penetration Worksheet */}
        <div
          style={{
            marginBottom: '8px',
          }}
        >
          <MarketPenetration data={data || []} />
        </div>
      </div>
    </div>
  );
}
