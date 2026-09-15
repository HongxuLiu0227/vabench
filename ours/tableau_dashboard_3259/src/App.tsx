import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { FilterProvider } from './contexts/FilterContext';
import { Dashboard } from './components/layout/Dashboard';
import './App.css';

function App() {
  return (
    <FilterProvider>
      <BrowserRouter>
        <div className="app">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </BrowserRouter>
    </FilterProvider>
  );
}

export default App;
