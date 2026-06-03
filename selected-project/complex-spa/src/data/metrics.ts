export const metrics = {
  revenue: {
    current: 125000,
    target: 150000,
    trend: 'up',
    change: 12.5
  },
  users: {
    current: 842,
    target: 1000,
    trend: 'up',
    change: 8.3
  },
  conversion: {
    current: 3.2,
    target: 4.0,
    trend: 'down',
    change: -0.5
  },
  churn: {
    current: 1.8,
    target: 1.5,
    trend: 'up',
    change: 0.3
  },
  mrr: {
    current: 45000,
    target: 50000,
    trend: 'up',
    change: 5.2
  },
  arpu: {
    current: 53.4,
    target: 55.0,
    trend: 'down',
    change: -1.6
  },
  activeUsers: {
    current: 624,
    target: 700,
    trend: 'up',
    change: 7.6
  },
  sessions: {
    current: 3245,
    target: 3500,
    trend: 'up',
    change: 6.3
  }
};

export const kpiData = [
  {
    id: 1,
    title: 'Total Revenue',
    value: '$125K',
    change: '+12.5%',
    trend: 'up',
    icon: 'dollar'
  },
  {
    id: 2,
    title: 'Active Users',
    value: '842',
    change: '+8.3%',
    trend: 'up',
    icon: 'user'
  },
  {
    id: 3,
    title: 'Conversion Rate',
    value: '3.2%',
    change: '-0.5%',
    trend: 'down',
    icon: 'swap'
  },
  {
    id: 4,
    title: 'Avg. Session',
    value: '4m 32s',
    change: '+6.3%',
    trend: 'up',
    icon: 'clock-circle'
  }
];

export const performanceMetrics = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [
    {
      label: 'Revenue',
      data: [85000, 92000, 105000, 112000, 118000, 125000],
      borderColor: '#4CAF50',
      backgroundColor: 'rgba(76, 175, 80, 0.1)'
    },
    {
      label: 'Users',
      data: [620, 680, 720, 780, 810, 842],
      borderColor: '#2196F3',
      backgroundColor: 'rgba(33, 150, 243, 0.1)'
    },
    {
      label: 'Conversion',
      data: [2.8, 3.0, 3.1, 3.3, 3.2, 3.2],
      borderColor: '#FFC107',
      backgroundColor: 'rgba(255, 193, 7, 0.1)'
    }
  ]
};