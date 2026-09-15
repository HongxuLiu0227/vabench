import React from 'react';
import { NumbCritWorksheet } from '../worksheets/NumbCritWorksheet';
import { NumbMetaWorksheet } from '../worksheets/NumbMetaWorksheet';
import { NumbUsersWorksheet } from '../worksheets/NumbUsersWorksheet';
import type { GameData } from '../../types';

interface NumbDashboardProps {
  data: GameData[];
  onCategoryClick?: (category: string) => void;
  selectedCategory?: string | null;
}

export const NumbDashboard: React.FC<NumbDashboardProps> = ({
  data,
  onCategoryClick,
  selectedCategory,
}) => {
  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Number of Players Analysis</h2>
      </div>
      <div className="dashboard-content">
        <div className="dashboard-row">
          <div className="dashboard-full-width">
            <NumbMetaWorksheet data={data} width={984} height={491} />
          </div>
        </div>
        <div className="dashboard-row">
          <div className="dashboard-half">
            <NumbCritWorksheet
              data={data}
              width={492}
              height={449}
              onCategoryClick={onCategoryClick}
              selectedCategory={selectedCategory}
            />
          </div>
          <div className="dashboard-half">
            <NumbUsersWorksheet
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
