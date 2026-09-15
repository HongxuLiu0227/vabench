import { useEffect, useState } from 'react';
import { HorizontalBarChart } from '../charts/HorizontalBarChart';
import { getAggregatedSalesByCategory } from '../../services/dataService';

export const BarWorksheet: React.FC<{ width?: number; height?: number }> = ({
  width = 500,
  height = 400,
}) => {
  const [data, setData] = useState<Array<{ label: string; value: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const aggregatedData = await getAggregatedSalesByCategory();

        // Transform data for the chart, showing Category/Sub-Category hierarchy
        const chartData = aggregatedData.map((item) => ({
          label: `${item.category} - ${item.subCategory}`,
          value: item.sales,
          category: item.category,
        }));

        setData(chartData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div
        style={{
          width,
          height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '14px',
          color: '#666',
        }}
      >
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          width,
          height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '14px',
          color: '#c00',
        }}
      >
        Error: {error}
      </div>
    );
  }

  return (
    <div>
      <HorizontalBarChart
        data={data}
        width={width}
        height={height}
        title="Bar"
        margin={{ top: 40, right: 20, bottom: 40, left: 180 }}
        barColor="#4e79a7"
      />
    </div>
  );
};
