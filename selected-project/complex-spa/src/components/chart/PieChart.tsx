import React, { useState, useEffect } from 'react';
import { Pie } from '@ant-design/charts';
import { PieConfig } from '@ant-design/charts/es/pie';
import { useChartData } from '../../hooks/useChartData';

type PieChartProps = {
  variant?: 'default' | 'donut' | 'custom';
  title?: string;
  colors?: string[];
  innerRadius?: number;
};

const PieChart: React.FC<PieChartProps> = ({
  variant = 'default',
  title = 'Sales Distribution',
  colors = ['#1890ff', '#13c2c2', '#722ed1', '#fa8c16', '#f5222d'],
  innerRadius = 0,
}) => {
  const [data, setData] = useState<Array<{ type: string; value: number }>>([]);
  const { fetchPieData } = useChartData();

  useEffect(() => {
    const loadData = async () => {
      const pieData = await fetchPieData(variant);
      setData(pieData);
    };
    loadData();
  }, [variant, fetchPieData]);

  const config: PieConfig = {
    data,
    angleField: 'value',
    colorField: 'type',
    radius: 1,
    innerRadius,
    label: {
      type: 'inner',
      offset: '-30%',
      content: ({ percent }) => `${(percent * 100).toFixed(0)}%`,
      style: {
        fontSize: 14,
        textAlign: 'center',
      },
    },
    interactions: [{ type: 'element-active' }],
    color: colors,
    statistic: {
      title: {
        style: {
          fontSize: '16px',
          fontWeight: 'bold',
        },
        content: title,
      },
    },
  };

  if (variant === 'donut') {
    config.innerRadius = 0.6;
  }

  if (variant === 'custom') {
    config.legend = {
      position: 'right',
    };
    config.tooltip = {
      formatter: (datum) => {
        return { name: datum.type, value: `$${datum.value.toLocaleString()}` };
      },
    };
  }

  return <Pie {...config} />;
};

export default PieChart;