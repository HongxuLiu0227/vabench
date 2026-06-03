import React, { useState, useEffect } from 'react';
import { Line } from '@ant-design/charts';
import { fetchDashboardData } from '../../../services/dashboardService';

type DataPoint = {
  date: string;
  value: number;
  category: string;
};

type LineChartProps = {
  timeRange?: '7d' | '30d' | '90d';
};

const LineChart: React.FC<LineChartProps> = () => {
  const [data, setData] = useState<DataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const response = await fetchDashboardData('lineChart', { timeRange });
        setData(response.data as DataPoint[]);
      } catch (err) {
        setError('Failed to load chart data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [timeRange]);

  const config = {
    data,
    xField: 'date',
    yField: 'value',
    seriesField: 'category',
    xAxis: {
      type: 'time',
      label: {
        formatter: (v: string) => {
          const date = new Date(v);
          return `${date.getMonth() + 1}/${date.getDate()}`;
        },
      },
    },
    yAxis: {
      label: {
        formatter: (v: string) => `${v} users`,
      },
    },
    legend: {
      position: 'top-right',
    },
    smooth: true,
    animation: {
      appear: {
        animation: 'path-in',
        duration: 2000,
      },
    },
    color: ['#1979C9', '#D62A0D', '#FAA219'],
  };

  if (loading) return <div>Loading chart...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="line-chart-container">
      <div className="chart-header">
        <h3>User Engagement Trends</h3>
        <div className="time-range-selector">
          <button
            className={timeRange === '7d' ? 'active' : ''}
            onClick={() => setTimeRange('7d')}
          >
            7 Days
          </button>
          <button
            className={timeRange === '30d' ? 'active' : ''}
            onClick={() => setTimeRange('30d')}
          >
            30 Days
          </button>
          <button
            className={timeRange === '90d' ? 'active' : ''}
            onClick={() => setTimeRange('90d')}
          >
            90 Days
          </button>
        </div>
      </div>
      <Line {...config} />
    </div>
  );
};

export default LineChart;