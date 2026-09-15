import React from 'react';
import { getUniqueYears } from '../services/dataService';
import type { SalesData } from '../services/dataService';

interface YearFilterProps {
  data: SalesData[];
  selectedYear: number;
  onYearChange: (year: number) => void;
}

const YearFilter: React.FC<YearFilterProps> = ({ data, selectedYear, onYearChange }) => {
  const years = getUniqueYears(data);

  return (
    <div style={{ padding: '10px' }}>
      <h3 style={{ fontFamily: 'Arial', fontSize: '14px', marginBottom: '10px', fontWeight: 'bold' }}>
        Filter by Year
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {years.map(year => (
          <label
            key={year}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontFamily: 'Arial',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            <input
              type="radio"
              name="yearFilter"
              value={year}
              checked={selectedYear === year}
              onChange={() => onYearChange(year)}
              style={{ cursor: 'pointer' }}
            />
            {year}
          </label>
        ))}
      </div>
    </div>
  );
};

export default YearFilter;
