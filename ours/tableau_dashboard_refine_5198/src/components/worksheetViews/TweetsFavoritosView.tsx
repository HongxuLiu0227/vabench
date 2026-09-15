import React from "react";
import type { TweetData } from '../../types';
import { HorizontalBarChart } from '../charts/HorizontalBarChart';
import { useDashboard } from '../../contexts/DashboardContext';

interface TweetsFavoritosViewProps {
  data: TweetData[];
  width?: number;
  height?: number;
}

export function TweetsFavoritosView({ data, width = 800, height = 400 }: TweetsFavoritosViewProps) {
  const { highlight } = useDashboard();

  // Aggregate: sum favorite_count by full_text, colored by label
  const chartData = React.useMemo(() => {
    const textLabelMap = new Map<string, { sum: number; label: string; flag: string }>();

    data.forEach(tweet => {
      const key = tweet.full_text;
      if (textLabelMap.has(key)) {
        const existing = textLabelMap.get(key)!;
        existing.sum += tweet.favorite_count;
      } else {
        textLabelMap.set(key, { sum: tweet.favorite_count, label: tweet.label, flag: tweet.flag });
      }
    });

    return Array.from(textLabelMap.entries())
      .map(([full_text, { sum, label, flag }]) => ({
        category: full_text,
        value: sum,
        label: label,
        flag: flag,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10); // Top 10
  }, [data]);

  return (
    <HorizontalBarChart
      data={chartData}
      width={width}
      height={height}
      title="Tweets Favoritos"
      colorBy="label"
      highlight={highlight}
      truncateLabel={60}
    />
  );
}
