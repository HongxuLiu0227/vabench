import React, { useMemo } from 'react';
import type { ExtendedDataRow } from '../../types';
import { calculateAmountTotals } from '../../services/aggregationService';
import { useDashboardContext } from '../../contexts/DashboardContext';
import './AmountOfPositivePercent.css';

interface AmountOfPositivePercentProps {
  data: ExtendedDataRow[];
}

export const AmountOfPositivePercent: React.FC<AmountOfPositivePercentProps> = ({ data }) => {
  const { filters, highlights } = useDashboardContext();

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

  const totals = calculateAmountTotals(filteredData);

  return (
    <div
      className={`worksheet amount-of-positive-percent ${highlights.has('Amount of Positive %') ? 'highlighted' : ''}`}
    >
      <div className="percent-display">
        <div className="percent-value">{totals.positivePercentage.toFixed(1)}%</div>
        <div className="percent-label">Positive %</div>
      </div>
    </div>
  );
};
