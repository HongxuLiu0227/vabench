import React from 'react';
import HorizontalRankedBar from './HorizontalRankedBar';
import type { BarChartData, CleanDataRow } from '../types';
import { aggregateCountyOverallRate, getPerformanceColor } from '../utils/calculations';

interface CountyOverallRateProps {
  data: CleanDataRow[];
  parameterDate: Date;
  width: number;
  height: number;
}

const CountyOverallRate: React.FC<CountyOverallRateProps> = ({
  data,
  parameterDate,
  width,
  height
}) => {
  // Aggregate data
  const aggregatedData = aggregateCountyOverallRate(data, parameterDate);

  // Convert to bar chart data format with performance-based coloring
  const barData: BarChartData[] = aggregatedData.map(item => ({
    category: item.county,
    value: item.percentCTUploads / 100, // Convert to decimal for chart
    color: getPerformanceColor(item.colorCategory),
    series: item.colorCategory
  }));

  const parameterMonthYear = parameterDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short'
  });

  // Define legend items
  const legendItems = [
    { label: 'Above 67%', color: getPerformanceColor('Above 67%') },
    { label: '34 - 66%', color: getPerformanceColor('34 - 66%') },
    { label: 'Below 34%', color: getPerformanceColor('Below 34%') }
  ];

  return (
    <HorizontalRankedBar
      data={barData}
      title={`Overall Reporting Care & Treatment by County\n${parameterMonthYear}`}
      xAxisTitle="% C&T Uploads"
      width={width}
      height={height}
      showLegend={true}
      legendItems={legendItems}
    />
  );
};

export default CountyOverallRate;
