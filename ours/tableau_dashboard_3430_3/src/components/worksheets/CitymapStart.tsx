import { CitymapScatter } from '../CitymapScatter';
import type { StationData } from '../../types';

interface CitymapStartProps {
  data: StationData[];
  highlightedStation: string | null;
}

export function CitymapStart({ data, highlightedStation }: CitymapStartProps) {
  return (
    <CitymapScatter
      data={data}
      title="Most Popular Journey Starting Locations"
      width={800}
      height={450}
      highlightedStation={highlightedStation}
      showLegend={true}
    />
  );
}
