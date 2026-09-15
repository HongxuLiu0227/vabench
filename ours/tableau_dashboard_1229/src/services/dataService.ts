import type { BaseballPlayer, OverviewData, AggregatedData } from '../types/baseball';

const DATA_URL = '/data/TEMP_1gmu7581ajjigv161l39r0mgmvpl.csv';

/**
 * Normalize a triple-quoted CSV header field
 * Converts """name""" to name
 */
function normalizeHeaderField(field: string): string {
  // Remove surrounding triple quotes
  let normalized = field.trim();

  // Check if field starts and ends with triple quotes
  if (normalized.startsWith('"""') && normalized.endsWith('"""')) {
    // Remove the triple quotes from both ends
    normalized = normalized.slice(3, -3);
  }
  // Also handle case where field might have escaped quotes inside
  // Replace doubled quotes with single quotes
  normalized = normalized.replace(/""/g, '"');

  return normalized.trim();
}

/**
 * Parse CSV text into array of objects
 * Handles triple-quoted headers like """name""" and escaped quotes
 */
function parseCSV(text: string): Record<string, string>[] {
  const lines = text.split(/\r?\n/).filter(line => line.trim());
  if (lines.length === 0) return [];

  // Parse header - handle triple-quoted field names like """name""","""handedness""",...
  const headerLine = lines[0];
  const rawHeaders: string[] = [];

  // Split by comma and preserve the quoted fields
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < headerLine.length; i++) {
    const char = headerLine[i];
    if (char === '"') {
      inQuotes = !inQuotes;
      current += char;
    } else if (char === ',' && !inQuotes) {
      rawHeaders.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  if (current.trim()) {
    rawHeaders.push(current.trim());
  }

  // Normalize headers (remove triple quotes)
  const headers = rawHeaders.map(normalizeHeaderField);

  // Parse data rows (unquoted, comma-separated)
  const result: Record<string, string>[] = [];
  for (let lineIdx = 1; lineIdx < lines.length; lineIdx++) {
    const line = lines[lineIdx];
    const row: Record<string, string> = {};
    const values = line.split(',');

    for (let fieldIdx = 0; fieldIdx < Math.min(headers.length, values.length); fieldIdx++) {
      row[headers[fieldIdx]] = values[fieldIdx].trim();
    }

    if (Object.keys(row).length > 0) {
      result.push(row);
    }
  }

  return result;
}

/**
 * Transform raw CSV data into BaseballPlayer objects
 */
function transformData(rawData: Record<string, string>[]): BaseballPlayer[] {
  return rawData.map(row => {
    const height = Number(row['height'] || '0');
    const weight = Number(row['weight'] || '0');
    const htWtRatioBin = Number(row['Ht Wt ratio (bin)'] || '0');

    // Calculate Tableau fields
    const badHight = height > 73;  // Spec uses "Hight" typo
    const badWeight = weight > 184;

    return {
      name: row['name'] || '',
      handedness: row['handedness'] || '',
      height: height,
      weight: weight,
      avg: Number(row['avg'] || '0'),
      HR: Number(row['HR'] || '0'),
      weight_kg: weight * 0.453592,
      ht_wt_ratio_bin: htWtRatioBin,
      number_of_records: Number(row['Number of Records'] || '1'),
      // Tableau calculated fields
      "Bad Hight": badHight,
      "Bad Weight": badWeight,
      Calculation_41447206859923456: htWtRatioBin
    };
  });
}

/**
 * Load baseball data from CSV
 */
export async function loadBaseballData(): Promise<BaseballPlayer[]> {
  try {
    const response = await fetch(DATA_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.status}`);
    }
    const csvText = await response.text();
    const rawData = parseCSV(csvText);
    return transformData(rawData);
  } catch (error) {
    console.error('Error loading baseball data:', error);
    throw error;
  }
}

/**
 * Calculate derived fields for bad height/weight filters
 */
export function calculateBadHeightWeight(player: BaseballPlayer): {
  badHeight: boolean;
  badWeight: boolean;
} {
  return {
    badHeight: player.height > 73,
    badWeight: player.weight > 184
  };
}

/**
 * Aggregate batting average by name
 */
export function aggregateBattingAvgByName(data: BaseballPlayer[]): AggregatedData[] {
  const aggregated = new Map<string, Map<string, number>>();

  data.forEach(player => {
    if (!aggregated.has(player.name)) {
      aggregated.set(player.name, new Map());
    }
    const handednessMap = aggregated.get(player.name)!;
    const key = player.handedness || 'Unknown';
    handednessMap.set(key, (handednessMap.get(key) || 0) + player.avg);
  });

  const result: AggregatedData[] = [];
  aggregated.forEach((seriesMap, category) => {
    seriesMap.forEach((value, series) => {
      result.push({ category, value, series });
    });
  });

  return result.sort((a, b) => b.value - a.value);
}

/**
 * Aggregate home runs by height/weight combination
 */
export function aggregateHRByHeightWeight(data: BaseballPlayer[]): AggregatedData[] {
  const aggregated = new Map<string, Map<string, number>>();

  data.forEach(player => {
    const key = `${player.height}/${player.weight}`;
    if (!aggregated.has(key)) {
      aggregated.set(key, new Map());
    }
    const handednessMap = aggregated.get(key)!;
    const seriesKey = `${player.handedness}-${player.name}`;
    handednessMap.set(seriesKey, (handednessMap.get(seriesKey) || 0) + player.HR);
  });

  const result: AggregatedData[] = [];
  aggregated.forEach((seriesMap, category) => {
    seriesMap.forEach((value, series) => {
      result.push({ category, value, series });
    });
  });

  return result.sort((a, b) => b.value - a.value);
}

/**
 * Create overview data by handedness
 */
export function createOverviewData(data: BaseballPlayer[]): OverviewData[] {
  const grouped = new Map<string, OverviewData>();

  data.forEach(player => {
    const key = player.handedness || 'Unknown';
    if (!grouped.has(key)) {
      grouped.set(key, {
        handedness: key,
        avg_sum: 0,
        height_sum: 0,
        hr_sum: 0,
        count: 0,
        weight_kg_sum: 0
      });
    }
    const overview = grouped.get(key)!;
    overview.avg_sum += player.avg;
    overview.height_sum += player.height;
    overview.hr_sum += player.HR;
    overview.weight_kg_sum += player.weight_kg;
    overview.count++;
  });

  return Array.from(grouped.values());
}

/**
 * Filter data based on filter state
 */
export function filterData(data: BaseballPlayer[], filters: {
  badHeight?: boolean;
  badWeight?: boolean;
}): BaseballPlayer[] {
  return data.filter(player => {
    const { badHeight, badWeight } = calculateBadHeightWeight(player);

    if (filters.badHeight !== undefined && filters.badHeight !== badHeight) {
      return false;
    }
    if (filters.badWeight !== undefined && filters.badWeight !== badWeight) {
      return false;
    }

    return true;
  });
}
