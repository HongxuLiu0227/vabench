import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useSearchParams } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import './App.css';

// Wrapper component to handle URL-based selection state
const DashboardWrapper: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const schoolParam = searchParams.get('school');

  const handleSchoolSelect = (school: string | null) => {
    if (school) {
      setSearchParams({ school });
    } else {
      setSearchParams({});
    }
  };

  return <Dashboard selectedSchool={schoolParam} onSchoolSelect={handleSchoolSelect} />;
};

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Routes>
          <Route path="/" element={<DashboardWrapper />} />
          <Route path="/dashboard" element={<DashboardWrapper />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
