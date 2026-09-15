/**
 * Game data interface matching the metacritic_games_clean.csv structure
 * Includes field mappings for Tableau spec compatibility
 */
export interface GameData {
  F1: number;
  game: string;
  platform: string;
  developer: string;
  genre: string;
  number_players: string;
  rating: string;
  release_date: string;
  positive_critics: number;
  neutral_critics: number;
  negative_critics: number;
  positive_users: number;
  neutral_users: number;
  negative_users: number;
  metascore: number;
  user_score: number;
  // Calculated fields required by Tableau spec
  total_critics: number;
  total_users: number;
  // Aliases for Tableau calculated field references
  Calculation_652740522679025665?: number;  // Maps to total_critics
  Calculation_652740522680942595?: number;  // Maps to total_users
}

/**
 * Aggregated metrics for critics by number_players category
 * Matches Tableau measure: sum:Calculation_652740522679025665:qk (total_critics)
 */
export interface CriticMetrics {
  number_players: string;
  positive_critics: number;
  neutral_critics: number;
  negative_critics: number;
  total_critics: number;  // Maps to Calculation_652740522679025665
}

/**
 * Aggregated metrics for users by number_players category
 * Matches Tableau measure: sum:Calculation_652740522680942595:qk (total_users)
 */
export interface UserMetrics {
  number_players: string;
  positive_users: number;
  neutral_users: number;
  negative_users: number;
  total_users: number;  // Maps to Calculation_652740522680942595
}

/**
 * Time series data for metascore over time
 */
export interface MetascoreTimeSeries {
  month: string;
  avg_metascore: number;
  count: number;
}

/**
 * Selection state for interactions
 */
export interface SelectionState {
  game?: string;
  platform?: string;
  genre?: string;
  developer?: string;
  number_players?: string;
  adhocCluster?: string;
  positive_critics?: number;
  clear: boolean;
}

/**
 * Highlight state for worksheet interactions
 */
export interface HighlightState {
  worksheet: string;
  selections: Set<string>;
  field: string;
}
