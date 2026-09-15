import { useEffect, useRef } from 'react';
import type { MonthlyProfitData } from '../types';
import { createVerticalBarChart, type ChartMargins } from '../utils/chartUtils';

interface MonthlyProfitChartProps {
  data: MonthlyProfitData[];
  selectedMonth: string | null;
  onMonthSelect: (month: string | null) => void;
  width?: number;
  height?: number;
}

const defaultMargins: ChartMargins = {
  top: 20,
  right: 20,
  bottom: 60,
  left: 60,
};

export function MonthlyProfitChart({
  data,
  selectedMonth,
  onMonthSelect,
  width = 800,
  height = 400,
}: MonthlyProfitChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    const chartData = data.map((d) => ({ category: d.MonthYear, value: d.Profit }));

    createVerticalBarChart(
      svgRef.current,
      chartData,
      width,
      height,
      defaultMargins,
      selectedMonth,
      (category) => {
        onMonthSelect(category === selectedMonth ? null : category);
      }
    );
  }, [data, selectedMonth, onMonthSelect, width, height]);

  useEffect(() => {
    const handleClickOutside = () => {
      if (selectedMonth !== null) {
        onMonthSelect(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [selectedMonth, onMonthSelect]);

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
