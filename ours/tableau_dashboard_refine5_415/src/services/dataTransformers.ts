import type { ParsedOrder, TimeSeriesData, YearlyData, ScatterPoint, CustomerOverviewData } from '../types';

/**
 * Aggregate sales data by month for line chart (P121__line)
 */
export function aggregateSalesByMonth(orders: ParsedOrder[]): TimeSeriesData[] {
  const monthMap = new Map<string, TimeSeriesData>();

  orders.forEach((order) => {
    const date = order['Order Date'];
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

    if (!monthMap.has(monthKey)) {
      monthMap.set(monthKey, {
        date: new Date(date.getFullYear(), date.getMonth(), 1),
        sales: 0,
        profit: 0,
        quantity: 0,
      });
    }

    const entry = monthMap.get(monthKey)!;
    entry.sales += Number(order.Sales) || 0;
    entry.profit += Number(order.Profit) || 0;
    entry.quantity += Number(order.Quantity) || 0;
  });

  // Sort by date
  return Array.from(monthMap.values()).sort((a, b) => a.date.getTime() - b.date.getTime());
}

/**
 * Aggregate sales by year for yearly line chart (P1225__total_sales_each_year)
 */
export function aggregateSalesByYear(orders: ParsedOrder[]): YearlyData[] {
  const yearMap = new Map<number, YearlyData>();

  orders.forEach((order) => {
    const year = order['Order Date'].getFullYear();

    if (!yearMap.has(year)) {
      yearMap.set(year, {
        year,
        sales: 0,
        profit: 0,
        quantity: 0,
      });
    }

    const entry = yearMap.get(year)!;
    entry.sales += Number(order.Sales) || 0;
    entry.profit += Number(order.Profit) || 0;
    entry.quantity += Number(order.Quantity) || 0;
  });

  // Sort by year
  return Array.from(yearMap.values()).sort((a, b) => a.year - b.year);
}

/**
 * Aggregate data by product for scatter plot (P121__scatterplot)
 */
export function aggregateByProduct(orders: ParsedOrder[]): ScatterPoint[] {
  const productMap = new Map<string, ScatterPoint>();

  orders.forEach((order) => {
    const productName = order['Product Name'];

    if (!productMap.has(productName)) {
      productMap.set(productName, {
        sales: 0,
        profit: 0,
        quantity: 0,
        productName,
        customerName: order['Customer Name'],
      });
    }

    const entry = productMap.get(productName)!;
    entry.sales += Number(order.Sales) || 0;
    entry.profit += Number(order.Profit) || 0;
    entry.quantity += Number(order.Quantity) || 0;
  });

  return Array.from(productMap.values());
}

/**
 * Aggregate customer overview data by region (P1968__customer_overview)
 */
export function aggregateCustomerOverviewByRegion(orders: ParsedOrder[]): CustomerOverviewData[] {
  const regionMap = new Map<string, CustomerOverviewData>();
  const customerSetMap = new Map<string, Set<string>>();

  orders.forEach((order) => {
    const region = order.Region;

    if (!regionMap.has(region)) {
      regionMap.set(region, {
        region,
        sales: 0,
        quantity: 0,
        profit: 0,
        customerCount: 0,
      });
      customerSetMap.set(region, new Set());
    }

    const entry = regionMap.get(region)!;
    const customerSet = customerSetMap.get(region)!;

    entry.sales += Number(order.Sales) || 0;
    entry.quantity += Number(order.Quantity) || 0;
    entry.profit += Number(order.Profit) || 0;
    customerSet.add(order['Customer ID']);
    entry.customerCount = customerSet.size;
  });

  return Array.from(regionMap.values());
}
