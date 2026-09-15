import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { FilterProvider } from './contexts/FilterContext';
import { Dashboard } from './components/Dashboard';
import './App.css';

function App() {
  return (
    <FilterProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </FilterProvider>
  );
}

export default App;
