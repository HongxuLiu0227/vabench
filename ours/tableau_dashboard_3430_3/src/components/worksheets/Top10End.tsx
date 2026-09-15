import { HorizontalBarChart } from '../HorizontalBarChart';
import type { StationData } from '../../types';

interface Top10EndProps {
  data: StationData[];
  highlightedStation: string | null;
  onStationClick: (station: string) => void;
  isFiltered: boolean;
}

export function Top10End({ data, highlightedStation, onStationClick, isFiltered }: Top10EndProps) {
  return (
    <HorizontalBarChart
      data={data}
      title="Top 10 Stations (end)"
      xAxisTitle="Number of Trips"
      width={400}
      height={350}
      onBarClick={onStationClick}
      highlightedStation={highlightedStation}
      isFiltered={isFiltered}
    />
  );
}
