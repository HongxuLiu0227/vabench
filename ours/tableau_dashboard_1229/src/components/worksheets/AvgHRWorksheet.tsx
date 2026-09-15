import type { BaseballPlayer } from '../../types/baseball';
import { VerticalRankedBarChart } from '../charts/VerticalRankedBarChart';
import { aggregateHRByHeightWeight } from '../../services/dataService';
import { useInteraction } from '../../lib/useInteraction';

interface AvgHRWorksheetProps {
  data: BaseballPlayer[];
}

export function AvgHRWorksheet({ data }: AvgHRWorksheetProps) {
  const { selection, toggleNameSelection, toggleHandednessSelection } = useInteraction();

  const aggregatedData = aggregateHRByHeightWeight(data);

  const handleBarClick = (_category: string, series?: string) => {
    if (series) {
      const parts = series.split('-');
      if (parts.length >= 2) {
        const handedness = parts[0];
        const name = parts.slice(1).join('-');
        toggleHandednessSelection(handedness);
        toggleNameSelection(name);
      }
    }
  };

  return (
    <div style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}>
      <h4 style={{ marginTop: 0, marginBottom: '10px' }}>Avg. Home Run with Height & Weight</h4>
      <VerticalRankedBarChart
        data={aggregatedData}
        onBarClick={handleBarClick}
        highlightedCategories={selection.selectedNames}
        highlightedSeries={selection.selectedHandedness}
      />
    </div>
  );
}
