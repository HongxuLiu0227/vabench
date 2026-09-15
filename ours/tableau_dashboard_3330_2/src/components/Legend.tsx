import React from 'react';
import type { PieChartData } from '../types';
import './Legend.css';

interface LegendProps {
  data: PieChartData[];
  title?: string;
}

export const Legend: React.FC<LegendProps> = ({ data, title }) => {
  return (
    <div className="legend">
      {title && <div className="legend-title">{title}</div>}
      {data.map((item) => (
        <div key={item.label} className="legend-item">
          <div className="legend-color" style={{ backgroundColor: item.color }}></div>
          <div className="legend-label">{item.label}</div>
          <div className="legend-value">{item.percentage.toFixed(1)}%</div>
        </div>
      ))}
    </div>
  );
};
