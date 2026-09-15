import type { BaseballPlayer } from '../../types/baseball';
import { CustomTableauView } from '../views/CustomTableauView';
import { useInteraction } from '../../lib/useInteraction';

interface BadGoodHeightWorksheetProps {
  data: BaseballPlayer[];
}

export function BadGoodHeightWorksheet({ data }: BadGoodHeightWorksheetProps) {
  const { selection } = useInteraction();

  return (
    <div style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}>
      <h4 style={{ marginTop: 0, marginBottom: '10px' }}>Bad/Good Height</h4>
      <CustomTableauView
        data={data}
        viewType="bad-height"
        highlightedNames={selection.selectedNames}
        highlightedHandedness={selection.selectedHandedness}
      />
    </div>
  );
}
