import React, { useMemo } from 'react';
import type { TwitterData } from '../../types';
import { PieChart } from '../charts/PieChart';

interface LikesCountProps {
  data: TwitterData[];
}

export const LikesCount: React.FC<LikesCountProps> = ({ data }) => {
  const chartData = useMemo(() => {
    const likeBuckets = new Map<string, number>();
    data.forEach((row) => {
      const likes = row.いいね数;
      let bucket = '0';
      if (likes === 0) bucket = '0';
      else if (likes <= 5) bucket = '1-5';
      else if (likes <= 10) bucket = '6-10';
      else if (likes <= 20) bucket = '11-20';
      else if (likes <= 50) bucket = '21-50';
      else bucket = '51+';

      likeBuckets.set(bucket, (likeBuckets.get(bucket) || 0) + 1);
    });

    return Array.from(likeBuckets.entries())
      .map(([category, value]) => ({ category, value }))
      .sort((a, b) => {
        const order = ['0', '1-5', '6-10', '11-20', '21-50', '51+'];
        return order.indexOf(a.category) - order.indexOf(b.category);
      });
  }, [data]);

  return (
    <div className="worksheet-container">
      <div style={{ marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>
        いいね数
      </div>
      <PieChart data={chartData} width={300} height={250} />
    </div>
  );
};
