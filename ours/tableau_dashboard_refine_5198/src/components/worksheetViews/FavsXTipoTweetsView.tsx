import React from "react";
import type { TweetData } from '../../types';
import { VerticalBarChart } from '../charts/VerticalBarChart';
import { useDashboard } from '../../contexts/DashboardContext';

interface FavsXTipoTweetsViewProps {
  data: TweetData[];
  width?: number;
  height?: number;
}

export function FavsXTipoTweetsView({ data, width = 700, height = 400 }: FavsXTipoTweetsViewProps) {
  const { highlight } = useDashboard();

  // Filter to only negative and positive labels
  const filteredData = React.useMemo(() => {
    return data.filter(d => d.label === 'negative' || d.label === 'positive');
  }, [data]);

  // Aggregate: sum favorite_count by flag/label combination
  const chartData = React.useMemo(() => {
    const flagLabelMap = new Map<string, number>();

    filteredData.forEach(tweet => {
      const key = `${tweet.flag}-${tweet.label}`;
      flagLabelMap.set(key, (flagLabelMap.get(key) || 0) + tweet.favorite_count);
    });

    return Array.from(flagLabelMap.entries())
      .map(([key, value]) => {
        const [flag, label] = key.split('-');
        return {
          category: `${flag} / ${label}`,
          value: value,
          label: label,
          flag: flag,
        };
      })
      .sort((a, b) => b.value - a.value);
  }, [filteredData]);

  return (
    <VerticalBarChart
      data={chartData}
      width={width}
      height={height}
      title="Favs x Tipo de Tweets"
      colorBy="label"
      highlight={highlight}
      rotateLabels={true}
    />
  );
}
