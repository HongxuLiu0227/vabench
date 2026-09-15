import type { BaseballPlayer } from '../../types/baseball';
import { CustomTableauView } from '../views/CustomTableauView';
import { useInteraction } from '../../lib/useInteraction';

interface RelationWeightHeightWorksheetProps {
  data: BaseballPlayer[];
}

export function RelationWeightHeightWorksheet({ data }: RelationWeightHeightWorksheetProps) {
  const { selection, toggleNameSelection, toggleHandednessSelection } = useInteraction();

  const handleRowClick = (player: BaseballPlayer) => {
    toggleNameSelection(player.name);
    toggleHandednessSelection(player.handedness);
  };

  return (
    <div style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}>
      <h4 style={{ marginTop: 0, marginBottom: '10px' }}>Relation btw Weight and Height</h4>
      <CustomTableauView
        data={data}
        viewType="relation"
        highlightedNames={selection.selectedNames}
        highlightedHandedness={selection.selectedHandedness}
        onRowClick={handleRowClick}
      />
    </div>
  );
}
