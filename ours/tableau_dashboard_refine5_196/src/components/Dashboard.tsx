import { useEffect, useState } from 'react';
import { Scatterplot } from './Scatterplot';
import { LineChart } from './LineChart';
import { YearlySalesChart } from './YearlySalesChart';
import { loadCsvData, transformScatterData, transformLineData, transformYearlySalesData } from '../services/dataService';
import type { ScatterDataPoint, LineDataPoint, YearlySalesDataPoint } from '../types';

export const Dashboard: React.FC = () => {
  const [scatterData, setScatterData] = useState<ScatterDataPoint[]>([]);
  const [lineData, setLineData] = useState<LineDataPoint[]>([]);
  const [yearlyData, setYearlyData] = useState<YearlySalesDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const rawData = await loadCsvData();

        // Transform data for each visualization
        const scatter = transformScatterData(rawData);
        const line = transformLineData(rawData);
        const yearly = transformYearlySalesData(rawData);

        setScatterData(scatter);
        setLineData(line);
        setYearlyData(yearly);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };

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
            borderTop: '4px solid #3498db',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }}
        />
        <p>Loading dashboard data...</p>
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
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
          color: '#d32f2f',
          fontSize: '16px',
          padding: '20px',
          textAlign: 'center',
        }}
      >
        <h2 style={{ marginBottom: '16px' }}>Error Loading Dashboard</h2>
        <p style={{ marginBottom: '16px' }}>{error}</p>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: '10px 20px',
            backgroundColor: '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  // Handle empty data state
  if (scatterData.length === 0 && lineData.length === 0 && yearlyData.length === 0) {
    return (
      <div
        role="status"
        aria-live="polite"
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          fontSize: '16px',
          padding: '20px',
          textAlign: 'center',
        }}
      >
        <h2 style={{ marginBottom: '16px' }}>No Data Available</h2>
        <p style={{ marginBottom: '16px' }}>Unable to load dashboard data. Please try again later.</p>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: '10px 20px',
            backgroundColor: '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  // Calculate dimensions based on Tableau spec
  // Dashboard size: 1000x800
  // Top row (y=0-62%): Scatterplot (x=0-49%) + Line (x=50-99%)
  // Bottom row (y=63-99%): Yearly Sales (full width)

  const containerWidth = 1000;
  const containerHeight = 800;

  const topRowHeight = containerHeight * 0.6175;
  const bottomRowHeight = containerHeight * 0.3625;

  const leftWidth = containerWidth * 0.492;
  const rightWidth = containerWidth * 0.492;

  return (
    <div
      style={{
        width: '100%',
        maxWidth: `${containerWidth}px`,
        margin: '0 auto',
        padding: '8px',
        backgroundColor: '#ffffff',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        {/* Top Row */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            height: `${topRowHeight}px`,
          }}
        >
          {/* Scatterplot */}
          <div
            style={{
              flex: '0 0 auto',
              width: `${leftWidth}px`,
              backgroundColor: '#ffffff',
            }}
          >
            <Scatterplot data={scatterData} width={leftWidth} height={topRowHeight} title="Scatterplot" />
          </div>

          {/* Line Chart */}
          <div
            style={{
              flex: '0 0 auto',
              width: `${rightWidth}px`,
              backgroundColor: '#ffffff',
            }}
          >
            <LineChart data={lineData} width={rightWidth} height={topRowHeight} title="Line" />
          </div>
        </div>

        {/* Bottom Row */}
        <div
          style={{
            height: `${bottomRowHeight}px`,
            backgroundColor: '#ffffff',
          }}
        >
          <YearlySalesChart
            data={yearlyData}
            width={containerWidth}
            height={bottomRowHeight}
            title="Total Sales Each Year"
          />
        </div>
      </div>
    </div>
  );
};
