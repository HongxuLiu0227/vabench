import Papa from 'papaparse';
import type { GameData, GenreSalesData, YearGenreSalesData, PublisherSalesData, GenrePieData } from '../types';

const DATA_URL = '/data/processed_data_All.csv';

let cachedData: GameData[] | null = null;

/**
 * Normalize CSV headers by removing quotes, extra spaces, and special characters
 */
function normalizeHeader(header: string): string {
  return header
    .replace(/^["']|["']$/g, '') // Remove surrounding quotes
    .trim()
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/["'"]/g, ''); // Remove any internal quotes
}

/**
 * Detect and skip preamble rows before the real header
 * Returns the line number where the actual header starts
 */
function detectHeaderLine(lines: string[]): number {
  // Known field names that should appear in the header
  const knownFieldNames = ['Rank', 'Name', 'Platform', 'Year', 'Genre', 'Publisher', 'Global_Sales'];

  for (let i = 0; i < Math.min(lines.length, 20); i++) {
    const line = lines[i];
    const normalizedHeaders = line.split(',').map(h => normalizeHeader(h));

    // Check if this line looks like a header (contains known field names)
    const knownFieldCount = normalizedHeaders.filter(h =>
      knownFieldNames.some(field => h.includes(field))
    ).length;

    // If we find at least 3 known fields, this is likely the header
    if (knownFieldCount >= 3) {
      console.log(`[DataService] Header detected at line ${i + 1}`);
      return i;
    }
  }

  // Default to first line if no header detected
  console.log(`[DataService] No clear header detected, using first line`);
  return 0;
}

export async function loadGameData(): Promise<GameData[]> {
  if (cachedData) {
    console.log(`[DataService] Returning cached data (${cachedData.length} rows)`);
    return cachedData;
  }

  console.log(`[DataService] Loading data from ${DATA_URL}`);

  const response = await fetch(DATA_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
  }

  const csvText = await response.text();
  const lines = csvText.split(/\r?\n/).filter(line => line.trim());
  console.log(`[DataService] CSV loaded. Total lines: ${lines.length}`);

  // Detect header line to skip preamble
  const headerLineIndex = detectHeaderLine(lines);
  if (headerLineIndex > 0) {
    console.log(`[DataService] Skipping ${headerLineIndex} preamble lines before header`);
  }

  const csvToParse = lines.slice(headerLineIndex).join('\n');

  return new Promise((resolve, reject) => {
    Papa.parse(csvToParse, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        console.log(`[DataService] Parsed ${results.data.length} rows`);

        // Log raw headers for debugging
        console.log(`[DataService] Raw headers:`, results.meta.fields);

        // Normalize headers
        const normalizedHeaders = (results.meta.fields || []).map(normalizeHeader);
        console.log(`[DataService] Normalized headers:`, normalizedHeaders);

        // Create a mapping from normalized headers to original headers
        const headerMap = new Map<string, string>();
        (results.meta.fields || []).forEach(original => {
          headerMap.set(normalizeHeader(original), original);
        });

        // Parse numeric fields explicitly to avoid string concatenation
        const data = results.data
          .filter((row: any) => {
            // Filter out rows where all fields are empty
            const hasData = Object.values(row).some(v => v !== null && v !== undefined && v !== '');
            return hasData;
          })
          .map((row: any) => {
            // Helper function to get a value by field name (tries normalized then original)
            const getFieldValue = (fieldName: string): any => {
              const originalHeader = headerMap.get(fieldName);
              if (originalHeader && row[originalHeader] !== undefined) {
                return row[originalHeader];
              }
              return row[fieldName];
            };

            // Convert to number with validation
            const toNumber = (val: any): number => {
              if (val === null || val === undefined || val === '') {
                return 0;
              }
              const num = Number(val);
              return isNaN(num) ? 0 : num;
            };

            return {
              Rank: toNumber(getFieldValue('Rank')),
              Name: String(getFieldValue('Name') || ''),
              Platform: String(getFieldValue('Platform') || ''),
              Year: toNumber(getFieldValue('Year')),
              Genre: String(getFieldValue('Genre') || ''),
              Publisher: String(getFieldValue('Publisher') || ''),
              NA_Sales: toNumber(getFieldValue('NA_Sales')),
              EU_Sales: toNumber(getFieldValue('EU_Sales')),
              JP_Sales: toNumber(getFieldValue('JP_Sales')),
              Other_Sales: toNumber(getFieldValue('Other_Sales')),
              Global_Sales: toNumber(getFieldValue('Global_Sales')),
              Averaged_Sales: toNumber(getFieldValue('Averaged_Sales')),
            } as GameData;
          });

        console.log(`[DataService] Processed ${data.length} valid rows`);

        // Basic validation
        const yearValues = data.map(d => d.Year).filter(y => y > 0);
        if (yearValues.length === 0) {
          console.error('[DataService] WARNING: No valid year values found in data!');
        } else {
          console.log(`[DataService] Year range: ${Math.min(...yearValues)} - ${Math.max(...yearValues)}`);
        }

        const globalSalesValues = data.map(d => d.Global_Sales).filter(s => s > 0);
        if (globalSalesValues.length === 0) {
          console.error('[DataService] WARNING: No valid Global_Sales values found in data!');
        } else {
          console.log(`[DataService] Global_Sales range: ${Math.min(...globalSalesValues).toFixed(2)} - ${Math.max(...globalSalesValues).toFixed(2)}`);
        }

        cachedData = data;
        resolve(data);
      },
      error: (error: Error) => {
        console.error('[DataService] Parse error:', error);
        reject(error);
      },
    });
  });
}

export function filterData(
  data: GameData[],
  genres: string[],
  publishers: string[],
  platforms: string[],
  years: number[]
): GameData[] {
  return data.filter((row) => {
    if (genres.length > 0 && !genres.includes(row.Genre)) return false;
    if (publishers.length > 0 && !publishers.includes(row.Publisher)) return false;
    if (platforms.length > 0 && !platforms.includes(row.Platform)) return false;
    if (years.length > 0 && !years.includes(row.Year)) return false;
    return true;
  });
}

export function aggregateGenreSales(data: GameData[]): GenreSalesData[] {
  const genreMap = new Map<string, { sum: number; count: number }>();

  data.forEach((row) => {
    const existing = genreMap.get(row.Genre) || { sum: 0, count: 0 };
    genreMap.set(row.Genre, {
      sum: existing.sum + row.Global_Sales,
      count: existing.count + 1,
    });
  });

  return Array.from(genreMap.entries()).map(([genre, { sum, count }]) => ({
    genre,
    avgGlobalSales: sum / count,
    count,
  }));
}

export function aggregateYearGenreSales(data: GameData[]): YearGenreSalesData[] {
  const yearGenreMap = new Map<string, number>();

  data.forEach((row) => {
    const key = `${row.Year}-${row.Genre}`;
    yearGenreMap.set(key, (yearGenreMap.get(key) || 0) + row.Global_Sales);
  });

  return Array.from(yearGenreMap.entries()).map(([key, globalSales]) => {
    const [year, genre] = key.split('-');
    return {
      year: Number(year),
      genre,
      globalSales,
    };
  });
}

export function aggregatePublisherSales(data: GameData[]): PublisherSalesData[] {
  const publisherMap = new Map<string, { sum: number; platforms: Set<string>; count: number }>();

  data.forEach((row) => {
    const existing = publisherMap.get(row.Publisher) || { sum: 0, platforms: new Set<string>(), count: 0 };
    existing.sum += row.Global_Sales;
    existing.platforms.add(row.Platform);
    existing.count += 1;
    publisherMap.set(row.Publisher, existing);
  });

  return Array.from(publisherMap.entries())
    .map(([publisher, { sum, platforms, count }]) => ({
      publisher,
      avgGlobalSales: sum / count,
      platforms: Array.from(platforms),
      count,
    }))
    .sort((a, b) => b.avgGlobalSales - a.avgGlobalSales);
}

export function aggregateGenrePieData(data: GameData[]): GenrePieData[] {
  const genreMap = new Map<string, number>();

  data.forEach((row) => {
    genreMap.set(row.Genre, (genreMap.get(row.Genre) || 0) + row.Global_Sales);
  });

  return Array.from(genreMap.entries())
    .map(([genre, globalSales]) => ({ genre, globalSales }))
    .sort((a, b) => b.globalSales - a.globalSales);
}

export function getUniqueValues<T>(data: T[]): T[] {
  return Array.from(new Set(data)).sort();
}

export const getAllGenres = async (): Promise<string[]> => {
  const data = await loadGameData();
  return getUniqueValues(data.map((d) => d.Genre));
};

export const getAllPublishers = async (): Promise<string[]> => {
  const data = await loadGameData();
  return getUniqueValues(data.map((d) => d.Publisher));
};

export const getAllPlatforms = async (): Promise<string[]> => {
  const data = await loadGameData();
  return getUniqueValues(data.map((d) => d.Platform));
};

export const getAllYears = async (): Promise<number[]> => {
  const data = await loadGameData();
  return getUniqueValues(data.map((d) => d.Year)).sort((a, b) => a - b);
};
