import type { BaseballPlayer } from '../../types/baseball';
import { VerticalRankedBarChart } from '../charts/VerticalRankedBarChart';
import { aggregateBattingAvgByName } from '../../services/dataService';
import { useInteraction } from '../../lib/useInteraction';

interface BattingAvgWorksheetProps {
  data: BaseballPlayer[];
}

export function BattingAvgWorksheet({ data }: BattingAvgWorksheetProps) {
  const { selection, toggleNameSelection, toggleHandednessSelection } = useInteraction();

  const aggregatedData = aggregateBattingAvgByName(data);

  const handleBarClick = (category: string, series?: string) => {
    if (series) {
      const handedness = series.split('-')[0];
      toggleHandednessSelection(handedness);
    }
    toggleNameSelection(category);
  };

  return (
    <div style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}>
      <h4 style={{ marginTop: 0, marginBottom: '10px' }}>Batting Average</h4>
      <VerticalRankedBarChart
        data={aggregatedData}
        onBarClick={handleBarClick}
        highlightedCategories={selection.selectedNames}
        highlightedSeries={selection.selectedHandedness}
      />
    </div>
  );
}
