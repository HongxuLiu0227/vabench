import type { BaseballPlayer } from '../../types/baseball';
import { CustomTableauView } from '../views/CustomTableauView';
import { useInteraction } from '../../lib/useInteraction';

interface OverViewWorksheetProps {
  data: BaseballPlayer[];
}

export function OverViewWorksheet({ data }: OverViewWorksheetProps) {
  const { selection, toggleHandednessSelection } = useInteraction();

  const handleHandednessClick = (handedness: string) => {
    toggleHandednessSelection(handedness);
  };

  return (
    <div style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}>
      <h4 style={{ marginTop: 0, marginBottom: '10px' }}>OverView</h4>
      <CustomTableauView
        data={data}
        viewType="overview"
        highlightedNames={selection.selectedNames}
        highlightedHandedness={selection.selectedHandedness}
        onHandednessClick={handleHandednessClick}
      />
    </div>
  );
}
