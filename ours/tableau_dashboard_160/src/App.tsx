import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Default route - show dashboard at root */}
        <Route path="/" element={<Dashboard />} />

        {/* Dashboard route alias */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Catch all - redirect to root */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
