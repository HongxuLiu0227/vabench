import React from 'react';
import { HorizontalBarChart } from './HorizontalBarChart';
import type { BarChartData } from '../types';

interface SalesBySubCategoryProps {
  data: BarChartData[];
  width?: number;
  height?: number;
}

export const SalesBySubCategory: React.FC<SalesBySubCategoryProps> = ({
  data,
  width = 800,
  height = 300
}) => {
  return (
    <HorizontalBarChart
      data={data}
      width={width}
      height={height}
      title="Sales by Sub Category"
      maxBars={100}
    />
  );
};
