import React, { useMemo } from 'react';
import { StackedBarChart } from '../StackedBarChart';
import type { GameData } from '../../types';
import { aggregateSentimentData } from '../../utils/data';

interface PlatCritWorksheetProps {
  data: GameData[];
  width: number;
  height: number;
  onCategoryClick?: (category: string) => void;
  selectedCategory?: string | null;
}

export const PlatCritWorksheet: React.FC<PlatCritWorksheetProps> = ({
  data,
  width,
  height,
  onCategoryClick,
  selectedCategory,
}) => {
  const chartData = useMemo(() => {
    return aggregateSentimentData(data, 'platform');
  }, [data]);

  return (
    <div className="worksheet">
      <StackedBarChart
        data={chartData}
        width={width}
        height={height}
        title="Critics"
        onCategoryClick={onCategoryClick}
        selectedCategory={selectedCategory}
      />
    </div>
  );
};
