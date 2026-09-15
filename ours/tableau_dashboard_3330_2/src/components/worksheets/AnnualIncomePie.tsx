import React, { useMemo } from 'react';
import type { ExtendedDataRow, PieChartData } from '../../types';
import { PieChart } from './PieChart';
import { groupByField, getColorPalette } from '../../services/aggregationService';
import { useDashboardContext } from '../../contexts/DashboardContext';
import './AnnualIncomePie.css';

interface AnnualIncomePieProps {
  data: ExtendedDataRow[];
  width: number;
  height: number;
}

export const AnnualIncomePie: React.FC<AnnualIncomePieProps> = ({ data, width, height }) => {
  const { filters, highlights, setFilter, clearFilter } = useDashboardContext();

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

  const highlightedLabels = useMemo(() => {
    const highlight = highlights.get('Annual income - Overall Pie');
    return highlight ? highlight.highlightedValues : new Set<string>();
  }, [highlights]);

  const pieData = useMemo(() => {
    const grouped = groupByField(filteredData, 'A6. What is your annual income?');
    const colors = getColorPalette(grouped.length);

    return grouped.map((item, index) => ({
      label: item.label,
      value: item.count,
      percentage: item.percentage,
      color: colors[index],
    })) as PieChartData[];
  }, [filteredData]);

  const handleSliceClick = (label: string) => {
    const currentFilter = filters.get('Annual income - Overall Pie');
    if (currentFilter && currentFilter.selectedValues.has(label)) {
      currentFilter.selectedValues.delete(label);
      if (currentFilter.selectedValues.size === 0) {
        clearFilter('Annual income - Overall Pie');
      } else {
        setFilter({
          worksheetName: 'Annual income - Overall Pie',
          selectedValues: currentFilter.selectedValues,
          fieldName: 'A6. What is your annual income?',
        });
      }
    } else {
      const newSelectedValues = currentFilter
        ? new Set([...currentFilter.selectedValues, label])
        : new Set([label]);
      setFilter({
        worksheetName: 'Annual income - Overall Pie',
        selectedValues: newSelectedValues,
        fieldName: 'A6. What is your annual income?',
      });
    }
  };

  return (
    <div className="annual-income-pie">
      <PieChart
        data={pieData}
        title="Annual Income"
        width={width}
        height={height}
        onSliceClick={handleSliceClick}
        highlightedLabels={highlightedLabels}
      />
    </div>
  );
};
