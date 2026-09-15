import React, { useMemo } from 'react';
import type { TwitterData } from '../../types';
import { HorizontalBarChart } from '../charts/HorizontalBarChart';

interface UserPostRankingProps {
  data: TwitterData[];
  onUserClick?: (userUrl: string) => void;
}

export const UserPostRanking: React.FC<UserPostRankingProps> = ({
  data,
  onUserClick,
}) => {
  const chartData = useMemo(() => {
    const userCounts = new Map<string, number>();
    data.forEach((row) => {
      const user = row.ユーザプロフィールURL;
      userCounts.set(user, (userCounts.get(user) || 0) + 1);
    });

    return Array.from(userCounts.entries())
      .map(([category, value]) => ({ category, value }))
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
        ユーザ別投稿数ランキング
      </div>
      <div style={{ position: 'relative' }}>
        <HorizontalBarChart
          data={chartData}
          width={600}
          height={400}
          xLabel="投稿数"
          onBarClick={handleBarClick}
        />
        <div style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          fontSize: '11px',
          color: '#666'
        }}>
          クリックでフィルタ / URLでプロフィールへ
        </div>
      </div>
    </div>
  );
};
