import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Dashboard } from './components';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Render dashboard at root path */}
        <Route path="/" element={<Dashboard />} />
        {/* Optional: /dashboard alias */}
        <Route path="/dashboard" element={<Dashboard />} />
        {/* Redirect any other path to root */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
