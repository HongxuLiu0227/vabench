import { useEffect, useState } from 'react';
import { ScatterplotChart } from '../ScatterplotChart';
import { LoadingSpinner } from '../LoadingSpinner';
import { ErrorMessage } from '../ErrorMessage';
import type { ScatterPoint } from '../ScatterplotChart';
import { loadOrdersData } from '../../services/dataLoader';
import { createScatterplotData } from '../../services/dataTransform';

export const Scatterplot: React.FC = () => {
  const [data, setData] = useState<ScatterPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const rawData = await loadOrdersData();
        const scatterData = createScatterplotData(rawData);
        setData(scatterData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading scatterplot data..." />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ScatterplotChart
        data={data}
        width={400}
        height={300}
        title="Scatterplot"
      />
    </div>
  );
};
