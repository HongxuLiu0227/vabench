import { useDashboardData } from '../hooks/useDashboardData';
import { PlatMeta } from './PlatMeta';
import { PlatCrit } from './PlatCrit';
import { PlatUsers } from './PlatUsers';

export function Dashboard() {
  const {
    platformCritics,
    platformUsers,
    metascoreByMonth,
    loading,
    error,
  } = useDashboardData();

  if (loading) {
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
        Loading data...
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          fontSize: '16px',
          color: '#dc3545',
        }}
      >
        <p style={{ marginBottom: '20px' }}>Error: {error}</p>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: '10px 20px',
            fontSize: '14px',
            cursor: 'pointer',
            border: '1px solid #dc3545',
            borderRadius: '4px',
            background: '#fff',
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: '1000px',
        margin: '0 auto',
        padding: '20px',
        backgroundColor: '#fff',
        minHeight: '100vh',
      }}
    >
      {/* Main content area - using vertical flow layout */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          marginBottom: '20px',
        }}
      >
        {/* plat_meta - top section, full width */}
        <div
          style={{
            width: '100%',
            minHeight: '450px',
          }}
        >
          <PlatMeta data={metascoreByMonth} />
        </div>

        {/* Bottom section - two panels side by side */}
        <div
          style={{
            display: 'flex',
            gap: '16px',
            width: '100%',
          }}
        >
          {/* plat_crit - left panel */}
          <div
            style={{
              flex: '1',
              minWidth: '0',
              border: '1px solid #e0e0e0',
              borderRadius: '4px',
              padding: '12px',
              backgroundColor: '#fafafa',
            }}
          >
            <PlatCrit data={platformCritics} />
          </div>

          {/* plat_users - right panel */}
          <div
            style={{
              flex: '1',
              minWidth: '0',
              border: '1px solid #e0e0e0',
              borderRadius: '4px',
              padding: '12px',
              backgroundColor: '#fafafa',
            }}
          >
            <PlatUsers data={platformUsers} />
          </div>
        </div>
      </div>

      {/* Dashboard text zones */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '20px',
          paddingTop: '10px',
          borderTop: '1px solid #eee',
        }}
      >
        <div
          style={{
            flex: '1',
            fontSize: '11px',
            color: '#c0c0c0',
          }}
        >
          Source:{' '}
          <a
            href="https://www.kaggle.com/skateddu/metacritic-games-stats-20112019"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: '#c0c0c0',
              textDecoration: 'none',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.textDecoration = 'underline';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.textDecoration = 'none';
            }}
          >
            https://www.kaggle.com/skateddu/metacritic-games-stats-20112019
          </a>
        </div>
        <div
          style={{
            flex: '1',
            fontSize: '11px',
            color: '#c0c0c0',
            textAlign: 'right',
          }}
        >
          Created by Sergio Funes
        </div>
      </div>
    </div>
  );
}
