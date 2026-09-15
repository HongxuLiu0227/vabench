import React, { useEffect, useState } from 'react';
import { VerticalBarChart } from '../charts/VerticalBarChart';
import { calculateTurnoverByYears } from '../../services/dataService';
import type { HRData, FilterState, AggregatedData } from '../../types/hrData';

interface YearsWorkedTurnoverProps {
  data: HRData[];
  width?: number;
  height?: number;
  filters?: FilterState;
  onFilterChange?: (filters: FilterState) => void;
}

const YEARS_COLORS: Record<string, string> = {
  '2': '#4e79a7',
  '3': '#f28e2b',
  '4': '#e15759',
  '5': '#76b7b2',
  '6': '#59a14f',
  '7': '#edc948',
  '8': '#b07aa1',
  '10': '#ff9da7',
};

export const YearsWorkedTurnover: React.FC<YearsWorkedTurnoverProps> = ({
  data,
  width = 400,
  height = 300,
  filters = {},
  onFilterChange,
}) => {
  const [aggregatedData, setAggregatedData] = useState<AggregatedData[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(
    filters.timeSpendCompany !== undefined ? String(filters.timeSpendCompany) : undefined
  );

  useEffect(() => {
    const aggregated = calculateTurnoverByYears(data);
    setAggregatedData(aggregated);
  }, [data]);

  useEffect(() => {
    setSelectedCategory(filters.timeSpendCompany !== undefined ? String(filters.timeSpendCompany) : undefined);
  }, [filters.timeSpendCompany]);

  const handleBarClick = (category: string) => {
    const newTimeSpend = selectedCategory === category ? undefined : Number(category);
    setSelectedCategory(newTimeSpend !== undefined ? String(newTimeSpend) : undefined);
    if (onFilterChange) {
      onFilterChange({ ...filters, timeSpendCompany: newTimeSpend });
    }
  };

  const getColor = (_: string, series?: string) => {
    if (!series) return '#4e79a7';
    return YEARS_COLORS[series] || '#4e79a7';
  };

  const selectedCategories = selectedCategory
    ? new Set([selectedCategory])
    : new Set<string>();

  return (
    <div style={{ width, height }}>
      <div style={{ marginBottom: '10px', fontSize: '14px', fontWeight: 'bold' }}>
        Employee turnover depending on years worked distribution
      </div>
      <VerticalBarChart
        data={aggregatedData}
        width={width}
        height={height - 40}
        getColor={getColor}
        stacked={true}
        onBarClick={handleBarClick}
        selectedCategories={selectedCategories}
      />
    </div>
  );
};
