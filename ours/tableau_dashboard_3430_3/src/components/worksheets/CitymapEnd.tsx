import { CitymapScatter } from '../CitymapScatter';
import type { StationData } from '../../types';

interface CitymapEndProps {
  data: StationData[];
  highlightedStation: string | null;
}

export function CitymapEnd({ data, highlightedStation }: CitymapEndProps) {
  return (
    <CitymapScatter
      data={data}
      title="Most Popular Journey Ending Locations"
      width={800}
      height={450}
      highlightedStation={highlightedStation}
    />
  );
}
