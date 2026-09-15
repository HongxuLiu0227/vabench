import React from 'react';
import { VerticalRankedBarChart } from '../VerticalRankedBarChart';
import type { CricketDataRow } from '../../types/cricket';
import { aggregateWinByWickets } from '../../services/dataService';

interface WinByWicketsChartProps {
  data: CricketDataRow[];
  winnerFilter: string | null;
  highlightedBatsman?: string | null;
}

export const WinByWicketsChart: React.FC<WinByWicketsChartProps> = ({
  data,
  winnerFilter,
  highlightedBatsman,
}) => {
  const chartData = React.useMemo(
    () => aggregateWinByWickets(data, winnerFilter, 20),
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
        title="Win By Wickets"
        titleStyle={titleStyle}
        highlightedCategory={highlightedBatsman}
      />
    </div>
  );
};
