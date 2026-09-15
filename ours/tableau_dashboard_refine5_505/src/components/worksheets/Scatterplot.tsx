import { useEffect, useState } from 'react';
import { ScatterPlot } from '../charts/ScatterPlot';
import { aggregateByProduct, type AggregatedData } from '../../lib/dataTransform';
import { loadSalesData } from '../../services/dataService';
import { LoadingState, ErrorState } from '../ui/LoadingState';

export function Scatterplot() {
  const [data, setData] = useState<AggregatedData<string>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const rawData = await loadSalesData();
        const aggregated = aggregateByProduct(rawData);
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
    return <LoadingState message="Loading product scatterplot data..." />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  return (
    <ScatterPlot
      data={data}
      width={500}
      height={400}
      title="Scatterplot"
      xLabel="Sales"
      yLabel="Profit"
    />
  );
}
