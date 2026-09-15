import React, { useMemo } from 'react';
import type { TwitterData } from '../../types';
import { HorizontalBarChart } from '../charts/HorizontalBarChart';

interface RetweetByUserProps {
  data: TwitterData[];
  onUserClick?: (userUrl: string) => void;
}

export const RetweetByUser: React.FC<RetweetByUserProps> = ({ data, onUserClick }) => {
  const chartData = useMemo(() => {
    const userRetweets = new Map<string, { total: number; count: number }>();
    data.forEach((row) => {
      const user = row.ユーザプロフィールURL;
      if (!userRetweets.has(user)) {
        userRetweets.set(user, { total: 0, count: 0 });
      }
      const stats = userRetweets.get(user)!;
      stats.total += row.リツイート数;
      stats.count += 1;
    });

    return Array.from(userRetweets.entries())
      .map(([category, stats]) => ({
        category,
        value: Math.round((stats.total / stats.count) * 10) / 10,
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
        リツイート(ユーザ別)
      </div>
      <HorizontalBarChart
        data={chartData}
        width={500}
        height={350}
        xLabel="平均リツイート数"
        onBarClick={handleBarClick}
      />
    </div>
  );
};
