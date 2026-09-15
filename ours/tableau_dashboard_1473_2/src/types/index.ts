import type { BikeTripData, StationData } from '../services/dataService';

export type { BikeTripData, StationData };

export interface WorksheetProps {
  title: string;
  data: StationData[];
  isTop: boolean;
  isStart: boolean;
  onStationSelect?: (stationName: string | null) => void;
  highlightedStations?: Set<string>;
}

export interface HighlightContextType {
  highlightedStartStation: string | null;
  highlightedEndStation: string | null;
  highlightedYear: string | null;
  setHighlight: (type: 'start' | 'end' | 'year', value: string | null) => void;
  clearHighlight: () => void;
}

export interface ChartMargins {
  top: number;
  right: number;
  bottom: number;
  left: number;
}
