import React from 'react';
import HorizontalRankedBar from './HorizontalRankedBar';
import type { BarChartData, CleanDataRow } from '../types';
import { aggregateCountyDistribution } from '../utils/calculations';

interface CountyDistributionProps {
  data: CleanDataRow[];
  width: number;
  height: number;
}

const CountyDistribution: React.FC<CountyDistributionProps> = ({ data, width, height }) => {
  // Aggregate data
  const aggregatedData = aggregateCountyDistribution(data);

  // Convert to bar chart data format
  const barData: BarChartData[] = aggregatedData.map(item => ({
    category: item.county,
    value: item.facilityCount,
    color: '#2196F3', // Default blue color for distribution chart
    series: item.agency
  }));

  return (
    <HorizontalRankedBar
      data={barData}
      title="Distribution of EMR Sites by County"
      xAxisTitle="Number of Facilities by County"
      width={width}
      height={height}
    />
  );
};

export default CountyDistribution;
