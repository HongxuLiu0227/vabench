import React from 'react';
import type { FilterState } from '../types';

interface FiltersProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  regions: string[];
  categories: string[];
  segments: string[];
}

export const Filters: React.FC<FiltersProps> = ({
  filters,
  onFilterChange,
  regions,
  categories,
  segments,
}) => {
  const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value === 'all' ? undefined : e.target.value;
    onFilterChange({ ...filters, region: value });
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value === 'all' ? undefined : e.target.value;
    onFilterChange({ ...filters, category: value });
  };

  const handleSegmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value === 'all' ? undefined : e.target.value;
    onFilterChange({ ...filters, segment: value });
  };

  const containerStyle: React.CSSProperties = {
    padding: '15px',
    backgroundColor: '#f9f9f9',
    borderBottom: '1px solid #ddd',
    display: 'flex',
    gap: '20px',
    flexWrap: 'wrap',
    alignItems: 'center',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '14px',
    fontWeight: 'bold',
    marginRight: '5px',
  };

  const selectStyle: React.CSSProperties = {
    padding: '6px 10px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    fontSize: '14px',
    minWidth: '120px',
  };

  const filterGroupStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
  };

  return (
    <div style={containerStyle}>
      <div style={filterGroupStyle}>
        <label style={labelStyle}>Region:</label>
        <select value={filters.region || 'all'} onChange={handleRegionChange} style={selectStyle}>
          <option value="all">All Regions</option>
          {regions.map((region) => (
            <option key={region} value={region}>
              {region}
            </option>
          ))}
        </select>
      </div>

      <div style={filterGroupStyle}>
        <label style={labelStyle}>Category:</label>
        <select value={filters.category || 'all'} onChange={handleCategoryChange} style={selectStyle}>
          <option value="all">All Categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      <div style={filterGroupStyle}>
        <label style={labelStyle}>Segment:</label>
        <select value={filters.segment || 'all'} onChange={handleSegmentChange} style={selectStyle}>
          <option value="all">All Segments</option>
          {segments.map((segment) => (
            <option key={segment} value={segment}>
              {segment}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
