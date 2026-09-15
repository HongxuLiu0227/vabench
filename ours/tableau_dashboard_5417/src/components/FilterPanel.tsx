import React, { useState } from 'react';
import type { FilterState } from '../types';

interface FilterPanelProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  availableValues: {
    platforms: string[];
    genres: string[];
    ratings: string[];
    developers: string[];
    numberPlayers: string[];
  };
}

interface MultiSelectDropdownProps {
  label: string;
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
}

const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({
  label,
  options,
  selected,
  onChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOption = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter(s => s !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  const selectAll = () => {
    onChange([...options]);
  };

  const clearAll = () => {
    onChange([]);
  };

  return (
    <div className="filter-dropdown">
      <button
        className="dropdown-button"
        onClick={() => setIsOpen(!isOpen)}
      >
        {label} {selected.length > 0 && `(${selected.length})`}
        <span className={`dropdown-arrow ${isOpen ? 'open' : ''}`}>▼</span>
      </button>
      {isOpen && (
        <div className="dropdown-menu">
          <div className="dropdown-actions">
            <button onClick={selectAll} className="text-button">Select All</button>
            <button onClick={clearAll} className="text-button">Clear</button>
          </div>
          <div className="dropdown-options">
            {options.map(option => (
              <label key={option} className="dropdown-option">
                <input
                  type="checkbox"
                  checked={selected.includes(option)}
                  onChange={() => toggleOption(option)}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onFiltersChange,
  availableValues,
}) => {
  const updateFilter = (key: keyof FilterState, value: string[]) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  return (
    <div className="filter-panel">
      <h3>Filters</h3>
      <MultiSelectDropdown
        label="Platform"
        options={availableValues.platforms}
        selected={filters.platforms}
        onChange={(value) => updateFilter('platforms', value)}
      />
      <MultiSelectDropdown
        label="Genre"
        options={availableValues.genres}
        selected={filters.genres}
        onChange={(value) => updateFilter('genres', value)}
      />
      <MultiSelectDropdown
        label="Rating"
        options={availableValues.ratings}
        selected={filters.ratings}
        onChange={(value) => updateFilter('ratings', value)}
      />
      <MultiSelectDropdown
        label="Developer"
        options={availableValues.developers}
        selected={filters.developers}
        onChange={(value) => updateFilter('developers', value)}
      />
      <MultiSelectDropdown
        label="Number of Players"
        options={availableValues.numberPlayers}
        selected={filters.numberPlayers}
        onChange={(value) => updateFilter('numberPlayers', value)}
      />
    </div>
  );
};
