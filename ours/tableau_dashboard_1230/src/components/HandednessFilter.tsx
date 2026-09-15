import React from 'react';
import { useDashboard } from '../contexts/DashboardContext';
import './HandednessFilter.css';

export const HandednessFilter: React.FC = () => {
  const { availableHandedness, filterState, setFilterState } = useDashboard();

  const handednessLabels: Record<string, string> = {
    'L': 'Left',
    'R': 'Right',
    'B': 'Both'
  };

  const handleToggle = (value: string) => {
    const newFilters = filterState.handedness.includes(value)
      ? filterState.handedness.filter(h => h !== value)
      : [...filterState.handedness, value];

    setFilterState({ handedness: newFilters });
  };

  const handleSelectAll = () => {
    setFilterState({ handedness: availableHandedness });
  };

  const handleClearAll = () => {
    setFilterState({ handedness: [] });
  };

  return (
    <div className="handedness-filter">
      <h3>Handedness Filter</h3>

      <div className="filter-actions">
        <button onClick={handleSelectAll} className="filter-btn">
          Select All
        </button>
        <button onClick={handleClearAll} className="filter-btn">
          Clear All
        </button>
      </div>

      <div className="filter-options" role="group" aria-label="Handedness filter options">
        {availableHandedness.map(handedness => (
          <label key={handedness} className="filter-option">
            <input
              type="checkbox"
              checked={filterState.handedness.includes(handedness)}
              onChange={() => handleToggle(handedness)}
              aria-label={`Filter by ${handednessLabels[handedness] || handedness} handedness`}
            />
            <span>{handednessLabels[handedness] || handedness}</span>
            <span className="filter-count" aria-label={`Count: ${handedness}`}> ({handedness})</span>
          </label>
        ))}
      </div>

      <div className="filter-status">
        Selected: {filterState.handedness.length} of {availableHandedness.length}
      </div>
    </div>
  );
};
