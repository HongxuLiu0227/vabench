import * as d3 from 'd3';
import type { ParsedAccidentRecord } from '../types/data';

/**
 * Data loading service
 * Loads and parses CSV data from /data/...
 *
 * IMPORTANT: This service uses bracket notation to access CSV fields
 * to handle special characters in column names (parentheses, hyphens, spaces).
 */
export class DataService {
  // Required field names for validation
  private static readonly REQUIRED_FIELDS = [
    'Accident_Index',
    'Accident_Severity',
    'Number_of_Vehicles',
    'Number_of_Casualties',
    'Day_of_Week',
    'Speed_limit',
    'Light_Conditions',
    'Weather_Conditions',
    'Road_Surface_Conditions',
    'Urban_or_Rural_Area',
    'Time',
    'Date'
  ] as const;

  /**
   * Normalize CSV headers by removing quotes, extra whitespace, and BOM characters
   * This handles dirty CSV headers like `"Order Date"` or `"  Field Name  "`
   */
  private static normalizeHeaders(headers: string[]): Record<string, string> {
    const headerMap: Record<string, string> = {};

    for (const header of headers) {
      // Remove BOM (Byte Order Mark) if present
      let cleaned = header.replace(/^\uFEFF/, '');

      // Remove surrounding quotes (single or double, repeated)
      cleaned = cleaned.replace(/^['"]+|['"]+$/g, '').trim();

      // Store the mapping from original to normalized
      headerMap[header] = cleaned;
    }

    return headerMap;
  }

  /**
   * Load accident data from CSV
   * Loads from /data/ and validates required fields are present
   */
  static async loadAccidentData(): Promise<ParsedAccidentRecord[]> {
    try {
      const rawData = await d3.csv('/data/DfTRoadSafety_Accidents_2014.csv');

      // Validate that we have data
      if (!rawData || rawData.length === 0) {
        throw new Error('CSV file is empty or could not be parsed');
      }

      // Check if we need to normalize headers (detect dirty headers)
      const firstRow = rawData[0];
      const rawHeaders = Object.keys(firstRow);

      // Check for common dirty header patterns
      const hasDirtyHeaders = rawHeaders.some(h =>
        h.startsWith('"') || h.startsWith("'") ||
        h.endsWith('"') || h.endsWith("'") ||
        h.startsWith('\uFEFF') ||
        /^\s/.test(h) || /\s$/.test(h)
      );

      let normalizedData: d3.DSVRowString[];
      if (hasDirtyHeaders) {
        console.warn('Detected dirty CSV headers, normalizing...');
        const headerMap = this.normalizeHeaders(rawHeaders);

        // Remap all rows with normalized headers
        normalizedData = rawData.map(row => {
          const newRow: d3.DSVRowString = {};
          for (const [key, value] of Object.entries(row)) {
            const normalizedKey = headerMap[key] || key;
            newRow[normalizedKey] = value;
          }
          return newRow;
        });
      } else {
        normalizedData = rawData;
      }

      // Validate that required fields exist in the first row
      const normalizedFirstRow = normalizedData[0];
      this.validateRequiredFields(normalizedFirstRow);

      // Parse and transform data with validation
      const parsedData = normalizedData.map((row, index) => this.parseRow(row, index));

      // Validate parsed data
      this.validateParsedData(parsedData);

      return parsedData;
    } catch (error) {
      console.error('Error loading accident data:', error);
      throw error;
    }
  }

  /**
   * Validate that required fields exist in the CSV data
   */
  private static validateRequiredFields(row: d3.DSVRowString): void {
    const missingFields: string[] = [];
    const availableFields = Object.keys(row);

    for (const field of this.REQUIRED_FIELDS) {
      if (!(field in row)) {
        missingFields.push(field);
      }
    }

    if (missingFields.length > 0) {
      throw new Error(
        `Missing required fields in CSV: ${missingFields.join(', ')}\n` +
        `Available fields: ${availableFields.join(', ')}\n\n` +
        `This could mean:\n` +
        `1. The CSV file has a different structure than expected\n` +
        `2. Headers are quoted/dirty (e.g., "Field Name" instead of Field Name)\n` +
        `3. There are preamble rows before the actual header\n` +
        `4. Field names have different spelling or formatting`
      );
    }

    console.log(`✓ All required fields present: ${this.REQUIRED_FIELDS.join(', ')}`);
  }

  /**
   * Parse a single CSV row into a ParsedAccidentRecord
   * Uses bracket notation to safely access fields with special characters
   */
  private static parseRow(row: d3.DSVRowString, index: number): ParsedAccidentRecord {
    return {
      Accident_Index: this.getSafeString(row, 'Accident_Index', index),
      Accident_Severity: this.getSafeString(row, 'Accident_Severity', index),
      Number_of_Vehicles: this.getSafeNumber(row, 'Number_of_Vehicles', index),
      Number_of_Casualties: this.getSafeNumber(row, 'Number_of_Casualties', index),
      Day_of_Week: this.getSafeNumber(row, 'Day_of_Week', index),
      Speed_limit: this.getSafeString(row, 'Speed_limit', index) || '-1',
      Light_Conditions: this.getSafeString(row, 'Light_Conditions', index),
      Weather_Conditions: this.getSafeString(row, 'Weather_Conditions', index),
      Road_Surface_Conditions: this.getSafeString(row, 'Road_Surface_Conditions', index),
      Urban_or_Rural_Area: this.getSafeString(row, 'Urban_or_Rural_Area', index),
      Time: this.getSafeString(row, 'Time', index),
      Date: this.getSafeString(row, 'Date', index)
    };
  }

  /**
   * Safely get a string field from a CSV row
   */
  private static getSafeString(row: d3.DSVRowString, field: string, rowIndex: number): string {
    const value = row[field];
    if (value === undefined || value === null) {
      console.warn(`Row ${rowIndex}: Missing field '${field}', using empty string`);
      return '';
    }
    // Trim whitespace to handle dirty CSV data
    return String(value).trim();
  }

  /**
   * Safely parse a numeric field from a CSV row
   */
  private static getSafeNumber(row: d3.DSVRowString, field: string, rowIndex: number): number {
    const value = row[field];
    if (value === undefined || value === null || value === '') {
      console.warn(`Row ${rowIndex}: Missing or empty numeric field '${field}', using 0`);
      return 0;
    }

    // Remove any whitespace before parsing
    const trimmed = String(value).trim();
    const parsed = parseFloat(trimmed);

    if (isNaN(parsed)) {
      console.warn(`Row ${rowIndex}: Could not parse '${field}' value '${value}' as number, using 0`);
      return 0;
    }

    return parsed;
  }

  /**
   * Validate the parsed data for consistency
   */
  private static validateParsedData(data: ParsedAccidentRecord[]): void {
    if (data.length === 0) {
      throw new Error('No data records after parsing');
    }

    // Check for data quality issues
    let zeroCount = 0;
    let invalidCount = 0;
    let allZero = true;

    for (const record of data) {
      // Check if ALL numeric values are zero (indicates parsing failure)
      if (record.Number_of_Vehicles > 0 || record.Number_of_Casualties > 0) {
        allZero = false;
      }

      // Count records with zero values (might indicate parsing issues)
      if (record.Number_of_Vehicles === 0 && record.Number_of_Casualties === 0) {
        zeroCount++;
      }

      // Check for obviously invalid Day_of_Week values
      if (record.Day_of_Week < 1 || record.Day_of_Week > 7) {
        invalidCount++;
      }
    }

    if (allZero) {
      throw new Error(
        'CRITICAL: All parsed records have zero values. This indicates a severe parsing issue.\n' +
        'Possible causes:\n' +
        '1. CSV has preamble rows before the real header\n' +
        '2. Number fields are not being parsed correctly\n' +
        '3. Data is stored in a different format than expected\n\n' +
        'Sample parsed record: ' + JSON.stringify(data[0], null, 2)
      );
    }

    if (zeroCount > data.length * 0.5) {
      console.warn(
        `⚠ Warning: ${zeroCount} out of ${data.length} records have zero values. ` +
        'This might indicate a parsing issue.'
      );
    }

    if (invalidCount > 0) {
      console.warn(`⚠ Warning: ${invalidCount} records have invalid Day_of_Week values`);
    }

    // Log a sample record for debugging
    console.log('✓ Sample parsed record:', JSON.stringify(data[0], null, 2));
    console.log(`✓ Successfully parsed ${data.length} accident records`);
  }


  /**
   * Filter data based on filter criteria
   */
  static filterData(
    data: ParsedAccidentRecord[],
    filters: {
      selectedLightConditions?: string[];
      selectedSpeedLimits?: string[];
      selectedWeatherConditions?: string[];
      selectedRoadSurfaceConditions?: string[];
      selectedAccidentSeverities?: string[];
      selectedDayOfWeek?: string[];
    }
  ): ParsedAccidentRecord[] {
    let filtered = data;

    if (filters.selectedLightConditions && filters.selectedLightConditions.length > 0) {
      filtered = filtered.filter(d => filters.selectedLightConditions!.includes(d.Light_Conditions));
    }

    if (filters.selectedSpeedLimits && filters.selectedSpeedLimits.length > 0) {
      filtered = filtered.filter(d => filters.selectedSpeedLimits!.includes(d.Speed_limit));
    }

    if (filters.selectedWeatherConditions && filters.selectedWeatherConditions.length > 0) {
      filtered = filtered.filter(d => filters.selectedWeatherConditions!.includes(d.Weather_Conditions));
    }

    if (filters.selectedRoadSurfaceConditions && filters.selectedRoadSurfaceConditions.length > 0) {
      filtered = filtered.filter(d => filters.selectedRoadSurfaceConditions!.includes(d.Road_Surface_Conditions));
    }

    if (filters.selectedAccidentSeverities && filters.selectedAccidentSeverities.length > 0) {
      filtered = filtered.filter(d => filters.selectedAccidentSeverities!.includes(d.Accident_Severity));
    }

    if (filters.selectedDayOfWeek && filters.selectedDayOfWeek.length > 0) {
      filtered = filtered.filter(d => filters.selectedDayOfWeek!.includes(d.Day_of_Week.toString()));
    }

    return filtered;
  }

  /**
   * Get unique values for a field
   */
  static getUniqueValues<T>(data: T[], key: keyof T): string[] {
    const values = new Set<string>();
    data.forEach(d => {
      const val = d[key];
      if (val !== null && val !== undefined && val !== '') {
        values.add(String(val));
      }
    });
    return Array.from(values).sort();
  }

  /**
   * Aggregate data by group (count records)
   */
  static aggregateByCount<T>(
    data: T[],
    groupBy: (d: T) => string
  ): Array<{ key: string; count: number }> {
    const rolledUp = d3.rollup(
      data,
      v => v.length,
      groupBy
    );

    return Array.from(rolledUp, ([key, count]) => ({ key, count }))
      .sort((a, b) => b.count - a.count);
  }

  /**
   * Aggregate data by group with sum
   */
  static aggregateBySum<T>(
    data: T[],
    groupBy: (d: T) => string,
    sumField: keyof T
  ): Array<{ key: string; sum: number }> {
    const rolledUp = d3.rollup(
      data,
      v => d3.sum(v, d => Number(d[sumField]) || 0),
      groupBy
    );

    return Array.from(rolledUp, ([key, sum]) => ({ key, sum }))
      .sort((a, b) => b.sum - a.sum);
  }

  /**
   * Aggregate data by multiple groups
   */
  static aggregateByMultiple<T>(
    data: T[],
    groupByKeys: Array<(d: T) => string>
  ): Array<{ keys: string[]; count: number }> {
    const keyFunc = (d: T) => groupByKeys.map(k => k(d)).join('|');

    const rolledUp = d3.rollup(
      data,
      v => v.length,
      keyFunc
    );

    return Array.from(rolledUp, ([key, count]) => ({
      keys: key.split('|'),
      count
    })).sort((a, b) => b.count - a.count);
  }

  /**
   * Aggregate data for Q2_Weather chart
   * Groups by Weather_Conditions, with optional series by Light_Conditions
   */
  static aggregateQ2Weather(
    data: ParsedAccidentRecord[]
  ): Array<{ Weather_Conditions: string; Light_Conditions: string; count: number }> {
    const grouped = d3.rollup(
      data,
      v => v.length,
      d => d.Weather_Conditions,
      d => d.Light_Conditions
    );

    const result: Array<{ Weather_Conditions: string; Light_Conditions: string; count: number }> = [];

    grouped.forEach((lightMap, weather) => {
      lightMap.forEach((count, light) => {
        result.push({
          Weather_Conditions: weather,
          Light_Conditions: light,
          count
        });
      });
    });

    return result.sort((a, b) => b.count - a.count);
  }

  /**
   * Aggregate data for Q7_Speed chart
   * Groups by Accident_Severity and Speed_limit, sums Number_of_Casualties
   */
  static aggregateQ7Speed(
    data: ParsedAccidentRecord[]
  ): Array<{ Accident_Severity: string; Speed_limit: string; casualties: number }> {
    const grouped = d3.rollup(
      data,
      v => d3.sum(v, d => Number(d.Number_of_Casualties) || 0),
      d => d.Accident_Severity,
      d => d.Speed_limit
    );

    const result: Array<{ Accident_Severity: string; Speed_limit: string; casualties: number }> = [];

    grouped.forEach((speedMap, severity) => {
      speedMap.forEach((casualties, speed) => {
        result.push({
          Accident_Severity: severity,
          Speed_limit: speed,
          casualties
        });
      });
    });

    return result;
  }

  /**
   * Aggregate data for Sheet 28
   * Groups by Speed_limit and Weather_Conditions, counts records
   */
  static aggregateSheet28(
    data: ParsedAccidentRecord[]
  ): Array<{ Speed_limit: string; Weather_Conditions: string; Light_Conditions: string; count: number }> {
    const grouped = d3.rollup(
      data,
      v => v.length,
      d => d.Speed_limit,
      d => d.Weather_Conditions,
      d => d.Light_Conditions
    );

    const result: Array<{ Speed_limit: string; Weather_Conditions: string; Light_Conditions: string; count: number }> = [];

    grouped.forEach((weatherMap, speed) => {
      weatherMap.forEach((lightMap, weather) => {
        lightMap.forEach((count, light) => {
          result.push({
            Speed_limit: speed,
            Weather_Conditions: weather,
            Light_Conditions: light,
            count
          });
        });
      });
    });

    return result.sort((a, b) => b.count - a.count);
  }

  /**
   * Aggregate data for Sheet 29
   * Groups by Day_of_Week, counts records
   */
  static aggregateSheet29(
    data: ParsedAccidentRecord[]
  ): Array<{ Day_of_Week: string; count: number }> {
    const grouped = d3.rollup(
      data,
      v => v.length,
      d => d.Day_of_Week.toString()
    );

    return Array.from(grouped, ([day, count]) => ({ Day_of_Week: day, count }))
      .sort((a, b) => parseInt(a.Day_of_Week) - parseInt(b.Day_of_Week));
  }
}
