/**
 * Format number as currency
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

/**
 * Format number as percentage
 */
export const formatPercent = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  }).format(value);
};

/**
 * Format number with comma separators
 */
export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('en-US').format(value);
};

/**
 * Calculate dynamic margins for chart based on label lengths
 */
export const calculateDynamicMargins = (
  maxLabelLength: number,
  _axis: 'y' | 'x',
  baseMargin: number = 60
): number => {
  // Estimate character width (in pixels) for a standard sans-serif font
  const charWidth = 8;
  const calculatedMargin = baseMargin + (maxLabelLength * charWidth);
  return Math.min(calculatedMargin, 300); // Cap at 300px max margin
};
