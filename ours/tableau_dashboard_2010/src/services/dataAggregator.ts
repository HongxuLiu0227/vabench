import type { ABTestingDataWithAgeGroup, Variation, ProcessStep, Gender } from '../types/data';

export interface AggregatedMetric {
  category: string;
  series?: string;
  value: number;
}

// Count by category and optional series
export function countByCategory(
  data: ABTestingDataWithAgeGroup[],
  categoryField: keyof ABTestingDataWithAgeGroup,
  seriesField?: keyof ABTestingDataWithAgeGroup
): AggregatedMetric[] {
  const grouped = new Map<string, Map<string, number>>();

  data.forEach(row => {
    const category = String(row[categoryField]);
    const series = seriesField ? String(row[seriesField]) : 'all';

    if (!grouped.has(category)) {
      grouped.set(category, new Map());
    }
    const seriesMap = grouped.get(category)!;
    seriesMap.set(series, (seriesMap.get(series) || 0) + 1);
  });

  const result: AggregatedMetric[] = [];
  grouped.forEach((seriesMap, category) => {
    if (seriesField) {
      seriesMap.forEach((value, series) => {
        result.push({ category, series, value });
      });
    } else {
      result.push({ category, value: seriesMap.get('all') || 0 });
    }
  });

  return result;
}

// Average by category
export function averageByCategory(
  data: ABTestingDataWithAgeGroup[],
  categoryField: keyof ABTestingDataWithAgeGroup,
  valueField: keyof ABTestingDataWithAgeGroup
): AggregatedMetric[] {
  const grouped = new Map<string, { sum: number; count: number }>();

  data.forEach(row => {
    const category = String(row[categoryField]);
    const value = Number(row[valueField]) || 0;

    if (!grouped.has(category)) {
      grouped.set(category, { sum: 0, count: 0 });
    }
    const group = grouped.get(category)!;
    group.sum += value;
    group.count += 1;
  });

  return Array.from(grouped.entries()).map(([category, { sum, count }]) => ({
    category,
    value: count > 0 ? sum / count : 0
  }));
}

// Filter data
export function filterData(
  data: ABTestingDataWithAgeGroup[],
  filters: {
    variation?: Variation | null;
    process_step?: ProcessStep | null;
    gendr?: Gender | null;
    age_group?: string | null;
    minDelta?: number | null;
  }
): ABTestingDataWithAgeGroup[] {
  return data.filter(row => {
    if (filters.variation && row.Variation !== filters.variation) return false;
    if (filters.process_step && row.process_step !== filters.process_step) return false;
    if (filters.gendr && row.gendr !== filters.gendr) return false;
    if (filters.age_group && row.age_group !== filters.age_group) return false;
    if (filters.minDelta !== undefined && filters.minDelta !== null) {
      // For delta filter, we need to calculate it first
      // This is handled by the caller for balance vs age (2)
    }
    return true;
  });
}

// Calculate percentage of total within category
export function calculatePercentageOfTotal(
  data: AggregatedMetric[],
  categoryField: 'category' | 'series' = 'series'
): AggregatedMetric[] {
  const totals = new Map<string, number>();

  // Calculate totals by category
  data.forEach(metric => {
    const key = categoryField === 'category' ? metric.category : (metric.series || 'all');
    totals.set(key, (totals.get(key) || 0) + metric.value);
  });

  // Convert to percentages
  return data.map(metric => {
    const key = categoryField === 'category' ? metric.category : (metric.series || 'all');
    const total = totals.get(key) || 1;
    return {
      ...metric,
      value: total > 0 ? (metric.value / total) * 100 : 0
    };
  });
}

// Get unique values
export function getUniqueValues(
  data: ABTestingDataWithAgeGroup[],
  field: keyof ABTestingDataWithAgeGroup
): string[] {
  const values = new Set<string>();
  data.forEach(row => {
    values.add(String(row[field]));
  });
  return Array.from(values);
}
