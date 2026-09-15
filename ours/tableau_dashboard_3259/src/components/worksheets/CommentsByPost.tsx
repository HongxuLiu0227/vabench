import React, { useMemo } from 'react';
import type { TwitterData } from '../../types';
import { HorizontalBarChart } from '../charts/HorizontalBarChart';

interface CommentsByPostProps {
  data: TwitterData[];
  onPostClick?: (postUrl: string) => void;
}

export const CommentsByPost: React.FC<CommentsByPostProps> = ({ data, onPostClick }) => {
  const chartData = useMemo(() => {
    const postComments = new Map<string, number>();
    data.forEach((row) => {
      const post = row.投稿URLキャプチャー;
      postComments.set(post, (postComments.get(post) || 0) + row.コメント数);
    });

    return Array.from(postComments.entries())
      .map(([category, value]) => ({ category, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 15);
  }, [data]);

  const handleBarClick = (category: string) => {
    if (onPostClick) {
      onPostClick(category);
    }
  };

  return (
    <div className="worksheet-container">
      <div style={{ marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>
        コメントユーザ(投稿別)
      </div>
      <HorizontalBarChart
        data={chartData}
        width={500}
        height={350}
        xLabel="コメント数"
        onBarClick={handleBarClick}
      />
    </div>
  );
};
