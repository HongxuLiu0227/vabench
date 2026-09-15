import { useEffect, useState } from 'react';
import { HorizontalRankedBarChart } from '../HorizontalRankedBarChart';
import { LoadingSpinner } from '../LoadingSpinner';
import { ErrorMessage } from '../ErrorMessage';
import { loadOrdersData } from '../../services/dataLoader';
import { aggregateSalesBySubCategory } from '../../services/dataTransform';

export const SalesBySubCategory: React.FC = () => {
  const [data, setData] = useState<Array<{ category: string; value: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const rawData = await loadOrdersData();
        const aggregated = aggregateSalesBySubCategory(rawData);
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
    return <LoadingSpinner message="Loading sales by sub-category..." />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <HorizontalRankedBarChart
        data={data}
        width={400}
        height={300}
        title="Sales by Sub Category"
      />
    </div>
  );
};
