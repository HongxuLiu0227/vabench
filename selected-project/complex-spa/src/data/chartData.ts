export const lineChartData = {
  title: 'Monthly Sales Performance',
  xField: 'month',
  yField: 'sales',
  data: [
    { month: 'Jan', sales: 125000 },
    { month: 'Feb', sales: 98000 },
    { month: 'Mar', sales: 145000 },
    { month: 'Apr', sales: 110000 },
    { month: 'May', sales: 165000 },
    { month: 'Jun', sales: 132000 },
    { month: 'Jul', sales: 155000 },
    { month: 'Aug', sales: 142000 },
    { month: 'Sep', sales: 178000 },
    { month: 'Oct', sales: 195000 },
    { month: 'Nov', sales: 210000 },
    { month: 'Dec', sales: 250000 }
  ]
};

export const barChartData = {
  title: 'Product Category Revenue',
  xField: 'category',
  yField: 'revenue',
  data: [
    { category: 'Electronics', revenue: 450000 },
    { category: 'Clothing', revenue: 320000 },
    { category: 'Home & Garden', revenue: 280000 },
    { category: 'Sports', revenue: 210000 },
    { category: 'Books', revenue: 180000 }
  ]
};

export const pieChartData = {
  title: 'Market Share by Region',
  angleField: 'share',
  colorField: 'region',
  data: [
    { region: 'North America', share: 42 },
    { region: 'Europe', share: 28 },
    { region: 'Asia Pacific', share: 18 },
    { region: 'Latin America', share: 8 },
    { region: 'Middle East & Africa', share: 4 }
  ]
};