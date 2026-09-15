export interface AccidentRecord {
  Accident_Index: string;
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
  Local_Authority_District: number;
  Local_Authority_Highway: string;
  First_Road_Class: number;
  First_Road_Number: number;
  Road_Type: number;
  Speed_limit: number;
  Junction_Detail: number;
  Junction_Control: number;
  Second_Road_Class: number;
  Second_Road_Number: number;
  Pedestrian_Crossing_Human_Control: number;
  Pedestrian_Crossing_Physical_Facilities: number;
  Light_Conditions: number;
  Weather_Conditions: number;
  Road_Surface_Conditions: number;
  Special_Conditions_at_Site: number;
  Carriageway_Hazards: number;
  Urban_or_Rural_Area: number;
  Did_Police_Officer_Attend_Scene_of_Accident: number;
  LSOA_of_Accident_Location: string;
  Sex_of_Casualty: number;
}

export interface AggregatedData {
  category: string;
  series: string;
  value: number;
}

export type HighlightMap = Record<string, Set<string | number>>;
