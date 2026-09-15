import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { FilterProvider } from './contexts/FilterContext';
import { loadOrdersData } from './services/dataLoader';
import { SidebarFilters } from './components/SidebarFilters';
import { Dashboard } from './components/Dashboard';
import './App.css';

function App() {
  const [data, setData] = useState<Awaited<ReturnType<typeof loadOrdersData>>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const orders = await loadOrdersData();
        setData(orders);
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
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px',
        color: '#666',
      }}>
        Loading data...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '16px',
        color: '#d7191c',
        padding: '20px',
        textAlign: 'center',
      }}>
        <div style={{ marginBottom: '20px' }}>Error loading data: {error}</div>
        <div style={{ fontSize: '14px', color: '#666' }}>
          Please ensure the data file is available at <code>/data/Orders (Sample - Superstore).csv</code>
        </div>
      </div>
    );
  }

  return (
    <FilterProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={
            <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <Dashboard data={data} />
              </div>
              <div style={{ width: '200px', flexShrink: 0 }}>
                <SidebarFilters data={data} />
              </div>
            </div>
          } />
          <Route path="/dashboard" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </FilterProvider>
  );
}

export default App;
