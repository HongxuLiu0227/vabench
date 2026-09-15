import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useData } from './services/dataService';
import { Dashboard } from './components/Dashboard';

function App() {
  const { data, loading, error } = useData();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px'
      }}>
        Loading Superstore data...
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
        color: 'red'
      }}>
        <p>Error: {error}</p>
        <p style={{ fontSize: '14px', color: '#666' }}>
          Failed to load data from /data/9517_dash_dashboard0_png_informative_dashboard/p9517_Sample_-_Superstore_Orders.csv
        </p>
      </div>
    );
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
