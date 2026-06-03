import { useState, useEffect } from 'react';
import { mockAnalyticsData } from '../services/userService';

type AnalyticsData = {
  date: string;
  pageViews: number;
  uniqueVisitors: number;
  bounceRate: number;
  avgSessionDuration: number;
  topPages: { page: string; views: number }[];
  trafficSources: { source: string; percentage: number }[];
  devices: { device: string; percentage: number }[];
};

export const useAnalyticsData = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchData = async (dateRange?: any, metric?: string) => {
    setLoading(true);
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300));
    setData(mockAnalyticsData);
    setLoading(false);
  };

  return { data, loading, fetchData };
};
