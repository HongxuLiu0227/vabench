import type { BikeTripData, CSVRow, HourRecord } from '../types';
import { runComprehensiveValidation, logValidationResults } from './dataValidator';

/**
 * Data loading service for fetching and processing bike trip data
 * All data is loaded from /data/... endpoints at runtime
 */
export class DataLoaderService {
  private dataCache: BikeTripData[] | null = null;

  /**
   * Fetch CSV data from the public/data directory
   */
  async fetchCSVData(): Promise<string> {
    const response = await fetch('/data/TEMP_0du9fqe1d1zge91goeeim12daxpo.csv');
    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.statusText}`);
    }
    return response.text();
  }

  /**
   * Parse CSV string into array of objects
   */
  parseCSV(csvText: string): CSVRow[] {
    // Remove BOM (Byte Order Mark) if present at the start
    const csvTextClean = csvText.replace(/^\uFEFF/, '');

    const lines = csvTextClean.split('\n').filter(line => line.trim());
    if (lines.length === 0) return [];

    // Parse header (remove quotes and extra quotes)
    const headerLine = lines[0];
    const headers = this.parseCSVLine(headerLine);

    // Clean headers: remove all quotes, normalize whitespace, and ensure clean field names
    const cleanHeaders = headers.map(h => this.cleanCSVValue(h));

    // Validate that we have clean headers (no empty headers after cleaning)
    if (cleanHeaders.some(h => !h || h.trim() === '')) {
      throw new Error('CSV parsing failed: One or more headers are empty after normalization');
    }

    // Log the cleaned headers for debugging
    if (import.meta.env.DEV) {
      console.log('Cleaned CSV headers:', cleanHeaders);
    }

    // Parse data rows
    const rows: CSVRow[] = [];
    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCSVLine(lines[i]);
      if (values.length === cleanHeaders.length) {
        const row: CSVRow = {};
        cleanHeaders.forEach((header, index) => {
          row[header] = values[index];
        });
        rows.push(row);
      }
    }

    return rows;
  }

  /**
   * Clean a CSV value by removing quotes and normalizing
   * Handles triple-quoted headers like """tripduration""" and dirty headers
   * Strips leading/trailing whitespace and quotes
   */
  private cleanCSVValue(value: string): string {
    // Trim whitespace first
    let cleaned = value.trim();
    // Remove all leading and trailing quotes (handles """, "", etc.)
    cleaned = cleaned.replace(/^"+|"+$/g, '');
    // Replace escaped quotes (double double-quotes) with single quotes
    cleaned = cleaned.replace(/""/g, '"');
    // Trim again in case there was whitespace around the quotes
    return cleaned.trim();
  }

  /**
   * Parse a single CSV line, handling quoted values correctly
   */
  private parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          // Escaped quote within quoted value
          current += '"';
          i++; // Skip next quote
        } else {
          // Toggle quote mode
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        // Field separator
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }

    // Add last field
    result.push(current);

    return result;
  }

  /**
   * Convert CSV rows to BikeTripData objects
   * Handles normalized headers and provides fallbacks for missing fields
   */
  convertToBikeTripData(rows: CSVRow[]): BikeTripData[] {
    return rows.map((row, index) => {
      try {
        // Headers are already cleaned by parseCSV, so we can use them directly
        // Add defensive checks to ensure fields exist before accessing
        const data: BikeTripData = {
          tripduration: Number(row['tripduration'] || '0'),
          starttime: row['starttime'] || '',
          stoptime: row['stoptime'] || '',
          start_station_id: Number(row['start station id'] || '0'),
          start_station_name: row['start station name'] || '',
          start_station_latitude: Number(row['start station latitude'] || '0'),
          start_station_longitude: Number(row['start station longitude'] || '0'),
          end_station_id: Number(row['end station id'] || '0'),
          end_station_name: row['end station name'] || '',
          end_station_latitude: Number(row['end station latitude'] || '0'),
          end_station_longitude: Number(row['end station longitude'] || '0'),
          bikeid: Number(row['bikeid'] || '0'),
          usertype: row['usertype'] || '',
          birth_year: Number(row['birth year'] || '0'),
          gender: Number(row['gender'] || '0'),
          Table_Name: row['Table Name'] || ''
        };

        // Validate that we have at least the essential fields
        if (!data.starttime && !data.stoptime) {
          console.warn(`Row ${index + 1}: Missing both starttime and stoptime`);
        }

        return data;
      } catch (error) {
        console.error(`Error converting row ${index + 1}:`, error);
        // Return a minimal valid object to prevent complete failure
        return {
          tripduration: 0,
          starttime: '',
          stoptime: '',
          start_station_id: 0,
          start_station_name: '',
          start_station_latitude: 0,
          start_station_longitude: 0,
          end_station_id: 0,
          end_station_name: '',
          end_station_latitude: 0,
          end_station_longitude: 0,
          bikeid: 0,
          usertype: '',
          birth_year: 0,
          gender: 0,
          Table_Name: ''
        };
      }
    });
  }

  /**
   * Load and cache all bike trip data
   */
  async loadData(): Promise<BikeTripData[]> {
    if (this.dataCache) {
      return this.dataCache;
    }

    const csvText = await this.fetchCSVData();
    const rows = this.parseCSV(csvText);
    this.dataCache = this.convertToBikeTripData(rows);

    // Validate the loaded data
    const startHours = this.aggregateByStartHour(this.dataCache);
    const endHours = this.aggregateByEndHour(this.dataCache);
    const validation = runComprehensiveValidation(this.dataCache, startHours, endHours);

    // Log validation results in development mode
    if (import.meta.env.DEV) {
      logValidationResults(validation);
    }

    // Throw error if validation fails (to prevent silent failures)
    if (!validation.overallValid) {
      const errorCount =
        validation.rawDataValidation.errors.length +
        validation.startHoursValidation.errors.length +
        validation.endHoursValidation.errors.length;

      throw new Error(
        `Data validation failed with ${errorCount} error(s). ` +
        `Check console for details.`
      );
    }

    return this.dataCache;
  }

  /**
   * Aggregate data by hour for trip start times
   */
  aggregateByStartHour(data: BikeTripData[]): HourRecord[] {
    const hourCounts = new Map<number, number>();

    data.forEach(trip => {
      try {
        const date = new Date(trip.starttime);
        const hour = date.getHours();
        hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
      } catch {
        // Skip invalid dates
      }
    });

    // Convert to array and sort by hour
    const result: HourRecord[] = [];
    for (let hour = 0; hour < 24; hour++) {
      result.push({
        hour,
        count: hourCounts.get(hour) || 0
      });
    }

    return result;
  }

  /**
   * Aggregate data by hour for trip end times
   */
  aggregateByEndHour(data: BikeTripData[]): HourRecord[] {
    const hourCounts = new Map<number, number>();

    data.forEach(trip => {
      try {
        const date = new Date(trip.stoptime);
        const hour = date.getHours();
        hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
      } catch {
        // Skip invalid dates
      }
    });

    // Convert to array and sort by hour
    const result: HourRecord[] = [];
    for (let hour = 0; hour < 24; hour++) {
      result.push({
        hour,
        count: hourCounts.get(hour) || 0
      });
    }

    return result;
  }

  /**
   * Get aggregated data for peak trip start hours
   */
  async getPeakStartHours(): Promise<HourRecord[]> {
    const data = await this.loadData();
    return this.aggregateByStartHour(data);
  }

  /**
   * Get aggregated data for peak trip end hours
   */
  async getPeakEndHours(): Promise<HourRecord[]> {
    const data = await this.loadData();
    return this.aggregateByEndHour(data);
  }
}

// Export singleton instance
export const dataLoaderService = new DataLoaderService();
