import React from 'react';
import { VerticalRankedBarChart } from '../VerticalRankedBarChart';
import type { CricketDataRow } from '../../types/cricket';
import { aggregateTeamRuns } from '../../services/dataService';

interface TeamRunsChartProps {
  data: CricketDataRow[];
  highlightedTeam?: string | null;
}

export const TeamRunsChart: React.FC<TeamRunsChartProps> = ({
  data,
  highlightedTeam,
}) => {
  const chartData = React.useMemo(
    () => aggregateTeamRuns(data),
    [data]
  );

  return (
    <div>
      <VerticalRankedBarChart
        data={chartData}
        highlightedCategory={highlightedTeam}
      />
    </div>
  );
};
