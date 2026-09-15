import Papa from 'papaparse';
import type { GameData, SentimentData, ScoreData, TrendData, FilterState } from '../types';

/**
 * Normalize CSV headers by removing triple quotes and other artifacts
 * Converts: """F1""", """game""" -> F1, game
 */
const normalizeHeaderName = (header: string): string => {
  return header
    .replace(/^"""+|"""+$/g, '')  // Remove triple quotes at start/end
    .replace(/^"+|"+$/g, '')       // Remove any remaining quotes
    .trim();
};

/**
 * Detect and skip preamble rows before the actual CSV header
 * Returns the line number where the real header starts
 */
const detectHeaderRow = (lines: string[]): number => {
  const requiredFields = ['game', 'platform', 'metascore', 'user_score'];

  for (let i = 0; i < Math.min(lines.length, 10); i++) {
    const line = lines[i];
    // Skip empty lines
    if (!line.trim()) continue;

    // Parse the line to check for headers
    const fields = line.split(',').map(f => f.trim().replace(/^"+|"+$/g, ''));

    // Check if this line contains most of our required fields
    const matchCount = requiredFields.filter(field =>
      fields.some(f => f.toLowerCase() === field.toLowerCase())
    ).length;

    // If we found at least 3 required fields, this is likely the header
    if (matchCount >= 3) {
      return i;
    }
  }

  // Default to first line if no clear header found
  return 0;
};

/**
 * Pre-process CSV text to normalize headers
 * Handles CSV files that use triple quotes (""") as field delimiters
 */
const preprocessCSV = (csvText: string): string => {
  // Remove BOM if present
  if (csvText.charCodeAt(0) === 0xFEFF) {
    csvText = csvText.slice(1);
  }

  const lines = csvText.split('\n');
  const headerRowIdx = detectHeaderRow(lines);

  if (headerRowIdx >= lines.length) {
    throw new Error('Could not find valid header row in CSV');
  }

  const headerLine = lines[headerRowIdx];

  // Special handling for triple-quoted CSV format
  // If the line starts with """, we need to replace """ with " throughout
  if (headerLine.includes('"""')) {
    // Replace all """ with " to convert to standard CSV format
    const normalizedLines = lines.slice(headerRowIdx).map(line => {
      return line.replace(/"""/g, '"');
    });

    return normalizedLines.join('\n');
  }

  // Standard CSV processing
  const normalizedHeader = headerLine.split(',')
    .map(field => {
      const normalized = normalizeHeaderName(field);
      return normalized ? `"${normalized}"` : field;
    })
    .join(',');

  lines[headerRowIdx] = normalizedHeader;

  // Return data starting from header row
  return lines.slice(headerRowIdx).join('\n');
};

// Parse CSV data
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const parseGameData = (rawData: any[]): GameData[] => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return rawData.map((row: any, index: number) => {
    try {
      // Extract base fields with proper normalization
      const positiveCritics = Number(row['positive_critics'] || 0);
      const neutralCritics = Number(row['neutral_critics'] || 0);
      const negativeCritics = Number(row['negative_critics'] || 0);
      const positiveUsers = Number(row['positive_users'] || 0);
      const neutralUsers = Number(row['neutral_users'] || 0);
      const negativeUsers = Number(row['negative_users'] || 0);

      return {
        F1: Number(row['F1'] || 0),
        game: String(row['game'] || '').trim(),
        platform: String(row['platform'] || '').trim(),
        developer: String(row['developer'] || '').trim(),
        genre: String(row['genre'] || '').trim(),
        number_players: String(row['number_players'] || '').trim(),
        rating: String(row['rating'] || '').trim(),
        release_date: new Date(String(row['release_date'] || '')),
        positive_critics: positiveCritics,
        neutral_critics: neutralCritics,
        negative_critics: negativeCritics,
        positive_users: positiveUsers,
        neutral_users: neutralUsers,
        negative_users: negativeUsers,
        metascore: Number(row['metascore'] || 0),
        user_score: Number(row['user_score'] || 0),
        // Tableau calculated fields - these are required by the spec
        // Calculation_652740522679025665: Total critics count
        Calculation_652740522679025665: positiveCritics + neutralCritics + negativeCritics,
        // Calculation_652740522680942595: Total users count
        Calculation_652740522680942595: positiveUsers + neutralUsers + negativeUsers,
        // AdhocCluster: Tableau clustering field (default to 0)
        AdhocCluster: 0,
      };
    } catch (error) {
      console.warn(`Failed to parse row ${index}:`, error, row);
      return null;
    }
  }).filter((d): d is GameData => d !== null && Boolean(d.game) && Boolean(d.platform));
};

// Load CSV data
export const loadData = async (): Promise<GameData[]> => {
  try {
    const response = await fetch('/data/metacritic_games_clean.csv');
    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.status}`);
    }

    const csvText = await response.text();

    // Pre-process CSV to normalize headers and skip preamble rows
    const processedCSV = preprocessCSV(csvText);

    return new Promise((resolve, reject) => {
      Papa.parse(processedCSV, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: false,  // We'll handle type conversion ourselves
        complete: (results) => {
          try {
            // Validate that we got data
            if (!results.data || results.data.length === 0) {
              throw new Error('No data parsed from CSV');
            }

            const gameData = parseGameData(results.data);

            if (gameData.length === 0) {
              throw new Error('No valid game records found after parsing');
            }

            console.log(`Successfully loaded ${gameData.length} game records`);
            resolve(gameData);
          } catch (error) {
            reject(error);
          }
        },
        error: (_error: Error) => {
          reject(_error);
        }
      });
    });
  } catch (error) {
    console.error('Error loading data:', error);
    throw error;
  }
};

// Apply filters to data
export const applyFilters = (data: GameData[], filters: FilterState): GameData[] => {
  return data.filter(row => {
    if (filters.platforms.length > 0 && !filters.platforms.includes(row.platform)) {
      return false;
    }
    if (filters.genres.length > 0 && !filters.genres.includes(row.genre)) {
      return false;
    }
    if (filters.ratings.length > 0 && !filters.ratings.includes(row.rating)) {
      return false;
    }
    if (filters.developers.length > 0 && !filters.developers.includes(row.developer)) {
      return false;
    }
    if (filters.numberPlayers.length > 0 && !filters.numberPlayers.includes(row.number_players)) {
      return false;
    }
    return true;
  });
};

// Get unique values for filters
export const getUniqueValues = (data: GameData[]) => {
  return {
    platforms: [...new Set(data.map(d => d.platform))].sort(),
    genres: [...new Set(data.map(d => d.genre))].sort(),
    ratings: [...new Set(data.map(d => d.rating))].sort(),
    developers: [...new Set(data.map(d => d.developer))].sort(),
    numberPlayers: [...new Set(data.map(d => d.number_players))].sort(),
  };
};

// Aggregate sentiment data by category
export const aggregateSentimentData = (
  data: GameData[],
  categoryKey: keyof GameData
): SentimentData[] => {
  const grouped = new Map<string, SentimentData>();

  data.forEach(row => {
    const category = String(row[categoryKey]);
    if (!grouped.has(category)) {
      grouped.set(category, {
        category,
        positive: 0,
        neutral: 0,
        negative: 0,
        total: 0,
      });
    }

    const item = grouped.get(category)!;
    item.positive += row.positive_critics;
    item.neutral += row.neutral_critics;
    item.negative += row.negative_critics;
    item.total += row.positive_critics + row.neutral_critics + row.negative_critics;
  });

  return Array.from(grouped.values()).sort((a, b) => b.total - a.total);
};

// Aggregate user sentiment data by category
export const aggregateUserSentimentData = (
  data: GameData[],
  categoryKey: keyof GameData
): SentimentData[] => {
  const grouped = new Map<string, SentimentData>();

  data.forEach(row => {
    const category = String(row[categoryKey]);
    if (!grouped.has(category)) {
      grouped.set(category, {
        category,
        positive: 0,
        neutral: 0,
        negative: 0,
        total: 0,
      });
    }

    const item = grouped.get(category)!;
    item.positive += row.positive_users;
    item.neutral += row.neutral_users;
    item.negative += row.negative_users;
    item.total += row.positive_users + row.neutral_users + row.negative_users;
  });

  return Array.from(grouped.values()).sort((a, b) => b.total - a.total);
};

// Get score scatter plot data
export const getScoreData = (data: GameData[]): ScoreData[] => {
  return data.map(row => ({
    metascore: row.metascore,
    user_score: row.user_score,
    game: row.game,
    platform: row.platform,
    genre: row.genre,
    developer: row.developer,
  })).filter(d => d.metascore > 0 && d.user_score > 0);
};

// Get trend data over time
export const getTrendData = (data: GameData[]): TrendData[] => {
  const grouped = new Map<string, TrendData>();

  data.forEach(row => {
    const dateKey = new Date(Date.UTC(row.release_date.getFullYear(), row.release_date.getMonth(), 1));
    const key = dateKey.toISOString();

    if (!grouped.has(key)) {
      grouped.set(key, {
        date: dateKey,
        avgMetascore: 0,
        avgUserScore: 0,
        count: 0,
      });
    }

    const item = grouped.get(key)!;
    item.avgMetascore += row.metascore;
    item.avgUserScore += row.user_score;
    item.count += 1;
  });

  return Array.from(grouped.values())
    .map(item => ({
      ...item,
      avgMetascore: item.avgMetascore / item.count,
      avgUserScore: item.avgUserScore / item.count,
    }))
    .sort((a, b) => a.date.getTime() - b.date.getTime());
};

// Get top N items by a measure
export const getTopItems = <T extends GameData>(
  data: T[],
  measureKey: keyof T,
  n: number
): T[] => {
  return [...data]
    .sort((a, b) => Number(b[measureKey]) - Number(a[measureKey]))
    .slice(0, n);
};
