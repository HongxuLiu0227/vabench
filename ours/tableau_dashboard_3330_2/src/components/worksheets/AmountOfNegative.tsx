import React, { useMemo } from 'react';
import type { ExtendedDataRow } from '../../types';
import { calculateAmountTotals } from '../../services/aggregationService';
import { useDashboardContext } from '../../contexts/DashboardContext';
import './AmountOfNegative.css';

interface AmountOfNegativeProps {
  data: ExtendedDataRow[];
}

export const AmountOfNegative: React.FC<AmountOfNegativeProps> = ({ data }) => {
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
      className={`worksheet amount-of-negative ${highlights.has('Amount of  Negative') ? 'highlighted' : ''}`}
    >
      <div className="amount-display">
        <div className="amount-value">{totals.negativeCount}</div>
        <div className="amount-label">Amount of Negative</div>
      </div>
    </div>
  );
};
