import React, { useMemo } from 'react';
import type { TwitterData } from '../../types';
import { VerticalBarChart } from '../charts/VerticalBarChart';

interface CommentsDailyProps {
  data: TwitterData[];
  onDateClick?: (date: Date) => void;
}

export const CommentsDaily: React.FC<CommentsDailyProps> = ({ data, onDateClick }) => {
  const chartData = useMemo(() => {
    const dailyComments = new Map<string, number>();
    data.forEach((row) => {
      const date = new Date(row.投稿日時);
      const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      dailyComments.set(dateKey, (dailyComments.get(dateKey) || 0) + row.コメント数);
    });

    return Array.from(dailyComments.entries())
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
        コメントユーザ日別
      </div>
      <VerticalBarChart
        data={chartData}
        width={400}
        height={300}
        xLabel="日付"
        yLabel="コメント数"
        onBarClick={handleBarClick}
      />
    </div>
  );
};
