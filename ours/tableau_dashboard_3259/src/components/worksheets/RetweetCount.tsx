import React, { useMemo } from 'react';
import type { TwitterData } from '../../types';
import { PieChart } from '../charts/PieChart';

interface RetweetCountProps {
  data: TwitterData[];
}

export const RetweetCount: React.FC<RetweetCountProps> = ({ data }) => {
  const chartData = useMemo(() => {
    const retweetBuckets = new Map<string, number>();
    data.forEach((row) => {
      const retweets = row.リツイート数;
      let bucket = '0';
      if (retweets === 0) bucket = '0';
      else if (retweets <= 3) bucket = '1-3';
      else if (retweets <= 5) bucket = '4-5';
      else if (retweets <= 10) bucket = '6-10';
      else bucket = '11+';

      retweetBuckets.set(bucket, (retweetBuckets.get(bucket) || 0) + 1);
    });

    return Array.from(retweetBuckets.entries())
      .map(([category, value]) => ({ category, value }))
      .sort((a, b) => {
        const order = ['0', '1-3', '4-5', '6-10', '11+'];
        return order.indexOf(a.category) - order.indexOf(b.category);
      });
  }, [data]);

  return (
    <div className="worksheet-container">
      <div style={{ marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>
        リツート数
      </div>
      <PieChart data={chartData} width={300} height={250} />
    </div>
  );
};
