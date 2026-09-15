import React, { useMemo } from 'react';
import type { UserMetrics } from '../../types/data';
import { useDashboard } from '../../contexts/DashboardContext';
import './NumbUsersWorksheet.css';

interface NumbUsersWorksheetProps {
  data: UserMetrics[];
  width?: number;
  height?: number;
}

export const NumbUsersWorksheet: React.FC<NumbUsersWorksheetProps> = ({
  data,
  width = 400,
  height = 300,
}) => {
  const { selection, setSelection, clearSelection, highlights, autoClear } = useDashboard();

  const worksheetName = 'numb_users';
  const highlightState = highlights.get(worksheetName);

  // Handle row click for interaction
  const handleRowClick = (row: UserMetrics) => {
    if (autoClear && selection.number_players === row.number_players) {
      clearSelection();
    } else {
      setSelection({
        number_players: row.number_players,
        clear: false,
      });
    }
  };

  const totalPositive = useMemo(() => data.reduce((sum, row) => sum + row.positive_users, 0), [data]);
  const totalNeutral = useMemo(() => data.reduce((sum, row) => sum + row.neutral_users, 0), [data]);
  const totalNegative = useMemo(() => data.reduce((sum, row) => sum + row.negative_users, 0), [data]);
  const grandTotal = totalPositive + totalNeutral + totalNegative;

  // Check if a row is highlighted
  const isRowHighlighted = (row: UserMetrics) => {
    if (!highlightState || highlightState.selections.size === 0) return false;
    return highlightState.selections.has(row.number_players);
  };

  // Check if a row is selected
  const isRowSelected = (row: UserMetrics) => {
    return selection.number_players === row.number_players;
  };

  return (
    <div
      className="numb-users-worksheet"
      style={{ width, height }}
    >
      <div className="worksheet-title" style={{ color: '#c0c0c0', fontSize: '11px' }}>
        Users
      </div>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th className="row-header">Number of Players</th>
              <th className="measure-header">Positive Users</th>
              <th className="measure-header">Neutral Users</th>
              <th className="measure-header">Negative Users</th>
              <th className="measure-header">Total Users</th>
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
                <td className="measure-cell positive">{row.positive_users.toLocaleString()}</td>
                <td className="measure-cell neutral">{row.neutral_users.toLocaleString()}</td>
                <td className="measure-cell negative">{row.negative_users.toLocaleString()}</td>
                <td className="measure-cell total">{row.total_users.toLocaleString()}</td>
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
