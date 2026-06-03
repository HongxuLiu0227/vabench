import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

type BarChartProps = {
  data: Array<{
    date: string;
    visitors: number;
    pageViews: number;
    [key: string]: string | number;
  }>;
  keys: string[];
};

export default function BarChart(props: BarChartProps) {
  const data = Array.isArray(props.data) ? props.data : [];
  const keys = Array.isArray(props.keys) ? props.keys : [];
  const chartData = {
    labels: data.map((item: { date: string }) => item.date),
    datasets: keys.map((key: string) => ({
      label: key === 'visitors' ? 'Visitors' : 'Page Views',
      data: data.map((item: { [key: string]: string | number }) => item[key] as number),
      backgroundColor: key === 'visitors' ? '#3498db' : '#2ecc71',
      borderColor: key === 'visitors' ? '#2980b9' : '#27ae60',
      borderWidth: 1,
    })),
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return <Bar data={chartData} options={options} />;
};