import React from "react";
import type { TweetData } from '../../types';
import { HorizontalBarChart } from '../charts/HorizontalBarChart';
import { useDashboard } from '../../contexts/DashboardContext';

interface RetweeteadosViewProps {
  data: TweetData[];
  width?: number;
  height?: number;
}

export function RetweeteadosView({ data, width = 800, height = 400 }: RetweeteadosViewProps) {
  const { highlight } = useDashboard();

  // Aggregate: sum of retweet_count by full_text, colored by flag
  const chartData = React.useMemo(() => {
    const textFlagMap = new Map<string, { sum: number; flag: string }>();

    data.forEach(tweet => {
      const key = tweet.full_text;
      if (textFlagMap.has(key)) {
        const existing = textFlagMap.get(key)!;
        existing.sum += tweet.retweet_count;
      } else {
        textFlagMap.set(key, { sum: tweet.retweet_count, flag: tweet.flag });
      }
    });

    return Array.from(textFlagMap.entries())
      .map(([full_text, { sum, flag }]) => ({
        category: full_text,
        value: sum,
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
      title="+ Retweeteados"
      colorBy="flag"
      highlight={highlight}
      truncateLabel={60}
    />
  );
}
