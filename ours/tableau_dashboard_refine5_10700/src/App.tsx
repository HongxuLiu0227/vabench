import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useData } from './hooks/useData';
import { Dashboard } from './components/Dashboard';

// Add spinner animation
const style = document.createElement('style');
style.innerHTML = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;
if (!document.head.querySelector('style[data-spin-animation]')) {
  style.setAttribute('data-spin-animation', 'true');
  document.head.appendChild(style);
}

function App() {
  const { data, loading, error } = useData();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9fafb' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ animation: 'spin 1s linear infinite', borderRadius: '50%', height: '48px', width: '48px', borderBottom: '2px solid #2563eb', marginLeft: 'auto', marginRight: 'auto' }}></div>
          <p style={{ marginTop: '16px', color: '#4b5563' }}>Loading data from /data/Diabetes_Cleaned.csv...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9fafb' }}>
        <div style={{ textAlign: 'center', color: '#dc2626' }}>
          <p style={{ fontSize: '20px', fontWeight: 600 }}>Error loading data</p>
          <p style={{ marginTop: '8px' }}>{error}</p>
        </div>
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
