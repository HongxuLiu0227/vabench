/**
 * Date Parameter Selector component
 * Allows users to select the month/year for filtering data
 */

import React from 'react';

interface DateParameterSelectorProps {
  availableDates: string[];
  selectedDate: string;
  onDateChange: (date: string) => void;
}

const DateParameterSelector: React.FC<DateParameterSelectorProps> = ({
  availableDates,
  selectedDate,
  onDateChange,
}) => {
  return (
    <div className="date-parameter-selector" style={{
      marginBottom: '16px',
      padding: '12px',
      backgroundColor: '#ffffff',
      border: '1px solid #e0e0e0',
      borderRadius: '4px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    }}>
      <label htmlFor="date-select" style={{
        fontFamily: 'Verdana, sans-serif',
        fontSize: '11px',
        fontWeight: 'bold',
        color: '#333333',
        margin: 0,
      }}>
        Upload Period - 3 Months:
      </label>
      <select
        id="date-select"
        value={selectedDate}
        onChange={(e) => onDateChange(e.target.value)}
        style={{
          flex: 1,
          maxWidth: '300px',
          padding: '6px 12px',
          fontFamily: 'Verdana, sans-serif',
          fontSize: '11px',
          border: '1px solid #cccccc',
          borderRadius: '4px',
          backgroundColor: '#ffffff',
          cursor: 'pointer',
        }}
      >
        {availableDates.map(date => (
          <option key={date} value={date}>
            {date}
          </option>
        ))}
      </select>
    </div>
  );
};

export default DateParameterSelector;
