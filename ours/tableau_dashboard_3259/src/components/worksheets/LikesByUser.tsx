import React, { useMemo } from 'react';
import type { TwitterData } from '../../types';
import { HorizontalBarChart } from '../charts/HorizontalBarChart';

interface LikesByUserProps {
  data: TwitterData[];
  onUserClick?: (userUrl: string) => void;
}

export const LikesByUser: React.FC<LikesByUserProps> = ({ data, onUserClick }) => {
  const chartData = useMemo(() => {
    const userLikes = new Map<string, { total: number; count: number }>();
    data.forEach((row) => {
      const user = row.ユーザプロフィールURL;
      if (!userLikes.has(user)) {
        userLikes.set(user, { total: 0, count: 0 });
      }
      const stats = userLikes.get(user)!;
      stats.total += row.いいね数;
      stats.count += 1;
    });

    return Array.from(userLikes.entries())
      .map(([category, stats]) => ({
        category,
        value: Math.round(stats.total / stats.count),
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 15);
  }, [data]);

  const handleBarClick = (category: string) => {
    if (onUserClick) {
      onUserClick(category);
    }
  };

  return (
    <div className="worksheet-container">
      <div style={{ marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>
        いいね数(ユーザ別)
      </div>
      <HorizontalBarChart
        data={chartData}
        width={500}
        height={350}
        xLabel="平均いいね数"
        onBarClick={handleBarClick}
      />
    </div>
  );
};
