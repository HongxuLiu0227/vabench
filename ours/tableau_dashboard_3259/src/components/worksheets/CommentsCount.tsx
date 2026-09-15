import React, { useMemo } from 'react';
import type { TwitterData } from '../../types';
import { PieChart } from '../charts/PieChart';

interface CommentsCountProps {
  data: TwitterData[];
}

export const CommentsCount: React.FC<CommentsCountProps> = ({ data }) => {
  const chartData = useMemo(() => {
    const commentBuckets = new Map<string, number>();
    data.forEach((row) => {
      const comments = row.コメント数;
      let bucket = '0';
      if (comments === 0) bucket = '0';
      else if (comments === 1) bucket = '1';
      else if (comments <= 3) bucket = '2-3';
      else if (comments <= 5) bucket = '4-5';
      else bucket = '6+';

      commentBuckets.set(bucket, (commentBuckets.get(bucket) || 0) + 1);
    });

    return Array.from(commentBuckets.entries())
      .map(([category, value]) => ({ category, value }))
      .sort((a, b) => {
        const order = ['0', '1', '2-3', '4-5', '6+'];
        return order.indexOf(a.category) - order.indexOf(b.category);
      });
  }, [data]);

  return (
    <div className="worksheet-container">
      <div style={{ marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>
        コメント数
      </div>
      <PieChart data={chartData} width={300} height={250} />
    </div>
  );
};
