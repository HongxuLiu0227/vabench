import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DashboardProvider } from './contexts/DashboardContext';
import { Dashboard } from './components/Dashboard';

function App() {
  return (
    <BrowserRouter>
      <DashboardProvider>
        <Routes>
          {/* Dashboard at root */}
          <Route path="/" element={<Dashboard />} />

          {/* Dashboard alias */}
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Redirect all other routes to dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </DashboardProvider>
    </BrowserRouter>
  );
}

export default App;
