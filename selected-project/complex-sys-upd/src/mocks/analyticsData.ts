export const analyticsData = {
  pageViews: {
    total: 12453,
    byDay: [
      { date: '2023-05-01', views: 423 },
      { date: '2023-05-02', views: 587 },
      { date: '2023-05-03', views: 812 },
      { date: '2023-05-04', views: 654 },
      { date: '2023-05-05', views: 932 },
      { date: '2023-05-06', views: 721 },
      { date: '2023-05-07', views: 543 }
    ],
    byPage: [
      { page: '/dashboard', views: 4521 },
      { page: '/profile', views: 3120 },
      { page: '/settings', views: 1876 },
      { page: '/projects', views: 2936 }
    ]
  },
  userActivity: {
    activeUsers: 843,
    newUsers: 231,
    returningUsers: 612,
    sessions: 1245,
    avgSessionDuration: '4m 23s',
    byCountry: [
      { country: 'United States', users: 421 },
      { country: 'Germany', users: 187 },
      { country: 'United Kingdom', users: 156 },
      { country: 'France', users: 98 },
      { country: 'Japan', users: 76 }
    ]
  },
  conversions: {
    signups: 231,
    purchases: 98,
    trialSubscriptions: 54,
    premiumSubscriptions: 32,
    conversionRate: '3.2%'
  },
  devices: {
    desktop: 621,
    mobile: 487,
    tablet: 137,
    desktopPercentage: '50%',
    mobilePercentage: '39%',
    tabletPercentage: '11%'
  },
  trafficSources: {
    direct: 421,
    organic: 587,
    referral: 198,
    social: 156,
    email: 123
  }
};

export const getAnalyticsData = async () => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return analyticsData;
};