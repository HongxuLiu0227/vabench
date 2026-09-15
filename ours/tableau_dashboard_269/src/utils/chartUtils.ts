import * as d3 from 'd3';

export interface Margin {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export const defaultMargin: Margin = { top: 20, right: 20, bottom: 60, left: 60 };

export function getTextWidth(text: string, font: string = '12px sans-serif'): number {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) return 100;
  context.font = font;
  return context.measureText(text).width;
}

export function calculateDynamicLabels(labels: string[], fontSize: number = 12): Margin {
  const maxLabelLength = Math.max(...labels.map(l => l.length));
  const estimatedWidth = maxLabelLength * fontSize * 0.6;
  return {
    top: 40,
    right: 20,
    bottom: 60,
    left: Math.max(60, estimatedWidth + 20),
  };
}

export function createColorScale(values: number[]): d3.ScaleLinear<string, string> {
  const min = Math.min(...values);
  const max = Math.max(...values);
  return d3.scaleLinear<string, string>()
    .domain([min, (min + max) / 2, max] as [number, number, number])
    .range(['#d7191c', '#ffffbf', '#2c7bb6']);
}

export function createProfitColorScale(values: number[]): d3.ScaleLinear<string, string> {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const mid = (min + max) / 2;
  return d3.scaleLinear<string, string>()
    .domain([min, mid < 0 ? 0 : mid, max] as [number, number, number])
    .range(['#d7191c', '#ffffbf', '#2c7bb6']);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatCompactNumber(value: number): string {
  if (Math.abs(value) >= 1000000) {
    return (value / 1000000).toFixed(1) + 'M';
  } else if (Math.abs(value) >= 1000) {
    return (value / 1000).toFixed(1) + 'K';
  }
  return value.toFixed(0);
}
