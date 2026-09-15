import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { DashboardProvider } from './contexts/DashboardContext';
import { Dashboard } from './components/layout/Dashboard';

function App() {
  return (
    <DashboardProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </DashboardProvider>
  );
}

export default App;
