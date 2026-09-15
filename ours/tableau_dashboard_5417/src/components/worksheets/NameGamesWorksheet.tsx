import React, { useMemo } from 'react';
import type { GameData } from '../../types';

interface NameGamesWorksheetProps {
  data: GameData[];
  width: number;
  height: number;
  onGameClick?: (game: string) => void;
  selectedGame?: string | null;
}

export const NameGamesWorksheet: React.FC<NameGamesWorksheetProps> = ({
  data,
  width,
  height,
  onGameClick,
  selectedGame,
}) => {
  const games = useMemo(() => {
    return [...new Set(data.map(d => d.game))].sort();
  }, [data]);

  return (
    <div className="worksheet name-games-worksheet" style={{ width, height, overflow: 'auto' }}>
      <table style={{ width: '100%', fontSize: '12px' }}>
        <thead>
          <tr style={{ position: 'sticky', top: 0, background: 'white' }}>
            <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd' }}>Game</th>
          </tr>
        </thead>
        <tbody>
          {games.map((game, index) => (
            <tr
              key={index}
              onClick={() => onGameClick && onGameClick(game)}
              style={{
                cursor: onGameClick ? 'pointer' : 'default',
                background: selectedGame === game ? '#e3f2fd' : index % 2 === 0 ? '#f9f9f9' : 'white',
              }}
              onMouseEnter={(e) => {
                if (onGameClick) {
                  e.currentTarget.style.background = '#f0f0f0';
                }
              }}
              onMouseLeave={(e) => {
                if (onGameClick) {
                  e.currentTarget.style.background = selectedGame === game ? '#e3f2fd' : (index % 2 === 0 ? '#f9f9f9' : 'white');
                }
              }}
            >
              <td style={{ padding: '6px 8px', borderBottom: '1px solid #eee' }}>{game}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
