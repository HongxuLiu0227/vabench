export const fetchDashboardData = async (type: string, { timeRange }: { timeRange: '7d' | '30d' | '90d'}) => {
  // Generate mock data for now
  const mockData = {
    lineChart: {
      data: new Array(timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90).fill(0).map((_, index) => ({
        date: new Date(Date.now() - index * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        value: Math.floor(Math.random() * 100),
      })),
    },
  };
  return mockData[type as keyof typeof mockData];
};