import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import { loadData, groupByAge, groupByAgeAndGender } from './utils/data';
import type { AgeGroupData, GenderAgeData } from './utils/data';
import './App.css';

function App() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ageGroupData, setAgeGroupData] = useState<AgeGroupData[]>([]);
  const [genderAgeData, setGenderAgeData] = useState<GenderAgeData[]>([]);

  useEffect(() => {
    const initData = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await loadData();

        const ageGrouped = groupByAge(data);
        const genderAgeGrouped = groupByAgeAndGender(data);

        setAgeGroupData(ageGrouped);
        setGenderAgeData(genderAgeGrouped);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };

    initData();
  }, []);

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          fontFamily: 'sans-serif',
          fontSize: '16px',
          color: '#666',
        }}
      >
        Loading dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          fontFamily: 'sans-serif',
          padding: '20px',
          textAlign: 'center',
        }}
      >
        <div style={{ color: '#d32f2f', fontSize: '18px', marginBottom: '16px' }}>
          Error Loading Dashboard
        </div>
        <div style={{ color: '#666', fontSize: '14px' }}>{error}</div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Dashboard ageGroupData={ageGroupData} genderAgeData={genderAgeData} />}
        />
        <Route path="/dashboard" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
