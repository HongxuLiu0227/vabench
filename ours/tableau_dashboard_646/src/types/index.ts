// Data types for the video games sales dashboard
export interface GameData {
  Rank: number;
  Name: string;
  Platform: string;
  Year: number;
  Genre: string;
  Publisher: string;
  NA_Sales: number;
  EU_Sales: number;
  JP_Sales: number;
  Other_Sales: number;
  Global_Sales: number;
  Averaged_Sales: number;
}

// Filter state types
export interface FilterState {
  selectedGenres: string[];
  selectedPublishers: string[];
  selectedPlatforms: string[];
  selectedYears: number[];
  highlightGenre: string | null;
}

// Aggregated data types
export interface GenreSalesData {
  genre: string;
  avgGlobalSales: number;
  count: number;
}

export interface YearGenreSalesData {
  year: number;
  genre: string;
  globalSales: number;
}

export interface PublisherSalesData {
  publisher: string;
  avgGlobalSales: number;
  platforms: string[];
  count: number;
}

export interface GenrePieData {
  genre: string;
  globalSales: number;
}

// Color palettes
export const GENRE_PALETTE: Record<string, string> = {
  'Action': '#1170aa',
  'Sports': '#1170aa',
  'Misc': '#57606c',
  'Platform': '#5fa2ce',
  'Racing': '#7b848f',
  'Fighting': '#a3acb9',
  'Role-Playing': '#a3cce9',
  'Puzzle': '#c85200',
  'Simulation': '#c8d0d9',
  'Adventure': '#fc7d0b',
  'Strategy': '#fc7d0b',
  'Shooter': '#ffbc79',
};

export const PUBLISHER_PALETTE: Record<string, string> = {
  'Nintendo': '#ffbe7d',
  'Electronic Arts': '#e15759',
  'Sony Computer Entertainment': '#76b7b2',
  'Activision': '#59a14f',
  'Take-Two Interactive': '#edc948',
  'Ubisoft': '#b07aa1',
  'Microsoft Game Studios': '#ff9da7',
  'Konami Digital Entertainment': '#9c755f',
  'THQ': '#bab0ac',
  'Sega': '#d37295',
};

// Dashboard text zones
export interface DashboardTextZone {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  text: string;
}
