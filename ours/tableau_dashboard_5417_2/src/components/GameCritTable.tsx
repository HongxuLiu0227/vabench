import { useMemo } from 'react';
import type { ParsedGameData } from '../types';
import { aggregateByGame, filterData, calculateCriticDerivedMetric } from '../utils/dataTransformations';
import { useFilter } from '../contexts/FilterContext';

interface GameCritTableProps {
  data: ParsedGameData[];
  maxHeight?: number;
}

export function GameCritTable({ data, maxHeight = 300 }: GameCritTableProps) {
  const { selection, isSelected, toggleGame } = useFilter();

  const gameMetrics = useMemo(() => {
    const filtered = filterData(data, selection.games, selection.platforms);
    return aggregateByGame(filtered);
  }, [data, selection]);

  // Calculate derived metric for each game
  const enrichedMetrics = useMemo(() => {
    return gameMetrics.map((metric) => ({
      ...metric,
      derivedMetric: calculateCriticDerivedMetric(metric.positiveCritics, metric.totalCritics)
    }));
  }, [gameMetrics]);

  return (
    <div className="game-crit-table" style={{ maxHeight, overflow: 'auto' }}>
      <div
        style={{
          fontSize: '11px',
          color: '#c0c0c0',
          marginBottom: '8px',
          fontWeight: 'normal'
        }}
      >
        Critics
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #ddd', backgroundColor: '#f5f5f5' }}>
            <th style={{ padding: '8px', textAlign: 'left', fontWeight: 'bold', color: '#333' }}>Game</th>
            <th style={{ padding: '8px', textAlign: 'right', fontWeight: 'bold', color: '#333' }}>Positive</th>
            <th style={{ padding: '8px', textAlign: 'right', fontWeight: 'bold', color: '#333' }}>Neutral</th>
            <th style={{ padding: '8px', textAlign: 'right', fontWeight: 'bold', color: '#333' }}>Negative</th>
            <th style={{ padding: '8px', textAlign: 'right', fontWeight: 'bold', color: '#333' }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {enrichedMetrics.map((metric) => {
            const selected = isSelected(metric.game);
            return (
              <tr
                key={metric.game}
                onClick={() => toggleGame(metric.game)}
                style={{
                  borderBottom: '1px solid #eee',
                  cursor: 'pointer',
                  backgroundColor: selected ? '#e6f3ff' : 'transparent',
                  opacity: selection.games.size > 0 && !selected ? 0.3 : 1
                }}
                onMouseEnter={(e) => {
                  if (!selected) {
                    e.currentTarget.style.backgroundColor = '#f0f0f0';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!selected) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <td style={{ padding: '8px', textAlign: 'left', color: '#333' }}>{metric.game}</td>
                <td style={{ padding: '8px', textAlign: 'right', color: '#28a745' }}>
                  {metric.positiveCritics}
                </td>
                <td style={{ padding: '8px', textAlign: 'right', color: '#ffc107' }}>
                  {metric.neutralCritics}
                </td>
                <td style={{ padding: '8px', textAlign: 'right', color: '#dc3545' }}>
                  {metric.negativeCritics}
                </td>
                <td style={{ padding: '8px', textAlign: 'right', fontWeight: 'bold', color: '#333' }}>
                  {metric.totalCritics}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {enrichedMetrics.length === 0 && (
        <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
          No data available
        </div>
      )}
    </div>
  );
}
