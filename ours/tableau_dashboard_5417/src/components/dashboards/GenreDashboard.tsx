import React from 'react';
import { GenreCritWorksheet } from '../worksheets/GenreCritWorksheet';
import { GenreMetaWorksheet } from '../worksheets/GenreMetaWorksheet';
import { GenreUsersWorksheet } from '../worksheets/GenreUsersWorksheet';
import type { GameData } from '../../types';

interface GenreDashboardProps {
  data: GameData[];
  onCategoryClick?: (category: string) => void;
  selectedCategory?: string | null;
}

export const GenreDashboard: React.FC<GenreDashboardProps> = ({
  data,
  onCategoryClick,
  selectedCategory,
}) => {
  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Genre Analysis</h2>
      </div>
      <div className="dashboard-content">
        <div className="dashboard-row">
          <div className="dashboard-full-width">
            <GenreMetaWorksheet data={data} width={984} height={491} />
          </div>
        </div>
        <div className="dashboard-row">
          <div className="dashboard-half">
            <GenreCritWorksheet
              data={data}
              width={492}
              height={449}
              onCategoryClick={onCategoryClick}
              selectedCategory={selectedCategory}
            />
          </div>
          <div className="dashboard-half">
            <GenreUsersWorksheet
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
