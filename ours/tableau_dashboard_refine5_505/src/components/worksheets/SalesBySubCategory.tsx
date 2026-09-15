import { useEffect, useState } from 'react';
import { HorizontalBarChart } from '../charts/HorizontalBarChart';
import { aggregateBySubCategory, type AggregatedData } from '../../lib/dataTransform';
import { loadSalesData } from '../../services/dataService';
import { LoadingState, ErrorState } from '../ui/LoadingState';

export function SalesBySubCategory() {
  const [data, setData] = useState<AggregatedData<string>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const rawData = await loadSalesData();
        const aggregated = aggregateBySubCategory(rawData);
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
    return <LoadingState message="Loading sales by sub-category..." />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  return (
    <HorizontalBarChart
      data={data}
      width={500}
      height={400}
      title="Sales by Sub Category"
      xLabel="Sales"
      yLabel="Sub-Category"
    />
  );
}
