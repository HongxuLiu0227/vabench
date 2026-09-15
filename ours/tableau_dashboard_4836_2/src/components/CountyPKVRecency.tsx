import React from 'react';
import HorizontalRankedBar from './HorizontalRankedBar';
import type { BarChartData, CleanDataRow } from '../types';
import { aggregateCountyPKVRecency, getPerformanceColor } from '../utils/calculations';

interface CountyPKVRecencyProps {
  data: CleanDataRow[];
  parameterDate: Date;
  width: number;
  height: number;
}

const CountyPKVRecency: React.FC<CountyPKVRecencyProps> = ({
  data,
  parameterDate,
  width,
  height
}) => {
  // Aggregate data
  const aggregatedData = aggregateCountyPKVRecency(data, parameterDate);

  // Convert to bar chart data format with performance-based coloring
  const barData: BarChartData[] = aggregatedData.map(item => ({
    category: item.county,
    value: item.percentPKVUploads / 100, // Convert to decimal for chart
    color: getPerformanceColor(item.colorCategory),
    series: item.colorCategory
  }));

  const parameterMonthYear = parameterDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short'
  });

  return (
    <HorizontalRankedBar
      data={barData}
      title={`Overall Reporting - PKVs by County\n${parameterMonthYear}`}
      xAxisTitle="% PKV Uploads"
      width={width}
      height={height}
    />
  );
};

export default CountyPKVRecency;
