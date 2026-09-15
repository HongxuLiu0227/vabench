import { useEffect, useState, useRef } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import { useDashboardData } from './hooks/useDashboardData';
import './App.css';

function App() {
  const { data, loading, error } = useDashboardData();
  const [containerDimensions, setContainerDimensions] = useState({
    width: 1000,
    height: 800,
  });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerDimensions({
          width: rect.width,
          height: Math.max(rect.height, 800), // Minimum height of 800px
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          fontSize: '18px',
          color: '#666',
        }}
      >
        Loading dashboard data...
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
          fontSize: '16px',
          color: '#d32f2f',
          textAlign: 'center',
          padding: '20px',
        }}
      >
        <div style={{ marginBottom: '16px' }}>
          <strong>Error loading dashboard data</strong>
        </div>
        <div style={{ fontSize: '14px', color: '#666' }}>
          {error.message}
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <div
              ref={containerRef}
              style={{
                width: '100vw',
                height: '100vh',
                overflow: 'auto',
                backgroundColor: '#f0f0f0',
              }}
            >
              <Dashboard
                productData={data.productData}
                categoryData={data.categoryData}
                regionData={data.regionData}
                containerWidth={containerDimensions.width}
                containerHeight={containerDimensions.height}
              />
            </div>
          }
        />
        <Route path="/dashboard" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
