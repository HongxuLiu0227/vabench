import React, { useMemo } from 'react';
import type { TwitterData } from '../../types';
import { VerticalBarChart } from '../charts/VerticalBarChart';

interface RetweetDailyProps {
  data: TwitterData[];
  onDateClick?: (date: Date) => void;
}

export const RetweetDaily: React.FC<RetweetDailyProps> = ({ data, onDateClick }) => {
  const chartData = useMemo(() => {
    const dailyRetweets = new Map<string, number>();
    data.forEach((row) => {
      const date = new Date(row.投稿日時);
      const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      dailyRetweets.set(dateKey, (dailyRetweets.get(dateKey) || 0) + row.リツイート数);
    });

    return Array.from(dailyRetweets.entries())
      .map(([category, value]) => ({ category, value }))
      .sort((a, b) => a.category.localeCompare(b.category));
  }, [data]);

  const handleBarClick = (category: string) => {
    if (onDateClick) {
      const [year, month, day] = category.split('-').map(Number);
      onDateClick(new Date(year, month - 1, day));
    }
  };

  return (
    <div className="worksheet-container">
      <div style={{ marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>
        リツイート日別
      </div>
      <VerticalBarChart
        data={chartData}
        width={400}
        height={300}
        xLabel="日付"
        yLabel="リツイート数"
        onBarClick={handleBarClick}
      />
    </div>
  );
};
