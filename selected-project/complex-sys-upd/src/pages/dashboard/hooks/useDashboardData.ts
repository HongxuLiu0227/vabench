import { useState, useEffect } from 'react';
import { dashboardService } from '../services/dashboardService';

type DashboardData = {
  kpis: {
    totalProjects: number;
    activeTasks: number;
    completedTasks: number;
    overdueTasks: number;
  };
  recentFiles: Array<{
    id: string;
    name: string;
    type: string;
    modified: string;
    size: string;
  }>;
  activityTimeline: Array<{
    id: string;
    user: string;
    action: string;
    timestamp: string;
    avatar: string;
  }>;
  quickLinks: Array<{
    id: string;
    title: string;
    url: string;
    icon: string;
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
    forecast: Array<{
      day: string;
      high: number;
      low: number;
      condition: string;
    }>;
  };
};

const useDashboardData = () => ({ data: [] });
export default useDashboardData;
