import React, { useMemo } from 'react';
import { StackedBarChart } from '../StackedBarChart';
import type { GameData } from '../../types';
import { aggregateUserSentimentData } from '../../utils/data';

interface DevUsersWorksheetProps {
  data: GameData[];
  width: number;
  height: number;
  onCategoryClick?: (category: string) => void;
  selectedCategory?: string | null;
}

export const DevUsersWorksheet: React.FC<DevUsersWorksheetProps> = ({
  data,
  width,
  height,
  onCategoryClick,
  selectedCategory,
}) => {
  const chartData = useMemo(() => {
    return aggregateUserSentimentData(data, 'developer');
  }, [data]);

  return (
    <div className="worksheet">
      <StackedBarChart
        data={chartData}
        width={width}
        height={height}
        title="Users"
        onCategoryClick={onCategoryClick}
        selectedCategory={selectedCategory}
      />
    </div>
  );
};
