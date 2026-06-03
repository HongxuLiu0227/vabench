import type { KpiData, RecentFile, Activity, Announcement, WeatherData } from '../../../types/index';
export const fetchKpiData = async () => { return []; };
export const dashboardService = { fetchKpiData };
export default dashboardService;

export const fetchRecentFiles = async (): Promise<RecentFile[]> => {
  return [
    { id: 1, name: 'Q1 Report.pdf', type: 'pdf', size: '2.4 MB', modified: '2023-04-15' },
    { id: 2, name: 'User Survey.xlsx', type: 'xlsx', size: '1.8 MB', modified: '2023-04-12' },
    { id: 3, name: 'Project Plan.docx', type: 'docx', size: '3.2 MB', modified: '2023-04-10' },
    { id: 4, name: 'Budget Presentation.pptx', type: 'pptx', size: '5.1 MB', modified: '2023-04-05' }
  ];
};

export const fetchActivities = async (): Promise<Activity[]> => {
  return [
    { id: 1, user: 'Alex Johnson', action: 'created project', target: 'Website Redesign', time: '2 hours ago' },
    { id: 2, user: 'Maria Garcia', action: 'completed task', target: 'User Research', time: '4 hours ago' },
    { id: 3, user: 'Sam Wilson', action: 'uploaded file', target: 'Wireframes.pdf', time: '1 day ago' },
    { id: 4, user: 'Taylor Smith', action: 'commented on', target: 'Project Plan', time: '2 days ago' }
  ];
};

export const fetchAnnouncements = async (): Promise<Announcement[]> => {
  return [
    { id: 1, title: 'Office Closure', content: 'Main office will be closed on May 1st for Labor Day', date: '2023-04-25' },
    { id: 2, title: 'New Policy', content: 'Remote work policy updated effective June 1st', date: '2023-04-20' },
    { id: 3, title: 'Team Lunch', content: 'Monthly team lunch this Friday at 12:30pm', date: '2023-04-18' }
  ];
};

export const fetchWeather = async (): Promise<WeatherData> => {
  return {
    temperature: 72,
    condition: 'Partly Cloudy',
    high: 78,
    low: 65,
    icon: 'partly-cloudy'
  };
};

export const fetchChartData = async (): Promise<{date: string; value: number}[]> => {
  return [
    { date: 'Jan', value: 65 },
    { date: 'Feb', value: 59 },
    { date: 'Mar', value: 80 },
    { date: 'Apr', value: 81 },
    { date: 'May', value: 56 },
    { date: 'Jun', value: 55 },
    { date: 'Jul', value: 40 }
  ];
};