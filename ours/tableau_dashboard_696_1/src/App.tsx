import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DashboardExploringPatterns } from './components/DashboardExploringPatterns';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardExploringPatterns />} />
        <Route path="/dashboard" element={<DashboardExploringPatterns />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
