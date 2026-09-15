import React from 'react';
import { ScoreScatterPlot } from '../ScoreScatterPlot';
import { NameGamesWorksheet } from '../worksheets/NameGamesWorksheet';
import type { GameData } from '../../types';

interface AllDashboardProps {
  data: GameData[];
  onGameClick?: (game: string) => void;
  selectedGame?: string | null;
}

export const AllDashboard: React.FC<AllDashboardProps> = ({
  data,
  onGameClick,
  selectedGame,
}) => {
  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Metacritic Games Analysis</h2>
      </div>
      <div className="dashboard-content">
        <div className="dashboard-row">
          <div className="dashboard-main">
            <ScoreScatterPlot
              data={data.map(d => ({
                metascore: d.metascore,
                user_score: d.user_score,
                game: d.game,
                platform: d.platform,
                genre: d.genre,
                developer: d.developer,
              }))}
              width={700}
              height={500}
              title="Score Comparison"
              onPointClick={onGameClick}
              selectedGame={selectedGame}
            />
          </div>
          <div className="dashboard-sidebar">
            <NameGamesWorksheet
              data={data}
              width={280}
              height={500}
              onGameClick={onGameClick}
              selectedGame={selectedGame}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
