import { useMemo } from 'react';
import { useDashboard } from '../../hooks/useDashboard';
import { HorizontalBarChart } from '../HorizontalBarChart';
import type { ParsedOrder } from '../../types';

interface SalesBySubCategoryProps {
  data: ParsedOrder[];
}

export function SalesBySubCategory({ data }: SalesBySubCategoryProps) {
  const { filters, updateFilters, selection, setSelection } = useDashboard();

  // Filter to Technology category first
  const filteredData = useMemo(() => {
    return data.filter((row) => row['Category'] === 'Technology');
  }, [data]);

  const chartData = useMemo(() => {
    const aggregation = new Map<string, number>();

    filteredData.forEach((row) => {
      const subCategory = row['Sub-Category'];
      const existing = aggregation.get(subCategory);
      if (existing) {
        aggregation.set(subCategory, existing + row['Sales']);
      } else {
        aggregation.set(subCategory, row['Sales']);
      }
    });

    return Array.from(aggregation.entries())
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredData]);

  const handleBarClick = (subCategory: string) => {
    if (filters.subCategory === subCategory) {
      updateFilters({ subCategory: undefined });
      setSelection(null);
    } else {
      updateFilters({ subCategory });
      setSelection({ field: 'Sub-Category', value: subCategory });
    }
  };

  return (
    <HorizontalBarChart
      data={chartData}
      title="Sales by Sub Category"
      onBarClick={handleBarClick}
      selection={selection}
      worksheetName="Sales by Sub Category"
    />
  );
}
