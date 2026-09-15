import React, { useMemo } from 'react';
import type { ExtendedDataRow, PieChartData } from '../../types';
import { PieChart } from './PieChart';
import { groupByField, getColorPalette } from '../../services/aggregationService';
import { useDashboardContext } from '../../contexts/DashboardContext';
import './EducationPie.css';

interface EducationPieProps {
  data: ExtendedDataRow[];
  width: number;
  height: number;
}

export const EducationPie: React.FC<EducationPieProps> = ({ data, width, height }) => {
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
    const highlight = highlights.get('Education - Overall Pie');
    return highlight ? highlight.highlightedValues : new Set<string>();
  }, [highlights]);

  const pieData = useMemo(() => {
    const grouped = groupByField(filteredData, 'A5. What is your highest level of education?');
    const colors = getColorPalette(grouped.length);

    return grouped.map((item, index) => ({
      label: item.label,
      value: item.count,
      percentage: item.percentage,
      color: colors[index],
    })) as PieChartData[];
  }, [filteredData]);

  const handleSliceClick = (label: string) => {
    const currentFilter = filters.get('Education - Overall Pie');
    if (currentFilter && currentFilter.selectedValues.has(label)) {
      currentFilter.selectedValues.delete(label);
      if (currentFilter.selectedValues.size === 0) {
        clearFilter('Education - Overall Pie');
      } else {
        setFilter({
          worksheetName: 'Education - Overall Pie',
          selectedValues: currentFilter.selectedValues,
          fieldName: 'A5. What is your highest level of education?',
        });
      }
    } else {
      const newSelectedValues = currentFilter
        ? new Set([...currentFilter.selectedValues, label])
        : new Set([label]);
      setFilter({
        worksheetName: 'Education - Overall Pie',
        selectedValues: newSelectedValues,
        fieldName: 'A5. What is your highest level of education?',
      });
    }
  };

  return (
    <div className="education-pie">
      <PieChart
        data={pieData}
        title="Education"
        width={width}
        height={height}
        onSliceClick={handleSliceClick}
        highlightedLabels={highlightedLabels}
      />
    </div>
  );
};
