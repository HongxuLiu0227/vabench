import type { OrderData, SalesBySegmentData, PlotOfSalesData, SalesByRegionData, FilterState } from '../types';

export function processSalesBySegmentData(
  data: OrderData[],
  filters: FilterState
): SalesBySegmentData[] {
  let filtered = data;

  // Apply region filter
  if (filters.selectedRegion) {
    filtered = filtered.filter(d => d.Region === filters.selectedRegion);
  }

  // Group by Customer Segment and sum Sales
  const grouped = new Map<string, number>();

  filtered.forEach(d => {
    const segment = d['Customer Segment'];
    const sales = Number(d.Sales) || 0;
    grouped.set(segment, (grouped.get(segment) || 0) + sales);
  });

  return Array.from(grouped.entries())
    .map(([segment, sales]) => ({ segment, sales }))
    .sort((a, b) => b.sales - a.sales);
}

export function processPlotOfSalesData(
  data: OrderData[],
  filters: FilterState
): PlotOfSalesData[] {
  let filtered = data;

  // Apply segment filter
  if (filters.selectedSegment) {
    filtered = filtered.filter(d => d['Customer Segment'] === filters.selectedSegment);
  }

  // Apply region filter
  if (filters.selectedRegion) {
    filtered = filtered.filter(d => d.Region === filters.selectedRegion);
  }

  // Group by Category and Customer Segment
  const grouped = new Map<string, { sales: number; profit: number }>();
  const key = (category: string, segment: string) => `${category}|${segment}`;

  filtered.forEach(d => {
    const category = d.Category;
    const segment = d['Customer Segment'];
    const sales = Number(d.Sales) || 0;
    const profit = Number(d.Profit) || 0;

    const k = key(category, segment);
    const existing = grouped.get(k);

    if (existing) {
      existing.sales += sales;
      existing.profit += profit;
    } else {
      grouped.set(k, { sales, profit });
    }
  });

  return Array.from(grouped.entries()).map(([k, values]) => {
    const [category, customerSegment] = k.split('|');
    return {
      category,
      customerSegment,
      sales: values.sales,
      profit: values.profit,
    };
  });
}

export function processSalesByRegionData(
  data: OrderData[],
  filters: FilterState
): SalesByRegionData[] {
  let filtered = data;

  // Apply segment filter
  if (filters.selectedSegment) {
    filtered = filtered.filter(d => d['Customer Segment'] === filters.selectedSegment);
  }

  // Group by Country / Region and sum Sales and Profit
  const grouped = new Map<string, { sales: number; profit: number }>();

  filtered.forEach(d => {
    const country = d['Country / Region'];
    const sales = Number(d.Sales) || 0;
    const profit = Number(d.Profit) || 0;

    const existing = grouped.get(country);

    if (existing) {
      existing.sales += sales;
      existing.profit += profit;
    } else {
      grouped.set(country, { sales, profit });
    }
  });

  return Array.from(grouped.entries())
    .map(([country, values]) => ({
      country,
      sales: values.sales,
      profit: values.profit,
    }))
    .sort((a, b) => b.sales - a.sales); // Sort descending by sales
}

export function getUniqueRegions(data: OrderData[]): string[] {
  const regions = new Set(data.map(d => d.Region));
  return Array.from(regions).sort();
}

export function getUniqueSegments(data: OrderData[]): string[] {
  const segments = new Set(data.map(d => d['Customer Segment']));
  return Array.from(segments).sort();
}
