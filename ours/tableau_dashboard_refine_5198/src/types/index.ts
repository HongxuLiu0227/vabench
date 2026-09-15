// Type definitions for the tweet classification data
export interface TweetData {
  '': number;
  id: number;
  created_at: string;
  name: string;
  followers_count: number;
  favorite_count: number;
  retweet_count: number;
  flag: 'Kirchner' | 'Macri' | 'Lavagna';
  full_text: string;
  label: 'error' | 'positive' | 'neutral' | 'negative';
}

// Aggregated data types
export interface AggregatedByCategory<T> {
  category: T;
  value: number;
  label?: string;
  flag?: string;
  name?: string;
  full_text?: string;
}

// Color palettes from Tableau spec
export const LABEL_COLORS: Record<string, string> = {
  error: '#4e79a7',
  positive: '#76b7b2',
  negative: '#e15759',
  neutral: '#edc948',
};

export const FLAG_COLORS: Record<string, string> = {
  Kirchner: '#4e79a7',
  Macri: '#e15759',
  Lavagna: '#edc948',
};

// Highlight state for interactions
export interface HighlightState {
  enabled: boolean;
  name?: string;
  label?: string;
  flag?: string;
  full_text?: string;
}

// Filter state
export interface FilterState {
  flag?: string[];
  label?: string[];
  name?: string[];
}

// Time-based data
export interface TimeData {
  hour: number;
  minute: number;
  count: number;
  label?: string;
  flag?: string;
}
