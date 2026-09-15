import * as d3 from 'd3-dsv';
import type { GameData, CriticMetrics, UserMetrics, MetascoreTimeSeries } from '../types/data';

/**
 * Normalize CSV headers by removing extra quotes
 * Handles cases like """F1""" -> F1
 */
function normalizeHeader(header: string): string {
  // Remove BOM if present
  let cleaned = header.replace(/^\uFEFF/, '');
  // Handle triple-quoted headers like """F1""" or """"game""""
  // First, unescape double quotes within the field
  cleaned = cleaned.replace(/""/g, '"');
  // Then remove surrounding quotes (handles "field", ""field"", """field""", etc.)
  cleaned = cleaned.replace(/^"+|"+$/g, '');
  return cleaned.trim();
}

/**
 * Parse CSV with robust header normalization
 * Handles quoted/dirty headers and skips preamble rows if needed
 */
function parseCSVWithNormalization(csvText: string): d3.DSVRowArray {
  const lines = csvText.split(/\r?\n/).filter(line => line.trim());

  if (lines.length === 0) {
    throw new Error('CSV file is empty');
  }

  // Find the actual header row (skip preamble if needed)
  // The real header should contain known field names
  const knownFields = ['game', 'platform', 'developer', 'genre', 'number_players'];
  let headerRowIndex = 0;

  for (let i = 0; i < Math.min(10, lines.length); i++) {
    // Parse this row to check headers
    const parsed = d3.csvParse(lines[i]);
    if (parsed.columns.length > 0) {
      const normalizedHeaders = parsed.columns.map(h => normalizeHeader(h));
      const hasKnownFields = knownFields.some(field =>
        normalizedHeaders.some(h => h.toLowerCase().includes(field.toLowerCase()))
      );
      if (hasKnownFields) {
        headerRowIndex = i;
        break;
      }
    }
  }

  // Extract data starting from header row
  const dataLines = lines.slice(headerRowIndex);

  // Join and parse with d3
  const csvContent = dataLines.join('\n');
  const parsedData = d3.csvParse(csvContent);

  // Normalize all column names in the parsed data
  const normalizedData = parsedData.map((row) => {
    const newRow: { [key: string]: string } = {};
    parsedData.columns.forEach((col) => {
      const normalizedKey = normalizeHeader(col);
      newRow[normalizedKey] = row[col] || '';
    });
    return newRow;
  });

  // Update columns to normalized names
  (normalizedData as any).columns = parsedData.columns.map(normalizeHeader);

  return normalizedData as any;
}

/**
 * Load and parse the metacritic games CSV data
 */
export async function loadGameData(): Promise<GameData[]> {
  const response = await fetch('/data/metacritic_games_clean.csv');
  if (!response.ok) {
    throw new Error(`Failed to load data: ${response.status} ${response.statusText}`);
  }

  const csvText = await response.text();
  const parsedData = parseCSVWithNormalization(csvText);

  return parsedData.map((row: d3.DSVRowString) => {
    // Get value from row, trying both normalized and original header formats
    const getFieldValue = (fieldName: string): string => {
      return String(row[fieldName] || row[`"""${fieldName}"""`] || '').trim();
    };

    const getNumberValue = (fieldName: string): number => {
      const val = row[fieldName] !== undefined ? row[fieldName] : row[`"""${fieldName}"""`];
      const num = Number(val);
      return isNaN(num) ? 0 : num;
    };

    const positive_critics = getNumberValue('positive_critics');
    const neutral_critics = getNumberValue('neutral_critics');
    const negative_critics = getNumberValue('negative_critics');
    const positive_users = getNumberValue('positive_users');
    const neutral_users = getNumberValue('neutral_users');
    const negative_users = getNumberValue('negative_users');

    const total_critics = positive_critics + neutral_critics + negative_critics;
    const total_users = positive_users + neutral_users + negative_users;

    return {
      F1: getNumberValue('F1'),
      game: getFieldValue('game'),
      platform: getFieldValue('platform'),
      developer: getFieldValue('developer'),
      genre: getFieldValue('genre'),
      number_players: getFieldValue('number_players'),
      rating: getFieldValue('rating'),
      release_date: getFieldValue('release_date'),
      positive_critics,
      neutral_critics,
      negative_critics,
      positive_users,
      neutral_users,
      negative_users,
      metascore: getNumberValue('metascore'),
      user_score: getNumberValue('user_score'),
      // Calculated fields required by Tableau spec (Calculation_652740522679025665 and Calculation_652740522680942595)
      total_critics,
      total_users,
      // Add aliases for Tableau calculated field references
      Calculation_652740522679025665: total_critics,
      Calculation_652740522680942595: total_users,
    };
  });
}

/**
 * Aggregate critic metrics by number_players category
 */
export function aggregateCriticMetrics(data: GameData[]): CriticMetrics[] {
  const grouped = new Map<string, CriticMetrics>();

  data.forEach((game) => {
    const key = game.number_players;
    if (!grouped.has(key)) {
      grouped.set(key, {
        number_players: key,
        positive_critics: 0,
        neutral_critics: 0,
        negative_critics: 0,
        total_critics: 0,
      });
    }
    const metrics = grouped.get(key)!;
    metrics.positive_critics += game.positive_critics;
    metrics.neutral_critics += game.neutral_critics;
    metrics.negative_critics += game.negative_critics;
    metrics.total_critics += game.positive_critics + game.neutral_critics + game.negative_critics;
  });

  return Array.from(grouped.values()).sort((a, b) => a.number_players.localeCompare(b.number_players));
}

/**
 * Aggregate user metrics by number_players category
 */
export function aggregateUserMetrics(data: GameData[]): UserMetrics[] {
  const grouped = new Map<string, UserMetrics>();

  data.forEach((game) => {
    const key = game.number_players;
    if (!grouped.has(key)) {
      grouped.set(key, {
        number_players: key,
        positive_users: 0,
        neutral_users: 0,
        negative_users: 0,
        total_users: 0,
      });
    }
    const metrics = grouped.get(key)!;
    metrics.positive_users += game.positive_users;
    metrics.neutral_users += game.neutral_users;
    metrics.negative_users += game.negative_users;
    metrics.total_users += game.positive_users + game.neutral_users + game.negative_users;
  });

  return Array.from(grouped.values()).sort((a, b) => a.number_players.localeCompare(b.number_players));
}

/**
 * Aggregate metascore by month for time series chart
 */
export function aggregateMetascoreByMonth(data: GameData[]): MetascoreTimeSeries[] {
  const grouped = new Map<string, { sum: number; count: number }>();

  data.forEach((game) => {
    const date = new Date(game.release_date);
    if (isNaN(date.getTime())) return;

    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    if (!grouped.has(monthKey)) {
      grouped.set(monthKey, { sum: 0, count: 0 });
    }
    const entry = grouped.get(monthKey)!;
    entry.sum += game.metascore;
    entry.count += 1;
  });

  const result: MetascoreTimeSeries[] = Array.from(grouped.entries())
    .map(([month, { sum, count }]) => ({
      month,
      avg_metascore: count > 0 ? sum / count : 0,
      count,
    }))
    .sort((a, b) => a.month.localeCompare(b.month));

  return result;
}

/**
 * Filter data based on selection state
 */
export function filterDataBySelection(data: GameData[], selection: {
  game?: string;
  platform?: string;
  genre?: string;
  developer?: string;
  number_players?: string;
}): GameData[] {
  return data.filter((game) => {
    if (selection.game && game.game !== selection.game) return false;
    if (selection.platform && game.platform !== selection.platform) return false;
    if (selection.genre && game.genre !== selection.genre) return false;
    if (selection.developer && game.developer !== selection.developer) return false;
    if (selection.number_players && game.number_players !== selection.number_players) return false;
    return true;
  });
}
