import { csvParse } from 'd3-dsv';
import type {
  StockPriceRecord,
  MonthlyAverage,
  MaxPriceInfo,
  DateRange,
} from '../types/stockData';

// Helper function to normalize CSV headers by removing quotes and trimming whitespace
// This ensures that quoted/dirty headers like """date""", "date", etc. are normalized to clean field names
// Examples:
//   """date"""   → "date"
//   "date"       → "date"
//   date         → "date"
//   """open""" , → "open"
// This normalization is required for the Tableau spec field lookups to work correctly
function normalizeHeaderName(header: string): string {
  return header.replace(/^"+|"+$/g, '').replace(/"+/g, '').trim();
}

// Helper function to clean CSV data with BOM, triple-quoted headers, and normalize line endings
// This function ensures that CSV files with dirty/quoted headers can be parsed correctly
// by the d3-dsv csvParse function and that field lookups work as expected
function cleanCsvData(rawText: string): string {
  let cleaned = rawText;

  // Remove UTF-8 BOM if present
  if (cleaned.charCodeAt(0) === 0xFEFF) {
    cleaned = cleaned.slice(1);
  }

  // Normalize line endings to LF
  cleaned = cleaned.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // Normalize headers: strip ALL quotes and extra whitespace from header names
  // This handles the triple-quoted header format: """date""","""open""","""high""","""low""","""close""","""volume"""
  // After normalization: "date","open","high","low","close","volume"
  // The d3-dsv parser will then correctly parse these as field names
  const lines = cleaned.split('\n');
  if (lines.length > 0) {
    // Split header by comma, normalize each field individually, then rejoin
    const headers = lines[0].split(',');
    const normalizedHeaders = headers.map(normalizeHeaderName);
    lines[0] = normalizedHeaders.join(',');
    cleaned = lines.join('\n');
  }

  return cleaned;
}

function formatYearMonth(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

function getFirstDayOfMonth(year: number, month: number): Date {
  return new Date(year, month, 1);
}

export async function loadStockData(): Promise<StockPriceRecord[]> {
  try {
    const response = await fetch('/data/prices-split-adjusted.csv');
    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.statusText}`);
    }
    const rawText = await response.text();
    const cleanedText = cleanCsvData(rawText);

    // Helper to safely extract and normalize field values from parsed CSV data
    // This handles cases where headers might have extra whitespace or inconsistent formatting
    const getFieldValue = (d: { [key: string]: string }, fieldName: string): string | undefined => {
      // Try direct access first (headers are pre-normalized by cleanCsvData)
      if (d[fieldName] !== undefined) {
        return d[fieldName].trim();
      }
      // Fallback: check all keys case-insensitively (in case of casing issues)
      const lowerFieldName = fieldName.toLowerCase();
      for (const key of Object.keys(d)) {
        if (key.toLowerCase().trim() === lowerFieldName) {
          return d[key].trim();
        }
      }
      return undefined;
    };

    const parsedData = csvParse(cleanedText, (d: { [key: string]: string }) => {
      // Access fields using normalized header names (quotes and whitespace removed)
      const dateStr = getFieldValue(d, 'date');
      const symbolVal = getFieldValue(d, 'symbol'); // May be undefined if not present in CSV
      const openVal = getFieldValue(d, 'open');
      const closeVal = getFieldValue(d, 'close');
      const highVal = getFieldValue(d, 'high');
      const lowVal = getFieldValue(d, 'low');
      const volumeVal = getFieldValue(d, 'volume');

      // Validate required fields
      if (!dateStr) {
        console.warn('Missing date field in row:', d);
        return null;
      }

      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        console.warn('Invalid date format:', dateStr);
        return null;
      }

      // Coerce values to numbers, defaulting to 0 for missing/invalid values
      const open = openVal !== undefined && openVal !== '' && !isNaN(Number(openVal)) ? Number(openVal) : 0;
      const close = closeVal !== undefined && closeVal !== '' && !isNaN(Number(closeVal)) ? Number(closeVal) : 0;
      const high = highVal !== undefined && highVal !== '' && !isNaN(Number(highVal)) ? Number(highVal) : 0;
      const low = lowVal !== undefined && lowVal !== '' && !isNaN(Number(lowVal)) ? Number(lowVal) : 0;
      const volume = volumeVal !== undefined && volumeVal !== '' && !isNaN(Number(volumeVal)) ? Number(volumeVal) : 0;

      // Use symbol from CSV if present, otherwise use a default value
      // This is required because the Tableau spec expects a symbol field for highlight interactions
      const symbol = symbolVal && symbolVal !== '' ? symbolVal : 'UNKNOWN';

      // Validate that we have at least some non-zero data
      if (open === 0 && close === 0 && high === 0 && low === 0) {
        console.warn('All zero values for date:', dateStr);
      }

      return {
        symbol,
        date,
        open,
        close,
        high,
        low,
        volume,
      };
    });

    // Filter out null entries and sort by date
    const validData = parsedData
      .filter((d): d is StockPriceRecord => d !== null && !isNaN(d.date.getTime()))
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    if (validData.length === 0) {
      throw new Error('No valid data records found in CSV');
    }

    console.log(`Loaded ${validData.length} valid stock records from ${validData[0].date.toISOString()} to ${validData[validData.length - 1].date.toISOString()}`);
    console.log(`Symbol field: ${validData[0].symbol} (used for Tableau highlight interactions)`);

    return validData;
  } catch (error) {
    console.error('Error loading stock data:', error);
    throw error;
  }
}

export function calculateMonthlyAverages(
  data: StockPriceRecord[],
  filter?: DateRange
): MonthlyAverage[] {
  let filteredData = data;

  if (filter?.start || filter?.end) {
    filteredData = data.filter((d) => {
      if (filter.start && d.date < filter.start) return false;
      if (filter.end && d.date > filter.end) return false;
      return true;
    });
  }

  const monthlyMap = new Map<string, { sumOpen: number; sumClose: number; count: number }>();

  filteredData.forEach((record) => {
    const yearMonth = formatYearMonth(record.date);

    if (!monthlyMap.has(yearMonth)) {
      monthlyMap.set(yearMonth, { sumOpen: 0, sumClose: 0, count: 0 });
    }

    const entry = monthlyMap.get(yearMonth)!;
    entry.sumOpen += record.open;
    entry.sumClose += record.close;
    entry.count += 1;
  });

  const monthlyAverages: MonthlyAverage[] = [];

  monthlyMap.forEach((value, yearMonth) => {
    const [year, month] = yearMonth.split('-').map(Number);
    monthlyAverages.push({
      yearMonth,
      date: getFirstDayOfMonth(year, month - 1),
      averageOpen: value.sumOpen / value.count,
      averageClose: value.sumClose / value.count,
    });
  });

  return monthlyAverages.sort((a, b) => a.date.getTime() - b.date.getTime());
}

export function calculateMaxPrice(
  data: StockPriceRecord[],
  priceField: 'open' | 'close',
  filter?: DateRange
): MaxPriceInfo | null {
  let filteredData = data;

  if (filter?.start || filter?.end) {
    filteredData = data.filter((d) => {
      if (filter.start && d.date < filter.start) return false;
      if (filter.end && d.date > filter.end) return false;
      return true;
    });
  }

  if (filteredData.length === 0) return null;

  let maxRecord = filteredData[0];

  filteredData.forEach((record) => {
    if (record[priceField] > maxRecord[priceField]) {
      maxRecord = record;
    }
  });

  return {
    value: maxRecord[priceField],
    date: maxRecord.date,
  };
}

export function filterDataByRange(
  data: StockPriceRecord[],
  dateRange: DateRange
): StockPriceRecord[] {
  if (!dateRange.start && !dateRange.end) return data;

  return data.filter((d) => {
    if (dateRange.start && d.date < dateRange.start) return false;
    if (dateRange.end && d.date > dateRange.end) return false;
    return true;
  });
}
