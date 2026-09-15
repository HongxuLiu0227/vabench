import { useState, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import './App.css';

function App() {
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  const handleYearSelect = useCallback((year: number | null) => {
    setSelectedYear(year);
  }, []);

  const handleClearSelection = useCallback(() => {
    setSelectedYear(null);
  }, []);

  return (
    <BrowserRouter>
      <div className="app">
        <Routes>
          <Route
            path="/"
            element={
              <main className="main-content">
                <Dashboard
                  onYearSelect={handleYearSelect}
                  selectedYear={selectedYear}
                />
                {selectedYear !== null && (
                  <div className="selection-bar">
                    <span className="selection-text">
                      Selected Year: {selectedYear}
                    </span>
                    <button
                      className="clear-button"
                      onClick={handleClearSelection}
                    >
                      Clear Selection
                    </button>
                  </div>
                )}
              </main>
            }
          />
          <Route path="/dashboard" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
