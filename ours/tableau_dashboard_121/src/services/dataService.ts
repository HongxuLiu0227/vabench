import * as d3 from 'd3';
import type { OrderRecord, AggregatedSalesByCategory, AggregatedSalesByDate, AggregatedProductMetrics, AggregatedMarketSales } from '../types';

/**
 * Normalize CSV header by removing BOM, quotes, and extra whitespace
 */
const normalizeHeader = (header: string): string => {
  // Remove BOM character
  let cleaned = header.replace(/^\uFEFF/, '');
  // Remove quotes
  cleaned = cleaned.replace(/^"|"$/g, '');
  // Trim whitespace
  cleaned = cleaned.trim();
  return cleaned;
};

/**
 * Detect and skip preamble rows to find the real CSV header
 * Returns the line number (0-indexed) where the header starts
 */
const findHeaderRow = (lines: string[]): number => {
  const requiredFields = ['Row ID', 'Order ID', 'Order Date', 'Sales', 'Profit', 'Category', 'Sub-Category', 'Market'];

  for (let i = 0; i < Math.min(lines.length, 10); i++) {
    const line = lines[i];
    if (!line || line.trim() === '') continue;

    // Parse potential headers with proper CSV handling (fields may contain commas in quotes)
    let headers: string[];
    try {
      // Use d3.csvParseRows to properly handle quoted fields with commas
      const parsedRow = d3.csvParseRows(line);
      if (parsedRow.length > 0) {
        headers = parsedRow[0].map(h => normalizeHeader(h));
      } else {
        continue;
      }
    } catch {
      // Fallback to simple split if parsing fails
      headers = line.split(',').map(h => normalizeHeader(h));
    }

    // Skip lines that start with preamble text or have too many unnamed columns
    const hasUnnamed = headers.filter(h => h.startsWith('Unnamed') || h === '').length > headers.length * 0.5;
    if (hasUnnamed) {
      continue;
    }

    // Check if this line contains the required fields
    const matchedFields = requiredFields.filter(field =>
      headers.some(h => h === field || h.includes(field))
    );

    // If we match most required fields, this is likely the header
    if (matchedFields.length >= requiredFields.length * 0.7) {
      return i;
    }
  }

  // Default to line 0 if no header found
  return 0;
};

/**
 * Parse CSV with preamble detection and header normalization
 */
const parseCsvWithPreamble = (csvText: string): d3.DSVRowArray => {
  // Find the actual header row
  const lines = csvText.split(/\r?\n/);
  const headerRowIndex = findHeaderRow(lines);

  if (headerRowIndex === 0) {
    // No preamble detected, use standard parsing
    return d3.csvParse(csvText);
  }

  // Extract lines from header row onwards
  const cleanLines = lines.slice(headerRowIndex);
  const cleanCsv = cleanLines.join('\n');

  return d3.csvParse(cleanCsv);
};

export const loadOrdersData = async (): Promise<OrderRecord[]> => {
  try {
    const response = await fetch('/data/Data_to_Clean_Orders.csv');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const csvText = await response.text();

    // Parse date in YYYY-MM-DD HH:MM:SS format (from CSV: "2014-10-02 00:00:00")
    const parseDate = d3.timeParse('%Y-%m-%d %H:%M:%S');

    // Use robust CSV parser with preamble detection
    const parsedData = parseCsvWithPreamble(csvText);

    // Convert to OrderRecord objects
    const orderRecords: OrderRecord[] = parsedData.map((d: any) => {
      const orderDate = parseDate(d["Order Date"]);
      const shipDate = parseDate(d["Ship Date"]);

      return {
        "Row ID": Number(d["Row ID"]) || 0,
        "Order ID": d["Order ID"] || '',
        "Order Date": orderDate || new Date(),
        "Ship Date": shipDate || new Date(),
        "Ship Mode": d["Ship Mode"] || '',
        "Customer ID": d["Customer ID"] || '',
        "Customer Name": d["Customer Name"] || '',
        "Segment": d["Segment"] || '',
        "City, State": d["City, State"] || '',
        "Country": d["Country"] || '',
        "Postal Code": d["Postal Code"] || '',
        "Market": d["Market"] || '',
        "Region": d["Region"] || '',
        "Product ID": d["Product ID"] || '',
        "Category": d["Category"] || '',
        "Sub-Category": d["Sub-Category"] || '',
        "Product Name": d["Product Name"] || '',
        "Sales": Number(d["Sales"]) || 0,
        "Quantity": Number(d["Quantity"]) || 0,
        "Discount": Number(d["Discount"]) || 0,
        "Profit": Number(d["Profit"]) || 0,
        "Shipping Cost": Number(d["Shipping Cost"]) || 0,
        "Order Priority": d["Order Priority"] || ''
      };
    });

    // Filter out invalid data
    return orderRecords.filter(d =>
      d["Row ID"] > 0 &&
      d["Order ID"] !== '' &&
      !isNaN(d["Sales"]) &&
      !isNaN(d["Profit"])
    );
  } catch (error) {
    console.error('Error loading orders data:', error);
    throw error;
  }
};

export const aggregateByCategoryAndSubCategory = (
  data: OrderRecord[]
): AggregatedSalesByCategory[] => {
  const grouped = d3.rollup(
    data,
    v => d3.sum(v, d => d.Sales),
    d => d.Category,
    d => d["Sub-Category"]
  );

  const result: AggregatedSalesByCategory[] = [];
  grouped.forEach((subCategories, category) => {
    subCategories.forEach((sales, subCategory) => {
      result.push({
        category,
        subCategory,
        sales: sales || 0
      });
    });
  });

  // Sort by sales descending
  return result.sort((a, b) => b.sales - a.sales);
};

export const aggregateByDate = (data: OrderRecord[]): AggregatedSalesByDate[] => {
  const grouped = d3.rollup(
    data,
    v => d3.sum(v, d => d.Sales),
    d => {
      // Truncate to month
      const date = new Date(d["Order Date"]);
      return new Date(date.getFullYear(), date.getMonth(), 1);
    }
  );

  const result: AggregatedSalesByDate[] = [];
  grouped.forEach((sales, date) => {
    result.push({
      date,
      sales: sales || 0
    });
  });

  // Sort by date ascending
  return result.sort((a, b) => a.date.getTime() - b.date.getTime());
};

export const aggregateByProduct = (data: OrderRecord[]): AggregatedProductMetrics[] => {
  const grouped = d3.rollup(
    data,
    v => ({
      sales: d3.sum(v, d => d.Sales),
      profit: d3.sum(v, d => d.Profit),
      quantity: d3.sum(v, d => d.Quantity)
    }),
    d => d["Product Name"]
  );

  const result: AggregatedProductMetrics[] = [];
  grouped.forEach((metrics, productName) => {
    result.push({
      productName,
      sales: metrics.sales || 0,
      profit: metrics.profit || 0,
      quantity: metrics.quantity || 0
    });
  });

  return result;
};

export const aggregateByMarketAndSubCategory = (
  data: OrderRecord[]
): AggregatedMarketSales[] => {
  const grouped = d3.rollup(
    data,
    v => d3.sum(v, d => d.Sales),
    d => d.Market,
    d => d["Sub-Category"]
  );

  const result: AggregatedMarketSales[] = [];
  grouped.forEach((subCategories, market) => {
    subCategories.forEach((sales, subCategory) => {
      result.push({
        market,
        subCategory,
        sales: sales || 0
      });
    });
  });

  return result;
};

export const filterData = (
  data: OrderRecord[],
  category: string | null,
  subCategory: string | null
): OrderRecord[] => {
  return data.filter(d => {
    if (subCategory && d["Sub-Category"] !== subCategory) {
      return false;
    }
    if (category && !subCategory && d.Category !== category) {
      return false;
    }
    return true;
  });
};
