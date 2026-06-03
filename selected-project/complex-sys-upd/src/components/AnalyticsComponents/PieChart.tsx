import React from 'react';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

type PieChartProps = {
  data: Array<{
    name: string;
    value: number;
  }>;
};

export default function PieChart(props: PieChartProps) {
  const data = Array.isArray(props.data) ? props.data : [];
  const chartData = {
    labels: data.map((item: { name: string }) => item.name),
    datasets: [{
      data: data.map((item: { value: number }) => item.value),
      backgroundColor: [
        '#3498db',
        '#2ecc71',
        '#e74c3c',
        '#f39c12',
        '#9b59b6'
      ],
      borderColor: [
        '#2980b9',
        '#27ae60',
        '#c0392b',
        '#d35400',
        '#8e44ad'
      ],
      borderWidth: 1,
    }],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right' as const,
      },
    },
  };

  return <Pie data={chartData} options={options} />;
};