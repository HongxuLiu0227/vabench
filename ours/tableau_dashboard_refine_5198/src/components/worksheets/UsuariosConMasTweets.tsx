import React from "react";
import type { TweetData } from '../../types';
import { HorizontalBarChart } from '../charts/HorizontalBarChart';
import { useDashboard } from '../../contexts/DashboardContext';

interface UsuariosConMasTweetsProps {
  data: TweetData[];
  width?: number;
  height?: number;
}

export function UsuariosConMasTweets({ data, width = 800, height = 380 }: UsuariosConMasTweetsProps) {
  const { highlight, setHighlight, clearHighlight } = useDashboard();

  // Aggregate: count tweets by user (name), colored by label
  const chartData = React.useMemo(() => {
    // Group by name to get most common label per user
    const userLabelMap = new Map<string, string>();
    const nameCountMap = new Map<string, number>();

    data.forEach(tweet => {
      nameCountMap.set(tweet.name, (nameCountMap.get(tweet.name) || 0) + 1);
      // Use the last label (or most common) for coloring
      userLabelMap.set(tweet.name, tweet.label);
    });

    // Convert to array and sort
    const aggregated = Array.from(nameCountMap.entries())
      .map(([name, count]) => ({
        category: name,
        value: count,
        label: userLabelMap.get(name),
        full_text: name, // For highlight matching
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 15); // Top 15 users

    return aggregated;
  }, [data]);

  const handleBarClick = (category: string, clickedData: typeof chartData[0]) => {
    if (highlight.enabled && highlight.name === category) {
      clearHighlight();
    } else {
      setHighlight({
        enabled: true,
        name: category,
        label: clickedData.label,
      });
    }
  };

  return (
    <HorizontalBarChart
      data={chartData}
      width={width}
      height={height}
      title="Usuarios con + Tweets"
      colorBy="label"
      highlight={highlight}
      onBarClick={handleBarClick}
      truncateLabel={20}
    />
  );
}
