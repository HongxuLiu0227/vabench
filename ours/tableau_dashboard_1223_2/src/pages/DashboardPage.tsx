/**
 * Dashboard Page Component
 *
 * Main page that displays Dashboard 3
 * Handles data loading and displays the dashboard
 */

import { useEffect, useState } from 'react';
import Dashboard3 from '../components/Dashboard3';
import type { MarketPenetrationData } from '../services/dataService';
import { loadMarketPenetrationData } from '../services/dataService';

export default function DashboardPage() {
  const [data, setData] = useState<MarketPenetrationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        const marketData = await loadMarketPenetrationData();
        setData(marketData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <main
        role="status"
        aria-live="polite"
        aria-label="Loading dashboard"
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
        <div
          style={{
            width: '48px',
            height: '48px',
            border: '4px solid #E5E7EB',
            borderTopColor: '#3B82F6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            marginBottom: '16px',
          }}
        />
        <p
          style={{
            fontSize: '16px',
            color: '#374151',
            margin: 0,
          }}
        >
          Loading dashboard data...
        </p>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </main>
    );
  }

  if (error) {
    return (
      <main
        role="alert"
        aria-live="assertive"
        aria-label="Error loading dashboard"
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
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: '#FEE2E2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '20px',
          }}
        >
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#DC2626"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h1
          style={{
            fontSize: '20px',
            fontWeight: '600',
            color: '#1F2937',
            marginBottom: '12px',
            margin: '0 0 12px 0',
          }}
        >
          Error Loading Dashboard
        </h1>
        <p
          style={{
            fontSize: '14px',
            color: '#6B7280',
            maxWidth: '400px',
            margin: 0,
          }}
        >
          {error}
        </p>
        <button
          onClick={() => window.location.reload()}
          style={{
            marginTop: '20px',
            padding: '10px 20px',
            backgroundColor: '#3B82F6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'background-color 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#2563EB';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#3B82F6';
          }}
        >
          Retry
        </button>
      </main>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#F3F4F6',
        padding: '20px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
      }}
    >
      <Dashboard3 data={data} />
    </div>
  );
}
