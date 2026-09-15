import { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DashboardProvider } from './contexts/DashboardContext';
import { Loading } from './components/Loading';
import { getData } from './services/dataService';
import type { ExtendedDataRow } from './types';
import './App.css';

const Dashboard = lazy(() => import('./components/Dashboard').then(m => ({ default: m.Dashboard })));

function App() {
  const [data, setData] = useState<ExtendedDataRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const dataset = await getData();
        setData(dataset);
        setIsLoading(false);
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load data. Please refresh the page.');
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <DashboardProvider>
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <Suspense fallback={<Loading />}>
                <div className="app-container">
                  <Dashboard data={data} />
                </div>
              </Suspense>
            }
          />
          <Route path="/dashboard" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </DashboardProvider>
  );
}

export default App;
