import { useEffect, useRef } from 'react';
import type { TopItemData } from '../types';
import { createHorizontalBarChart, calculateDynamicMargins, type ChartMargins } from '../utils/chartUtils';

interface TopProductsChartProps {
  data: TopItemData[];
  width?: number;
  height?: number;
}

const defaultMargins: ChartMargins = {
  top: 20,
  right: 20,
  bottom: 60,
  left: 150,
};

export function TopProductsChart({
  data,
  width = 500,
  height = 500,
}: TopProductsChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    const margins = calculateDynamicMargins(data, 'horizontal', defaultMargins);

    createHorizontalBarChart(
      svgRef.current,
      data,
      width,
      height,
      margins
    );
  }, [data, width, height]);

  return (
    <div style={{ width, height }}>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        style={{ display: 'block', margin: '0 auto' }}
      />
    </div>
  );
}
