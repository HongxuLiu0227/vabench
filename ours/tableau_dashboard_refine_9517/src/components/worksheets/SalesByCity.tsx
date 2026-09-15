import { useMemo } from 'react';
import { useDashboard } from '../../hooks/useDashboard';
import { HorizontalBarChart } from '../HorizontalBarChart';
import type { ParsedOrder } from '../../types';

interface SalesByCityProps {
  data: ParsedOrder[];
}

export function SalesByCity({ data }: SalesByCityProps) {
  const { filters, updateFilters, selection, setSelection } = useDashboard();

  const chartData = useMemo(() => {
    const aggregation = new Map<string, number>();

    data.forEach((row) => {
      const city = row['City'];
      const existing = aggregation.get(city);
      if (existing) {
        aggregation.set(city, existing + row['Sales']);
      } else {
        aggregation.set(city, row['Sales']);
      }
    });

    return Array.from(aggregation.entries())
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 15);
  }, [data]);

  const handleBarClick = (city: string) => {
    if (filters.cityName === city) {
      updateFilters({ cityName: undefined });
      setSelection(null);
    } else {
      updateFilters({ cityName: city });
      setSelection({ field: 'City', value: city });
    }
  };

  return (
    <HorizontalBarChart
      data={chartData}
      title="Sales by City"
      onBarClick={handleBarClick}
      selection={selection}
      worksheetName="Sales by city"
    />
  );
}
