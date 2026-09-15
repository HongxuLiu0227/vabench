import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useData } from './services/useData';
import { Dashboard } from './components/Dashboard';

function LoadingScreen() {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontFamily: 'sans-serif',
        fontSize: '18px',
        color: '#666',
      }}
    >
      <div>Loading dashboard data...</div>
    </div>
  );
}

function ErrorScreen({ error }: { error: string }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontFamily: 'sans-serif',
        fontSize: '16px',
        color: '#d32f2f',
        padding: '20px',
        textAlign: 'center',
      }}
    >
      <div style={{ marginBottom: '16px', fontSize: '20px', fontWeight: 'bold' }}>
        Error Loading Dashboard
      </div>
      <div>{error}</div>
    </div>
  );
}

function App() {
  const { data, loading, error } = useData();

  if (loading) {
    return <LoadingScreen />;
  }

  if (error) {
    return <ErrorScreen error={error} />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard data={data} />} />
        <Route path="/dashboard" element={<Dashboard data={data} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
