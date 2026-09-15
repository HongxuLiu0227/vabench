import { useEffect, useState } from 'react';
import { HorizontalRankedBarChart } from '../HorizontalRankedBarChart';
import { LoadingSpinner } from '../LoadingSpinner';
import { ErrorMessage } from '../ErrorMessage';
import { loadOrdersData } from '../../services/dataLoader';
import { aggregateSalesByCategoryAndSubCategory } from '../../services/dataTransform';

export const BarChart: React.FC = () => {
  const [data, setData] = useState<Array<{
    category: string;
    subCategory: string;
    value: number;
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const rawData = await loadOrdersData();
        const aggregated = aggregateSalesByCategoryAndSubCategory(rawData);
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
    return <LoadingSpinner message="Loading sales data..." />;
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
        title="Bar"
        showSubCategory={true}
      />
    </div>
  );
};
