import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DashboardProvider } from './contexts/DashboardContext';
import { useTweetData } from './hooks/useTweetData';
import { LoadingScreen } from './components/LoadingScreen';

// Lazy load dashboard components
const Dashboard1 = lazy(() => import('./components/Dashboard1').then(m => ({ default: m.Dashboard1 })));
const Historia1 = lazy(() => import('./components/Historia1').then(m => ({ default: m.Historia1 })));

function AppContent() {
  const { data, loading, error } = useTweetData();

  if (loading) {
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#f5f5f5',
        color: '#333'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ color: '#e15759' }}>Error Loading Data</h2>
          <p>{error}</p>
          <p style={{ fontSize: '14px', color: '#666' }}>
            Please ensure /data/tweets_classification.csv is available
          </p>
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        <Route path="/" element={<Dashboard1 data={data} />} />
        <Route path="/dashboard" element={<Navigate to="/" replace />} />
        <Route path="/historia-1" element={<Historia1 data={data} />} />
      </Routes>
    </Suspense>
  );
}

function App() {
  return (
    <BrowserRouter>
      <DashboardProvider>
        <AppContent />
      </DashboardProvider>
    </BrowserRouter>
  );
}

export default App;
