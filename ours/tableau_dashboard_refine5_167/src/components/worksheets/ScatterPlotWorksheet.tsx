import { useEffect, useState } from 'react';
import { ScatterPlot } from '../charts/ScatterPlot';
import { getScatterPlotData } from '../../services/dataService';

export const ScatterPlotWorksheet: React.FC<{ width?: number; height?: number }> = ({
  width = 500,
  height = 400,
}) => {
  const [data, setData] = useState<Array<{ x: number; y: number; size: number; label: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const scatterData = await getScatterPlotData();

        // Transform data for the chart
        const chartData = scatterData.map((item) => ({
          x: item.sales,
          y: item.profit,
          size: item.quantity,
          label: item.productName,
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
      <ScatterPlot
        data={data}
        width={width}
        height={height}
        title="Scatterplot"
        margin={{ top: 40, right: 30, bottom: 60, left: 80 }}
        circleColor="#e15759"
        xLabel="Sales"
        yLabel="Profit"
      />
    </div>
  );
};
