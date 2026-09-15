import React, { useMemo } from 'react';
import type { ExtendedDataRow, PieChartData } from '../../types';
import { PieChart } from './PieChart';
import { groupByField, getColorPalette } from '../../services/aggregationService';
import { useDashboardContext } from '../../contexts/DashboardContext';
import './YearsOfExperiencePie.css';

interface YearsOfExperiencePieProps {
  data: ExtendedDataRow[];
  width: number;
  height: number;
}

export const YearsOfExperiencePie: React.FC<YearsOfExperiencePieProps> = ({ data, width, height }) => {
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
    const highlight = highlights.get('Years of experience - Overall Pie');
    return highlight ? highlight.highlightedValues : new Set<string>();
  }, [highlights]);

  const pieData = useMemo(() => {
    const grouped = groupByField(
      filteredData,
      'A8. How many years of experience do you have as a musician?  If "other" please specify'
    );
    const colors = getColorPalette(grouped.length);

    return grouped.map((item, index) => ({
      label: item.label,
      value: item.count,
      percentage: item.percentage,
      color: colors[index],
    })) as PieChartData[];
  }, [filteredData]);

  const handleSliceClick = (label: string) => {
    const currentFilter = filters.get('Years of experience - Overall Pie');
    if (currentFilter && currentFilter.selectedValues.has(label)) {
      currentFilter.selectedValues.delete(label);
      if (currentFilter.selectedValues.size === 0) {
        clearFilter('Years of experience - Overall Pie');
      } else {
        setFilter({
          worksheetName: 'Years of experience - Overall Pie',
          selectedValues: currentFilter.selectedValues,
          fieldName:
            'A8. How many years of experience do you have as a musician?  If "other" please specify',
        });
      }
    } else {
      const newSelectedValues = currentFilter
        ? new Set([...currentFilter.selectedValues, label])
        : new Set([label]);
      setFilter({
        worksheetName: 'Years of experience - Overall Pie',
        selectedValues: newSelectedValues,
        fieldName:
          'A8. How many years of experience do you have as a musician?  If "other" please specify',
      });
    }
  };

  return (
    <div className="years-of-experience-pie">
      <PieChart
        data={pieData}
        title="Years of Experience"
        width={width}
        height={height}
        onSliceClick={handleSliceClick}
        highlightedLabels={highlightedLabels}
      />
    </div>
  );
};
