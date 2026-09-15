import { useEffect, useState } from 'react';
import { LineChart } from '../charts/LineChart';
import { getSalesByYear } from '../../services/dataService';

export const TotalSalesEachYearWorksheet: React.FC<{ width?: number; height?: number }> = ({
  width = 500,
  height = 400,
}) => {
  const [data, setData] = useState<Array<{ x: string | number; y: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const salesByYear = await getSalesByYear();

        // Transform data for the chart
        const chartData = salesByYear.map((item) => ({
          x: item.year,
          y: item.sales,
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
      <LineChart
        data={data}
        width={width}
        height={height}
        title="Total Sales Each Year"
        margin={{ top: 40, right: 30, bottom: 50, left: 80 }}
        lineColor="#f28e2b"
        xLabel="Year"
        yLabel="Sales"
      />
    </div>
  );
};
