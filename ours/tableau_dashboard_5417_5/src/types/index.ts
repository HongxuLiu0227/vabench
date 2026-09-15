/**
 * Note: The source CSV may have dirty/triple-quoted headers like """game""".
 * The dataService normalizes these to clean column names before mapping to GameData.
 * Expected clean column names after normalization:
 * - F1, game, platform, developer, genre, number_players, rating, release_date,
 * - positive_critics, neutral_critics, negative_critics,
 * - positive_users, neutral_users, negative_users,
 * - metascore, user_score
 */

// Raw CSV data interface (after normalization)
export interface GameDataRaw {
  F1: string;
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
}

// Processed game data
export interface GameData {
  id: number;
  game: string;
  platform: string;
  developer: string;
  genre: string;
  number_players: string;
  rating: string;
  release_date: Date;
  positive_critics: number;
  neutral_critics: number;
  negative_critics: number;
  positive_users: number;
  neutral_users: number;
  negative_users: number;
  metascore: number;
  user_score: number;
  total_critics: number;
  total_users: number;
}

// Aggregated data for plat_crit and plat_users
export interface PlatformMetrics {
  platform: string;
  positive_critics: number;
  neutral_critics: number;
  negative_critics: number;
  total_critics: number;
  positive_users: number;
  neutral_users: number;
  negative_users: number;
  total_users: number;
}

// Time series data for plat_meta
export interface MetascoreByMonth {
  month: Date;
  avgMetascore: number;
  count: number;
}

// Filter state
export interface FilterState {
  platforms: string[];
  games: string[];
  selectedGame: string | null;
}
