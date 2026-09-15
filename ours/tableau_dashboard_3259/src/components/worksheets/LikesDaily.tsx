import React, { useMemo } from 'react';
import type { TwitterData } from '../../types';
import { VerticalBarChart } from '../charts/VerticalBarChart';

interface LikesDailyProps {
  data: TwitterData[];
  onDateClick?: (date: Date) => void;
}

export const LikesDaily: React.FC<LikesDailyProps> = ({ data, onDateClick }) => {
  const chartData = useMemo(() => {
    const dailyLikes = new Map<string, number>();
    data.forEach((row) => {
      const date = new Date(row.投稿日時);
      const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      dailyLikes.set(dateKey, (dailyLikes.get(dateKey) || 0) + row.いいね数);
    });

    return Array.from(dailyLikes.entries())
      .map(([category, value]) => ({ category, value }))
      .sort((a, b) => a.category.localeCompare(b.category));
  }, [data]);

  const handleBarClick = (category: string) => {
    if (onDateClick) {
      const [year, month, day] = category.split('-').map(Number);
      onDateClick(new Date(year, month - 1, day));
    }
  };

  return (
    <div className="worksheet-container">
      <div style={{ marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>
        いいねユーザ日別
      </div>
      <VerticalBarChart
        data={chartData}
        width={400}
        height={300}
        xLabel="日付"
        yLabel="いいね数"
        onBarClick={handleBarClick}
      />
    </div>
  );
};
