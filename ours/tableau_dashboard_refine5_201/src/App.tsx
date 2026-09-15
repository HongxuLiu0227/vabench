import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Dashboard } from './components/Dashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Dashboard at root path */}
        <Route path="/" element={<Dashboard />} />

        {/* Alias route for dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Redirect any unknown paths to root */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
