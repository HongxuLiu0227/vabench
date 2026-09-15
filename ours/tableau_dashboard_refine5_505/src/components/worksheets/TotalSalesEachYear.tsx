import { useEffect, useState } from 'react';
import { LineChart } from '../charts/LineChart';
import { aggregateByYear, type AggregatedData } from '../../lib/dataTransform';
import { loadSalesData } from '../../services/dataService';
import { LoadingState, ErrorState } from '../ui/LoadingState';

export function TotalSalesEachYear() {
  const [data, setData] = useState<AggregatedData<number>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const rawData = await loadSalesData();
        const aggregated = aggregateByYear(rawData);
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
    return <LoadingState message="Loading sales data by year..." />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  return (
    <LineChart
      data={data}
      width={500}
      height={400}
      title="Total Sales Each Year"
      xLabel="Year"
      yLabel="Sales"
    />
  );
}
