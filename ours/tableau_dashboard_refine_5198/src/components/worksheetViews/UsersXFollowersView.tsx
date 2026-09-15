import React from "react";
import type { TweetData } from '../../types';
import { HorizontalBarChart } from '../charts/HorizontalBarChart';
import { useDashboard } from '../../contexts/DashboardContext';

interface UsersXFollowersViewProps {
  data: TweetData[];
  width?: number;
  height?: number;
}

export function UsersXFollowersView({ data, width = 800, height = 400 }: UsersXFollowersViewProps) {
  const { highlight } = useDashboard();

  // Aggregate: sum followers_count by name
  const chartData = React.useMemo(() => {
    const followersMap = new Map<string, { sum: number; flag: string }>();

    data.forEach(tweet => {
      const key = tweet.name;
      if (followersMap.has(key)) {
        const existing = followersMap.get(key)!;
        existing.sum += tweet.followers_count;
      } else {
        followersMap.set(key, { sum: tweet.followers_count, flag: tweet.flag });
      }
    });

    return Array.from(followersMap.entries())
      .map(([name, { sum, flag }]) => ({
        category: name,
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
      title="Users con mayor número de seguidores."
      highlight={highlight}
      truncateLabel={20}
    />
  );
}
