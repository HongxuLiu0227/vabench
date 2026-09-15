import React from 'react';
import { PlatCritWorksheet } from '../worksheets/PlatCritWorksheet';
import { PlatMetaWorksheet } from '../worksheets/PlatMetaWorksheet';
import { PlatUsersWorksheet } from '../worksheets/PlatUsersWorksheet';
import type { GameData } from '../../types';

interface PlatDashboardProps {
  data: GameData[];
  onCategoryClick?: (category: string) => void;
  selectedCategory?: string | null;
}

export const PlatDashboard: React.FC<PlatDashboardProps> = ({
  data,
  onCategoryClick,
  selectedCategory,
}) => {
  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Platform Analysis</h2>
      </div>
      <div className="dashboard-content">
        <div className="dashboard-row">
          <div className="dashboard-full-width">
            <PlatMetaWorksheet data={data} width={984} height={491} />
          </div>
        </div>
        <div className="dashboard-row">
          <div className="dashboard-half">
            <PlatCritWorksheet
              data={data}
              width={492}
              height={449}
              onCategoryClick={onCategoryClick}
              selectedCategory={selectedCategory}
            />
          </div>
          <div className="dashboard-half">
            <PlatUsersWorksheet
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
