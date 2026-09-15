import { useEffect, useState } from 'react';
import { LineChart } from './LineChart';
import { HorizontalRankedBar } from './HorizontalRankedBar';
import { ScatterPlot } from './ScatterPlot';
import { loadSalesData, validateTableauFields, type ParsedSalesRecord } from '../services/dataLoader';

export function Dashboard() {
  const [data, setData] = useState<ParsedSalesRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const salesData = await loadSalesData();

        // Validate Tableau field resolution
        const validation = validateTableauFields(salesData);
        if (!validation.isValid) {
          console.error('Tableau field validation failed:', validation.errors);
          setError(`Data validation failed: ${validation.errors.join('; ')}`);
          setLoading(false);
          return;
        }

        console.log('Data loaded and validated successfully');
        console.log(`Sample record:`, validation.sampleRecord);

        setData(salesData);
        setLoading(false);
      } catch (err) {
        console.error('Failed to load data:', err);
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
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          fontSize: '18px',
          gap: '16px',
        }}
      >
        <div
          style={{
            width: '48px',
            height: '48px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #1f77b4',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }}
        />
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
        <span>Loading dashboard data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div
        role="alert"
        aria-live="assertive"
        aria-label="Error loading dashboard"
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          fontSize: '18px',
          color: '#d32f2f',
          padding: '20px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontSize: '48px',
            marginBottom: '16px',
          }}
        >
          ⚠️
        </div>
        <h1 style={{ fontSize: '24px', marginBottom: '16px' }}>
          Error Loading Dashboard
        </h1>
        <p style={{ fontSize: '16px', maxWidth: '600px' }}>{error}</p>
      </div>
    );
  }

  // Dashboard layout based on zone positions from Tableau spec
  // The dashboard is arranged in a 2x2 grid:
  // - Top-left: P9517__sales_by_sub_category
  // - Top-right: P121__scatterplot
  // - Bottom-left: P1225__total_sales_each_year
  // - Bottom-right: P121__line

  return (
    <div
      style={{
        padding: '8px',
        backgroundColor: '#ffffff',
        minHeight: '100vh',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gridTemplateRows: '1fr 1fr',
          gap: '4px',
          height: 'calc(100vh - 16px)',
        }}
      >
        {/* Top-left: Sales by Sub-Category */}
        <div
          style={{
            border: 'none',
            backgroundColor: '#ffffff',
            padding: '4px',
          }}
        >
          <HorizontalRankedBar data={data} title="Sales by Sub Category" width={600} height={400} />
        </div>

        {/* Top-right: Scatterplot */}
        <div
          style={{
            border: 'none',
            backgroundColor: '#ffffff',
            padding: '4px',
          }}
        >
          <ScatterPlot data={data} title="Scatterplot" width={600} height={400} />
        </div>

        {/* Bottom-left: Total Sales Each Year */}
        <div
          style={{
            border: 'none',
            backgroundColor: '#ffffff',
            padding: '4px',
          }}
        >
          <LineChart
            data={data}
            title="Total Sales Each Year"
            timeGranularity="year"
            width={600}
            height={400}
          />
        </div>

        {/* Bottom-right: Line (Sales over time) */}
        <div
          style={{
            border: 'none',
            backgroundColor: '#ffffff',
            padding: '4px',
          }}
        >
          <LineChart
            data={data}
            title="Line"
            timeGranularity="month"
            width={600}
            height={400}
          />
        </div>
      </div>
    </div>
  );
}
