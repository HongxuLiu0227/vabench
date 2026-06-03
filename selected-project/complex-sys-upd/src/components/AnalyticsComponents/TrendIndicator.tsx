import React from 'react';

type TrendIndicatorProps = {
  currentValue: number;
  previousValue: number;
  label: string;
};

export default function TrendIndicator(props) {
  const difference = props.currentValue - props.previousValue;
  const percentage = props.previousValue !== 0 
    ? (difference / props.previousValue) * 100 
    : 0;
  
  const isPositive = difference >= 0;
  const arrow = isPositive ? '↑' : '↓';
  
  return (
    <div className="trend-indicator">
      <h3>{props.label}</h3>
      <div className={`trend-value ${isPositive ? 'positive' : 'negative'}`}>
        <span>{props.currentValue.toLocaleString()}</span>
        <span className="trend-arrow">
          {arrow} {Math.abs(percentage).toFixed(1)}%
        </span>
      </div>
      <p className="trend-description">
        {isPositive ? 'Up' : 'Down'} by {Math.abs(difference).toLocaleString()} 
        from previous period
      </p>
    </div>
  );
};

// Example CSS:
// .trend-indicator {
//   background: white;
//   padding: 20px;
//   border-radius: 8px;
//   box-shadow: 0 2px 5px rgba(0,0,0,0.1);
// }
// .trend-indicator h3 {
//   margin: 0 0 10px 0;
//   font-size: 16px;
//   color: #7f8c8d;
// }
// .trend-value {
//   font-size: 24px;
//   font-weight: bold;
//   margin-bottom: 5px;
// }
// .trend-value.positive {
//   color: #27ae60;
// }
// .trend-value.negative {
//   color: #e74c3c;
// }
// .trend-arrow {
//   font-size: 16px;
//   margin-left: 10px;
// }
// .trend-description {
//   margin: 0;
//   font-size: 14px;
//   color: #95a5a6;
// }