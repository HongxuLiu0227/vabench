/**
 * P121__scatterplot worksheet
 * Chart intent: custom_tableau_view (scatterplot)
 */

import { ScatterPlot } from '../charts';
import type { ScatterPlotData } from '../../types/data';

interface ScatterPlotWorksheetProps {
  data: ScatterPlotData[];
}

export const ScatterPlotWorksheet: React.FC<ScatterPlotWorksheetProps> = ({ data }) => {
  return (
    <div className="worksheet" style={{ padding: '8px' }}>
      <ScatterPlot
        data={data}
        title="Scatterplot"
        width={450}
        height={320}
        color="#e15759"
      />
    </div>
  );
};
