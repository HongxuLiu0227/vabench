import React from "react";
import type { TweetData } from '../../types';
import { CustomTableauView } from '../charts/CustomTableauView';
import { useDashboard } from '../../contexts/DashboardContext';

interface RTxTiposTweetsViewProps {
  data: TweetData[];
  width?: number;
  height?: number;
}

export function RTxTiposTweetsView({ data, width = 700, height = 350 }: RTxTiposTweetsViewProps) {
  const { highlight } = useDashboard();

  // Filter to only negative and positive labels
  const filteredData = React.useMemo(() => {
    return data.filter(d => d.label === 'negative' || d.label === 'positive');
  }, [data]);

  // Aggregate: sum retweet_count by flag and label
  const chartData = React.useMemo(() => {
    const flagLabelMap = new Map<string, number>();

    filteredData.forEach(tweet => {
      const key = `${tweet.flag}-${tweet.label}`;
      flagLabelMap.set(key, (flagLabelMap.get(key) || 0) + tweet.retweet_count);
    });

    return Array.from(flagLabelMap.entries())
      .map(([key, value]) => {
        const [flag, label] = key.split('-');
        return {
          flag: flag,
          label: label,
          value: value,
        };
      });
  }, [filteredData]);

  return (
    <CustomTableauView
      data={chartData}
      width={width}
      height={height}
      title="RT x Tipos de Tweets"
      highlight={highlight}
    />
  );
}
