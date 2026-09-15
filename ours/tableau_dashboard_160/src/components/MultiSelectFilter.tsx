import React, { useState, useRef, useEffect } from 'react';
import './MultiSelectFilter.css';

interface MultiSelectFilterProps {
  title: string;
  options: string[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  width?: number;
}

export const MultiSelectFilter: React.FC<MultiSelectFilterProps> = ({
  title,
  options,
  selectedValues,
  onChange,
  width = 150
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleToggle = (value: string) => {
    const newSelectedValues = selectedValues.includes(value)
      ? selectedValues.filter(v => v !== value)
      : [...selectedValues, value];
    onChange(newSelectedValues);
  };

  const handleSelectAll = () => {
    onChange(options);
  };

  const handleClearAll = () => {
    onChange([]);
  };

  const displayText = selectedValues.length === 0
    ? 'All'
    : selectedValues.length === 1
      ? selectedValues[0]
      : `${selectedValues.length} selected`;

  return (
    <div className="multi-select-filter" ref={dropdownRef} style={{ width }}>
      <div
        className="filter-dropdown-trigger"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="filter-title">{title}</div>
        <div className="filter-value">{displayText}</div>
        <div className={`dropdown-arrow ${isOpen ? 'open' : ''}`}>▼</div>
      </div>

      {isOpen && (
        <div className="filter-dropdown-menu">
          <div className="filter-actions">
            <button onClick={handleSelectAll} className="filter-action-btn">
              Select All
            </button>
            <button onClick={handleClearAll} className="filter-action-btn">
              Clear All
            </button>
          </div>
          <div className="filter-options">
            {options.map(option => (
              <label key={option} className="filter-option">
                <input
                  type="checkbox"
                  checked={selectedValues.includes(option)}
                  onChange={() => handleToggle(option)}
                />
                <span className="option-label">{option}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiSelectFilter;
