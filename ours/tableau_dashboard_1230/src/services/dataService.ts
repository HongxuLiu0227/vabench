import { csvParse } from 'd3-dsv';
import type { BaseballPlayer, PlayerDataPoint } from '../types';

const DATA_URL = '/data/TEMP_1f9wqu912jthnc10j3mrn01585hz.csv';

/**
 * Normalize CSV header by removing all surrounding quotes
 * Handles patterns like: "name", """name""", '"name"', etc.
 */
function normalizeHeader(header: string): string {
  let normalized = header.trim();

  // Remove leading and trailing quotes (including multiple layers)
  while (normalized.startsWith('"') || normalized.startsWith("'")) {
    normalized = normalized.slice(1);
  }
  while (normalized.endsWith('"') || normalized.endsWith("'")) {
    normalized = normalized.slice(0, -1);
  }

  return normalized;
}

/**
 * Pre-process CSV text to normalize headers with triple quotes
 * This handles non-standard CSV files where headers are wrapped in multiple quotes
 */
function preprocessCSV(csvText: string): string {
  const lines = csvText.split('\n');

  if (lines.length === 0) {
    return csvText;
  }

  // Process the header line (first non-empty line)
  let headerLineIndex = 0;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim()) {
      headerLineIndex = i;
      break;
    }
  }

  const headerLine = lines[headerLineIndex];
  const headers = headerLine.split(',');

  // Normalize each header
  const normalizedHeaders = headers.map(h => {
    const normalized = normalizeHeader(h);
    // Wrap in standard single quotes for d3-dsv
    return `"${normalized}"`;
  });

  // Replace the header line with normalized headers
  lines[headerLineIndex] = normalizedHeaders.join(',');

  return lines.join('\n');
}

/**
 * Clean CSV field value by removing quotes and extra whitespace
 */
function cleanFieldValue(value: string): string {
  if (!value) return '';
  let cleaned = value.trim();

  // Remove leading and trailing quotes
  while (cleaned.startsWith('"') || cleaned.startsWith("'")) {
    cleaned = cleaned.slice(1);
  }
  while (cleaned.endsWith('"') || cleaned.endsWith("'")) {
    cleaned = cleaned.slice(0, -1);
  }

  return cleaned;
}

/**
 * Parse numeric value safely
 */
function parseNumeric(value: string): number {
  const cleaned = cleanFieldValue(value);
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

/**
 * Load and parse the baseball player data
 */
export async function loadBaseballData(): Promise<BaseballPlayer[]> {
  try {
    const response = await fetch(DATA_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
    }

    const csvText = await response.text();

    // Pre-process CSV to normalize headers
    const preprocessedCSV = preprocessCSV(csvText);

    // First pass: parse raw data to calculate statistics
    const rawData = csvParse(preprocessedCSV, (row: { [key: string]: string }) => {
      const name = cleanFieldValue(row.name || '');
      const handedness = cleanFieldValue(row.handedness || '');
      const height = parseNumeric(row.height || '0');
      const weight = parseNumeric(row.weight || '0');
      const avg = parseNumeric(row.avg || '0');
      const hr = parseNumeric(row.HR || '0');
      const htWtRatioBin = parseNumeric(row['Ht Wt ratio (bin)'] || '0');
      const numberOfRecords = parseNumeric(row['Number of Records'] || '1');

      return {
        name,
        handedness,
        height,
        weight,
        avg,
        hr,
        htWtRatioBin,
        numberOfRecords
      };
    });

    // Filter out empty rows and calculate statistics
    const validData = rawData.filter(player => player.name !== '');

    // Calculate statistics for outlier detection (z-scores)
    const heights = validData.map(p => p.height);
    const weights = validData.map(p => p.weight);

    const heightMean = heights.reduce((a, b) => a + b, 0) / heights.length;
    const heightStd = Math.sqrt(heights.map(h => Math.pow(h - heightMean, 2)).reduce((a, b) => a + b, 0) / heights.length);

    const weightMean = weights.reduce((a, b) => a + b, 0) / weights.length;
    const weightStd = Math.sqrt(weights.map(w => Math.pow(w - weightMean, 2)).reduce((a, b) => a + b, 0) / weights.length);

    // Second pass: add calculated fields
    const enrichedData = validData.map(player => {
      const heightZScore = heightStd > 0 ? (player.height - heightMean) / heightStd : 0;
      const weightZScore = weightStd > 0 ? (player.weight - weightMean) / weightStd : 0;

      // Calculation_41447206859923456: Combine height and weight as a simple metric
      // Using height * weight / 100 as a reasonable composite metric
      const calculation = (player.height * player.weight) / 100;

      return {
        ...player,
        badHeight: heightZScore,  // Numeric z-score for height
        badWeight: weightZScore,  // Numeric z-score for weight
        calculation_41447206859923456: calculation  // Composite metric
      };
    });

    return enrichedData;
  } catch (error) {
    console.error('Error loading baseball data:', error);
    throw error;
  }
}

/**
 * Process raw data into chart-ready data points with calculated fields
 */
export function processPlayerData(players: BaseballPlayer[]): PlayerDataPoint[] {
  // Calculate statistics for outlier detection
  const heights = players.map(p => p.height);
  const weights = players.map(p => p.weight);

  const heightMean = heights.reduce((a, b) => a + b, 0) / heights.length;
  const heightStd = Math.sqrt(heights.map(h => Math.pow(h - heightMean, 2)).reduce((a, b) => a + b, 0) / heights.length);

  const weightMean = weights.reduce((a, b) => a + b, 0) / weights.length;
  const weightStd = Math.sqrt(weights.map(w => Math.pow(w - weightMean, 2)).reduce((a, b) => a + b, 0) / weights.length);

  // Define outliers as values beyond 2 standard deviations
  const heightThreshold = 2;
  const weightThreshold = 2;

  return players.map(player => {
    const heightZScore = heightStd > 0 ? (player.height - heightMean) / heightStd : 0;
    const weightZScore = weightStd > 0 ? (player.weight - weightMean) / weightStd : 0;

    return {
      name: player.name,
      handedness: player.handedness,
      height: player.height,
      weight: player.weight,
      avg: player.avg,
      hr: player.hr,
      heightWeightRatio: player.height > 0 ? player.weight / player.height : 0,
      isBadHeight: Math.abs(heightZScore) > heightThreshold,
      isBadWeight: Math.abs(weightZScore) > weightThreshold,
      badHeight: player.badHeight,  // Numeric z-score from loaded data
      badWeight: player.badWeight,  // Numeric z-score from loaded data
      calculation_41447206859923456: player.calculation_41447206859923456  // Composite metric
    };
  });
}

/**
 * Get unique handedness values
 */
export function getUniqueHandedness(players: BaseballPlayer[]): string[] {
  const handednessSet = new Set(players.map(p => p.handedness).filter(h => h));
  return Array.from(handednessSet).sort();
}

/**
 * Filter data by handedness
 */
export function filterByHandedness(data: PlayerDataPoint[], selectedHandedness: string[]): PlayerDataPoint[] {
  if (selectedHandedness.length === 0) return data;
  return data.filter(d => selectedHandedness.includes(d.handedness));
}

/**
 * Calculate average HR by height/weight ratio category
 */
export function calculateAvgHRByHeightWeight(
  data: PlayerDataPoint[]
): Array<{ category: string; value: number; name: string; handedness: string }> {
  // Group by player to get average HR per player
  const playerAvgHR = new Map<string, { value: number; name: string; handedness: string }>();

  data.forEach(d => {
    const key = `${d.height}-${d.weight}`;
    if (!playerAvgHR.has(key)) {
      playerAvgHR.set(key, {
        value: d.hr,
        name: d.name,
        handedness: d.handedness
      });
    }
  });

  // Convert to array and sort by HR descending
  return Array.from(playerAvgHR.values())
    .map(item => ({
      category: item.name,
      value: item.value,
      name: item.name,
      handedness: item.handedness
    }))
    .sort((a, b) => b.value - a.value);
}

/**
 * Get aggregated statistics for OverView
 */
export function getOverviewStats(data: PlayerDataPoint[]) {
  if (data.length === 0) {
    return {
      avgAvg: 0,
      avgHeight: 0,
      totalHR: 0,
      count: 0,
      avgHtWtRatio: 0
    };
  }

  return {
    avgAvg: data.reduce((sum, d) => sum + d.avg, 0) / data.length,
    avgHeight: data.reduce((sum, d) => sum + d.height, 0) / data.length,
    totalHR: data.reduce((sum, d) => sum + d.hr, 0),
    count: data.length,
    avgHtWtRatio: data.reduce((sum, d) => sum + d.heightWeightRatio, 0) / data.length
  };
}
