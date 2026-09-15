import React from "react";
import type { TweetData } from '../../types';
import { HorizontalBarChart } from '../charts/HorizontalBarChart';
import { useDashboard } from '../../contexts/DashboardContext';

interface EvolucionTipoTweetsViewProps {
  data: TweetData[];
  width?: number;
  height?: number;
}

export function EvolucionTipoTweetsView({ data, width = 800, height = 400 }: EvolucionTipoTweetsViewProps) {
  const { highlight } = useDashboard();

  // Filter to only negative and positive labels
  const filteredData = React.useMemo(() => {
    return data.filter(d => d.label === 'negative' || d.label === 'positive');
  }, [data]);

  // Aggregate: count by time (year-month) and label, colored by flag
  const chartData = React.useMemo(() => {
    const timeMap = new Map<string, { count: number; flag: string }>();

    filteredData.forEach(tweet => {
      const date = new Date(tweet.created_at);
      const timeKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      if (timeMap.has(timeKey)) {
        const existing = timeMap.get(timeKey)!;
        existing.count++;
      } else {
        timeMap.set(timeKey, { count: 1, flag: tweet.flag });
      }
    });

    return Array.from(timeMap.entries())
      .map(([time, { count, flag }]) => ({
        category: time,
        value: count,
        flag: flag,
      }))
      .sort((a, b) => a.category.localeCompare(b.category));
  }, [filteredData]);

  return (
    <HorizontalBarChart
      data={chartData}
      width={width}
      height={height}
      title="Evolución Tipo de Tweets"
      colorBy="flag"
      highlight={highlight}
      margin={{ top: 40, right: 20, bottom: 60, left: 80 }}
    />
  );
}
