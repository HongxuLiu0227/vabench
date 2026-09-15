import type { DataPoint, BreachTypeCount, InfoSourceCount, PieSlice, FilterState } from '../types/data';

export const aggregateByBreachType = (data: DataPoint[]): BreachTypeCount[] => {
  const counts: Record<string, number> = {};

  data.forEach(d => {
    const key = d.breachType || 'Unknown';
    counts[key] = (counts[key] || 0) + 1;
  });

  return Object.entries(counts)
    .map(([breachType, count]) => ({ breachType, count }))
    .sort((a, b) => b.count - a.count);
};

export const aggregateByInfoSource = (data: DataPoint[]): InfoSourceCount[] => {
  const counts: Record<string, Record<string, number>> = {};

  data.forEach(d => {
    const infoSource = d.infoSource || 'Unknown';
    const breachType = d.breachType || 'Unknown';

    if (!counts[infoSource]) {
      counts[infoSource] = {};
    }
    counts[infoSource][breachType] = (counts[infoSource][breachType] || 0) + 1;
  });

  const result: InfoSourceCount[] = [];
  Object.entries(counts).forEach(([infoSource, breachTypes]) => {
    Object.entries(breachTypes).forEach(([breachType, count]) => {
      result.push({ infoSource, breachType, count });
    });
  });

  return result.sort((a, b) => b.count - a.count);
};

export const aggregatePieSlices = (data: DataPoint[], filter: FilterState): PieSlice[] => {
  // Apply filters - this is the base filter state from interactions
  let filtered = data;

  // Apply selected year filter (from dashboard interaction)
  if (filter.year) {
    filtered = filtered.filter(d => d.year === filter.year);
  }

  // Apply selected breach type filter (from dashboard interaction)
  if (filter.breachType) {
    filtered = filtered.filter(d => d.breachType === filter.breachType);
  }

  // IMPORTANT: Per tableau_spec.json lines 70-95, the pie chart has a filter
  // from "DISC" to "UNKN" (alphabetical range). This means: DISC, HACK, INSD, PHYS, PORT, STAT, UNKN
  // This is a categorical range filter that is ALWAYS applied to this worksheet
  const allowedBreachTypes = ['DISC', 'HACK', 'INSD', 'PHYS', 'PORT', 'STAT', 'UNKN'];
  filtered = filtered.filter(d => allowedBreachTypes.includes(d.breachType));

  // Group by breach type and year for pie slices
  const groups: Record<string, Record<number, number>> = {};

  filtered.forEach(d => {
    const breachType = d.breachType || 'Unknown';
    if (!groups[breachType]) {
      groups[breachType] = {};
    }
    groups[breachType][d.year] = (groups[breachType][d.year] || 0) + 1;
  });

  const slices: PieSlice[] = [];
  const total = filtered.length;

  Object.entries(groups).forEach(([breachType, years]) => {
    Object.entries(years).forEach(([year, count]) => {
      slices.push({
        breachType,
        year: parseInt(year),
        count,
        percentage: total > 0 ? (count / total) * 100 : 0,
      });
    });
  });

  return slices.sort((a, b) => b.count - a.count);
};

export const filterData = (data: DataPoint[], filter: FilterState): DataPoint[] => {
  let filtered = data;

  if (filter.year) {
    filtered = filtered.filter(d => d.year === filter.year);
  }

  if (filter.breachType) {
    filtered = filtered.filter(d => d.breachType === filter.breachType);
  }

  return filtered;
};

export const getUniqueYears = (data: DataPoint[]): number[] => {
  const years = new Set<number>();
  data.forEach(d => years.add(d.year));
  return Array.from(years).sort((a, b) => a - b);
};
