import { csvParse } from 'd3-dsv';
import type { DataRow, ProductAggregation, YearSalesAggregation, RegionAggregation } from '../types/data';

const DATA_URL = '/data/2648_dash_dashboard0_png_discount_20dashboard/p2648_TableauTemp_0tumk6m1wd3kt01h4z0ux1dz9kj5.csv';

export async function fetchCSVData(): Promise<DataRow[]> {
  const response = await fetch(DATA_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch data: ${response.statusText}`);
  }

  let csvText = await response.text();

  // Strip UTF-8 BOM if present (prevents column name corruption)
  if (csvText.charCodeAt(0) === 0xFEFF) {
    csvText = csvText.slice(1);
  }

  const rawData = csvParse(csvText);

  // Validate that we parsed data successfully
  if (!rawData || rawData.length === 0) {
    throw new Error('CSV parsing failed: no data rows found');
  }

  // Validate required columns exist
  const firstRow = rawData[0];
  const requiredColumns = ['Category', 'Order Date', 'Sales', 'Profit', 'Region'];
  const missingColumns = requiredColumns.filter(col => !(col in firstRow));

  if (missingColumns.length > 0) {
    throw new Error(`CSV parsing failed: missing required columns: ${missingColumns.join(', ')}`);
  }

  return rawData.map((row, index) => {
    // Validate date parsing
    const orderDateStr = row['Order Date'];
    const orderDate = new Date(orderDateStr);
    if (isNaN(orderDate.getTime())) {
      console.warn(`Invalid Order Date at row ${index + 1}: "${orderDateStr}"`);
    }

    const shipDateStr = row['Ship Date'];
    const shipDate = new Date(shipDateStr);
    if (isNaN(shipDate.getTime())) {
      console.warn(`Invalid Ship Date at row ${index + 1}: "${shipDateStr}"`);
    }

    // Coerce numeric fields and handle empty/invalid values
    const sales = Number(row['Sales']) || 0;
    const profit = Number(row['Profit']) || 0;
    const profitRatio = Number(row['Profit Ratio']) || 0;
    const quantity = Number(row['Quantity']) || 0;
    const discount = Number(row['Discount']) || 0;

    return {
      category: row['Category'] || '',
      city: row['City'] || '',
      country: row['Country'] || '',
      customerName: row['Customer Name'] || '',
      manufacturer: row['Manufacturer'] || '',
      orderDate,
      orderId: row['Order ID'] || '',
      postalCode: Number(row['Postal Code']) || 0,
      productName: row['Product Name'] || '',
      region: row['Region'] || '',
      segment: row['Segment'] || '',
      shipDate,
      shipMode: row['Ship Mode'] || '',
      state: row['State'] || '',
      subCategory: row['Sub-Category'] || '',
      discount,
      numberOfRecords: Number(row['Number of Records']) || 0,
      profit,
      profitRatio,
      quantity,
      sales,
    };
  });
}

export function aggregateByProduct(data: DataRow[]): ProductAggregation[] {
  if (!data || data.length === 0) {
    console.warn('aggregateByProduct: empty data array');
    return [];
  }

  const productMap = new Map<string, ProductAggregation>();

  data.forEach((row) => {
    // Skip rows with invalid product names
    if (!row.productName || row.productName.trim() === '') {
      return;
    }

    const existing = productMap.get(row.productName);
    if (existing) {
      existing.sumSales += row.sales;
      existing.sumProfit += row.profit;
      existing.sumQuantity += row.quantity;
    } else {
      productMap.set(row.productName, {
        productName: row.productName,
        sumSales: row.sales,
        sumProfit: row.profit,
        sumQuantity: row.quantity,
      });
    }
  });

  const result = Array.from(productMap.values());

  // Log aggregation statistics for debugging
  console.log(`aggregateByProduct: ${result.length} unique products from ${data.length} rows`);

  return result;
}

export function aggregateByYear(data: DataRow[]): YearSalesAggregation[] {
  if (!data || data.length === 0) {
    console.warn('aggregateByYear: empty data array');
    return [];
  }

  const yearMap = new Map<number, YearSalesAggregation>();

  data.forEach((row) => {
    // Skip rows with invalid dates
    if (!row.orderDate || isNaN(row.orderDate.getTime())) {
      return;
    }

    const year = row.orderDate.getFullYear();

    // Skip invalid years (e.g., 1970 for epoch dates)
    if (year < 1900 || year > 2100) {
      console.warn(`aggregateByYear: skipping invalid year ${year} from date ${row.orderDate.toISOString()}`);
      return;
    }

    const existing = yearMap.get(year);
    if (existing) {
      existing.sumSales += row.sales;
    } else {
      yearMap.set(year, {
        year,
        sumSales: row.sales,
      });
    }
  });

  const result = Array.from(yearMap.values()).sort((a, b) => a.year - b.year);

  // Log aggregation statistics for debugging
  console.log(`aggregateByYear: ${result.length} years from ${data.length} rows`, result.map(y => `${y.year}: $${y.sumSales.toFixed(2)}`).join(', '));

  return result;
}

export function aggregateByRegion(data: DataRow[]): RegionAggregation[] {
  if (!data || data.length === 0) {
    console.warn('aggregateByRegion: empty data array');
    return [];
  }

  const regionMap = new Map<string, { customers: Set<string>; sumSales: number; sumQuantity: number; sumProfit: number }>();

  data.forEach((row) => {
    // Skip rows with invalid region names
    if (!row.region || row.region.trim() === '') {
      return;
    }

    // Skip rows with invalid customer names
    if (!row.customerName || row.customerName.trim() === '') {
      return;
    }

    const existing = regionMap.get(row.region);
    if (existing) {
      existing.customers.add(row.customerName);
      existing.sumSales += row.sales;
      existing.sumQuantity += row.quantity;
      existing.sumProfit += row.profit;
    } else {
      regionMap.set(row.region, {
        customers: new Set([row.customerName]),
        sumSales: row.sales,
        sumQuantity: row.quantity,
        sumProfit: row.profit,
      });
    }
  });

  const result = Array.from(regionMap.entries()).map(([region, stats]) => ({
    region,
    countCustomers: stats.customers.size,
    sumSales: stats.sumSales,
    sumQuantity: stats.sumQuantity,
    sumProfit: stats.sumProfit,
    profitRatio: stats.sumSales > 0 ? stats.sumProfit / stats.sumSales : 0,
  })).sort((a, b) => a.region.localeCompare(b.region));

  // Log aggregation statistics for debugging
  console.log(`aggregateByRegion: ${result.length} regions from ${data.length} rows`);

  return result;
}
