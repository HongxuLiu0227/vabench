import { useState, useEffect } from 'react';

interface ChartData {
  label: string;
  value: number;
  color?: string;
}

export const useChartData = (dataSource: 'metrics' | 'projects' | 'users') => {
  const [data, setData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Simulate API call with timeout
        await new Promise(resolve => setTimeout(resolve, 500));
        
        let mockData: ChartData[] = [];
        
        switch(dataSource) {
          case 'metrics':
            mockData = [
              { label: 'Revenue', value: 125000, color: '#4CAF50' },
              { label: 'Expenses', value: 75000, color: '#F44336' },
              { label: 'Profit', value: 50000, color: '#2196F3' },
            ];
            break;
          case 'projects':
            mockData = [
              { label: 'Completed', value: 12, color: '#9C27B0' },
              { label: 'In Progress', value: 8, color: '#FF9800' },
              { label: 'On Hold', value: 3, color: '#607D8B' },
            ];
            break;
          case 'users':
            mockData = [
              { label: 'Active', value: 45, color: '#00BCD4' },
              { label: 'Inactive', value: 15, color: '#E91E63' },
              { label: 'Pending', value: 5, color: '#795548' },
            ];
            break;
        }
        
        setData(mockData);
        setError(null);
      } catch (err) {
        setError('Failed to load chart data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dataSource]);

  return { data, loading, error };
};

export const useChartConfig = (chartType: 'pie' | 'bar' | 'line') => {
  const baseConfig = {
    padding: 'auto',
    appendPadding: 10,
    theme: 'light',
    interactions: [{ type: 'element-active' }],
  };

  switch(chartType) {
    case 'pie':
      return {
        ...baseConfig,
        angleField: 'value',
        colorField: 'label',
        radius: 0.8,
        label: {
          type: 'inner',
          offset: '-30%',
          content: '{name}\n{percentage}',
          style: {
            fontSize: 14,
            textAlign: 'center',
          },
        },
      };
    case 'bar':
      return {
        ...baseConfig,
        xField: 'value',
        yField: 'label',
        seriesField: 'label',
        legend: { position: 'top-left' },
      };
    case 'line':
      return {
        ...baseConfig,
        xField: 'label',
        yField: 'value',
        point: {
          size: 5,
          shape: 'diamond',
        },
      };
    default:
      return baseConfig;
  }
};