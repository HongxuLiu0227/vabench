import Papa from 'papaparse';
import type { GameData, ParsedGameData } from '../types';

const DATA_URL = '/data/metacritic_games_clean.csv';

/**
 * Load and parse CSV data from the public/data directory
 */
export async function loadGameData(): Promise<ParsedGameData[]> {
  try {
    const response = await fetch(DATA_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
    }

    let csvText = await response.text();

    // Remove UTF-8 BOM if present at the start of the file
    if (csvText.charCodeAt(0) === 0xFEFF) {
      csvText = csvText.slice(1);
    }

    return new Promise((resolve, reject) => {
      Papa.parse<GameData>(csvText, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header: string) => {
          // Normalize headers by:
          // 1. Removing UTF-8 BOM if present in the header itself
          // 2. Stripping excessive quotes (e.g., """field_name""" -> field_name)
          // 3. Trimming whitespace
          let normalized = header.replace(/^\uFEFF/, '');
          normalized = normalized.replace(/^"+|"+$/g, '').trim();
          return normalized;
        },
        complete: (results) => {
          try {
            const parsedData = results.data.map(parseGameRow).filter(Boolean) as ParsedGameData[];
            resolve(parsedData);
          } catch (error) {
            reject(error);
          }
        },
        error: (error: Error) => {
          reject(new Error(`CSV parsing error: ${error.message}`));
        }
      });
    });
  } catch (error) {
    console.error('Error loading game data:', error);
    throw error;
  }
}

/**
 * Cleaned row type after removing quotes
 */
interface CleanedRow {
  F1?: string;
  game: string;
  platform: string;
  developer: string;
  genre: string;
  number_players: string;
  rating: string;
  release_date: string;
  positive_critics: string;
  neutral_critics: string;
  negative_critics: string;
  positive_users: string;
  neutral_users: string;
  negative_users: string;
  metascore: string;
  user_score: string;
  [key: string]: string | undefined;
}

/**
 * Normalize CSV headers and values by removing excessive wrapping quotes
 * Handles cases like """field_name""" by stripping ALL leading/trailing quotes
 */
function normalizeQuotes(str: string): string {
  if (!str) return str;
  // Remove one or more quotes from the start and end
  return str.replace(/^"+|"+$/g, '');
}

/**
 * Parse a single game row from CSV to structured data
 * Note: Headers are already normalized by transformHeader during parsing
 */
function parseGameRow(row: GameData): ParsedGameData | null {
  try {
    // Headers are already normalized by transformHeader, just clean the values
    const cleanRow = Object.fromEntries(
      Object.entries(row).map(([key, value]) => [
        key,
        value ? normalizeQuotes(value) : ''
      ])
    ) as CleanedRow;

    const releaseDate = new Date(cleanRow.release_date);
    if (isNaN(releaseDate.getTime())) {
      return null;
    }

    // Parse numeric fields explicitly to prevent string concatenation
    const positiveCritics = Number(cleanRow.positive_critics) || 0;
    const neutralCritics = Number(cleanRow.neutral_critics) || 0;
    const negativeCritics = Number(cleanRow.negative_critics) || 0;
    const positiveUsers = Number(cleanRow.positive_users) || 0;
    const neutralUsers = Number(cleanRow.neutral_users) || 0;
    const negativeUsers = Number(cleanRow.negative_users) || 0;
    const metascore = Number(cleanRow.metascore) || 0;
    const userScore = Number(cleanRow.user_score) || 0;

    // Create month key for aggregation (YYYY-MM format)
    const releaseMonth = `${releaseDate.getFullYear()}-${String(releaseDate.getMonth() + 1).padStart(2, '0')}`;

    // Calculate derived metrics for Tableau compatibility
    const totalCritics = positiveCritics + neutralCritics + negativeCritics;
    const totalUsers = positiveUsers + neutralUsers + negativeUsers;

    return {
      id: cleanRow.F1 || cleanRow.game + '_' + cleanRow.platform,
      game: cleanRow.game,
      platform: cleanRow.platform,
      developer: cleanRow.developer,
      genre: cleanRow.genre,
      number_players: cleanRow.number_players,
      rating: cleanRow.rating,
      releaseDate,
      releaseMonth,
      positiveCritics,
      neutralCritics,
      negativeCritics,
      totalCritics,
      positiveUsers,
      neutralUsers,
      negativeUsers,
      totalUsers,
      metascore,
      userScore,
      // Tableau calculated fields (percentage of positive reviews)
      Calculation_652740522679025665: totalCritics > 0 ? (positiveCritics / totalCritics) * 100 : 0,
      Calculation_652740522680942595: totalUsers > 0 ? (positiveUsers / totalUsers) * 100 : 0
    };
  } catch (error) {
    console.error('Error parsing row:', error, row);
    return null;
  }
}

/**
 * Cache the loaded data to avoid re-fetching
 */
let cachedData: ParsedGameData[] | null = null;

/**
 * Get game data with caching
 */
export async function getGameData(): Promise<ParsedGameData[]> {
  if (cachedData) {
    return cachedData;
  }
  cachedData = await loadGameData();
  return cachedData;
}
