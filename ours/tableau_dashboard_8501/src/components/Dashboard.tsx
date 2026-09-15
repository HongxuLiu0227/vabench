import React from 'react';
import { MinAgePosition } from './worksheets/MinAgePosition';
import { MaxAgePosition } from './worksheets/MaxAgePosition';
import { AvgAgePosition } from './worksheets/AvgAgePosition';
import { useFifaData } from '../hooks/useFifaData';
import './Dashboard.css';

export const Dashboard: React.FC = () => {
  const {
    filteredStats,
    loading,
    error,
    selection,
    handleSelect,
    clearSelection,
  } = useFifaData();

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading">Loading data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="error">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Click outside to clear selection */}
      <div
        className="dashboard-content"
        onClick={(e) => {
          // Only clear if clicking directly on the container, not on a chart
          if (e.target === e.currentTarget) {
            clearSelection();
          }
        }}
      >
        {/* Selection indicator */}
        {selection && (
          <div className="selection-indicator">
            <span>
              Filtered by: <strong>{selection.position}</strong> (from {selection.worksheet})
            </span>
            <button onClick={clearSelection} className="clear-button">
              Clear Filter
            </button>
          </div>
        )}

        {/* Top row: Min Age (left) and Max Age (right) */}
        <div className="top-row">
          <div className="worksheet-container min-age">
            <MinAgePosition
              data={filteredStats}
              selection={selection}
              onSelect={handleSelect}
            />
          </div>
          <div className="worksheet-container max-age">
            <MaxAgePosition
              data={filteredStats}
              selection={selection}
              onSelect={handleSelect}
            />
          </div>
        </div>

        {/* Bottom row: Avg Age (full width) */}
        <div className="bottom-row">
          <div className="worksheet-container avg-age">
            <AvgAgePosition
              data={filteredStats}
              selection={selection}
              onSelect={handleSelect}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
