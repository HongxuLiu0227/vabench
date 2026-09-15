import React from 'react';
import { DevCritWorksheet } from '../worksheets/DevCritWorksheet';
import { DevMetaWorksheet } from '../worksheets/DevMetaWorksheet';
import { DevUsersWorksheet } from '../worksheets/DevUsersWorksheet';
import type { GameData } from '../../types';

interface DevDashboardProps {
  data: GameData[];
  onCategoryClick?: (category: string) => void;
  selectedCategory?: string | null;
}

export const DevDashboard: React.FC<DevDashboardProps> = ({
  data,
  onCategoryClick,
  selectedCategory,
}) => {
  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Developer Analysis</h2>
      </div>
      <div className="dashboard-content">
        <div className="dashboard-row">
          <div className="dashboard-full-width">
            <DevMetaWorksheet data={data} width={984} height={491} />
          </div>
        </div>
        <div className="dashboard-row">
          <div className="dashboard-half">
            <DevCritWorksheet
              data={data}
              width={492}
              height={449}
              onCategoryClick={onCategoryClick}
              selectedCategory={selectedCategory}
            />
          </div>
          <div className="dashboard-half">
            <DevUsersWorksheet
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
