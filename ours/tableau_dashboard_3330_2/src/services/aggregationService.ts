import type { ExtendedDataRow } from '../types';

// Calculate totals for Amount of Positive and Negative worksheets
export const calculateAmountTotals = (data: ExtendedDataRow[]) => {
  const positiveCount = data.filter((row) => row.isPositive).length;
  const negativeCount = data.filter((row) => row.isNegative).length;
  const totalCount = data.length;

  return {
    positiveCount,
    negativeCount,
    totalCount,
    positivePercentage: totalCount > 0 ? (positiveCount / totalCount) * 100 : 0,
    negativePercentage: totalCount > 0 ? (negativeCount / totalCount) * 100 : 0,
  };
};

// Group data by field for pie charts
export const groupByField = (data: ExtendedDataRow[], field: keyof ExtendedDataRow) => {
  const groups: Record<string, number> = {};

  data.forEach((row) => {
    const value = row[field] as string;
    if (value && value !== 'Null') {
      groups[value] = (groups[value] || 0) + 1;
    }
  });

  return Object.entries(groups)
    .map(([label, count]) => ({
      label,
      count,
      percentage: (count / data.length) * 100,
    }))
    .sort((a, b) => b.count - a.count);
};

// Filter data based on selected values
export const filterData = (
  data: ExtendedDataRow[],
  fieldName: string,
  selectedValues: Set<string>
): ExtendedDataRow[] => {
  if (selectedValues.size === 0) return data;

  return data.filter((row) => {
    const value = row[fieldName] as string;
    return selectedValues.has(value);
  });
};

// Get unique values for a field
export const getUniqueValues = (
  data: ExtendedDataRow[],
  field: keyof ExtendedDataRow
): string[] => {
  const values = new Set<string>();
  data.forEach((row) => {
    const value = row[field];
    if (value && value !== 'Null') {
      values.add(String(value));
    }
  });
  return Array.from(values);
};

// Color palette for pie charts
export const getColorPalette = (count: number): string[] => {
  const baseColors = [
    '#4E79A7', // Blue
    '#F28E2B', // Orange
    '#E15759', // Red
    '#76B7B2', // Teal
    '#59A14F', // Green
    '#EDC948', // Yellow
    '#B07AA1', // Purple
    '#FF9DA7', // Pink
    '#9C755F', // Brown
    '#BAB0AC', // Gray
  ];

  const colors: string[] = [];
  for (let i = 0; i < count; i++) {
    colors.push(baseColors[i % baseColors.length]);
  }
  return colors;
};
