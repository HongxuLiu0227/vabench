import React from "react";
import type { TweetData} from '../../types';
import { VerticalBarChart } from '../charts/VerticalBarChart';
import { useDashboard } from '../../contexts/DashboardContext';

interface TweetsXTiempoViewProps {
  data: TweetData[];
  width?: number;
  height?: number;
}

export function TweetsXTiempoView({ data, width = 700, height = 400 }: TweetsXTiempoViewProps) {
  const { highlight } = useDashboard();

  // Aggregate: count by hour, colored by label
  const chartData = React.useMemo(() => {
    const hourMap = new Map<number, { count: number; label: string }>();

    data.forEach(tweet => {
      const date = new Date(tweet.created_at);
      const hour = date.getHours();

      if (hourMap.has(hour)) {
        const existing = hourMap.get(hour)!;
        existing.count++;
      } else {
        hourMap.set(hour, { count: 1, label: tweet.label });
      }
    });

    return Array.from(hourMap.entries())
      .map(([hour, { count, label }]) => ({
        category: `${hour}:00`,
        value: count,
        label: label,
      }))
      .sort((a, b) => {
        const hourA = parseInt(a.category.split(':')[0]);
        const hourB = parseInt(b.category.split(':')[0]);
        return hourA - hourB;
      });
  }, [data]);

  return (
    <VerticalBarChart
      data={chartData}
      width={width}
      height={height}
      title="Tweets x Tiempo"
      colorBy="label"
      highlight={highlight}
      rotateLabels={true}
    />
  );
}
