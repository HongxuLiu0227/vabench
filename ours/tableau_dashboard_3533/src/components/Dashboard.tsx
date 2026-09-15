import React, { useState } from 'react';
import type { CricketDataRow } from '../types/cricket';
import { BatsmanRunsChart } from './worksheets/BatsmanRunsChart';
import { VenueChart } from './worksheets/VenueChart';
import { WinByRunsChart } from './worksheets/WinByRunsChart';
import { WinByWicketsChart } from './worksheets/WinByWicketsChart';
import { WinnerCountChart } from './worksheets/WinnerCountChart';

interface DashboardProps {
  data: CricketDataRow[];
}

export const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  const [selectedWinner, setSelectedWinner] = useState<string | null>('Kolkata Knight Riders');
  const [highlightedField, setHighlightedField] = useState<{ field: string; value: string } | null>(null);

  const handleWinnerSelect = (winner: string) => {
    if (winner === '') {
      setSelectedWinner(null);
    } else {
      setSelectedWinner(winner);
    }
    // Auto-clear highlight after selection (Tableau behavior)
    setTimeout(() => setHighlightedField(null), 300);
  };

  return (
    <div style={{
      padding: '8px',
      maxWidth: '1600px',
      margin: '0 auto',
      backgroundColor: '#ffffff',
      minHeight: '100vh'
    }}>
      {/* Dashboard Text Zone - Header */}
      <div style={{
        textAlign: 'center',
        marginBottom: '20px',
        paddingBottom: '15px',
        borderBottom: '1px solid #e0e0e0'
      }}>
        <h1 style={{
          fontFamily: 'Times New Roman, serif',
          fontSize: '22px',
          fontWeight: 'bold',
          textDecoration: 'underline',
          color: '#000000',
          marginBottom: '5px'
        }}>
          Best Cricket Teams & Players
        </h1>
        <p style={{
          fontFamily: 'Times New Roman, serif',
          fontSize: '11px',
          fontStyle: 'italic',
          textDecoration: 'underline',
          fontWeight: 'bold',
          color: '#000000'
        }}>
          -Imam Abdullah Khan
        </p>
      </div>

      {/* Dashboard Grid Layout based on zone positions */}
      {/* Row 1: Winner vs Count | Win by Runs | Win by Wickets */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: '16px',
        marginBottom: '16px'
      }}>
        {/* Winner vs Count (Top Winning Teams) - Filter Source */}
        <div style={{
          border: '1px solid #e0e0e0',
          borderRadius: '4px',
          padding: '8px',
          backgroundColor: '#fafafa'
        }}>
          <WinnerCountChart
            data={data}
            onWinnerSelect={handleWinnerSelect}
            selectedWinner={selectedWinner}
            highlightedWinner={
              highlightedField?.field === 'winner' ? highlightedField.value : undefined
            }
          />
        </div>

        {/* Win by Runs */}
        <div style={{
          border: '1px solid #e0e0e0',
          borderRadius: '4px',
          padding: '8px',
          backgroundColor: '#fafafa'
        }}>
          <WinByRunsChart
            data={data}
            winnerFilter={selectedWinner}
            highlightedBatsman={
              highlightedField?.field === 'batsman' ? highlightedField.value : undefined
            }
          />
        </div>

        {/* Win by Wickets */}
        <div style={{
          border: '1px solid #e0e0e0',
          borderRadius: '4px',
          padding: '8px',
          backgroundColor: '#fafafa'
        }}>
          <WinByWicketsChart
            data={data}
            winnerFilter={selectedWinner}
            highlightedBatsman={
              highlightedField?.field === 'batsman' ? highlightedField.value : undefined
            }
          />
        </div>
      </div>

      {/* Row 2: Batman vs Runs | Venue */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '16px'
      }}>
        {/* Batman vs Runs (Top Batsmen) */}
        <div style={{
          border: '1px solid #e0e0e0',
          borderRadius: '4px',
          padding: '8px',
          backgroundColor: '#fafafa'
        }}>
          <BatsmanRunsChart
            data={data}
            winnerFilter={selectedWinner}
            highlightedBatsman={
              highlightedField?.field === 'batsman' ? highlightedField.value : undefined
            }
          />
        </div>

        {/* Venue */}
        <div style={{
          border: '1px solid #e0e0e0',
          borderRadius: '4px',
          padding: '8px',
          backgroundColor: '#fafafa'
        }}>
          <VenueChart
            data={data}
            winnerFilter={selectedWinner}
            highlightedVenue={
              highlightedField?.field === 'venue' ? highlightedField.value : undefined
            }
          />
        </div>
      </div>

      {/* Info Box */}
      <div style={{
        marginTop: '20px',
        padding: '10px',
        backgroundColor: '#f0f0f0',
        borderRadius: '4px',
        fontSize: '11px',
        color: '#666'
      }}>
        <strong>Interaction Guide:</strong> Click on any team in "Top Winning Teams" to filter the
        other charts. The filter defaults to "Kolkata Knight Riders". Click "Clear" to reset.
      </div>
    </div>
  );
};
