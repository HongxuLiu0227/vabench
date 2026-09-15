import type { ParsedSalesData, YearlySales, YearlyProfit, SubCategorySales, SubCategoryProfit } from '../types/data';

/**
 * Aggregate data by year and sum Sales
 */
export function aggregateYearlySales(data: ParsedSalesData[], filterYear: number | null = null): YearlySales[] {
  let filteredData = data;
  if (filterYear !== null) {
    filteredData = data.filter((d) => d.Year === filterYear);
  }

  const aggregated = new Map<number, number>();

  filteredData.forEach((row) => {
    const current = aggregated.get(row.Year) || 0;
    aggregated.set(row.Year, current + row.Sales);
  });

  return Array.from(aggregated.entries())
    .map(([year, sales]) => ({ year, sales }))
    .sort((a, b) => a.year - b.year);
}

/**
 * Aggregate data by year and sum Profit
 */
export function aggregateYearlyProfit(data: ParsedSalesData[], filterYear: number | null = null): YearlyProfit[] {
  let filteredData = data;
  if (filterYear !== null) {
    filteredData = data.filter((d) => d.Year === filterYear);
  }

  const aggregated = new Map<number, number>();

  filteredData.forEach((row) => {
    const current = aggregated.get(row.Year) || 0;
    aggregated.set(row.Year, current + row.Profit);
  });

  return Array.from(aggregated.entries())
    .map(([year, profit]) => ({ year, profit }))
    .sort((a, b) => a.year - b.year);
}

/**
 * Aggregate data by Sub-Category and sum Sales
 * Returns data sorted by the specified order
 */
export function aggregateSubCategorySales(
  data: ParsedSalesData[],
  filterYear: number | null = null,
  sortOrder: string[] = []
): SubCategorySales[] {
  let filteredData = data;
  if (filterYear !== null) {
    filteredData = data.filter((d) => d.Year === filterYear);
  }

  const aggregated = new Map<string, number>();

  filteredData.forEach((row) => {
    const current = aggregated.get(row['Sub-Category']) || 0;
    aggregated.set(row['Sub-Category'], current + row.Sales);
  });

  const result = Array.from(aggregated.entries()).map(([subCategory, sales]) => ({
    subCategory,
    sales,
  }));

  // Sort by specified order if provided, otherwise by sales descending
  if (sortOrder.length > 0) {
    const orderMap = new Map(sortOrder.map((cat, index) => [cat, index]));
    result.sort((a, b) => {
      const aIndex = orderMap.get(a.subCategory) ?? sortOrder.length;
      const bIndex = orderMap.get(b.subCategory) ?? sortOrder.length;
      return aIndex - bIndex;
    });
  } else {
    result.sort((a, b) => b.sales - a.sales);
  }

  return result;
}

/**
 * Aggregate data by Sub-Category and sum Profit
 * Returns data sorted by the specified order
 */
export function aggregateSubCategoryProfit(
  data: ParsedSalesData[],
  filterYear: number | null = null,
  sortOrder: string[] = []
): SubCategoryProfit[] {
  let filteredData = data;
  if (filterYear !== null) {
    filteredData = data.filter((d) => d.Year === filterYear);
  }

  const aggregated = new Map<string, number>();

  filteredData.forEach((row) => {
    const current = aggregated.get(row['Sub-Category']) || 0;
    aggregated.set(row['Sub-Category'], current + row.Profit);
  });

  const result = Array.from(aggregated.entries()).map(([subCategory, profit]) => ({
    subCategory,
    profit,
  }));

  // Sort by specified order if provided, otherwise by profit descending
  if (sortOrder.length > 0) {
    const orderMap = new Map(sortOrder.map((cat, index) => [cat, index]));
    result.sort((a, b) => {
      const aIndex = orderMap.get(a.subCategory) ?? sortOrder.length;
      const bIndex = orderMap.get(b.subCategory) ?? sortOrder.length;
      return aIndex - bIndex;
    });
  } else {
    result.sort((a, b) => b.profit - a.profit);
  }

  return result;
}
