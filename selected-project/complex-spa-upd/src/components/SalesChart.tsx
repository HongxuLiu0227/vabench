import React from 'react';
import styles from './SalesChart.module.css';

interface SalesData {
  month: string;
  revenue: number;
  profit: number;
}

interface SalesChartProps {
  data: SalesData[];
}

export const SalesChart: React.FC<SalesChartProps> = ({ data }) => {
  // In a real implementation, you would use a charting library like Chart.js or Recharts
  // This is a placeholder implementation
  
  const maxValue = Math.max(...data.map(item => Math.max(item.revenue, item.profit)));
  
  return (
    <div className={styles.chartContainer}>
      <h2 className={styles.chartTitle}>Sales Performance</h2>
      <div className={styles.chart}>
        {data.map((item, index) => (
          <div key={index} className={styles.chartBarGroup}>
            <div className={styles.chartMonth}>{item.month}</div>
            <div className={styles.chartBars}>
              <div 
                className={`${styles.chartBar} ${styles.revenueBar}`}
                style={{ height: `${(item.revenue / maxValue) * 100}%` }}
              ></div>
              <div 
                className={`${styles.chartBar} ${styles.profitBar}`}
                style={{ height: `${(item.profit / maxValue) * 100}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
      <div className={styles.chartLegend}>
        <div className={styles.legendItem}>
          <div className={`${styles.legendColor} ${styles.revenueColor}`}></div>
          <span>Revenue</span>
        </div>
        <div className={styles.legendItem}>
          <div className={`${styles.legendColor} ${styles.profitColor}`}></div>
          <span>Profit</span>
        </div>
      </div>
    </div>
  );
};