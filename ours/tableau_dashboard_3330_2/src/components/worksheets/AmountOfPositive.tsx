import React, { useMemo } from 'react';
import type { ExtendedDataRow } from '../../types';
import { calculateAmountTotals } from '../../services/aggregationService';
import { useDashboardContext } from '../../contexts/DashboardContext';
import './AmountOfPositive.css';

interface AmountOfPositiveProps {
  data: ExtendedDataRow[];
}

export const AmountOfPositive: React.FC<AmountOfPositiveProps> = ({ data }) => {
  const { filters, highlights, setFilter } = useDashboardContext();

  const filteredData = useMemo(() => {
    let result = data;
    filters.forEach((filter) => {
      result = result.filter((row) => {
        const value = row[filter.fieldName as keyof ExtendedDataRow];
        return filter.selectedValues.has(String(value));
      });
    });
    return result;
  }, [data, filters]);

  const handleClick = () => {
    setFilter({
      worksheetName: 'Amount of Positive',
      selectedValues: new Set(['true']),
      fieldName: 'isPositive',
    });
  };

  const totals = calculateAmountTotals(filteredData);

  return (
    <div
      className={`worksheet amount-of-positive ${highlights.has('Amount of Positive') ? 'highlighted' : ''}`}
      onClick={handleClick}
    >
      <div className="amount-display">
        <div className="amount-value">{totals.positiveCount}</div>
        <div className="amount-label">Amount of Positive</div>
      </div>
    </div>
  );
};
