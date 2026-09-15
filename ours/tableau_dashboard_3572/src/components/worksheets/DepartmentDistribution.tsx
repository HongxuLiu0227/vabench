import React, { useEffect, useState } from 'react';
import { VerticalBarChart } from '../charts/VerticalBarChart';
import { aggregateByDepartment } from '../../services/dataService';
import type { HRData, FilterState, AggregatedData } from '../../types/hrData';

interface DepartmentDistributionProps {
  data: HRData[];
  width?: number;
  height?: number;
  filters?: FilterState;
  onFilterChange?: (filters: FilterState) => void;
}

const DEPARTMENT_COLORS: Record<string, string> = {
  'sales': '#4e79a7',
  'accounting': '#f28e2b',
  'hr': '#e15759',
  'technical': '#76b7b2',
  'support': '#59a14f',
  'management': '#edc948',
  'IT': '#b07aa1',
  'product_mng': '#ff9da7',
  'marketing': '#9c755f',
  'RandD': '#bab0ac',
};

export const DepartmentDistribution: React.FC<DepartmentDistributionProps> = ({
  data,
  width = 400,
  height = 300,
  filters = {},
  onFilterChange,
}) => {
  const [aggregatedData, setAggregatedData] = useState<AggregatedData[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(filters.sales);

  useEffect(() => {
    const aggregated = aggregateByDepartment(data);
    setAggregatedData(aggregated);
  }, [data]);

  useEffect(() => {
    setSelectedCategory(filters.sales);
  }, [filters.sales]);

  const handleBarClick = (category: string) => {
    const newSales = selectedCategory === category ? undefined : category;
    setSelectedCategory(newSales);
    if (onFilterChange) {
      onFilterChange({ ...filters, sales: newSales });
    }
  };

  const getColor = (category: string) => {
    return DEPARTMENT_COLORS[category] || '#4e79a7';
  };

  const selectedCategories = selectedCategory
    ? new Set([selectedCategory])
    : new Set<string>();

  return (
    <div style={{ width, height }}>
      <div style={{ marginBottom: '10px', fontSize: '14px', fontWeight: 'bold' }}>
        Department Wise Distribution
      </div>
      <VerticalBarChart
        data={aggregatedData}
        width={width}
        height={height - 40}
        getColor={getColor}
        onBarClick={handleBarClick}
        selectedCategories={selectedCategories}
      />
    </div>
  );
};
