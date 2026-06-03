import React, { useState, useEffect } from 'react';
import { Line } from '@ant-design/charts';
import { LineConfig } from '@ant-design/charts/es/line';
import { useChartData } from '../../hooks/useChartData';

type LineChartProps = {
  variant?: 'default' | 'compact' | 'detailed';
  title?: string;
  height?: number;
};

const LineChart: React.FC<LineChartProps> = ({ variant = 'default', title, height = 400 }) => {
  const { lineData, loading } = useChartData();
  const [config, setConfig] = useState<LineConfig>({});

  useEffect(() => {
    const baseConfig: LineConfig = {
      data: lineData,
      height,
      xField: 'date',
      yField: 'value',
      seriesField: 'category',
      smooth: true,
      legend: {
        position: 'top-right',
      },
      loading,
    };

    switch (variant) {
      case 'compact':
        setConfig({
          ...baseConfig,
          height: 250,
          legend: false,
          tooltip: false,
          interactions: [],
        });
        break;
      case 'detailed':
        setConfig({
          ...baseConfig,
          annotations: [
            {
              type: 'regionFilter',
              start: ['min', 'median'],
              end: ['max', '0'],
              color: '#F4664A',
            },
          ],
          meta: {
            value: {
              alias: 'Metric Value',
              formatter: (v) => `${v} units`,
            },
          },
        });
        break;
      default:
        setConfig(baseConfig);
    }
  }, [variant, lineData, loading, height]);

  return (
    <div className="line-chart-container">
      {title && <h3>{title}</h3>}
      <Line {...config} />
    </div>
  );
};

export default LineChart;