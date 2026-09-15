import React from 'react';
import { GameCritWorksheet } from '../worksheets/GameCritWorksheet';
import { GameMetaWorksheet } from '../worksheets/GameMetaWorksheet';
import { GameUsersWorksheet } from '../worksheets/GameUsersWorksheet';
import type { GameData } from '../../types';

interface GameDashboardProps {
  data: GameData[];
  onCategoryClick?: (category: string) => void;
  selectedCategory?: string | null;
}

export const GameDashboard: React.FC<GameDashboardProps> = ({
  data,
  onCategoryClick,
  selectedCategory,
}) => {
  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Game Analysis</h2>
      </div>
      <div className="dashboard-content">
        <div className="dashboard-row">
          <div className="dashboard-full-width">
            <GameMetaWorksheet data={data} width={984} height={491} />
          </div>
        </div>
        <div className="dashboard-row">
          <div className="dashboard-half">
            <GameCritWorksheet
              data={data}
              width={492}
              height={449}
              onCategoryClick={onCategoryClick}
              selectedCategory={selectedCategory}
            />
          </div>
          <div className="dashboard-half">
            <GameUsersWorksheet
              data={data}
              width={492}
              height={449}
              onCategoryClick={onCategoryClick}
              selectedCategory={selectedCategory}
            />
          </div>
        </div>
      </div>
      <div className="dashboard-footer">
        <div className="footer-left">
          Source: https://www.kaggle.com/skateddu/metacritic-games-stats-20112019
        </div>
        <div className="footer-right">
          Created by Sergio Funes
        </div>
      </div>
    </div>
  );
};
