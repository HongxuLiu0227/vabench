/**
 * Data types for the Road Safety Accidents dataset
 */

export interface AccidentRecord {
  Accident_Index: string | number;
  Location_Easting_OSGR: number;
  Location_Northing_OSGR: number;
  Longitude: number;
  Latitude: number;
  Police_Force: number;
  Accident_Severity: number;
  Number_of_Vehicles: number;
  Number_of_Casualties: number;
  Date: string;
  Day_of_Week: number;
  Time: string;
  'Local_Authority_(District)': number;
  'Local_Authority_(Highway)': string;
  '1st_Road_Class': number;
  '1st_Road_Number': number;
  Road_Type: number;
  Speed_limit: number;
  Junction_Detail: number;
  Junction_Control: number;
  '2nd_Road_Class': number;
  '2nd_Road_Number': number;
  'Pedestrian_Crossing-Human_Control': number;
  'Pedestrian_Crossing-Physical_Facilities': number;
  Light_Conditions: number;
  Weather_Conditions: number;
  Road_Surface_Conditions: number;
  Special_Conditions_at_Site: number;
  Carriageway_Hazards: number;
  Urban_or_Rural_Area: number;
  Did_Police_Officer_Attend_Scene_of_Accident: number;
  LSOA_of_Accident_Location: string;
  'Sex Of Casualty'?: number;
}

// Mapped value types
export type WeatherCondition =
  | 'Fine no high winds'
  | 'Raining no high winds'
  | 'Snowing no high winds'
  | 'Fine + high winds'
  | 'Raining + high winds'
  | 'Snowing + high winds'
  | 'Fog or mist'
  | 'Other'
  | 'Unknown';

export type RoadSurfaceCondition =
  | 'Dry'
  | 'Wet or damp'
  | 'Snow'
  | 'Frost or ice'
  | 'Flood over 3cm deep'
  | 'Oil or diesel'
  | 'Mud'
  | 'Unknown';

export type LightCondition =
  | 'Daylight'
  | 'Darkness - lights lit'
  | 'Darkness - lights unlit'
  | 'Darkness - no lighting'
  | 'Darkness - lighting unknown';

export type LightConditionsGroup =
  | 'Daylight'
  | 'Darkness';

export type AccidentSeverity =
  | 'Fatal'
  | 'Serious'
  | 'Slight';

export interface ParsedAccidentRecord extends Omit<AccidentRecord, 'Weather_Conditions' | 'Road_Surface_Conditions' | 'Light_Conditions' | 'Accident_Severity'> {
  Weather_Conditions: WeatherCondition;
  Road_Surface_Conditions: RoadSurfaceCondition;
  Light_Conditions: LightCondition;
  Accident_Severity: AccidentSeverity;
  Light_Conditions_Group: LightConditionsGroup;
}

// Chart data aggregation types
export interface WeatherAccidentCount {
  weather: WeatherCondition;
  count: number;
}

export interface SpeedWeatherAccidentCount {
  speed_limit: number;
  weather: WeatherCondition;
  light_condition: LightConditionsGroup;
  count: number;
}

export interface WeatherSurfaceAccidentCount {
  weather: WeatherCondition;
  road_surface: RoadSurfaceCondition;
  count: number;
}

// Filter state types
export type WeatherFilter = WeatherCondition | null;

// Color palettes
export const WEATHER_COLORS: Record<WeatherCondition, string> = {
  'Fine no high winds': '#1f77b4',
  'Raining no high winds': '#ff7f0e',
  'Snowing no high winds': '#2ca02c',
  'Fine + high winds': '#d62728',
  'Raining + high winds': '#9467bd',
  'Snowing + high winds': '#e377c2',
  'Fog or mist': '#8c564b',
  'Other': '#bcbd22',
  'Unknown': '#7f7f7f'
};

export const ROAD_SURFACE_COLORS: Record<RoadSurfaceCondition, string> = {
  'Dry': '#1f77b4',
  'Wet or damp': '#ff7f0e',
  'Snow': '#2ca02c',
  'Frost or ice': '#d62728',
  'Flood over 3cm deep': '#9467bd',
  'Oil or diesel': '#e377c2',
  'Mud': '#8c564b',
  'Unknown': '#7f7f7f'
};

export const LIGHT_CONDITION_GROUP_THICKNESS: Record<LightConditionsGroup, number> = {
  'Daylight': 20,
  'Darkness': 10
};
