import React, { useMemo } from 'react';
import { TrendChart } from '../TrendChart';
import type { GameData } from '../../types';

interface PlatMetaWorksheetProps {
  data: GameData[];
  width: number;
  height: number;
}

export const PlatMetaWorksheet: React.FC<PlatMetaWorksheetProps> = ({
  data,
  width,
  height,
}) => {
  const chartData = useMemo(() => {
    // Group by month, calculate average metascore
    const grouped = new Map<string, { sum: number; count: number; date: Date }>();

    data.forEach(row => {
      const dateKey = new Date(Date.UTC(row.release_date.getFullYear(), row.release_date.getMonth(), 1));
      const key = dateKey.toISOString();

      if (!grouped.has(key)) {
        grouped.set(key, { sum: 0, count: 0, date: dateKey });
      }

      const item = grouped.get(key)!;
      item.sum += row.metascore;
      item.count += 1;
    });

    return Array.from(grouped.values())
      .filter(item => item.count > 0)
      .map(item => ({
        date: item.date,
        avgMetascore: item.sum / item.count,
        avgUserScore: 0,
        count: item.count,
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [data]);

  return (
    <div className="worksheet">
      <TrendChart
        data={chartData}
        width={width}
        height={height}
        title="Platforms"
        axisTitleX="Month of release"
        axisTitleY="Average Metascore"
      />
    </div>
  );
};
