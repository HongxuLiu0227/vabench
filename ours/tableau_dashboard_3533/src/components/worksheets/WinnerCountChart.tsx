import React from 'react';
import { VerticalRankedBarChart } from '../VerticalRankedBarChart';
import type { CricketDataRow } from '../../types/cricket';
import { aggregateWinnerCount } from '../../services/dataService';

interface WinnerCountChartProps {
  data: CricketDataRow[];
  onWinnerSelect: (winner: string) => void;
  selectedWinner?: string | null;
  highlightedWinner?: string | null;
}

const TEAM_COLORS: Record<string, string> = {
  "Kolkata Knight Riders": "#499894",
  "Mumbai Indians": "#4e79a7",
  "Delhi Daredevils": "#59a14f",
  "Rising Pune Supergiant": "#79706e",
  "Gujarat Lions": "#8cd17d",
  "Chennai Super Kings": "#a0cbe8",
  "Kings XI Punjab": "#b6992d",
  "Rising Pune Supergiants": "#bab0ac",
  "Royal Challengers Bangalore": "#d37295",
  "Pune Warriors": "#e15759",
  "Kochi Tuskers Kerala": "#f1ce63",
  "Deccan Chargers": "#f28e2b",
  "Sunrisers Hyderabad": "#fabfd2",
  "Rajasthan Royals": "#ff9d9a",
  "Delhi Capitals": "#ffbe7d",
};

export const WinnerCountChart: React.FC<WinnerCountChartProps> = ({
  data,
  onWinnerSelect,
  selectedWinner,
  highlightedWinner,
}) => {
  const chartData = React.useMemo(
    () => aggregateWinnerCount(data),
    [data]
  );

  const titleStyle: React.CSSProperties = {
    fontStyle: 'italic',
    textDecoration: 'underline',
    fontFamily: 'Segoe UI Black, sans-serif',
    fontSize: '12px',
  };

  const colorScale = (category: string): string => {
    return TEAM_COLORS[category] || '#4e79a7';
  };

  return (
    <div>
      <VerticalRankedBarChart
        data={chartData}
        title="Top Winning Teams"
        onBarClick={onWinnerSelect}
        highlightedCategory={highlightedWinner}
        colorScale={colorScale}
        titleStyle={titleStyle}
      />
      {selectedWinner && (
        <div style={{
          fontSize: '11px',
          textAlign: 'center',
          marginTop: '10px',
          padding: '5px',
          backgroundColor: '#f0f0f0',
          borderRadius: '4px'
        }}>
          Selected: <strong>{selectedWinner}</strong>
          <button
            onClick={() => onWinnerSelect('')}
            style={{
              marginLeft: '10px',
              padding: '2px 8px',
              fontSize: '10px',
              cursor: 'pointer',
              border: '1px solid #ccc',
              borderRadius: '3px',
              backgroundColor: 'white'
            }}
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
};
