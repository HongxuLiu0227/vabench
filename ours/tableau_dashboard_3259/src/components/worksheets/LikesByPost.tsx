import React, { useMemo } from 'react';
import type { TwitterData } from '../../types';
import { HorizontalBarChart } from '../charts/HorizontalBarChart';

interface LikesByPostProps {
  data: TwitterData[];
  onPostClick?: (postUrl: string) => void;
}

export const LikesByPost: React.FC<LikesByPostProps> = ({ data, onPostClick }) => {
  const chartData = useMemo(() => {
    const postLikes = new Map<string, number>();
    data.forEach((row) => {
      const post = row.投稿URLキャプチャー;
      postLikes.set(post, (postLikes.get(post) || 0) + row.いいね数);
    });

    return Array.from(postLikes.entries())
      .map(([category, value]) => ({ category, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 15);
  }, [data]);

  const handleBarClick = (category: string) => {
    if (onPostClick) {
      onPostClick(category);
    }
    window.open(category, '_blank');
  };

  return (
    <div className="worksheet-container">
      <div style={{ marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>
        いいね数(投稿別)
      </div>
      <HorizontalBarChart
        data={chartData}
        width={500}
        height={350}
        xLabel="いいね数"
        onBarClick={handleBarClick}
      />
    </div>
  );
};
