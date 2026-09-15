import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DashboardProvider } from './contexts/DashboardContext';
import { Dashboard } from './components/Dashboard';
import { HighlightTable } from './components/HighlightTable';
import { loadOrdersData, aggregateByMarketAndSubCategory } from './services/dataService';
import { useEffect, useState } from 'react';
import type { OrderRecord } from './types';
import './App.css';

const HighlightTablePage: React.FC = () => {
  const [data, setData] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const ordersData = await loadOrdersData();
        setData(ordersData);
      } catch (err) {
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const tableData = React.useMemo(() => {
    return aggregateByMarketAndSubCategory(data);
  }, [data]);

  if (loading) {
    return <div className="page-loading">Loading...</div>;
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Highlight Table</h1>
        <nav className="page-nav">
          <a href="/">Dashboard</a>
          <span className="current">Highlight Table</span>
        </nav>
      </div>
      <HighlightTable data={tableData} />
    </div>
  );
};

function App() {
  return (
    <DashboardProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/highlight-table" element={<HighlightTablePage />} />
          <Route path="/dashboard" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </DashboardProvider>
  );
}

export default App
