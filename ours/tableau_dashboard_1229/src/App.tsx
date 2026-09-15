import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { InteractionProvider } from './lib/InteractionProvider';
import { useData } from './hooks/useData';
import { Dashboard } from './components/Dashboard';

function AppContent() {
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
        Loading data...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <div style={{ color: 'red', fontSize: '18px' }}>
          Error loading data: {error.message}
        </div>
        <div style={{ fontSize: '14px', color: '#666' }}>
          Please make sure the data file is available at <code>/data/TEMP_1gmu7581ajjigv161l39r0mgmvpl.csv</code>
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

function App() {
  return (
    <InteractionProvider>
      <AppContent />
    </InteractionProvider>
  );
}

export default App;
