import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { FilterProvider } from './contexts/FilterContext';
import { TripDashboard } from './components/TripDashboard';
import './App.css';

function App() {
  return (
    <FilterProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<TripDashboard />} />
          <Route path="/dashboard" element={<TripDashboard />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </FilterProvider>
  );
}

export default App;
