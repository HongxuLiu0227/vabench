import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Main dashboard route */}
        <Route path="/" element={<DashboardPage />} />

        {/* Alias route for dashboard */}
        <Route path="/dashboard" element={<DashboardPage />} />

        {/* Redirect any unmatched routes to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
