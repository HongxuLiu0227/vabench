import { Routes, Route, Navigate } from 'react-router-dom';
import { DashboardProvider } from './contexts/DashboardContext';
import { Dashboard } from './components/Dashboard';
import './App.css';

function App() {
  return (
    <DashboardProvider>
      <div className="app">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </DashboardProvider>
  );
}

export default App;
