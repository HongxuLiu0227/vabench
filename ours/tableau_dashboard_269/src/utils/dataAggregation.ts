import type { ParsedOrderRecord } from '../services/dataLoader';
import type { DashboardFilters, AggregatedData } from '../types';

export function applyFilters(data: ParsedOrderRecord[], filters: DashboardFilters): ParsedOrderRecord[] {
  return data.filter(row => {
    if (filters.orderDateYear && row['Order Year'] !== filters.orderDateYear) return false;
    if (filters.category && row.Category !== filters.category) return false;
    if (filters.region && row.Region !== filters.region) return false;
    if (filters.state && row.State !== filters.state) return false;
    if (filters.subCategory && row['Sub-Category'] !== filters.subCategory) return false;
    return true;
  });
}

export function aggregateByRegion(data: ParsedOrderRecord[]): AggregatedData[] {
  const grouped = new Map<string, AggregatedData>();

  data.forEach(row => {
    const key = row.Region;
    if (!grouped.has(key)) {
      grouped.set(key, {
        region: key,
        sales: 0,
        profit: 0,
        quantity: 0,
        count: 0,
      });
    }
    const aggregated = grouped.get(key)!;
    aggregated.sales += Number(row.Sales) || 0;
    aggregated.profit += Number(row.Profit) || 0;
    aggregated.quantity += Number(row.Quantity) || 0;
    aggregated.count += 1;
  });

  return Array.from(grouped.values()).sort((a, b) => b.sales - a.sales);
}

export function aggregateByState(data: ParsedOrderRecord[]): AggregatedData[] {
  const grouped = new Map<string, AggregatedData>();

  data.forEach(row => {
    const key = row.State;
    if (!grouped.has(key)) {
      grouped.set(key, {
        state: key,
        sales: 0,
        profit: 0,
        quantity: 0,
        count: 0,
      });
    }
    const aggregated = grouped.get(key)!;
    aggregated.sales += Number(row.Sales) || 0;
    aggregated.profit += Number(row.Profit) || 0;
    aggregated.quantity += Number(row.Quantity) || 0;
    aggregated.count += 1;
  });

  return Array.from(grouped.values()).sort((a, b) => b.sales - a.sales);
}

export function aggregateByCategory(data: ParsedOrderRecord[]): AggregatedData[] {
  const grouped = new Map<string, AggregatedData>();

  data.forEach(row => {
    const key = row.Category;
    if (!grouped.has(key)) {
      grouped.set(key, {
        category: key,
        sales: 0,
        profit: 0,
        quantity: 0,
        count: 0,
      });
    }
    const aggregated = grouped.get(key)!;
    aggregated.sales += Number(row.Sales) || 0;
    aggregated.profit += Number(row.Profit) || 0;
    aggregated.quantity += Number(row.Quantity) || 0;
    aggregated.count += 1;
  });

  return Array.from(grouped.values()).sort((a, b) => b.sales - a.sales);
}

export function aggregateBySubcategory(data: ParsedOrderRecord[]): AggregatedData[] {
  const grouped = new Map<string, AggregatedData>();

  data.forEach(row => {
    const key = `${row.Category}|${row['Sub-Category']}`;
    if (!grouped.has(key)) {
      grouped.set(key, {
        category: row.Category,
        subCategory: row['Sub-Category'],
        sales: 0,
        profit: 0,
        quantity: 0,
        count: 0,
      });
    }
    const aggregated = grouped.get(key)!;
    aggregated.sales += Number(row.Sales) || 0;
    aggregated.profit += Number(row.Profit) || 0;
    aggregated.quantity += Number(row.Quantity) || 0;
    aggregated.count += 1;
  });

  return Array.from(grouped.values()).sort((a, b) => b.sales - a.sales);
}

export function aggregateByProduct(data: ParsedOrderRecord[]): AggregatedData[] {
  const grouped = new Map<string, AggregatedData>();

  data.forEach(row => {
    const key = row['Product Name'];
    if (!grouped.has(key)) {
      grouped.set(key, {
        productName: key,
        sales: 0,
        profit: 0,
        quantity: 0,
        count: 0,
      });
    }
    const aggregated = grouped.get(key)!;
    aggregated.sales += Number(row.Sales) || 0;
    aggregated.profit += Number(row.Profit) || 0;
    aggregated.quantity += Number(row.Quantity) || 0;
    aggregated.count += 1;
  });

  return Array.from(grouped.values()).sort((a, b) => b.profit - a.profit);
}

export function aggregateByCustomer(data: ParsedOrderRecord[]): AggregatedData[] {
  const grouped = new Map<string, AggregatedData>();

  data.forEach(row => {
    const key = `${row.City}|${row['Customer Name']}`;
    if (!grouped.has(key)) {
      grouped.set(key, {
        customerName: row['Customer Name'],
        city: row.City,
        sales: 0,
        profit: 0,
        quantity: 0,
        count: 0,
      });
    }
    const aggregated = grouped.get(key)!;
    aggregated.sales += Number(row.Sales) || 0;
    aggregated.profit += Number(row.Profit) || 0;
    aggregated.quantity += Number(row.Quantity) || 0;
    aggregated.count += 1;
  });

  return Array.from(grouped.values())
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 10);
}

export function getCategoricalValues(data: ParsedOrderRecord[], field: keyof ParsedOrderRecord): string[] {
  const unique = new Set(data.map(row => String(row[field])));
  return Array.from(unique).sort();
}

export function getYearValues(data: ParsedOrderRecord[]): number[] {
  const unique = new Set(data.map(row => row['Order Year']));
  return Array.from(unique).sort((a, b) => a - b);
}
