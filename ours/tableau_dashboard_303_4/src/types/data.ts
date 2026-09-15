/**
 * Raw accident record from CSV
 * Note: Field names match actual CSV headers including special characters
 */
export interface AccidentRecord {
  Accident_Index: string;
  Location_Easting_OSGR: string;
  Location_Northing_OSGR: string;
  Longitude: string;
  Latitude: string;
  Police_Force: string;
  Accident_Severity: string;
  Number_of_Vehicles: string;
  Number_of_Casualties: string;
  Date: string;
  Day_of_Week: string;
  Time: string;
  'Local_Authority_(District)': string;
  'Local_Authority_(Highway)': string;
  '1st_Road_Class': string;
  '1st_Road_Number': string;
  Road_Type: string;
  Speed_limit: string;
  Junction_Detail: string;
  Junction_Control: string;
  '2nd_Road_Class': string;
  '2nd_Road_Number': string;
  'Pedestrian_Crossing-Human_Control': string;
  'Pedestrian_Crossing-Physical_Facilities': string;
  Light_Conditions: string;
  Weather_Conditions: string;
  Road_Surface_Conditions: string;
  Special_Conditions_at_Site: string;
  Carriageway_Hazards: string;
  Urban_or_Rural_Area: string;
  Did_Police_Officer_Attend_Scene_of_Accident: string;
  LSOA_of_Accident_Location: string;
  'Sex Of Casualty': string;
}

/**
 * Parsed accident record with numeric fields
 */
export interface ParsedAccidentRecord {
  Accident_Index: string;
  Accident_Severity: string;
  Number_of_Vehicles: number;
  Number_of_Casualties: number;
  Day_of_Week: number;
  Speed_limit: string;
  Light_Conditions: string;
  Weather_Conditions: string;
  Road_Surface_Conditions: string;
  Urban_or_Rural_Area: string;
  Time: string;
  Date: string;
}

/**
 * Aggregated data for Q2_Weather chart
 */
export interface Q2WeatherDataPoint {
  Weather_Conditions: string;
  count: number;
  Light_Conditions: string;
}

/**
 * Aggregated data for Q7_Speed chart
 */
export interface Q7SpeedDataPoint {
  Accident_Severity: string;
  casualties: number;
  Speed_limit: string;
}

/**
 * Aggregated data for Sheet 28 chart
 */
export interface Sheet28DataPoint {
  Speed_limit: string;
  count: number;
  Weather_Conditions: string;
  Light_Conditions: string;
}

/**
 * Aggregated data for Sheet 29 chart
 */
export interface Sheet29DataPoint {
  Day_of_Week: string;
  count: number;
}

/**
 * Filter state for dashboard interactions
 */
export interface DashboardFilters {
  selectedLightConditions: string[];
  selectedSpeedLimits: string[];
  selectedWeatherConditions: string[];
  selectedRoadSurfaceConditions: string[];
  selectedAccidentSeverities: string[];
  selectedDayOfWeek: string[];
}

/**
 * Highlight state for interactive highlighting
 */
export interface HighlightState {
  field: string | null;
  value: string | null;
  sourceWorksheet: string | null;
}
