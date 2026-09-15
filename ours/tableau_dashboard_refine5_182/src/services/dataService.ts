import { csvParse } from 'd3';
import type { SuperstoreData, ProductAggregation, RegionAggregation, MonthlySales, YearlySales } from './types';

const DATA_URL = '/data/1968_dash_dashboard0_png_coursera_course_204_week_203_dashboard/p1968_TEMP_1u7hox51ox1io4183hb2v01q3nst.csv';

/**
 * Normalizes CSV headers by removing BOM, extra quotes, and whitespace
 * This ensures deterministic header matching regardless of CSV source formatting
 */
function normalizeHeaderName(header: string): string {
  return header
    .replace(/^\uFEFF/, '') // Remove UTF-8 BOM
    .trim()
    .replace(/^"+|"+$/g, ''); // Remove surrounding quotes
}

/**
 * Safely parses a numeric value, returning NaN if parsing fails
 * This distinguishes between missing values (0) and invalid parses (NaN)
 */
function safeParseNumber(value: string | undefined | null): number {
  if (value === undefined || value === null || value === '') {
    return 0;
  }
  const parsed = Number(String(value).trim());
  return isNaN(parsed) ? 0 : parsed;
}

export async function fetchSuperstoreData(): Promise<SuperstoreData[]> {
  try {
    const response = await fetch(DATA_URL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    let csvText = await response.text();

    // Remove UTF-8 BOM if present at the start of the file
    if (csvText.charCodeAt(0) === 0xFEFF) {
      csvText = csvText.slice(1);
    }

    const rawData = csvParse(csvText);

    // Build a normalized header mapping for robust field lookup
    const normalizedHeaders = new Map<string, string>();
    Object.keys(rawData[0] || {}).forEach(header => {
      const normalized = normalizeHeaderName(header);
      normalizedHeaders.set(normalized, header);
    });

    // Helper to get a field value with fallback to normalized header
    const getField = (row: Record<string, string>, fieldName: string): string => {
      // Try exact match first
      if (row[fieldName] !== undefined) {
        return row[fieldName];
      }
      // Try normalized header
      const normalized = normalizeHeaderName(fieldName);
      const actualHeader = normalizedHeaders.get(normalized);
      if (actualHeader && row[actualHeader] !== undefined) {
        return row[actualHeader];
      }
      // Try with BOM prefix
      const bomField = '\uFEFF' + fieldName;
      if (row[bomField] !== undefined) {
        return row[bomField];
      }
      return '';
    };

    const parsedData = rawData.map((row: Record<string, string>) => {
      const sales = safeParseNumber(getField(row, 'Sales'));
      const quantity = safeParseNumber(getField(row, 'Quantity'));
      const discount = safeParseNumber(getField(row, 'Discount'));
      const profit = safeParseNumber(getField(row, 'Profit'));

      return {
        'Row ID': safeParseNumber(getField(row, 'Row ID')),
        'Order ID': String(getField(row, 'Order ID') || ''),
        'Order Date': String(getField(row, 'Order Date') || ''),
        'Ship Date': String(getField(row, 'Ship Date') || ''),
        'Ship Mode': String(getField(row, 'Ship Mode') || ''),
        'Customer ID': String(getField(row, 'Customer ID') || ''),
        'Customer Name': String(getField(row, 'Customer Name') || ''),
        Segment: String(getField(row, 'Segment') || ''),
        Country: String(getField(row, 'Country') || ''),
        City: String(getField(row, 'City') || ''),
        State: String(getField(row, 'State') || ''),
        'Postal Code': safeParseNumber(getField(row, 'Postal Code')),
        Region: String(getField(row, 'Region') || ''),
        'Product ID': String(getField(row, 'Product ID') || ''),
        Category: String(getField(row, 'Category') || ''),
        'Sub-Category': String(getField(row, 'Sub-Category') || ''),
        'Product Name': String(getField(row, 'Product Name') || ''),
        Sales: sales,
        Quantity: quantity,
        Discount: discount,
        Profit: profit,
      };
    });

    // Validate that we got meaningful data
    if (parsedData.length === 0) {
      throw new Error('No data rows found in CSV after parsing');
    }

    // Check that numeric fields have non-zero values (sample validation)
    const sampleSales = parsedData.reduce((sum, row) => sum + row.Sales, 0);
    if (sampleSales === 0) {
      console.warn('Warning: All Sales values are zero. Data may not have been parsed correctly.');
    }

    return parsedData;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
}

export function aggregateByProduct(data: SuperstoreData[]): ProductAggregation[] {
  const productMap = new Map<string, ProductAggregation>();

  data.forEach((row) => {
    const productName = row['Product Name'];
    const existing = productMap.get(productName);

    if (existing) {
      existing.sales += Number(row.Sales) || 0;
      existing.profit += Number(row.Profit) || 0;
      existing.quantity += Number(row.Quantity) || 0;
    } else {
      productMap.set(productName, {
        productName,
        sales: Number(row.Sales) || 0,
        profit: Number(row.Profit) || 0,
        quantity: Number(row.Quantity) || 0,
      });
    }
  });

  return Array.from(productMap.values());
}

export function aggregateByRegion(data: SuperstoreData[]): RegionAggregation[] {
  const regionMap = new Map<string, {
    totalDiscount: number;
    count: number;
    sumProfit: number;
    sumQuantity: number;
    sumSales: number;
  }>();

  data.forEach((row) => {
    const region = row.Region;
    const existing = regionMap.get(region);

    if (existing) {
      existing.totalDiscount += Number(row.Discount) || 0;
      existing.count += 1;
      existing.sumProfit += Number(row.Profit) || 0;
      existing.sumQuantity += Number(row.Quantity) || 0;
      existing.sumSales += Number(row.Sales) || 0;
    } else {
      regionMap.set(region, {
        totalDiscount: Number(row.Discount) || 0,
        count: 1,
        sumProfit: Number(row.Profit) || 0,
        sumQuantity: Number(row.Quantity) || 0,
        sumSales: Number(row.Sales) || 0,
      });
    }
  });

  return Array.from(regionMap.entries()).map(([region, stats]) => ({
    region,
    avgDiscount: stats.count > 0 ? stats.totalDiscount / stats.count : 0,
    sumProfit: stats.sumProfit,
    sumQuantity: stats.sumQuantity,
    sumSales: stats.sumSales,
    profitRatio: stats.sumSales > 0 ? stats.sumProfit / stats.sumSales : 0,
  }));
}

export function aggregateByMonth(data: SuperstoreData[]): MonthlySales[] {
  const monthMap = new Map<string, MonthlySales>();

  data.forEach((row) => {
    const date = new Date(row['Order Date']);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);

    const existing = monthMap.get(monthKey);
    const sales = Number(row.Sales) || 0;

    if (existing) {
      existing.sales += sales;
    } else {
      monthMap.set(monthKey, {
        month: monthStart,
        sales,
      });
    }
  });

  return Array.from(monthMap.values()).sort((a, b) => a.month.getTime() - b.month.getTime());
}

export function aggregateByYear(data: SuperstoreData[]): YearlySales[] {
  const yearMap = new Map<number, number>();

  data.forEach((row) => {
    const date = new Date(row['Order Date']);
    const year = date.getFullYear();
    const sales = Number(row.Sales) || 0;

    const existing = yearMap.get(year);
    if (existing !== undefined) {
      yearMap.set(year, existing + sales);
    } else {
      yearMap.set(year, sales);
    }
  });

  return Array.from(yearMap.entries())
    .map(([year, sales]) => ({ year, sales }))
    .sort((a, b) => a.year - b.year);
}
