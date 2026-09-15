import { HorizontalBarChart } from '../HorizontalBarChart';
import type { StationData } from '../../types';

interface Bottom10EndProps {
  data: StationData[];
  highlightedStation: string | null;
  onStationClick: (station: string) => void;
  isFiltered: boolean;
}

export function Bottom10End({ data, highlightedStation, onStationClick, isFiltered }: Bottom10EndProps) {
  return (
    <HorizontalBarChart
      data={data}
      title="Bottom 10 Stations (end)"
      xAxisTitle="Number of Trips"
      width={400}
      height={350}
      onBarClick={onStationClick}
      highlightedStation={highlightedStation}
      isFiltered={isFiltered}
    />
  );
}
