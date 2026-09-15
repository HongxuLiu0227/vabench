import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Dashboard } from './features/dashboard/Dashboard';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Render dashboard at root */}
        <Route path="/" element={<Dashboard />} />

        {/* Alias route for dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Redirect any unknown routes to root */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
