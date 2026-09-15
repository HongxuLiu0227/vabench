import React from 'react';
import { useDashboard } from '../contexts/DashboardContext';
import { HandednessFilter } from './HandednessFilter';
import { AvgHRBarChart } from './worksheets/AvgHRBarChart';
import { OverViewChart } from './worksheets/OverViewChart';
import { HeightWeightScatter } from './worksheets/HeightWeightScatter';
import { HandednessScatter } from './worksheets/HandednessScatter';
import './DashboardLayout.css';

export const DashboardLayout: React.FC = () => {
  const { isLoading, error, filteredData, selectionState, clearSelection } = useDashboard();

  if (isLoading) {
    return (
      <div className="dashboard-layout">
        <div className="loading-state" role="status" aria-live="polite">
          <div className="spinner" aria-hidden="true"></div>
          <p>Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-layout">
        <div className="error-state" role="alert" aria-live="assertive">
          <h2>Error Loading Data</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>Baseball Data</h2>
        </div>
        <HandednessFilter />

        {selectionState.names.length > 0 && (
          <div className="selection-info">
            <h4>Selection</h4>
            <p>{selectionState.names.length} player(s) selected</p>
            <button onClick={clearSelection} className="clear-btn">
              Clear Selection
            </button>
          </div>
        )}

        <div className="data-summary">
          <h4>Data Summary</h4>
          <p>Total Players: {filteredData.length}</p>
        </div>
      </aside>

      <main className="main-content">
        <div className="dashboard-header">
          <h1>Baseball Player Analytics</h1>
        </div>

        <div className="worksheets-grid">
          <div className="worksheet-row">
            <div className="worksheet-item">
              <AvgHRBarChart />
            </div>
          </div>

          <div className="worksheet-row">
            <div className="worksheet-item full-width">
              <OverViewChart />
            </div>
          </div>

          <div className="worksheet-row">
            <div className="worksheet-item">
              <HeightWeightScatter />
            </div>
            <div className="worksheet-item">
              <HandednessScatter />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
