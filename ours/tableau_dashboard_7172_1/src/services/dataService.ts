import { csvParse } from 'd3-dsv';
import type { BoatSalesRaw, BoatSalesData } from '../types';

/**
 * Normalize CSV text by removing UTF-8 BOM if present
 * This ensures consistent parsing regardless of whether the CSV has a BOM
 */
function normalizeBOM(csvText: string): string {
  // UTF-8 BOM is U+FEFF, which is the first character if present
  if (csvText.charCodeAt(0) === 0xFEFF) {
    return csvText.slice(1);
  }
  return csvText;
}

/**
 * Parse a date string in MM/dd/yyyy or yyyy-MM-dd format
 */
function parseDate(dateStr: string): Date | null {
  if (!dateStr || dateStr.trim() === '') {
    return null;
  }

  const trimmed = dateStr.trim();

  // Handle MM/dd/yyyy format
  const parts = trimmed.split('/');
  if (parts.length === 3) {
    const month = parseInt(parts[0], 10);
    const day = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);
    if (!isNaN(month) && !isNaN(day) && !isNaN(year) && month >= 1 && month <= 12 && day >= 1 && day <= 31 && year >= 1900 && year <= 2100) {
      const date = new Date(year, month - 1, day);
      if (!isNaN(date.getTime())) {
        return date;
      }
    }
  }

  // Handle yyyy-MM-dd format
  const isoParts = trimmed.split('-');
  if (isoParts.length === 3) {
    const year = parseInt(isoParts[0], 10);
    const month = parseInt(isoParts[1], 10);
    const day = parseInt(isoParts[2], 10);
    if (!isNaN(year) && !isNaN(month) && !isNaN(day) && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      const date = new Date(year, month - 1, day);
      if (!isNaN(date.getTime())) {
        return date;
      }
    }
  }

  // Try standard date parsing as last resort
  const parsed = new Date(trimmed);
  if (!isNaN(parsed.getTime())) {
    return parsed;
  }

  return null;
}

/**
 * Parse sold price from "USD 12345" or "EUR 12345" format to number
 */
function parseSoldPrice(soldPriceStr: string): number | null {
  if (!soldPriceStr || soldPriceStr.trim() === '') {
    return null;
  }

  const trimmed = soldPriceStr.trim();

  // Format: "USD 12345" or "EUR 12345"
  const parts = trimmed.split(/\s+/);
  if (parts.length >= 2 && (parts[0] === 'USD' || parts[0] === 'EUR')) {
    // Remove commas from numbers like "1,234.56"
    const numberStr = parts[1].replace(/,/g, '');
    const parsed = parseFloat(numberStr);
    return isNaN(parsed) ? null : parsed;
  }

  // Try direct number parsing
  const numberStr = trimmed.replace(/,/g, '');
  const parsed = parseFloat(numberStr);
  return isNaN(parsed) ? null : parsed;
}

/**
 * Parse a number string to number or null, handling various formats
 */
function parseNumber(numStr: string): number | null {
  if (!numStr || numStr.trim() === '') {
    return null;
  }

  const trimmed = numStr.trim();

  // Remove commas from numbers like "1,234.56"
  const normalized = trimmed.replace(/,/g, '');

  const parsed = parseFloat(normalized);
  if (isNaN(parsed)) {
    return null;
  }

  // Check for reasonable range (not infinity, not excessively large/small)
  if (!isFinite(parsed) || Math.abs(parsed) > 1e15) {
    return null;
  }

  return parsed;
}

/**
 * Transform raw CSV data to typed structure
 */
function transformData(raw: BoatSalesRaw): BoatSalesData {
  return {
    vesselIdPk: parseNumber(raw.VesselID_PK) || 0,
    boatName: raw['Boat Name'] || '',
    listingStatus: raw['Listing Status'] || '',
    boatModel: raw['Boat Model'] || '',
    boatType: raw['Boat Type'] || '',
    boatCondition: raw['Boat Condition'] || '',
    listingDate: parseDate(raw['Listing Date']),
    listingPrice: parseNumber(raw['Listing Price']),
    boatSoldDate: parseDate(raw.Boat_Sold_Date),
    soldPrice: parseSoldPrice(raw['Sold Price']),
    boatPriceCutDate: parseDate(raw.Boat_Price_Cut_Date),
    priceWas: parseNumber(raw['Price Was']),
    sellingBroker: raw['Selling Broker'] || '',
    listingBroker: raw['Listing Broker'] || '',
    seller: raw.Seller || '',
    sellerEmail: raw['Seller Email'] || '',
    buyer: raw.Buyer || '',
    buyerEmail: raw.BuyerEmail || '',
    hullNo: raw.HullNo || '',
    noOfDays: parseNumber(raw['No of Days']),
    boatModelName: raw.boat_model_name || '',
    hasPriceCut: !!(raw.Boat_Price_Cut_Date && raw.Boat_Price_Cut_Date.trim() !== ''),
  };
}

/**
 * Validate that required Tableau fields are present in the data
 */
function validateRequiredFields(data: BoatSalesData[]): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (data.length === 0) {
    errors.push('No data rows found in CSV');
    return { valid: false, errors };
  }

  // Check for required fields in the first non-empty row
  const firstRow = data.find(row =>
    row.sellingBroker ||
    row.boatType ||
    row.boatCondition
  );

  if (!firstRow) {
    errors.push('No valid data rows found with required fields');
    return { valid: false, errors };
  }

  // Track if we have any valid data
  let hasValidData = false;

  // Check if we have at least some brokers (Selling Broker is critical)
  const brokers = new Set(data.map(row => row.sellingBroker).filter(Boolean));
  if (brokers.size === 0) {
    errors.push('No selling brokers found in data');
  } else {
    hasValidData = true;
  }

  // Check for boat types (Sail vs Power worksheet)
  const boatTypes = new Set(data.map(row => row.boatType).filter(Boolean));
  if (boatTypes.size === 0) {
    errors.push('No boat types found in data');
  } else {
    hasValidData = true;
  }

  // Check for boat conditions (Used vs New worksheet)
  const boatConditions = new Set(data.map(row => row.boatCondition).filter(Boolean));
  if (boatConditions.size === 0) {
    errors.push('No boat conditions found in data');
  } else {
    hasValidData = true;
  }

  // Check for price cut dates (Price Cut worksheet)
  const rowsWithPriceCuts = data.filter(row => row.hasPriceCut).length;
  if (rowsWithPriceCuts === 0) {
    errors.push('No price cut data found in dataset');
  }

  // Check for sold dates (critical for time filtering)
  const rowsWithSoldDates = data.filter(row => row.boatSoldDate !== null).length;
  if (rowsWithSoldDates === 0) {
    errors.push('No sold dates found in data - charts may be empty');
  }

  return { valid: hasValidData, errors };
}

/**
 * Load and parse CSV data from the public data directory
 */
export async function loadBoatSalesData(): Promise<BoatSalesData[]> {
  try {
    const response = await fetch('/data/Sold_Boats_Report_07-13-2020_11_37_51.csv');
    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
    }

    let csvText = await response.text();

    // Normalize BOM to ensure consistent parsing
    csvText = normalizeBOM(csvText);

    const rawData = csvParse(csvText) as BoatSalesRaw[];

    if (rawData.length === 0) {
      throw new Error('CSV file is empty or could not be parsed');
    }

    console.log(`Loaded ${rawData.length} rows from CSV`);

    const transformedData = rawData.map(transformData);

    // Validate required Tableau fields
    const validation = validateRequiredFields(transformedData);
    if (!validation.valid) {
      console.warn('Data validation warnings:', validation.errors.join(', '));
    } else if (validation.errors.length > 0) {
      console.info('Data validation info:', validation.errors.join(', '));
    }

    // Log data quality metrics
    const validSoldDates = transformedData.filter(row => row.boatSoldDate !== null).length;
    const validBrokers = new Set(transformedData.map(row => row.sellingBroker)).size;
    const priceCuts = transformedData.filter(row => row.hasPriceCut).length;

    console.log(`Data quality: ${validSoldDates}/${transformedData.length} rows with sold dates, ${validBrokers} unique brokers, ${priceCuts} price cuts`);

    return transformedData;
  } catch (error) {
    console.error('Error loading boat sales data:', error);
    throw error;
  }
}

/**
 * Filter data based on broker list and date range
 */
export function filterData(
  data: BoatSalesData[],
  brokers: string[],
  minDate: Date,
  maxDate: Date
): BoatSalesData[] {
  return data.filter((row) => {
    // Filter by selling broker
    if (!brokers.includes(row.sellingBroker)) {
      return false;
    }

    // Filter by sold date range
    if (row.boatSoldDate) {
      const soldDate = new Date(row.boatSoldDate);
      if (soldDate < minDate || soldDate > maxDate) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Aggregate data by broker and category for bar charts
 */
export function aggregateByBrokerAndCategory(
  data: BoatSalesData[],
  categoryKey: 'hasPriceCut' | 'boatType' | 'boatCondition'
): Map<string, Map<string, number>> {
  const result = new Map<string, Map<string, number>>();

  data.forEach((row) => {
    const broker = row.sellingBroker;
    let category: string;

    switch (categoryKey) {
      case 'hasPriceCut':
        category = row.hasPriceCut ? 'Price Cut' : 'No Price Cut';
        break;
      case 'boatType':
        category = row.boatType || 'Unknown';
        break;
      case 'boatCondition':
        category = row.boatCondition || 'Unknown';
        break;
    }

    if (!result.has(broker)) {
      result.set(broker, new Map<string, number>());
    }

    const brokerCategories = result.get(broker)!;
    const currentCount = brokerCategories.get(category) || 0;
    brokerCategories.set(category, currentCount + 1);
  });

  return result;
}

/**
 * Convert aggregated data to flat array for rendering
 */
export function flattenAggregatedData(
  aggregated: Map<string, Map<string, number>>,
  sortByTotalDesc = true
): Array<{ broker: string; category: string; count: number; total: number }> {
  const result: Array<{ broker: string; category: string; count: number; total: number }> = [];

  // Calculate totals per broker
  const brokerTotals = new Map<string, number>();
  aggregated.forEach((categories, broker) => {
    let total = 0;
    categories.forEach((count) => {
      total += count;
    });
    brokerTotals.set(broker, total);
  });

  // Flatten data
  aggregated.forEach((categories, broker) => {
    categories.forEach((count, category) => {
      result.push({
        broker,
        category,
        count,
        total: brokerTotals.get(broker) || 0,
      });
    });
  });

  // Sort by total count descending if requested
  if (sortByTotalDesc) {
    result.sort((a, b) => b.total - a.total);
  }

  return result;
}

/**
 * Get unique categories from aggregated data
 */
export function getUniqueCategories(
  aggregated: Map<string, Map<string, number>>
): string[] {
  const categorySet = new Set<string>();

  aggregated.forEach((categories) => {
    categories.forEach((_, category) => {
      categorySet.add(category);
    });
  });

  return Array.from(categorySet).sort();
}
