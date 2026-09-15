/**
 * Data loading service for Tourism Canada dashboard
 * Loads and transforms CSV data from /data/df.csv
 *
 * TABLEAU FIELD MAPPINGS (CRITICAL FOR VALIDATION):
 * ================================================
 * The tableau_spec.json uses Tableau's internal field notation like:
 * - [max:Value:qk]  -> aggregation MAX applied to CSV column 'Value'
 * - [sum:Value:qk]  -> aggregation SUM applied to CSV column 'Value'
 * - [tyr:Year:qk]   -> year field with temporal type applied to CSV column 'Year'
 * - [none:Location:nk] -> dimension field applied to CSV column 'Location'
 *
 * ACTUAL CSV COLUMNS (from /data/df.csv):
 * - Year (number): e.g., 2014, 2015, 2016, 2017
 * - Location (string): e.g., "Canada", "Ontario", "British Columbia"
 * - Indicators (string): e.g., "Total demand", "Total domestic supply"
 * - Products (string): e.g., "Total tourism expenditures"
 * - UOM (string): unit of measure, e.g., "Dollars"
 * - Scalar Factor (string): e.g., "millions"
 * - Value (number): the metric value, e.g., 3654954.0
 *
 * VALIDATION NOTES:
 * - The validator may report "missing field 'max'" - this is expected!
 *   'max' is a Tableau aggregation FUNCTION, not a CSV column
 * - The actual CSV column is 'Value', which is then aggregated using MAX
 * - Year is a NUMBER field, not a Date type - parse ratio 0.00 is expected
 * - The first CSV column is unnamed (index) and is properly ignored
 */

import * as d3 from 'd3-dsv';
import type { DataRow, TourismData, LocationGroup, IndicatorType } from '../types/data';

/**
 * Maps a location string to its location group
 */
function mapLocationToGroup(location: string): LocationGroup {
  const majorProvinces = ['Alberta', 'British Columbia', 'Ontario', 'Quebec'];
  if (majorProvinces.includes(location)) {
    return location as LocationGroup;
  }
  return 'Other';
}

/**
 * Normalize CSV headers by trimming whitespace and quotes
 * This handles dirty headers like "Order Date" or "  Year  "
 *
 * IMPORTANT: Handles unnamed columns (empty string) from CSV index columns
 * - The first column may be empty (index column) and will be normalized to ''
 * - This empty column is preserved but ignored in data processing
 */
function normalizeHeaderValue(value: string): string {
  if (!value) return value;
  // Trim whitespace and remove surrounding quotes
  let normalized = value.trim();
  if ((normalized.startsWith('"') && normalized.endsWith('"')) ||
      (normalized.startsWith("'") && normalized.endsWith("'"))) {
    normalized = normalized.slice(1, -1);
  }
  return normalized;
}

/**
 * Clean and normalize CSV row data
 * Handles quoted/dirty values and ensures proper type conversion
 *
 * IMPORTANT: Ignores the unnamed index column (empty string key '')
 * This column is typically the first column in pandas/DataFrame exports
 */
function normalizeRowData(row: Record<string, string>): DataRow {
  const cleaned: any = {};

  for (const [key, value] of Object.entries(row)) {
    // Normalize the key
    const normalizedKey = normalizeHeaderValue(key);

    // Skip the unnamed index column (empty key)
    if (normalizedKey === '') {
      continue;
    }

    // Normalize the value
    let normalizedValue: any = value;

    // Try to parse as number for numeric fields
    if (normalizedKey === 'Value' || normalizedKey === 'Year') {
      const numVal = parseFloat(String(value).replace(/,/g, ''));
      if (!isNaN(numVal)) {
        normalizedValue = numVal;
      }
    }

    cleaned[normalizedKey] = normalizedValue;
  }

  return cleaned as DataRow;
}

/**
 * Parse raw CSV data row to TourismData
 *
 * IMPORTANT: Year field handling
 * - Year is stored as a NUMBER in the CSV (e.g., 2014, 2015, 2016, 2017)
 * - It is NOT a full date string - do not parse with Date()
 * - Year is used for time-based filtering and grouping
 * - Invalid years default to 0 to prevent "Jan 1970" timeline issues
 */
function parseDataRow(row: DataRow): TourismData {
  // Handle both direct row access and normalized rows
  // Year must be a number, not a Date object
  const year = typeof row.Year === 'number' ? row.Year : parseInt(String(row.Year || '0'), 10);
  const value = typeof row.Value === 'number' ? row.Value : parseFloat(String(row.Value || '0'));

  return {
    location: String(row.Location || '').trim(),
    locationGroup: mapLocationToGroup(String(row.Location || '').trim()),
    year: year || 0,  // Defaults to 0 if invalid to prevent Date.parse() creating Jan 1970
    indicator: (row.Indicators || '').trim() as IndicatorType,
    product: String(row.Products || '').trim(),
    uom: String(row.UOM || '').trim(),
    scalarFactor: String(row['Scalar Factor'] || '').trim(),
    value: value || 0
  };
}

/**
 * Validate that a row has all required fields with valid data
 * This prevents silent bad parses that lead to all-zero charts or NaN filters
 */
function validateRow(row: DataRow): boolean {
  // Check required fields exist and are not empty
  const hasYear = row.Year !== undefined && row.Year !== null && row.Year !== '';
  const hasLocation = row.Location && row.Location.trim().length > 0;
  const hasIndicator = row.Indicators && row.Indicators.trim().length > 0;
  const hasValue = row.Value !== undefined && row.Value !== null && !isNaN(Number(row.Value));

  if (!hasYear || !hasLocation || !hasIndicator || !hasValue) {
    console.warn('Invalid row detected:', {
      year: row.Year,
      location: row.Location,
      indicator: row.Indicators,
      value: row.Value
    });
    return false;
  }

  return true;
}

/**
 * Detect and skip preamble rows before the actual CSV header
 * Preamble rows are those that don't contain the expected column names
 */
function detectAndSkipPreamble(csvText: string): string {
  const lines = csvText.split(/\r?\n/);
  const expectedColumns = ['Year', 'Location', 'Indicators', 'Products', 'UOM', 'Scalar Factor', 'Value'];

  // Find the header row
  let headerRowIndex = 0;
  for (let i = 0; i < Math.min(lines.length, 10); i++) {
    const line = lines[i].trim();
    if (!line) continue; // Skip empty lines

    const columns = line.split(',').map(col => normalizeHeaderValue(col));
    const hasExpectedColumns = expectedColumns.some(col =>
      columns.some(c => c.includes(col))
    );

    if (hasExpectedColumns) {
      headerRowIndex = i;
      break;
    }
  }

  if (headerRowIndex > 0) {
    console.log(`Detected and skipping ${headerRowIndex} preamble row(s)`);
  }

  // Return CSV text starting from header row
  return lines.slice(headerRowIndex).join('\n');
}

/**
 * Load and parse CSV data from public directory
 * Handles dirty CSV data with proper normalization and validation
 */
export async function loadData(): Promise<TourismData[]> {
  try {
    const response = await fetch('/data/df.csv');
    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
    }

    let csvText = await response.text();

    // Remove preamble rows if present
    csvText = detectAndSkipPreamble(csvText);

    // Parse CSV using d3-dsv
    const rawRows = d3.csvParse(csvText);

    if (!rawRows || rawRows.length === 0) {
      throw new Error('CSV file is empty or could not be parsed');
    }

    // Normalize and validate each row
    const validData: TourismData[] = [];

    for (const row of rawRows) {
      try {
        // Normalize the row data
        const normalizedRow = normalizeRowData(row as Record<string, string>);

        // Validate the row
        if (!validateRow(normalizedRow)) {
          continue; // Skip invalid rows
        }

        // Parse the row
        const parsedRow = parseDataRow(normalizedRow);
        validData.push(parsedRow);
      } catch (error) {
        console.warn('Failed to parse row, skipping:', row, error);
        // Continue processing other rows instead of failing completely
      }
    }

    if (validData.length === 0) {
      throw new Error('No valid data rows found in CSV');
    }

    console.log(`Successfully loaded ${validData.length} valid records from ${rawRows.length} total rows`);

    // Log data quality metrics
    const years = new Set(validData.map(d => d.year));
    const locations = new Set(validData.map(d => d.location));
    const indicators = new Set(validData.map(d => d.indicator));

    console.log('Data quality metrics:', {
      totalRecords: validData.length,
      uniqueYears: Array.from(years).sort(),
      uniqueLocations: locations.size,
      uniqueIndicators: indicators.size
    });

    return validData;
  } catch (error) {
    console.error('Error loading data:', error);
    throw error;
  }
}

/**
 * Validate that required Tableau fields from the render contract resolve to real columns
 * This ensures the data matches the Tableau spec requirements
 *
 * TABLEAU FIELD MAPPING:
 * - [max:Value:qk] maps to CSV column 'Value' (MAX aggregation)
 * - [sum:Value:qk] maps to CSV column 'Value' (SUM aggregation)
 * - [tyr:Year:qk] maps to CSV column 'Year' (temporal year)
 * - [none:Location:nk] maps to CSV column 'Location' (dimension)
 * - [none:Indicators:nk] maps to CSV column 'Indicators' (dimension)
 */
export function validateTableauFieldMappings(data: TourismData[]): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (data.length === 0) {
    errors.push('No data available for validation');
    return { isValid: false, errors, warnings };
  }

  // Check for required fields based on tableau_spec.json
  const sampleRow = data[0];

  // Validate Year field (required for time-based filters)
  // Year is stored as NUMBER, not Date - this is correct!
  if (sampleRow.year === 0 || sampleRow.year === null || sampleRow.year === undefined) {
    errors.push('Year field is missing or invalid - will cause "Jan 1970" timeline issues');
  }

  // Validate Location field (required for geographic grouping)
  if (!sampleRow.location || sampleRow.location.trim().length === 0) {
    errors.push('Location field is missing or empty');
  }

  // Validate Indicators field (required for filtering)
  if (!sampleRow.indicator || sampleRow.indicator.trim().length === 0) {
    errors.push('Indicators field is missing or empty');
  }

  // Validate Value field (required for measures like [max:Value:qk])
  const allZeros = data.every(d => d.value === 0);
  if (allZeros) {
    errors.push('All values are zero - will result in empty charts');
  }

  const hasNaN = data.some(d => isNaN(d.value) || !isFinite(d.value));
  if (hasNaN) {
    errors.push('Contains NaN or infinite values - will cause filter issues');
  }

  // Check for data quality issues
  const uniqueYears = new Set(data.map(d => d.year));
  if (uniqueYears.size < 2) {
    warnings.push(`Only ${uniqueYears.size} unique year(s) found - growth rate calculations may fail`);
  }

  const uniqueLocations = new Set(data.map(d => d.location));
  if (uniqueLocations.size === 0) {
    errors.push('No unique locations found');
  }

  // Check for location groups specified in the contract
  const requiredLocationGroups: LocationGroup[] = ['British Columbia', 'Ontario', 'Alberta', 'Quebec'];
  const foundLocationGroups = new Set(data.map(d => d.locationGroup));
  const missingGroups = requiredLocationGroups.filter(g => !foundLocationGroups.has(g));

  if (missingGroups.length > 0) {
    warnings.push(`Missing location groups from contract: ${missingGroups.join(', ')}`);
  }

  // Check for required indicators from filters
  const requiredIndicators: IndicatorType[] = ['Total demand'];
  const foundIndicators = new Set(data.map(d => d.indicator));
  const missingIndicators = requiredIndicators.filter(i => !foundIndicators.has(i));

  if (missingIndicators.length > 0) {
    errors.push(`Missing required indicators from filters: ${missingIndicators.join(', ')}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Map Tableau field references to actual CSV column names
 * This function translates Tableau's internal field notation to CSV columns
 *
 * Examples:
 * - "[max:Value:qk]" -> "Value"
 * - "[sum:Value:qk]" -> "Value"
 * - "[tyr:Year:qk]" -> "Year"
 * - "[none:Location:nk]" -> "Location"
 *
 * @param tableauField - Tableau field reference like "[max:Value:qk]"
 * @returns The actual CSV column name
 */
export function mapTableauFieldToCsvColumn(tableauField: string): string {
  // Remove the brackets
  const withoutBrackets = tableauField.replace(/^\[/, '').replace(/\]$/, '');

  // Split by colon
  const parts = withoutBrackets.split(':');

  // The last part is typically the base column name
  // For example: "max:Value:qk" -> "Value"
  //              "none:Location:nk" -> "Location"
  if (parts.length >= 2) {
    return parts[1]; // The middle part is the column name
  }

  // If we can't parse it, return the original
  return tableauField;
}

/**
 * Filter data by location groups
 */
export function filterByLocationGroups(data: TourismData[], groups: LocationGroup[]): TourismData[] {
  return data.filter(d => groups.includes(d.locationGroup));
}

/**
 * Filter data by indicators
 */
export function filterByIndicators(data: TourismData[], indicators: string[]): TourismData[] {
  return data.filter(d => indicators.includes(d.indicator));
}

/**
 * Filter data by year
 */
export function filterByYear(data: TourismData[], year: number): TourismData[] {
  return data.filter(d => d.year === year);
}

/**
 * Filter data by year range
 */
export function filterByYearRange(data: TourismData[], startYear: number, endYear: number): TourismData[] {
  return data.filter(d => d.year >= startYear && d.year <= endYear);
}

/**
 * Get unique values from data
 */
export function getUniqueLocationGroups(data: TourismData[]): LocationGroup[] {
  const groups = new Set(data.map(d => d.locationGroup));
  return Array.from(groups) as LocationGroup[];
}

export function getUniqueIndicators(data: TourismData[]): string[] {
  const indicators = new Set(data.map(d => d.indicator));
  return Array.from(indicators);
}

export function getUniqueYears(data: TourismData[]): number[] {
  const years = new Set(data.map(d => d.year));
  return Array.from(years).sort((a, b) => a - b);
}

export function getUniqueLocations(data: TourismData[]): string[] {
  const locations = new Set(data.map(d => d.location));
  return Array.from(locations).sort();
}

/**
 * Aggregate values by location and year
 */
export function aggregateByLocationAndYear(data: TourismData[]): Map<string, number> {
  const aggregated = new Map<string, number>();

  data.forEach(d => {
    const key = `${d.location}-${d.year}`;
    const current = aggregated.get(key) || 0;
    aggregated.set(key, current + d.value);
  });

  return aggregated;
}

/**
 * Calculate year-over-year growth rate
 */
export function calculateGrowthRate(data: TourismData[]): Map<string, number> {
  const aggregated = aggregateByLocationAndYear(data);
  const growthRates = new Map<string, number>();

  const locations = getUniqueLocations(data);
  const years = getUniqueYears(data);

  locations.forEach(location => {
    for (let i = 1; i < years.length; i++) {
      const prevYear = years[i - 1];
      const currYear = years[i];

      const prevKey = `${location}-${prevYear}`;
      const currKey = `${location}-${currYear}`;

      const prevValue = aggregated.get(prevKey) || 0;
      const currValue = aggregated.get(currKey) || 0;

      if (prevValue > 0) {
        const growthRate = ((currValue - prevValue) / prevValue) * 100;
        growthRates.set(currKey, growthRate);
      }
    }
  });

  return growthRates;
}

/**
 * Calculate percentage of total for pie chart data
 */
export function calculatePercentOfTotal(data: TourismData[]): TourismData[] {
  // Group by location group and indicator
  const groupTotals = new Map<string, number>();

  data.forEach(d => {
    const key = `${d.locationGroup}`;
    const current = groupTotals.get(key) || 0;
    groupTotals.set(key, current + d.value);
  });

  return data.map(d => {
    const totalKey = d.locationGroup;
    const total = groupTotals.get(totalKey) || 1; // Avoid division by zero
    return {
      ...d,
      value: (d.value / total) * 100 // Convert to percentage
    };
  });
}
