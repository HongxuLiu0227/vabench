import { HorizontalBarChart } from '../HorizontalBarChart';
import type { StationData } from '../../types';

interface Bottom10StartProps {
  data: StationData[];
  highlightedStation: string | null;
  onStationClick: (station: string) => void;
  isFiltered: boolean;
}

export function Bottom10Start({ data, highlightedStation, onStationClick, isFiltered }: Bottom10StartProps) {
  return (
    <HorizontalBarChart
      data={data}
      title="Bottom 10 Stations (start)"
      xAxisTitle="Number of Trips"
      width={400}
      height={350}
      onBarClick={onStationClick}
      highlightedStation={highlightedStation}
      isFiltered={isFiltered}
    />
  );
}
