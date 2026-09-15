import { useEffect, useState } from 'react';
import { LineChart } from '../charts/LineChart';
import { aggregateByMonth, type AggregatedData } from '../../lib/dataTransform';
import { loadSalesData } from '../../services/dataService';
import { LoadingState, ErrorState } from '../ui/LoadingState';

export function LineChartMonthly() {
  const [data, setData] = useState<AggregatedData<string>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const rawData = await loadSalesData();
        const aggregated = aggregateByMonth(rawData);
        setData(aggregated);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return <LoadingState message="Loading monthly sales data..." />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  return (
    <LineChart
      data={data}
      width={500}
      height={400}
      title="Line"
      xLabel="Order Date (Month)"
      yLabel="Sales"
    />
  );
}
