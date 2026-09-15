import React from "react";
import type { TweetData } from '../../types';
import { VerticalBarChart } from '../charts/VerticalBarChart';
import { useDashboard } from '../../contexts/DashboardContext';

interface TweetsPorUsuarioViewProps {
  data: TweetData[];
  width?: number;
  height?: number;
}

export function TweetsPorUsuarioView({ data, width = 700, height = 400 }: TweetsPorUsuarioViewProps) {
  const { highlight } = useDashboard();

  // Filter: only Kirchner flag and negative/positive labels
  const filteredData = React.useMemo(() => {
    return data.filter(d => d.flag === 'Kirchner' && (d.label === 'negative' || d.label === 'positive'));
  }, [data]);

  // Aggregate: count by name and label combination
  const chartData = React.useMemo(() => {
    const nameLabelMap = new Map<string, { count: number; label: string; flag: string }>();

    filteredData.forEach(tweet => {
      const key = tweet.name;
      if (nameLabelMap.has(key)) {
        const existing = nameLabelMap.get(key)!;
        existing.count++;
      } else {
        nameLabelMap.set(key, { count: 1, label: tweet.label, flag: tweet.flag });
      }
    });

    return Array.from(nameLabelMap.entries())
      .map(([name, { count, label, flag }]) => ({
        category: name,
        value: count,
        label: label,
        flag: flag,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 15); // Top 15
  }, [filteredData]);

  return (
    <VerticalBarChart
      data={chartData}
      width={width}
      height={height}
      title="Tweets por Usuario"
      colorBy="label"
      highlight={highlight}
      rotateLabels={true}
    />
  );
}
