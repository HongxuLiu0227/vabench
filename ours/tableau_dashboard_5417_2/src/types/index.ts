/**
 * Game data type matching the CSV structure
 * Note: The CSV has triple-quoted headers like """game""", """platform""", etc.
 * This interface uses index signature to handle the raw headers before normalization.
 */
export interface GameData {
  [key: string]: string | undefined;
}

/**
 * Parsed game data with numeric values
 */
export interface ParsedGameData {
  id: string;
  game: string;
  platform: string;
  developer: string;
  genre: string;
  number_players: string;
  rating: string;
  releaseDate: Date;
  releaseMonth: string;
  positiveCritics: number;
  neutralCritics: number;
  negativeCritics: number;
  totalCritics: number;
  positiveUsers: number;
  neutralUsers: number;
  negativeUsers: number;
  totalUsers: number;
  metascore: number;
  userScore: number;
  // Tableau calculated fields
  Calculation_652740522679025665: number; // Positive critic percentage
  Calculation_652740522680942595: number; // Positive user percentage
}

/**
 * Aggregated metrics by game for table views
 */
export interface GameMetrics {
  game: string;
  positiveCritics: number;
  neutralCritics: number;
  negativeCritics: number;
  totalCritics: number;
  positiveUsers: number;
  neutralUsers: number;
  negativeUsers: number;
  totalUsers: number;
  metascore: number;
  userScore: number;
  platform: string;
  releaseDate: Date;
  // Tableau calculated fields
  Calculation_652740522679025665: number; // Positive critic percentage
  Calculation_652740522680942595: number; // Positive user percentage
}

/**
 * Time series data point for the line chart
 */
export interface TimeSeriesPoint {
  month: string;
  monthLabel: string;
  avgMetascore: number;
  games: string[];
}

/**
 * Selection state for filtering
 */
export interface SelectionState {
  games: Set<string>;
  platforms: Set<string>;
  genres: Set<string>;
}

/**
 * Filter context type
 */
export interface FilterContextType {
  selection: SelectionState;
  setSelection: (selection: SelectionState) => void;
  clearSelection: () => void;
  isSelected: (game: string, platform?: string) => boolean;
  toggleGame: (game: string) => void;
  togglePlatform: (platform: string) => void;
}

/**
 * Worksheet props
 */
export interface WorksheetProps {
  data: ParsedGameData[];
  filteredData: ParsedGameData[];
  onGameSelect?: (game: string) => void;
  onPlatformSelect?: (platform: string) => void;
  isSelected?: (game: string, platform?: string) => boolean;
}
