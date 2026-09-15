import React, { useState, useEffect } from 'react';
import type { DataRow, FilterState } from '../types';
import { loadData } from '../services/dataService';
import ConfusionMatrix from './ConfusionMatrix';
import ViewPosts from './ViewPosts';

const Dashboard: React.FC = () => {
  const [data, setData] = useState<DataRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterState | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const loadedData = await loadData();
        setData(loadedData);
        setError(null);
      } catch (err) {
        setError('Failed to load data. Please check the console for details.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleFilterChange = (newFilter: FilterState | null) => {
    setFilter(newFilter);
  };

  if (loading) {
    return (
      <div
        role="status"
        aria-live="polite"
        aria-label="Loading dashboard"
        style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}
      >
        <div style={{ textAlign: 'center' }}>
          <div aria-hidden="true" style={{ fontSize: '24px', marginBottom: '16px' }}>Loading dashboard...</div>
          <div aria-hidden="true" style={{ fontSize: '14px', color: '#666' }}>Please wait while we load the data</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        role="alert"
        aria-live="assertive"
        aria-label="Error loading dashboard"
        style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}
      >
        <div style={{ textAlign: 'center', color: '#d32f2f' }}>
          <div style={{ fontSize: '24px', marginBottom: '16px' }}>Error</div>
          <div style={{ fontSize: '14px' }}>{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: '100%',
        backgroundColor: '#f5f5f5',
        padding: '8px',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          gap: '8px',
          overflow: 'auto',
        }}
      >
        {/* Confusion Matrix - Top Section per Tableau zone coordinates */}
        <div
          style={{
            flex: '0 0 52%',
            backgroundColor: 'white',
            padding: '4px',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <ConfusionMatrix data={data} filter={filter} onFilterChange={handleFilterChange} />
        </div>

        {/* View Posts - Bottom Section per Tableau zone coordinates */}
        <div
          style={{
            flex: '1',
            backgroundColor: 'white',
            padding: '4px',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <ViewPosts data={data} filter={filter} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
