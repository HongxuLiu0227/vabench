import React from 'react';
import './ProgressCircle.css';

type ProgressCircleProps = {
  progress: number;
  size?: number;
  strokeWidth?: number;
  variant?: 'primary' | 'secondary' | 'success';
  showPercentage?: boolean;
};

const ProgressCircle: React.FC<ProgressCircleProps> = ({
  progress,
  size = 120,
  strokeWidth = 10,
  variant = 'primary',
  showPercentage = true,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const getVariantClass = () => {
    switch (variant) {
      case 'secondary':
        return 'progress-circle--secondary';
      case 'success':
        return 'progress-circle--success';
      default:
        return 'progress-circle--primary';
    }
  };

  return (
    <div className={`progress-circle ${getVariantClass()}`} style={{ width: size, height: size }}>
      <svg className="progress-circle__svg" width={size} height={size}>
        <circle
          className="progress-circle__bg"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        <circle
          className="progress-circle__fill"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      {showPercentage && (
        <div className="progress-circle__text">
          {Math.round(progress)}%
        </div>
      )}
    </div>
  );
};

export default ProgressCircle;