import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { FilterProvider } from './contexts/FilterContext';
import { Dashboard } from './components/Dashboard';
import { loadAndTransformData } from './services/dataService';
import type { DiagnosisData } from './types';
import './App.css';

function App() {
  const [data, setData] = useState<DiagnosisData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const transformedData = await loadAndTransformData('/data/TEMP_16kzbk812vlpgd1bdwy9c1dlt4ya.csv');
        setData(transformedData);
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
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          fontFamily: 'sans-serif',
          fontSize: '16px',
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
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          fontFamily: 'sans-serif',
          fontSize: '16px',
          color: '#d32f2f',
        }}
      >
        Error: {error}
      </div>
    );
  }

  return (
    <BrowserRouter>
      <FilterProvider>
        <Routes>
          <Route path="/" element={<Dashboard data={data} width={1000} height={800} />} />
          <Route path="/dashboard" element={<Navigate to="/" replace />} />
        </Routes>
      </FilterProvider>
    </BrowserRouter>
  );
}

export default App;
