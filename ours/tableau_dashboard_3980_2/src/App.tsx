import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Dashboard } from './components/Dashboard';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Default route renders the dashboard */}
        <Route path="/" element={<Dashboard />} />

        {/* Alias route for dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Redirect any unknown routes to dashboard */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
