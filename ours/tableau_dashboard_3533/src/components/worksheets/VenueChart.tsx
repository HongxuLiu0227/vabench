import React from 'react';
import { VerticalRankedBarChart } from '../VerticalRankedBarChart';
import type { CricketDataRow } from '../../types/cricket';
import { aggregateVenue } from '../../services/dataService';

interface VenueChartProps {
  data: CricketDataRow[];
  winnerFilter: string | null;
  highlightedVenue?: string | null;
}

export const VenueChart: React.FC<VenueChartProps> = ({
  data,
  winnerFilter,
  highlightedVenue,
}) => {
  const chartData = React.useMemo(
    () => aggregateVenue(data, winnerFilter, 10),
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
        title="Venue ("
        axisTitle=""
        titleStyle={titleStyle}
        highlightedCategory={highlightedVenue}
      />
      <div style={{
        fontSize: '9px',
        fontWeight: 'bold',
        fontStyle: 'italic',
        textDecoration: 'underline',
        fontFamily: 'Segoe UI Black, sans-serif',
        textAlign: 'center',
        marginTop: '-20px',
        marginBottom: '10px'
      }}>
        Where Match Take place)
      </div>
    </div>
  );
};
