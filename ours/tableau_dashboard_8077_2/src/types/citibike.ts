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
  'birth year': number | string;
  gender: number;
}

export interface StationData {
  stationName: string;
  count: number;
  stationId?: number;
  latitude?: number;
  longitude?: number;
}

export interface FilterState {
  selectedStation: string | null;
  selectedEndStation: string | null;
}

export interface DashboardContextType {
  data: CitiBikeTrip[];
  filteredData: CitiBikeTrip[];
  filterState: FilterState;
  setFilterState: (state: FilterState | ((prev: FilterState) => FilterState)) => void;
  loading: boolean;
  error: string | null;
}
