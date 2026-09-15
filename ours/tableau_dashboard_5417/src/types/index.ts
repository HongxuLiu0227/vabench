// Data types
export interface GameData {
  F1: number;
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
  // Tableau calculated fields (required by spec)
  Calculation_652740522679025665: number; // Total critics (positive + neutral + negative)
  Calculation_652740522680942595: number; // Total users (positive + neutral + negative)
  AdhocCluster: number; // Tableau clustering field
}

// Aggregated data for visualizations
export interface SentimentData {
  category: string;
  positive: number;
  neutral: number;
  negative: number;
  total: number;
}

export interface ScoreData {
  metascore: number;
  user_score: number;
  game: string;
  platform: string;
  genre: string;
  developer: string;
}

export interface TrendData {
  date: Date;
  avgMetascore: number;
  avgUserScore: number;
  count: number;
}

// Filter state
export interface FilterState {
  platforms: string[];
  genres: string[];
  ratings: string[];
  developers: string[];
  numberPlayers: string[];
}

// Selection/highlight state
export interface SelectionState {
  type: 'game' | 'platform' | 'genre' | 'developer' | 'numberPlayers' | null;
  values: Set<string>;
  autoClear: boolean;
}

// Worksheet types
export type WorksheetType =
  | 'dev_crit'
  | 'dev_meta'
  | 'dev_users'
  | 'game_crit'
  | 'game_meta'
  | 'game_users'
  | 'genre_crit'
  | 'genre_meta'
  | 'genre_users'
  | 'name_games'
  | 'numb_crit'
  | 'numb_meta'
  | 'numb_users'
  | 'plat_crit'
  | 'plat_meta'
  | 'plat_users';

// Dashboard types
export type DashboardType = 'dev' | 'game' | 'genre' | 'numb' | 'plat' | 'all';

// Zone layout
export interface Zone {
  x: number;
  y: number;
  w: number;
  h: number;
}
