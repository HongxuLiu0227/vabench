import React from 'react';
import { VerticalRankedBarChart } from '../VerticalRankedBarChart';
import type { CricketDataRow } from '../../types/cricket';
import { aggregateBatsmanRuns } from '../../services/dataService';

interface BatsmanRunsChartProps {
  data: CricketDataRow[];
  winnerFilter: string | null;
  highlightedBatsman?: string | null;
}

export const BatsmanRunsChart: React.FC<BatsmanRunsChartProps> = ({
  data,
  winnerFilter,
  highlightedBatsman,
}) => {
  const chartData = React.useMemo(
    () => aggregateBatsmanRuns(data, winnerFilter, 15),
    [data, winnerFilter]
  );

  const titleStyle: React.CSSProperties = {
    fontWeight: 'bold',
    fontStyle: 'italic',
    textDecoration: 'underline',
    fontFamily: 'Segoe UI Black, sans-serif',
    fontSize: '12px',
  };

  return (
    <div>
      <VerticalRankedBarChart
        data={chartData}
        title="Top Batsmen"
        axisTitle="Batsmen Runs"
        titleStyle={titleStyle}
        highlightedCategory={highlightedBatsman}
      />
    </div>
  );
};
