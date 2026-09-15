import React, { useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './contexts/AppContext';
import { Navigation } from './components/Navigation';
import { FilterPanel } from './components/FilterPanel';
import { DevDashboard } from './components/dashboards/DevDashboard';
import { GameDashboard } from './components/dashboards/GameDashboard';
import { GenreDashboard } from './components/dashboards/GenreDashboard';
import { NumbDashboard } from './components/dashboards/NumbDashboard';
import { PlatDashboard } from './components/dashboards/PlatDashboard';
import { AllDashboard } from './components/dashboards/AllDashboard';
import './App.css';

const AppContent: React.FC = () => {
  const { filteredData, filters, setFilters, availableValues, selection, setSelection, loading, error } = useApp();

  const handleCategoryClick = useCallback((category: string) => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    if (selection.autoClear && selection.values.has(category)) {
      // Clear selection if clicking the same category with auto-clear
      setSelection({ type: selection.type, values: new Set(), autoClear: true });
    } else {
      // Set new selection
      const newValues = new Set(selection.autoClear ? [category] : [...selection.values, category]);
      setSelection({ type: selection.type, values: newValues, autoClear: true });
    }
  }, [selection.type, selection.autoClear, selection.values, setSelection]);

  const handleGameClick = useCallback((game: string) => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    if (selection.autoClear && selection.values.has(game)) {
      setSelection({ type: 'game', values: new Set(), autoClear: true });
    } else {
      const newValues = new Set([game]);
      setSelection({ type: 'game', values: newValues, autoClear: true });
    }
  }, [selection.autoClear, selection.values, setSelection]);

  if (loading) {
    return (
      <div className="app-loading">
        <div className="spinner"></div>
        <p>Loading data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-error">
        <h2>Error loading data</h2>
        <p>{error}</p>
      </div>
    );
  }

  const selectedCategory = selection.values.size > 0 ? Array.from(selection.values)[0] : null;
  const selectedGame = selection.type === 'game' ? selectedCategory : null;

  return (
    <div className="app">
      <Navigation />
      <div className="app-layout">
        <aside className="app-sidebar">
          <FilterPanel
            filters={filters}
            onFiltersChange={setFilters}
            availableValues={availableValues}
          />
        </aside>
        <main className="app-main">
          <Routes>
            <Route path="/" element={<AllDashboard data={filteredData} onGameClick={handleGameClick} selectedGame={selectedGame} />} />
            <Route path="/developer" element={<DevDashboard data={filteredData} onCategoryClick={handleCategoryClick} selectedCategory={selectedCategory} />} />
            <Route path="/games" element={<GameDashboard data={filteredData} onCategoryClick={handleCategoryClick} selectedCategory={selectedCategory} />} />
            <Route path="/genres" element={<GenreDashboard data={filteredData} onCategoryClick={handleCategoryClick} selectedCategory={selectedCategory} />} />
            <Route path="/platforms" element={<PlatDashboard data={filteredData} onCategoryClick={handleCategoryClick} selectedCategory={selectedCategory} />} />
            <Route path="/players" element={<NumbDashboard data={filteredData} onCategoryClick={handleCategoryClick} selectedCategory={selectedCategory} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </BrowserRouter>
  );
};

export default App;
