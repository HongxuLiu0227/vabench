/**
 * Dashboard Component
 * Main dashboard implementing the Tableau "Results and model accuracy" layout
 */

import { useEffect, useState } from 'react';
import InteractiveLineChart from './InteractiveLineChart';
import GoToHomeButton from './GoToHomeButton';
import LoadingState from './LoadingState';
import ErrorState from './ErrorState';
import { loadDashboardData } from '../services/dataService';
import type { PredictionData } from '../types/data';

const Dashboard: React.FC = () => {
  const [predictionData, setPredictionData] = useState<PredictionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const data = await loadDashboardData();
        setPredictionData(data.predictionData);
        setError(null);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
        setError('Failed to load data. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return <LoadingState message="Loading dashboard..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => window.location.reload()} />;
  }

  return (
    <div
      style={{
        backgroundColor: '#000000',
        minHeight: '100vh',
        fontFamily: 'Calibri, sans-serif',
        padding: '20px',
        boxSizing: 'border-box',
      }}
    >
      {/* Header Zone */}
      <div
        style={{
          backgroundColor: '#b4b4b4',
          padding: '20px',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: 'Calibri, sans-serif',
              fontSize: '15px',
              fontWeight: 'normal',
              color: '#000000',
              margin: 0,
              marginBottom: '8px',
            }}
          >
            Results and Model accuracy
          </h1>
          <p
            style={{
              fontFamily: 'Calibri, sans-serif',
              fontSize: '12px',
              fontStyle: 'italic',
              color: '#898989',
              margin: 0,
            }}
          >
            Uses google excel as the data source. Sign in to Google to see predicted charts.
          </p>
        </div>
        <GoToHomeButton />
      </div>

      {/* Main Content Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 200px',
          gap: '20px',
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >
        {/* Row 1: Results - pred close */}
        <div style={{ position: 'relative' }}>
          {/* Y-Axis Label */}
          <div
            style={{
              position: 'absolute',
              left: '-45px',
              top: '50%',
              transform: 'translateY(-50%) rotate(-90deg)',
              transformOrigin: 'center center',
              fontFamily: 'Calibri, sans-serif',
              fontSize: '15px',
              fontWeight: 'bold',
              color: '#000000',
              whiteSpace: 'nowrap',
            }}
          >
            Close Stock
          </div>

          {/* Chart Container */}
          <div
            style={{
              backgroundColor: '#e6e6e6',
              padding: '20px 20px 60px 60px',
              borderRadius: '4px',
            }}
          >
            {predictionData.length > 0 ? (
              <InteractiveLineChart
                data={predictionData}
                xKey="Date"
                yKey="close"
                color="#1f77b4"
                width={800}
                height={250}
                axisTitle="Date"
                worksheetName="Results - pred close"
                selectedDate={selectedDate}
                onSelectionChange={(point) => setSelectedDate(point ? point.Date : null)}
              />
            ) : (
              <div
                style={{
                  textAlign: 'center',
                  padding: '40px',
                  color: '#666',
                  fontFamily: 'Calibri',
                }}
              >
                No prediction data available
              </div>
            )}
          </div>
        </div>

        {/* Row 1 Metrics: RMSE for close */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div
            style={{
              backgroundColor: 'transparent',
              textAlign: 'center',
            }}
          >
            <p
              style={{
                fontFamily: 'Calibri, sans-serif',
                fontSize: '15px',
                color: '#b4b4b4',
                margin: '0 0 10px 0',
              }}
            >
              Root Mean Square Error
            </p>
            <p
              style={{
                fontFamily: 'Calibri, sans-serif',
                fontSize: '15px',
                color: '#000000',
                margin: '5px 0',
              }}
            >
              Train : 0.36
            </p>
            <p
              style={{
                fontFamily: 'Calibri, sans-serif',
                fontSize: '15px',
                color: '#000000',
                margin: '5px 0',
              }}
            >
              Test: 1.54
            </p>
          </div>
        </div>

        {/* Row 2: Results - pred open */}
        <div style={{ position: 'relative' }}>
          {/* Y-Axis Label */}
          <div
            style={{
              position: 'absolute',
              left: '-45px',
              top: '50%',
              transform: 'translateY(-50%) rotate(-90deg)',
              transformOrigin: 'center center',
              fontFamily: 'Calibri, sans-serif',
              fontSize: '15px',
              fontWeight: 'bold',
              color: '#000000',
              whiteSpace: 'nowrap',
            }}
          >
            Open Stock
          </div>

          {/* Chart Container */}
          <div
            style={{
              backgroundColor: '#e6e6e6',
              padding: '20px 20px 60px 60px',
              borderRadius: '4px',
            }}
          >
            {predictionData.length > 0 ? (
              <InteractiveLineChart
                data={predictionData}
                xKey="Date"
                yKey="open"
                color="#ff7f0e"
                width={800}
                height={250}
                axisTitle="Date"
                worksheetName="Results - pred open"
                selectedDate={selectedDate}
                onSelectionChange={(point) => setSelectedDate(point ? point.Date : null)}
              />
            ) : (
              <div
                style={{
                  textAlign: 'center',
                  padding: '40px',
                  color: '#666',
                  fontFamily: 'Calibri',
                }}
              >
                No prediction data available
              </div>
            )}
          </div>
        </div>

        {/* Row 2 Metrics: RMSE for open */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div
            style={{
              backgroundColor: 'transparent',
              textAlign: 'center',
            }}
          >
            <p
              style={{
                fontFamily: 'Calibri, sans-serif',
                fontSize: '15px',
                color: '#000000',
                margin: '5px 0',
              }}
            >
              Train: 0.38
            </p>
            <p
              style={{
                fontFamily: 'Calibri, sans-serif',
                fontSize: '15px',
                color: '#000000',
                margin: '5px 0',
              }}
            >
              Test: 2.69
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
