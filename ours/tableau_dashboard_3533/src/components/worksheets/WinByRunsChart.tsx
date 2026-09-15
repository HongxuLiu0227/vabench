import React from 'react';
import { VerticalRankedBarChart } from '../VerticalRankedBarChart';
import type { CricketDataRow } from '../../types/cricket';
import { aggregateWinByRuns } from '../../services/dataService';

interface WinByRunsChartProps {
  data: CricketDataRow[];
  winnerFilter: string | null;
  highlightedBatsman?: string | null;
}

export const WinByRunsChart: React.FC<WinByRunsChartProps> = ({
  data,
  winnerFilter,
  highlightedBatsman,
}) => {
  const chartData = React.useMemo(
    () => aggregateWinByRuns(data, winnerFilter, 20),
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
        title="Win By Runs"
        titleStyle={titleStyle}
        highlightedCategory={highlightedBatsman}
      />
    </div>
  );
};
