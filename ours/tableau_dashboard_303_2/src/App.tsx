/**
 * Main App component with routing
 */
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useData } from './hooks/useData';
import { DashboardProvider } from './context/DashboardContext';
import { Dashboard } from './components/layout/Dashboard';
import './index.css';

function AppContent() {
  const { data, loading, error } = useData();

  if (loading) {
    return (
      <div
        role="status"
        aria-live="polite"
        aria-busy="true"
        style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}
      >
        <div style={{ textAlign: 'center' }}>
          <h2>Loading accident data...</h2>
          <p>Please wait while we load the dataset.</p>
          <div
            style={{
              marginTop: '20px',
              width: '40px',
              height: '40px',
              border: '4px solid #f3f3f3',
              borderTop: '4px solid #3498db',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              marginLeft: 'auto',
              marginRight: 'auto'
            }}
          />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        role="alert"
        aria-live="assertive"
        style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}
      >
        <div style={{ textAlign: 'center', color: 'red' }}>
          <h2>Error loading data</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardProvider data={data}>
      <Routes>
        <Route path="/" element={<Dashboard data={data} />} />
        <Route path="/dashboard" element={<Dashboard data={data} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </DashboardProvider>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
