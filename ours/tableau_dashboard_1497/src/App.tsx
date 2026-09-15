import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HighlightProvider } from './context/HighlightContext';
import { Dashboard } from './components/Dashboard';
import './App.css';

function App() {
  return (
    <HighlightProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </HighlightProvider>
  );
}

export default App;
