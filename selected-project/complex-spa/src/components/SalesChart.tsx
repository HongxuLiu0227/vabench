import React from 'react';
import { Line } from '@ant-design/charts';

interface SalesData {
  month: string;
  sales: number;
  revenue: number;
}

interface SalesChartProps {
  data: SalesData[];
}

const SalesChart: React.FC<SalesChartProps> = ({ data = [] }) => {
  const config = {
    data,
    xField: 'month',
    yField: 'value',
    seriesField: 'category',
    meta: {
      value: {
        alias: 'Amount',
      },
    },
  };

  return (
    <div style={{ height: '400px', width: '100%' }}>
      <h3>Sales Chart</h3>
      <Line {...config} />
    </div>
  );
};

export default SalesChart;