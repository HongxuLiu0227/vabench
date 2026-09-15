export interface TripData {
  tripDuration: number;
  startTime: Date;
  stopTime: Date;
  startStationId: number;
  startStationName: string;
  startStationLatitude: number;
  startStationLongitude: number;
  endStationId: number;
  endStationName: string;
  endStationLatitude: number;
  endStationLongitude: number;
  bikeId: number;
  userType: string;
  birthYear: number;
  gender: number; // 0=Unknown, 1=Male, 2=Female
}

export interface StationAggregation {
  stationName: string;
  count: number;
  latitude: number;
  longitude: number;
}

export interface RawCsvRow {
  [key: string]: string;
}
