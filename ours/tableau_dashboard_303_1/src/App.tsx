import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Main dashboard route */}
        <Route path="/" element={<Dashboard />} />

        {/* Dashboard alias route */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Catch all - redirect to root */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
