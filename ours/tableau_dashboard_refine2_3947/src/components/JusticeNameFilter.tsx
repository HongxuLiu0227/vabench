import React from 'react';
import { useFilters } from '../contexts/FilterContext';

interface JusticeNameFilterProps {
  availableJustices: string[];
}

export const JusticeNameFilter: React.FC<JusticeNameFilterProps> = ({ availableJustices }) => {
  const { filters, setJusticeNames } = useFilters();

  const handleCheckboxChange = (justiceName: string) => {
    const newSelection = new Set(filters.justiceNames);
    if (newSelection.has(justiceName)) {
      if (newSelection.size > 1) {
        newSelection.delete(justiceName);
      }
    } else {
      newSelection.add(justiceName);
    }
    setJusticeNames(newSelection);
  };

  const sortedJustices = [...availableJustices].sort();

  return (
    <div className="justice-name-filter">
      <div className="filter-title">Justice Names:</div>
      <div className="checkbox-group">
        {sortedJustices.map((justice) => (
          <label key={justice} className="checkbox-item">
            <input
              type="checkbox"
              checked={filters.justiceNames.has(justice)}
              onChange={() => handleCheckboxChange(justice)}
              disabled={filters.justiceNames.has(justice) && filters.justiceNames.size === 1}
            />
            <span>{justice}</span>
          </label>
        ))}
      </div>
    </div>
  );
};
