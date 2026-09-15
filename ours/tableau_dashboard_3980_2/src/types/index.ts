// Type definitions for the bike trip data
export interface BikeTripData {
  tripduration: number;
  starttime: string;
  stoptime: string;
  start_station_id: number;
  start_station_name: string;
  start_station_latitude: number;
  start_station_longitude: number;
  end_station_id: number;
  end_station_name: string;
  end_station_latitude: number;
  end_station_longitude: number;
  bikeid: number;
  usertype: string;
  birth_year: number;
  gender: number;
  Table_Name: string;
}

// Aggregated data for peak hours charts
export interface HourRecord {
  hour: number;
  count: number;
}

// Raw CSV row format
export interface CSVRow {
  [key: string]: string;
}
