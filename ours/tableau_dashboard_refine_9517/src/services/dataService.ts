import * as d3Dsv from 'd3-dsv';
import type {
  SuperstoreOrder,
  ParsedOrder,
  CustomerSales,
  CitySales,
  SubCategorySales,
  CustomerProfitData,
  MapDataPoint,
  FilterState,
} from '../types';

/**
 * Normalize CSV header names by removing BOM, extra quotes, and whitespace
 * This ensures consistent field lookup even with dirty CSV sources
 */
function normalizeHeaderName(value: string): string {
  if (!value) return '';

  // Remove BOM (Byte Order Mark)
  let text = value.replace('\ufeff', '');

  // Strip outer quotes if present (repeatedly for cases like """Order Date""")
  while (text.length >= 2 && text[0] === text[text.length - 1] && text[0] in { '"': 1, "'": 1 }) {
    text = text.slice(1, -1);
  }

  // Normalize whitespace
  text = text.replace(/\s+/g, ' ').trim();

  return text;
}

/**
 * Load and parse the Superstore Orders CSV data
 */
export async function loadSuperstoreData(): Promise<ParsedOrder[]> {
  const response = await fetch('/data/Sample - Superstore_Orders.csv');

  if (!response.ok) {
    throw new Error(`Failed to fetch data: ${response.status}`);
  }

  const csvText = await response.text();

  // Parse with d3-dsv (handles BOM automatically)
  const rawData = d3Dsv.csvParse(csvText) as unknown as SuperstoreOrder[];

  // Normalize column names in the data to ensure clean field access
  return rawData.map((row) => {
    const normalizedRow: Record<string, string | number> = {};

    // Copy all fields, normalizing keys
    for (const key of Object.keys(row)) {
      const normalizedKey = normalizeHeaderName(key);
      normalizedRow[normalizedKey] = (row as unknown as Record<string, string | number>)[key];
    }

    // Type conversions for numeric and date fields
    return {
      ...normalizedRow,
      'Row ID': Number(normalizedRow['Row ID']),
      'Order ID': String(normalizedRow['Order ID']),
      'Ship Mode': String(normalizedRow['Ship Mode']),
      'Customer ID': String(normalizedRow['Customer ID']),
      'Customer Name': String(normalizedRow['Customer Name']),
      'Segment': String(normalizedRow['Segment']),
      'Country': String(normalizedRow['Country']),
      'City': String(normalizedRow['City']),
      'State': String(normalizedRow['State']),
      'Postal Code': Number(normalizedRow['Postal Code']),
      'Region': String(normalizedRow['Region']),
      'Product ID': String(normalizedRow['Product ID']),
      'Category': String(normalizedRow['Category']),
      'Sub-Category': String(normalizedRow['Sub-Category']),
      'Product Name': String(normalizedRow['Product Name']),
      'Sales': Number(normalizedRow['Sales']),
      'Quantity': Number(normalizedRow['Quantity']),
      'Discount': Number(normalizedRow['Discount']),
      'Profit': Number(normalizedRow['Profit']),
      'Order Date': new Date(String(normalizedRow['Order Date'])),
      'Ship Date': new Date(String(normalizedRow['Ship Date'])),
    } as ParsedOrder;
  });
}

/**
 * Filter data based on filter state
 */
export function filterData(data: ParsedOrder[], filters: FilterState): ParsedOrder[] {
  return data.filter((row) => {
    if (filters.category && row['Category'] !== filters.category) return false;
    if (filters.subCategory && row['Sub-Category'] !== filters.subCategory) return false;
    if (filters.cityName && row['City'] !== filters.cityName) return false;
    if (filters.state && row['State'] !== filters.state) return false;
    if (filters.customerName && row['Customer Name'] !== filters.customerName) return false;
    if (filters.productName && row['Product Name'] !== filters.productName) return false;
    if (filters.region && row['Region'] !== filters.region) return false;
    return true;
  });
}

/**
 * Aggregate sales by customer (for Top/Bottom N)
 */
export function aggregateByCustomer(
  data: ParsedOrder[],
  sort: 'asc' | 'desc' = 'desc'
): CustomerSales[] {
  const aggregation = new Map<string, CustomerSales>();

  data.forEach((row) => {
    const customerName = row['Customer Name'];
    const existing = aggregation.get(customerName);

    if (existing) {
      existing.sales += Number(row['Sales']);
      existing.profit += Number(row['Profit']);
    } else {
      aggregation.set(customerName, {
        customerName,
        sales: Number(row['Sales']),
        profit: Number(row['Profit']),
      });
    }
  });

  const result = Array.from(aggregation.values());
  result.sort((a, b) => (sort === 'desc' ? b.sales - a.sales : a.sales - b.sales));

  return result;
}

/**
 * Aggregate sales by city
 */
export function aggregateByCity(data: ParsedOrder[]): CitySales[] {
  const aggregation = new Map<string, CitySales>();

  data.forEach((row) => {
    const city = row['City'];
    const key = `${city}-${row['State']}`;
    const existing = aggregation.get(key);

    if (existing) {
      existing.sales += Number(row['Sales']);
    } else {
      aggregation.set(key, {
        city,
        state: row['State'],
        sales: Number(row['Sales']),
      });
    }
  });

  const result = Array.from(aggregation.values());
  result.sort((a, b) => b.sales - a.sales);

  return result;
}

/**
 * Aggregate sales by sub-category
 */
export function aggregateBySubCategory(data: ParsedOrder[]): SubCategorySales[] {
  const aggregation = new Map<string, SubCategorySales>();

  data.forEach((row) => {
    const subCategory = row['Sub-Category'];
    const existing = aggregation.get(subCategory);

    if (existing) {
      existing.sales += Number(row['Sales']);
    } else {
      aggregation.set(subCategory, {
        subCategory,
        category: row['Category'],
        sales: Number(row['Sales']),
      });
    }
  });

  const result = Array.from(aggregation.values());
  result.sort((a, b) => b.sales - a.sales);

  return result;
}

/**
 * Aggregate customer sales and profits for scatter plot
 */
export function aggregateCustomerProfits(data: ParsedOrder[]): CustomerProfitData[] {
  const aggregation = new Map<string, CustomerProfitData>();

  data.forEach((row) => {
    const customerName = row['Customer Name'];
    const existing = aggregation.get(customerName);

    if (existing) {
      existing.sales += Number(row['Sales']);
      existing.profit += Number(row['Profit']);
      existing.quantity += Number(row['Quantity']);
    } else {
      aggregation.set(customerName, {
        customerName,
        sales: Number(row['Sales']),
        profit: Number(row['Profit']),
        quantity: Number(row['Quantity']),
      });
    }
  });

  return Array.from(aggregation.values());
}

/**
 * Aggregate data by city for map visualization
 * Note: Using approximate coordinates for major US cities
 */
export function aggregateForMap(data: ParsedOrder[]): MapDataPoint[] {
  // Approximate coordinates for some major US cities
  // In production, you would use a proper geocoding service
  const majorCities: Record<string, { lat: number; lng: number }> = {
    'New York City': { lat: 40.7128, lng: -74.006 },
    'Los Angeles': { lat: 34.0522, lng: -118.2437 },
    'Chicago': { lat: 41.8781, lng: -87.6298 },
    'Houston': { lat: 29.7604, lng: -95.3698 },
    'Philadelphia': { lat: 39.9526, lng: -75.1652 },
    'Phoenix': { lat: 33.4484, lng: -112.074 },
    'San Antonio': { lat: 29.4241, lng: -98.4936 },
    'San Diego': { lat: 32.7157, lng: -117.1611 },
    'Dallas': { lat: 32.7767, lng: -96.797 },
    'San Jose': { lat: 37.3382, lng: -121.8863 },
    'Seattle': { lat: 47.6062, lng: -122.3321 },
    'San Francisco': { lat: 37.7749, lng: -122.4194 },
    'Jacksonville': { lat: 30.3322, lng: -81.6557 },
    'Columbus': { lat: 39.9612, lng: -82.9988 },
    'Austin': { lat: 30.2672, lng: -97.7431 },
  };

  const aggregation = new Map<string, MapDataPoint>();

  data.forEach((row) => {
    const city = row['City'];
    const key = `${city}-${row['State']}`;
    const existing = aggregation.get(key);

    if (existing) {
      existing.sales += Number(row['Sales']);
    } else {
      const coords = majorCities[city] || {
        lat: 39.8283 + (Math.random() - 0.5) * 20,
        lng: -98.5795 + (Math.random() - 0.5) * 30,
      };

      aggregation.set(key, {
        city,
        state: row['State'],
        sales: Number(row['Sales']),
        latitude: coords.lat,
        longitude: coords.lng,
      });
    }
  });

  return Array.from(aggregation.values());
}

/**
 * Get unique values for a field
 */
export function getUniqueValues(data: ParsedOrder[], field: keyof ParsedOrder): string[] {
  const values = new Set(data.map((row) => String(row[field])));
  return Array.from(values).sort();
}
