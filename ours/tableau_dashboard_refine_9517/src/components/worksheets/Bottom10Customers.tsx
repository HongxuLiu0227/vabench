import { useMemo } from 'react';
import { useDashboard } from '../../hooks/useDashboard';
import { HorizontalBarChart } from '../HorizontalBarChart';
import type { ParsedOrder } from '../../types';

interface Bottom10CustomersProps {
  data: ParsedOrder[];
}

export function Bottom10Customers({ data }: Bottom10CustomersProps) {
  const { filters, updateFilters, selection, setSelection } = useDashboard();

  const chartData = useMemo(() => {
    const aggregation = new Map<string, number>();

    data.forEach((row) => {
      const customerName = row['Customer Name'];
      const existing = aggregation.get(customerName);
      if (existing) {
        aggregation.set(customerName, existing + row['Sales']);
      } else {
        aggregation.set(customerName, row['Sales']);
      }
    });

    return Array.from(aggregation.entries())
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => a.value - b.value)
      .slice(0, 10);
  }, [data]);

  const handleBarClick = (customerName: string) => {
    if (filters.customerName === customerName) {
      updateFilters({ customerName: undefined });
      setSelection(null);
    } else {
      updateFilters({ customerName });
      setSelection({ field: 'Customer Name', value: customerName });
    }
  };

  return (
    <HorizontalBarChart
      data={chartData}
      title="Bottom 10 Customers"
      onBarClick={handleBarClick}
      selection={selection}
      worksheetName="Bottom 10 Customers"
    />
  );
}
