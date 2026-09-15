import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HighlightProvider } from './contexts/HighlightContext';
import Dashboard from './components/Dashboard';
import './App.css';

function App() {
  return (
    <HighlightProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </HighlightProvider>
  );
}

export default App;

