/**
 * App Component with React Router
 * Renders the Dashboard at root path (/)
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Main dashboard at root */}
        <Route path="/" element={<Dashboard />} />

        {/* Dashboard alias/redirect */}
        <Route path="/dashboard" element={<Navigate to="/" replace />} />

        {/* Catch all - redirect to dashboard */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
