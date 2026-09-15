import React, { useMemo } from 'react';
import type { TwitterData } from '../../types';
import { HorizontalBarChart } from '../charts/HorizontalBarChart';

interface RetweetByPostProps {
  data: TwitterData[];
  onPostClick?: (postUrl: string) => void;
}

export const RetweetByPost: React.FC<RetweetByPostProps> = ({ data, onPostClick }) => {
  const chartData = useMemo(() => {
    const postRetweets = new Map<string, number>();
    data.forEach((row) => {
      const post = row.投稿URLキャプチャー;
      postRetweets.set(post, (postRetweets.get(post) || 0) + row.リツイート数);
    });

    return Array.from(postRetweets.entries())
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
        リツイート(投稿別)
      </div>
      <HorizontalBarChart
        data={chartData}
        width={500}
        height={350}
        xLabel="リツイート数"
        onBarClick={handleBarClick}
      />
    </div>
  );
};
