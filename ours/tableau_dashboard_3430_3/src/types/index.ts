export interface CitiBikeTrip {
  tripduration: number;
  starttime: Date;
  stoptime: Date;
  'start station id': number;
  'start station name': string;
  'start station latitude': number;
  'start station longitude': number;
  'end station id': number;
  'end station name': string;
  'end station latitude': number;
  'end station longitude': number;
  bikeid: number;
  usertype: string;
  'birth year': number;
  gender: string;
}

export interface StationData {
  stationName: string;
  count: number;
  latitude?: number;
  longitude?: number;
}

export interface FilterState {
  startStation: string | null;
  endStation: string | null;
}

export interface WorksheetData {
  top10Start: StationData[];
  bottom10Start: StationData[];
  top10End: StationData[];
  bottom10End: StationData[];
  citymapStart: StationData[];
  citymapEnd: StationData[];
}
