import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DashboardProvider } from './contexts/DashboardContext';
import { useTelcoData } from './hooks/useTelcoData';
import { Dashboard } from './components/Dashboard';

function AppContent() {
  const { data, loading, error } = useTelcoData();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '18px', color: '#333', marginBottom: '10px' }}>Loading Dashboard...</div>
          <div style={{ fontSize: '14px', color: '#666' }}>Please wait while we fetch the data</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div style={{ textAlign: 'center', color: '#e15759' }}>
          <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' }}>Error Loading Data</div>
          <div style={{ fontSize: '14px' }}>{error}</div>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Dashboard data={data} />} />
      <Route path="/dashboard" element={<Dashboard data={data} />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
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
