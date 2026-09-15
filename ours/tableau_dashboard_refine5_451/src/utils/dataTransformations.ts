import type { ParsedRecord, AggregatedBySubCategory, AggregatedByProduct, AggregatedByMonth, AggregatedByYear } from '../types';
import { timeMonth } from 'd3-time';

export const aggregateBySubCategory = (data: ParsedRecord[]): AggregatedBySubCategory[] => {
  const aggregation = new Map<string, number>();

  data.forEach(d => {
    const subCategory = d["Sub-Category"];
    const sales = aggregation.get(subCategory) || 0;
    aggregation.set(subCategory, sales + d.Sales);
  });

  return Array.from(aggregation.entries())
    .map(([subCategory, Sales]) => ({ "Sub-Category": subCategory, Sales }))
    .sort((a, b) => b.Sales - a.Sales);
};

export const aggregateByProduct = (data: ParsedRecord[]): AggregatedByProduct[] => {
  const aggregation = new Map<string, { Sales: number; Profit: number; Quantity: number }>();

  data.forEach(d => {
    const productName = d["Product Name"];
    const existing = aggregation.get(productName) || { Sales: 0, Profit: 0, Quantity: 0 };
    aggregation.set(productName, {
      Sales: existing.Sales + d.Sales,
      Profit: existing.Profit + d.Profit,
      Quantity: existing.Quantity + d.Quantity
    });
  });

  return Array.from(aggregation.entries()).map(([productName, metrics]) => ({
    "Product Name": productName,
    ...metrics
  }));
};

export const aggregateByMonth = (data: ParsedRecord[]): AggregatedByMonth[] => {
  const aggregation = new Map<Date, number>();

  data.forEach(d => {
    const month = timeMonth.floor(d["Order Date"]);
    const sales = aggregation.get(month) || 0;
    aggregation.set(month, sales + d.Sales);
  });

  return Array.from(aggregation.entries())
    .map(([Month, Sales]) => ({ Month, Sales }))
    .sort((a, b) => a.Month.getTime() - b.Month.getTime());
};

export const aggregateByYear = (data: ParsedRecord[]): AggregatedByYear[] => {
  const aggregation = new Map<number, number>();

  data.forEach(d => {
    // Extract the actual year number from the date
    const year = d["Order Date"].getFullYear();
    const sales = aggregation.get(year) || 0;
    aggregation.set(year, sales + d.Sales);
  });

  return Array.from(aggregation.entries())
    .map(([Year, Sales]) => ({ Year, Sales }))
    .sort((a, b) => a.Year - b.Year);
};

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('en-US').format(value);
};
