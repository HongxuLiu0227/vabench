/**
 * Mapping constants for converting data codes to human-readable labels
 */

export const ACCIDENT_SEVERITY_MAP: Record<string, string> = {
  '1': 'Fatal',
  '2': 'Serious',
  '3': 'Slight'
};

export const DAY_OF_WEEK_MAP: Record<string, string> = {
  '1': 'Sunday',
  '2': 'Monday',
  '3': 'Tuesday',
  '4': 'Wednesday',
  '5': 'Thursday',
  '6': 'Friday',
  '7': 'Saturday'
};

export const LIGHT_CONDITIONS_MAP: Record<string, string> = {
  '1': 'Daylight',
  '4': 'Darkness - lights lit',
  '5': 'Darkness - light unlit',
  '6': 'Darkness - No lighting',
  '7': 'Darkness - Lighting Unknown'
};

export const WEATHER_CONDITIONS_MAP: Record<string, string> = {
  '1': 'Fine no high winds',
  '2': 'Raining no high winds',
  '3': 'Snowing no high winds',
  '4': 'Fine + high winds',
  '5': 'Raining + high winds',
  '6': 'Snowing + high winds',
  '7': 'Fog or mist',
  '8': 'Other',
  '9': 'Unknown'
};

export const ROAD_SURFACE_CONDITIONS_MAP: Record<string, string> = {
  '1': 'Dry',
  '2': 'Wet or damp',
  '3': 'Snow',
  '4': 'Frost or ice',
  '5': 'Flood over 3cm deep',
  '6': 'Oil or diesel',
  '7': 'Mud'
};

export const URBAN_RURAL_MAP: Record<string, string> = {
  '1': 'Urban',
  '2': 'Rural',
  '3': 'Unallocated'
};

// Color palettes for charts
export const LIGHT_CONDITIONS_COLORS: Record<string, string> = {
  'Daylight': '#4e79a7',
  'Darkness - lights lit': '#f28e2b',
  'Darkness - light unlit': '#e15759',
  'Darkness - No lighting': '#76b7b2',
  'Darkness - Lighting Unknown': '#59a14f'
};

export const SPEED_LIMIT_COLORS: Record<string, string> = {
  '20': '#4e79a7',
  '30': '#f28e2b',
  '40': '#e15759',
  '50': '#76b7b2',
  '60': '#59a14f',
  '70': '#edc948',
  '-1': '#bab0ac'
};

export const WEATHER_CONDITIONS_COLORS: Record<string, string> = {
  'Fine no high winds': '#4e79a7',
  'Raining no high winds': '#f28e2b',
  'Snowing no high winds': '#e15759',
  'Fine + high winds': '#76b7b2',
  'Raining + high winds': '#59a14f',
  'Snowing + high winds': '#edc948',
  'Fog or mist': '#af7aa1',
  'Other': '#ff9da7',
  'Unknown': '#bab0ac'
};

// Default color for bars without series encoding
export const DEFAULT_BAR_COLOR = '#6baed6';
