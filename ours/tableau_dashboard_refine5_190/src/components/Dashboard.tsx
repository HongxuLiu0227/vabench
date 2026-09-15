import React, { useState, useEffect } from 'react';
import { fetchData, aggregateCustomerOverview, aggregateScatterplotData, aggregateDiscountOverview } from '../services/dataService';
import CustomerOverview from './CustomerOverview';
import Scatterplot from './Scatterplot';
import DiscountOverview from './DiscountOverview';
import type { CustomerOverviewData, ScatterplotData, DiscountOverviewData } from '../types';

/**
 * Dashboard component for Synthetic Dashboard 190
 * Layout based on tableau_render_contract.json zone specifications:
 * - Top row: P1968__customer_overview (left), P121__scatterplot (right)
 * - Bottom row: P2648__discount_overview_by_region (full width)
 */
export const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [customerData, setCustomerData] = useState<CustomerOverviewData[]>([]);
  const [scatterData, setScatterData] = useState<ScatterplotData[]>([]);
  const [discountData, setDiscountData] = useState<DiscountOverviewData[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const data = await fetchData();

        // Aggregate data for each worksheet
        setCustomerData(aggregateCustomerOverview(data));
        setScatterData(aggregateScatterplotData(data));
        setDiscountData(aggregateDiscountOverview(data));

        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <div
        role="status"
        aria-live="polite"
        aria-label="Loading dashboard"
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          fontSize: '16px',
          color: '#666'
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
              margin: '0 auto 16px auto'
            }}
          />
          <span>Loading dashboard data...</span>
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
        role="alert"
        aria-live="assertive"
        style={{
          padding: '20px',
          color: '#d62728',
          textAlign: 'center'
        }}
      >
        <h2>Error Loading Dashboard</h2>
        <p>{error}</p>
      </div>
    );
  }

  // Dashboard dimensions based on contract (1000px x 800px)
  const dashboardWidth = 1000;

  // Zone calculations based on render contract:
  // Top row (y=0 to y=617):
  // - Customer Overview: x=0.8% (8px), width=49.2% (492px), height=61.7% (617px)
  // - Scatterplot: x=50% (500px), width=49.2% (492px), height=61.7% (617px)
  // Bottom row (y=627 to y=990):
  // - Discount Overview: x=0.8% (8px), width=98.4% (984px), height=36.3% (363px)

  return (
    <div style={{
      width: '100%',
      maxWidth: `${dashboardWidth}px`,
      margin: '0 auto',
      padding: '8px',
      backgroundColor: '#ffffff',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
        marginBottom: '8px'
      }}>
        {/* Top Left: Customer Overview */}
        <div style={{
          flex: '0 0 calc(50% - 4px)',
          backgroundColor: '#ffffff',
          borderRadius: '4px',
          overflow: 'hidden'
        }}>
          <CustomerOverview
            data={customerData}
            width={492}
            height={617}
          />
        </div>

        {/* Top Right: Scatterplot */}
        <div style={{
          flex: '0 0 calc(50% - 4px)',
          backgroundColor: '#ffffff',
          borderRadius: '4px',
          overflow: 'hidden'
        }}>
          <Scatterplot
            data={scatterData}
            width={492}
            height={617}
          />
        </div>
      </div>

      {/* Bottom: Discount Overview */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '4px',
        overflow: 'hidden'
      }}>
        <DiscountOverview
          data={discountData}
          width={984}
          height={363}
        />
      </div>
    </div>
  );
};

export default Dashboard;
