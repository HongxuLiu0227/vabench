import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DashboardProvider } from './contexts/DashboardContext';
import { DashboardLayout } from './components/DashboardLayout';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <DashboardProvider>
        <Routes>
          <Route path="/" element={<DashboardLayout />} />
          <Route path="/dashboard" element={<DashboardLayout />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </DashboardProvider>
    </BrowserRouter>
  );
}

export default App;
