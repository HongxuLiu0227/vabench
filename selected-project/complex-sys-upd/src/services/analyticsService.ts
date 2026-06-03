import type { ApiResponse } from '../utils/apiUtils';

interface AnalyticsData {
  date: string;
  pageViews: number;
  uniqueVisitors: number;
  bounceRate: number;
  avgSessionDuration: number;
  conversions: number;
}

interface FilterOptions {
  startDate: string;
  endDate: string;
  page?: string;
  deviceType?: 'desktop' | 'mobile' | 'tablet' | 'all';
}

export const fetchAnalyticsData = async (filters: FilterOptions): Promise<ApiResponse<AnalyticsData[]>> => {
  try {
    // In a real app, this would be an actual API call
    const mockData: AnalyticsData[] = [
      {
        date: '2023-05-01',
        pageViews: 1245,
        uniqueVisitors: 892,
        bounceRate: 0.42,
        avgSessionDuration: 156,
        conversions: 28
      },
      {
        date: '2023-05-02',
        pageViews: 1432,
        uniqueVisitors: 1021,
        bounceRate: 0.38,
        avgSessionDuration: 172,
        conversions: 34
      },
      {
        date: '2023-05-03',
        pageViews: 1567,
        uniqueVisitors: 1123,
        bounceRate: 0.35,
        avgSessionDuration: 184,
        conversions: 41
      }
    ];

    // Apply filters to mock data (simulating backend filtering)
    const filteredData = mockData.filter(item => {
      const date = new Date(item.date);
      const startDate = new Date(filters.startDate);
      const endDate = new Date(filters.endDate);
      return date >= startDate && date <= endDate;
    });

    return {
      data: filteredData,
      success: true,
      message: 'Analytics data fetched successfully'
    };
  } catch (error) {
    return {
      data: [],
      success: false,
      message: error instanceof Error ? error.message : 'Failed to fetch analytics data'
    };
  }
};

export const fetchTopPages = async (): Promise<ApiResponse<{page: string; views: number}[]>> => {
  try {
    // Mock data for top pages
    return {
      data: [
        { page: '/dashboard', views: 3421 },
        { page: '/projects', views: 2789 },
        { page: '/profile', views: 1954 },
        { page: '/settings', views: 1243 },
        { page: '/analytics', views: 987 }
      ],
      success: true,
      message: 'Top pages data fetched successfully'
    };
  } catch (error) {
    return {
      data: [],
      success: false,
      message: error instanceof Error ? error.message : 'Failed to fetch top pages data'
    };
  }
};

export const fetchDeviceDistribution = async (): Promise<ApiResponse<{device: string; percentage: number}[]>> => {
  try {
    // Mock data for device distribution
    return {
      data: [
        { device: 'Desktop', percentage: 0.58 },
        { device: 'Mobile', percentage: 0.35 },
        { device: 'Tablet', percentage: 0.07 }
      ],
      success: true,
      message: 'Device distribution data fetched successfully'
    };
  } catch (error) {
    return {
      data: [],
      success: false,
      message: error instanceof Error ? error.message : 'Failed to fetch device distribution data'
    };
  }
};

export const fetchConversionRates = async (): Promise<ApiResponse<{goal: string; rate: number}[]>> => {
  try {
    // Mock data for conversion rates
    return {
      data: [
        { goal: 'Sign Up', rate: 0.12 },
        { goal: 'Purchase', rate: 0.08 },
        { goal: 'Download', rate: 0.15 },
        { goal: 'Contact', rate: 0.05 }
      ],
      success: true,
      message: 'Conversion rates data fetched successfully'
    };
  } catch (error) {
    return {
      data: [],
      success: false,
      message: error instanceof Error ? error.message : 'Failed to fetch conversion rates data'
    };
  }
};