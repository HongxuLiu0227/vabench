import type { BaseballPlayer } from '../../types/baseball';
import { CustomTableauView } from '../views/CustomTableauView';
import { useInteraction } from '../../lib/useInteraction';

interface HandednessRelationWorksheetProps {
  data: BaseballPlayer[];
}

export function HandednessRelationWorksheet({ data }: HandednessRelationWorksheetProps) {
  const { selection, toggleHandednessSelection } = useInteraction();

  const handleRowClick = (player: BaseballPlayer) => {
    toggleHandednessSelection(player.handedness);
  };

  return (
    <div style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}>
      <h4 style={{ marginTop: 0, marginBottom: '10px' }}>Relation btw Weight and Height with respect to the Handedness</h4>
      <CustomTableauView
        data={data}
        viewType="handedness"
        highlightedNames={selection.selectedNames}
        highlightedHandedness={selection.selectedHandedness}
        onRowClick={handleRowClick}
      />
    </div>
  );
}
