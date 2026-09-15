import { scaleDiverging } from 'd3-scale';

// Diverging color scale for Profit Ratio (-0.5 to 0.5)
// Red for negative, white for zero, green for positive
export const profitRatioColorScale = scaleDiverging<string>()
  .domain([-0.5, 0, 0.5])
  .range(['#d7191c', '#ffffbf', '#1a9641']);

// Alternative color scale with more intense colors
export const profitRatioColorScaleIntense = scaleDiverging<string>()
  .domain([-0.5, 0, 0.5])
  .range(['#b30000', '#ffffff', '#006400']);

// Get color for profit ratio
export function getProfitRatioColor(value: number): string {
  // Clamp value to domain
  const clampedValue = Math.max(-0.5, Math.min(0.5, value));
  return profitRatioColorScale(clampedValue);
}

// Format currency
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

// Format number with commas
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

// Format percentage
export function formatPercentage(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value);
}

// Calculate text width for dynamic margins
export function getTextWidth(text: string, font: string = '12px sans-serif'): number {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) return 100;
  context.font = font;
  const width = context.measureText(text).width;
  canvas.remove();
  return width;
}

// Get maximum text width from an array of strings
export function getMaxTextWidth(texts: string[], font: string = '12px sans-serif'): number {
  let maxWidth = 0;
  texts.forEach((text) => {
    const width = getTextWidth(text, font);
    if (width > maxWidth) {
      maxWidth = width;
    }
  });
  return maxWidth;
}

// Rank calculation for customer rank
export function calculateRank(values: number[], value: number): number {
  const sortedValues = [...values].sort((a, b) => b - a); // Descending
  const index = sortedValues.indexOf(value);
  if (index === -1) return 0;
  // Competition ranking (1224 style)
  let rank = 1;
  for (let i = 0; i < index; i++) {
    if (sortedValues[i] !== value) {
      rank++;
    }
  }
  return rank;
}

// Aggregate data for a specific measure
export function aggregateMeasure<T>(
  data: T[],
  groupBy: (item: T) => string,
  measure: (item: T) => number
): Map<string, number> {
  const map = new Map<string, number>();
  data.forEach((item) => {
    const key = groupBy(item);
    const value = measure(item);
    const existing = map.get(key) || 0;
    map.set(key, existing + value);
  });
  return map;
}
