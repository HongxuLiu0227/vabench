/**
 * Calculate margins for charts based on label sizes
 */
export interface ChartMargins {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export function calculateMargins(
  maxLabelLength: number,
  hasXAxisLabels: boolean = true,
  hasYAxisLabels: boolean = true,
  hasLegend: boolean = false
): ChartMargins {
  const base: ChartMargins = {
    top: 20,
    right: 20,
    bottom: hasXAxisLabels ? 60 : 20,
    left: hasYAxisLabels ? 60 : 20
  };

  // Adjust left margin for long y-axis labels
  if (hasYAxisLabels && maxLabelLength > 0) {
    base.left = Math.max(base.left, maxLabelLength * 7 + 20);
  }

  // Adjust right margin for legend
  if (hasLegend) {
    base.right = Math.max(base.right, 120);
  }

  return base;
}

/**
 * Format number for display
 */
export function formatNumber(value: number, decimals: number = 2): string {
  return value.toFixed(decimals);
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Get text width estimation
 */
export function estimateTextWidth(text: string, fontSize: number = 12): number {
  // Rough estimation: average character width is 0.6 * font size
  return text.length * fontSize * 0.6;
}
