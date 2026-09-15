import React, { useMemo } from 'react';
import type { TwitterData } from '../../types';
import { HorizontalBarChart } from '../charts/HorizontalBarChart';

interface CommentsByUserProps {
  data: TwitterData[];
  onUserClick?: (userUrl: string) => void;
}

export const CommentsByUser: React.FC<CommentsByUserProps> = ({ data, onUserClick }) => {
  const chartData = useMemo(() => {
    const userComments = new Map<string, { total: number; count: number }>();
    data.forEach((row) => {
      const user = row.ユーザプロフィールURL;
      if (!userComments.has(user)) {
        userComments.set(user, { total: 0, count: 0 });
      }
      const stats = userComments.get(user)!;
      stats.total += row.コメント数;
      stats.count += 1;
    });

    return Array.from(userComments.entries())
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
        コメントユーザ(ユーザ別)
      </div>
      <HorizontalBarChart
        data={chartData}
        width={500}
        height={350}
        xLabel="平均コメント数"
        onBarClick={handleBarClick}
      />
    </div>
  );
};
