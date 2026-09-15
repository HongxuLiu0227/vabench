import type { ParsedOrder, ProductSalesData, CategorySalesData, YearlySalesData, CustomerOverviewData } from '../types';

/**
 * Aggregate data by product for scatterplot
 * Groups by Product Name and sums Sales, Profit, and Quantity
 */
export function aggregateByProduct(orders: ParsedOrder[]): ProductSalesData[] {
  const productMap = new Map<string, ProductSalesData>();

  orders.forEach(order => {
    const key = order['Product Name'];
    if (!productMap.has(key)) {
      productMap.set(key, {
        productName: key,
        sales: 0,
        profit: 0,
        quantity: 0
      });
    }
    const data = productMap.get(key)!;
    data.sales += Number(order.Sales) || 0;
    data.profit += Number(order.Profit) || 0;
    data.quantity += Number(order.Quantity) || 0;
  });

  return Array.from(productMap.values());
}

/**
 * Aggregate data by Category and Sub-Category for horizontal bar chart
 * Groups by Category/Sub-Category hierarchy and sums Sales
 */
export function aggregateByCategory(orders: ParsedOrder[]): CategorySalesData[] {
  const categoryMap = new Map<string, CategorySalesData>();

  orders.forEach(order => {
    const category = order.Category;
    const subCategory = order['Sub-Category'];
    const key = `${category}|${subCategory}`;

    if (!categoryMap.has(key)) {
      categoryMap.set(key, {
        category,
        subCategory,
        sales: 0
      });
    }
    const data = categoryMap.get(key)!;
    data.sales += Number(order.Sales) || 0;
  });

  return Array.from(categoryMap.values()).sort((a, b) => b.sales - a.sales);
}

/**
 * Aggregate sales by year for line chart
 */
export function aggregateByYear(orders: ParsedOrder[]): YearlySalesData[] {
  const yearMap = new Map<number, number>();

  orders.forEach(order => {
    const year = order.OrderYear;
    const sales = Number(order.Sales) || 0;
    yearMap.set(year, (yearMap.get(year) || 0) + sales);
  });

  const data = Array.from(yearMap.entries())
    .map(([year, sales]) => ({ year, sales }))
    .sort((a, b) => a.year - b.year);

  return data;
}

/**
 * Aggregate customer overview data by Region
 * Includes Sales, Quantity, Profit, and Profit Ratio
 */
export function aggregateCustomerOverview(orders: ParsedOrder[]): CustomerOverviewData[] {
  const regionMap = new Map<string, CustomerOverviewData>();

  orders.forEach(order => {
    const region = order.Region;
    if (!regionMap.has(region)) {
      regionMap.set(region, {
        region,
        sales: 0,
        quantity: 0,
        profit: 0,
        profitRatio: 0
      });
    }
    const data = regionMap.get(region)!;
    data.sales += Number(order.Sales) || 0;
    data.quantity += Number(order.Quantity) || 0;
    data.profit += Number(order.Profit) || 0;
  });

  // Calculate profit ratio for each region
  Array.from(regionMap.values()).forEach(data => {
    data.profitRatio = data.sales > 0 ? (data.profit / data.sales) : 0;
  });

  return Array.from(regionMap.values());
}
