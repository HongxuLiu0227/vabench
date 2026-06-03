import { useState, useEffect } from 'react';
import { dashboardService } from '../pages/dashboard/services/dashboardService';

type DashboardData = {
  kpis: {
    totalUsers: number;
    activeProjects: number;
    tasksCompleted: number;
    revenue: number;
  };
  recentFiles: Array<{
    id: string;
    name: string;
    type: string;
    modified: string;
    size: string;
  }>;
  activities: Array<{
    id: string;
    user: string;
    action: string;
    timestamp: string;
  }>;
  announcements: Array<{
    id: string;
    title: string;
    content: string;
    date: string;
  }>;
  weather: {
    temperature: number;
    condition: string;
    icon: string;
  };
};

export const useDashboardData = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await dashboardService.getDashboardData();
        setData(response);
      } catch (err) {
        setError('Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading, error };
};
