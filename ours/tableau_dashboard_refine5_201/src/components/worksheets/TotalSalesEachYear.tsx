import { useEffect, useState } from 'react';
import { LineChart } from '../LineChart';
import { LoadingSpinner } from '../LoadingSpinner';
import { ErrorMessage } from '../ErrorMessage';
import { loadOrdersData } from '../../services/dataLoader';
import { aggregateSalesByYear } from '../../services/dataTransform';

export const TotalSalesEachYear: React.FC = () => {
  const [data, setData] = useState<Array<{ year: string; value: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const rawData = await loadOrdersData();
        const aggregated = aggregateSalesByYear(rawData);
        setData(aggregated);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading sales by year..." />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <LineChart
        data={data}
        width={400}
        height={300}
        title="Total Sales Each Year"
      />
    </div>
  );
};
