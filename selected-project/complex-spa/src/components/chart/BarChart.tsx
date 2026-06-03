import React from 'react';
import { Bar } from '@ant-design/charts';

type BarChartProps = {
  data: Array<{
    category: string;
    value: number;
  }>;
  color?: string;
  title?: string;
  height?: number;
};

const BarChart: React.FC<BarChartProps> = ({ data, color = '#1890ff', title, height = 300 }) => {
  const config = {
    data,
    xField: 'value',
    yField: 'category',
    seriesField: 'category',
    color,
    legend: {
      position: 'top-left',
    },
    height,
    meta: {
      category: { alias: 'Category' },
      value: { alias: 'Value' },
    },
  };

  return (
    <div style={{ padding: '16px', backgroundColor: '#fff', borderRadius: '4px' }}>
      {title && <h3 style={{ marginBottom: '16px' }}>{title}</h3>}
      <Bar {...config} />
    </div>
  );
};

export default BarChart;