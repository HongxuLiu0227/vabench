import { csvParse } from 'd3-dsv';
import type { GameData, PlatformMetrics, MetascoreByMonth } from '../types';

/**
 * Normalize CSV headers by removing excessive quotes and BOM
 * Handles dirty headers like """game""" or "game" -> game
 */
function normalizeHeaders(rawData: d3.DSVRowArray): d3.DSVRowArray {
  if (!rawData || !rawData.length) return rawData;

  // Get the first row to extract column names
  const firstRow = rawData[0];
  const columnMapping: { [key: string]: string } = {};
  const cleanColumns: string[] = [];

  // Build mapping from dirty header to clean header
  Object.keys(firstRow).forEach(dirtyHeader => {
    let cleanHeader = dirtyHeader;

    // Remove BOM (Byte Order Mark) if present
    cleanHeader = cleanHeader.replace(/^\uFEFF/, '');

    // Remove all variations of quotes:
    // 1. Triple quotes: """game""" -> game
    // 2. Double quotes: ""game"" -> game (if CSV parser already unescaped once)
    // 3. Single quotes: "game" -> game
    // The regex removes one or more quotes from start and end
    // Use a while loop to handle deeply nested quotes like """""game"""""
    let previousLength;
    do {
      previousLength = cleanHeader.length;
      cleanHeader = cleanHeader.replace(/^"+|"+$/g, '');
    } while (cleanHeader.length !== previousLength && (cleanHeader.startsWith('"') || cleanHeader.endsWith('"')));

    // Ensure F1 is always mapped correctly
    if (cleanHeader.toUpperCase() === 'F1' || dirtyHeader.toUpperCase().includes('F1')) {
      cleanHeader = 'F1';
    }

    columnMapping[dirtyHeader] = cleanHeader;
    cleanColumns.push(cleanHeader);
  });

  // Create new array with normalized keys
  const normalizedData = rawData.map(row => {
    const newRow: { [key: string]: string } = {};
    Object.keys(row).forEach(dirtyKey => {
      const cleanKey = columnMapping[dirtyKey] || dirtyKey;
      newRow[cleanKey] = row[dirtyKey];
    });
    return newRow;
  }) as d3.DSVRowArray;

  // Add the columns property that DSVRowArray expects
  normalizedData.columns = cleanColumns;

  return normalizedData;
}

/**
 * Validate that all required Tableau fields are present in the normalized data
 * @param normalizedData - The data with normalized headers
 * @throws Error if any required field is missing
 */
function validateRequiredFields(normalizedData: d3.DSVRowArray): void {
  // Required fields based on Tableau spec
  const requiredFields = [
    'game',
    'platform',
    'developer',
    'genre',
    'number_players',
    'rating',
    'release_date',
    'positive_critics',
    'neutral_critics',
    'negative_critics',
    'positive_users',
    'neutral_users',
    'negative_users',
    'metascore',
    'user_score'
  ];

  if (!normalizedData.columns || normalizedData.columns.length === 0) {
    throw new Error('No columns found in CSV data');
  }

  const availableColumns = normalizedData.columns.map(col => col.toLowerCase());
  const missingFields: string[] = [];

  requiredFields.forEach(field => {
    if (!availableColumns.includes(field.toLowerCase())) {
      missingFields.push(field);
    }
  });

  if (missingFields.length > 0) {
    throw new Error(
      `Missing required Tableau fields: ${missingFields.join(', ')}\n` +
      `Available columns: ${normalizedData.columns.join(', ')}`
    );
  }
}

/**
 * Find a field value in a row, trying various header formats
 * This provides fallback for different quote styles and BOM
 */
function getFieldValue(row: d3.DSVRowString, fieldName: string): string {
  // Helper to normalize a key for comparison
  const normalizeKey = (key: string): string => {
    return key
      .replace(/^\uFEFF/, '') // Remove BOM
      .replace(/^"+|"+$/g, '') // Remove quotes from edges
      .toLowerCase();
  };

  const targetFieldName = fieldName.toLowerCase();

  // Try exact match first
  if (row[fieldName] !== undefined) {
    return row[fieldName];
  }

  // Try with double quotes
  const quotedKey = `"${fieldName}"`;
  if (row[quotedKey] !== undefined) {
    return row[quotedKey];
  }

  // Try with triple quotes
  const tripleQuotedKey = `"""${fieldName}"""`;
  if (row[tripleQuotedKey] !== undefined) {
    return row[tripleQuotedKey];
  }

  // Try case-insensitive match with quote/BOM normalization
  const allKeys = Object.keys(row);
  const matchedKey = allKeys.find(k => {
    const normalized = normalizeKey(k);
    return normalized === targetFieldName;
  });

  return matchedKey ? row[matchedKey] : '';
}

// Parse CSV and convert to proper types
export async function loadGameData(): Promise<GameData[]> {
  const response = await fetch('/data/metacritic_games_clean.csv');
  if (!response.ok) {
    throw new Error(`Failed to load data: ${response.statusText}`);
  }
  const csvText = await response.text();

  // Parse CSV - d3-dsv will handle the outer quotes and unescape inner quotes
  const rawData = csvParse(csvText);

  // Normalize headers to remove excessive quotes
  const normalizedData = normalizeHeaders(rawData);

  // Validate that all required Tableau fields are present
  validateRequiredFields(normalizedData);

  return normalizedData.map((d: d3.DSVRowString, index: number) => {
    // Use getFieldValue for robust field access
    const positiveCritics = Number(getFieldValue(d, 'positive_critics')) || 0;
    const neutralCritics = Number(getFieldValue(d, 'neutral_critics')) || 0;
    const negativeCritics = Number(getFieldValue(d, 'negative_critics')) || 0;
    const positiveUsers = Number(getFieldValue(d, 'positive_users')) || 0;
    const neutralUsers = Number(getFieldValue(d, 'neutral_users')) || 0;
    const negativeUsers = Number(getFieldValue(d, 'negative_users')) || 0;

    return {
      id: index,
      game: getFieldValue(d, 'game'),
      platform: getFieldValue(d, 'platform'),
      developer: getFieldValue(d, 'developer'),
      genre: getFieldValue(d, 'genre'),
      number_players: getFieldValue(d, 'number_players'),
      rating: getFieldValue(d, 'rating'),
      release_date: new Date(getFieldValue(d, 'release_date')),
      positive_critics: positiveCritics,
      neutral_critics: neutralCritics,
      negative_critics: negativeCritics,
      positive_users: positiveUsers,
      neutral_users: neutralUsers,
      negative_users: negativeUsers,
      metascore: Number(getFieldValue(d, 'metascore')) || 0,
      user_score: Number(getFieldValue(d, 'user_score')) || 0,
      total_critics: positiveCritics + neutralCritics + negativeCritics,
      total_users: positiveUsers + neutralUsers + negativeUsers,
    };
  }).filter(game => {
    // Filter out rows with invalid data
    const validDate = game.release_date instanceof Date && !isNaN(game.release_date.getTime());
    const validYear = game.release_date.getFullYear() > 1900 && game.release_date.getFullYear() < 2100;
    return validDate && validYear && game.game && game.platform;
  });
}

// Aggregate metrics by platform for plat_crit
export function aggregatePlatformCritics(data: GameData[]): PlatformMetrics[] {
  const platformMap = new Map<string, PlatformMetrics>();

  data.forEach((game) => {
    // Skip invalid platforms
    if (!game.platform || game.platform.trim() === '') return;

    // Ensure numeric values are finite and non-negative
    const positive = isFinite(game.positive_critics) && game.positive_critics >= 0 ? game.positive_critics : 0;
    const neutral = isFinite(game.neutral_critics) && game.neutral_critics >= 0 ? game.neutral_critics : 0;
    const negative = isFinite(game.negative_critics) && game.negative_critics >= 0 ? game.negative_critics : 0;

    const existing = platformMap.get(game.platform);
    if (existing) {
      existing.positive_critics += positive;
      existing.neutral_critics += neutral;
      existing.negative_critics += negative;
      existing.total_critics += positive + neutral + negative;
    } else {
      platformMap.set(game.platform, {
        platform: game.platform,
        positive_critics: positive,
        neutral_critics: neutral,
        negative_critics: negative,
        total_critics: positive + neutral + negative,
        positive_users: 0,
        neutral_users: 0,
        negative_users: 0,
        total_users: 0,
      });
    }
  });

  // Filter out platforms with zero data and sort
  return Array.from(platformMap.values())
    .filter(p => p.total_critics > 0)
    .sort((a, b) => b.total_critics - a.total_critics);
}

// Aggregate metrics by platform for plat_users
export function aggregatePlatformUsers(data: GameData[]): PlatformMetrics[] {
  const platformMap = new Map<string, PlatformMetrics>();

  data.forEach((game) => {
    // Skip invalid platforms
    if (!game.platform || game.platform.trim() === '') return;

    // Ensure numeric values are finite and non-negative
    const positive = isFinite(game.positive_users) && game.positive_users >= 0 ? game.positive_users : 0;
    const neutral = isFinite(game.neutral_users) && game.neutral_users >= 0 ? game.neutral_users : 0;
    const negative = isFinite(game.negative_users) && game.negative_users >= 0 ? game.negative_users : 0;

    const existing = platformMap.get(game.platform);
    if (existing) {
      existing.positive_users += positive;
      existing.neutral_users += neutral;
      existing.negative_users += negative;
      existing.total_users += positive + neutral + negative;
    } else {
      platformMap.set(game.platform, {
        platform: game.platform,
        positive_critics: 0,
        neutral_critics: 0,
        negative_critics: 0,
        total_critics: 0,
        positive_users: positive,
        neutral_users: neutral,
        negative_users: negative,
        total_users: positive + neutral + negative,
      });
    }
  });

  // Filter out platforms with zero data and sort
  return Array.from(platformMap.values())
    .filter(p => p.total_users > 0)
    .sort((a, b) => b.total_users - a.total_users);
}

// Aggregate metascore by month for plat_meta
export function aggregateMetascoreByMonth(data: GameData[]): MetascoreByMonth[] {
  const monthMap = new Map<string, { sum: number; count: number }>();

  data.forEach((game) => {
    // Skip invalid dates
    if (!(game.release_date instanceof Date) || isNaN(game.release_date.getTime())) {
      return;
    }

    // Skip invalid metascores (must be finite and in valid range)
    if (!isFinite(game.metascore) || game.metascore < 0 || game.metascore > 100) {
      return;
    }

    const year = game.release_date.getFullYear();
    // Skip invalid years (prevent Jan 1970 issue)
    if (year < 1900 || year > 2100) {
      return;
    }

    const monthKey = `${year}-${String(game.release_date.getMonth() + 1).padStart(2, '0')}`;
    const existing = monthMap.get(monthKey);
    if (existing) {
      existing.sum += game.metascore;
      existing.count += 1;
    } else {
      monthMap.set(monthKey, { sum: game.metascore, count: 1 });
    }
  });

  const result = Array.from(monthMap.entries())
    .filter(([_, stats]) => stats.count > 0) // Only include months with data
    .map(([month, stats]) => ({
      month: new Date(month + '-01'),
      avgMetascore: stats.sum / stats.count,
      count: stats.count,
    }));

  return result.sort((a, b) => a.month.getTime() - b.month.getTime());
}

// Get unique platforms
export function getPlatforms(data: GameData[]): string[] {
  return Array.from(new Set(data.map((d) => d.platform)))
    .filter(p => p && p.trim() !== '') // Remove empty platforms
    .sort();
}

// Get unique games
export function getGames(data: GameData[]): string[] {
  return Array.from(new Set(data.map((d) => d.game)))
    .filter(g => g && g.trim() !== '') // Remove empty game names
    .sort();
}

// Filter data based on selected filters
export function filterData(data: GameData[], platforms: string[], games: string[]): GameData[] {
  if (!data || data.length === 0) return [];

  return data.filter((game) => {
    // Always filter out invalid games
    if (!game.game || !game.platform) return false;

    const platformMatch = platforms.length === 0 || platforms.includes(game.platform);
    const gameMatch = games.length === 0 || games.includes(game.game);
    return platformMatch && gameMatch;
  });
}
