import React from 'react';

type FiltersProps = {
  filters: {
    region: string;
    device: string;
    source: string;
  };
  onChange: (name: string, value: string) => void;
  options: {
    region: string[];
    device: string[];
    source: string[];
  };
};

export default function Filters(props) {
  return (
    <div className="filters-container">
      <div className="filter-group">
        <label htmlFor="region-filter">Region:</label>
        <select
          id="region-filter"
          value={props.filters.region}
          onChange={(e) => props.onChange('region', e.target.value)}
        >
          {props.options.region.map(option => (
            <option key={option} value={option}>
              {option === 'all' ? 'All Regions' : option}
            </option>
          ))}
        </select>
      </div>
      
      <div className="filter-group">
        <label htmlFor="device-filter">Device:</label>
        <select
          id="device-filter"
          value={props.filters.device}
          onChange={(e) => props.onChange('device', e.target.value)}
        >
          {props.options.device.map(option => (
            <option key={option} value={option}>
              {option === 'all' ? 'All Devices' : option}
            </option>
          ))}
        </select>
      </div>
      
      <div className="filter-group">
        <label htmlFor="source-filter">Source:</label>
        <select
          id="source-filter"
          value={props.filters.source}
          onChange={(e) => props.onChange('source', e.target.value)}
        >
          {props.options.source.map(option => (
            <option key={option} value={option}>
              {option === 'all' ? 'All Sources' : option}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

// Example CSS:
// .filters-container {
//   display: flex;
//   gap: 15px;
// }
// .filter-group {
//   display: flex;
//   align-items: center;
//   gap: 8px;
// }
// .filter-group label {
//   font-size: 14px;
//   color: #555;
// }
// .filter-group select {
//   padding: 8px 12px;
//   border: 1px solid #ddd;
//   border-radius: 4px;
//   font-size: 14px;
// }