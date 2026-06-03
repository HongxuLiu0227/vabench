import type { ApiResponse } from '../utils/apiUtils';

interface AnalyticsData {
  date: string;
  pageViews: number;
  uniqueVisitors: number;
  bounceRate: number;
  avgSessionDuration: number;
  conversions: number;
}

interface DeviceBreakdown {
  device: string;
  percentage: number;
}

interface TrafficSource {
  source: string;
  visitors: number;
}

interface GeoData {
  country: string;
  sessions: number;
}

export const fetchAnalyticsData = async (dateRange: { start: string; end: string }): Promise<ApiResponse<AnalyticsData[]>> => {
  try {
    // In a real app, this would be an API call
    const mockData: AnalyticsData[] = [
      {
        date: '2023-05-01',
        pageViews: 1245,
        uniqueVisitors: 892,
        bounceRate: 0.32,
        avgSessionDuration: 142,
        conversions: 45
      },
      {
        date: '2023-05-02',
        pageViews: 1567,
        uniqueVisitors: 1023,
        bounceRate: 0.28,
        avgSessionDuration: 156,
        conversions: 52
      },
      {
        date: '2023-05-03',
        pageViews: 1432,
        uniqueVisitors: 987,
        bounceRate: 0.31,
        avgSessionDuration: 138,
        conversions: 48
      }
    ];

    return { data: mockData, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
};

export const fetchDeviceBreakdown = async (): Promise<ApiResponse<DeviceBreakdown[]>> => {
  try {
    const mockData: DeviceBreakdown[] = [
      { device: 'Desktop', percentage: 0.58 },
      { device: 'Mobile', percentage: 0.35 },
      { device: 'Tablet', percentage: 0.07 }
    ];

    return { data: mockData, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
};

export const fetchTrafficSources = async (): Promise<ApiResponse<TrafficSource[]>> => {
  try {
    const mockData: TrafficSource[] = [
      { source: 'Organic Search', visitors: 1245 },
      { source: 'Direct', visitors: 876 },
      { source: 'Social', visitors: 543 },
      { source: 'Referral', visitors: 321 },
      { source: 'Email', visitors: 210 }
    ];

    return { data: mockData, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
};

export const fetchGeoData = async (): Promise<ApiResponse<GeoData[]>> => {
  try {
    const mockData: GeoData[] = [
      { country: 'United States', sessions: 2345 },
      { country: 'United Kingdom', sessions: 1234 },
      { country: 'Germany', sessions: 876 },
      { country: 'France', sessions: 765 },
      { country: 'Canada', sessions: 543 }
    ];

    return { data: mockData, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
};

export const fetchTopPages = async (): Promise<ApiResponse<{ page: string; views: number }[]>> => {
  try {
    const mockData = [
      { page: '/dashboard', views: 3456 },
      { page: '/products', views: 2345 },
      { page: '/blog', views: 1876 },
      { page: '/pricing', views: 1543 },
      { page: '/contact', views: 987 }
    ];

    return { data: mockData, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
};