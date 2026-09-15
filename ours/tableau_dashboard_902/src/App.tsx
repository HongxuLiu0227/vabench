import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Dashboard } from './components/Dashboard';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Default route redirects to dashboard */}
        <Route path="/" element={<Dashboard />} />

        {/* Dashboard route */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Catch-all redirect to dashboard */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
