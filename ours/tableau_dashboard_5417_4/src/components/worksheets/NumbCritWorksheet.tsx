import React, { useMemo } from 'react';
import type { CriticMetrics } from '../../types/data';
import { useDashboard } from '../../contexts/DashboardContext';
import './NumbCritWorksheet.css';

interface NumbCritWorksheetProps {
  data: CriticMetrics[];
  width?: number;
  height?: number;
}

export const NumbCritWorksheet: React.FC<NumbCritWorksheetProps> = ({
  data,
  width = 400,
  height = 300,
}) => {
  const { selection, setSelection, clearSelection, highlights, autoClear } = useDashboard();

  const worksheetName = 'numb_crit';
  const highlightState = highlights.get(worksheetName);

  // Handle row click for interaction
  const handleRowClick = (row: CriticMetrics) => {
    if (autoClear && selection.number_players === row.number_players) {
      clearSelection();
    } else {
      setSelection({
        number_players: row.number_players,
        clear: false,
      });
    }
  };

  const totalPositive = useMemo(() => data.reduce((sum, row) => sum + row.positive_critics, 0), [data]);
  const totalNeutral = useMemo(() => data.reduce((sum, row) => sum + row.neutral_critics, 0), [data]);
  const totalNegative = useMemo(() => data.reduce((sum, row) => sum + row.negative_critics, 0), [data]);
  const grandTotal = totalPositive + totalNeutral + totalNegative;

  // Check if a row is highlighted
  const isRowHighlighted = (row: CriticMetrics) => {
    if (!highlightState || highlightState.selections.size === 0) return false;
    return highlightState.selections.has(row.number_players);
  };

  // Check if a row is selected
  const isRowSelected = (row: CriticMetrics) => {
    return selection.number_players === row.number_players;
  };

  return (
    <div
      className="numb-crit-worksheet"
      style={{ width, height }}
    >
      <div className="worksheet-title" style={{ color: '#c0c0c0', fontSize: '11px' }}>
        Critics
      </div>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th className="row-header">Number of Players</th>
              <th className="measure-header">Positive Critics</th>
              <th className="measure-header">Neutral Critics</th>
              <th className="measure-header">Negative Critics</th>
              <th className="measure-header">Total Critics</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr
                key={row.number_players}
                onClick={() => handleRowClick(row)}
                className={
                  isRowSelected(row)
                    ? 'selected'
                    : isRowHighlighted(row)
                    ? 'highlighted'
                    : ''
                }
              >
                <td className="row-label">{row.number_players}</td>
                <td className="measure-cell positive">{row.positive_critics.toLocaleString()}</td>
                <td className="measure-cell neutral">{row.neutral_critics.toLocaleString()}</td>
                <td className="measure-cell negative">{row.negative_critics.toLocaleString()}</td>
                <td className="measure-cell total">{row.total_critics.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="grand-total">
              <td className="row-label">Grand Total</td>
              <td className="measure-cell positive">{totalPositive.toLocaleString()}</td>
              <td className="measure-cell neutral">{totalNeutral.toLocaleString()}</td>
              <td className="measure-cell negative">{totalNegative.toLocaleString()}</td>
              <td className="measure-cell total">{grandTotal.toLocaleString()}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};
