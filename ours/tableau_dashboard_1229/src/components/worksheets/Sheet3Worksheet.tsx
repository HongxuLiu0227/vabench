import type { BaseballPlayer } from '../../types/baseball';
import { CustomTableauView } from '../views/CustomTableauView';
import { useInteraction } from '../../lib/useInteraction';

interface Sheet3WorksheetProps {
  data: BaseballPlayer[];
}

export function Sheet3Worksheet({ data }: Sheet3WorksheetProps) {
  const { selection, toggleHandednessSelection } = useInteraction();

  const handleHandednessClick = (handedness: string) => {
    toggleHandednessSelection(handedness);
  };

  return (
    <div style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}>
      <h4 style={{ marginTop: 0, marginBottom: '10px' }}>Sheet 3</h4>
      <CustomTableauView
        data={data}
        viewType="sheet3"
        highlightedNames={selection.selectedNames}
        highlightedHandedness={selection.selectedHandedness}
        onHandednessClick={handleHandednessClick}
      />
    </div>
  );
}
