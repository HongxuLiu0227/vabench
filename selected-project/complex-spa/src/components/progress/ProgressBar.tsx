import React, { useState, useEffect } from 'react';
import './ProgressBar.css';

type ProgressBarProps = {
  variant?: 'default' | 'success' | 'warning' | 'error';
  value: number;
  max?: number;
  showLabel?: boolean;
  striped?: boolean;
  animated?: boolean;
};

const ProgressBar: React.FC<ProgressBarProps> = ({
  variant = 'default',
  value,
  max = 100,
  showLabel = true,
  striped = false,
  animated = false,
}) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Smooth animation effect
    const timer = setTimeout(() => {
      setProgress(value);
    }, 300);
    return () => clearTimeout(timer);
  }, [value]);

  const percentage = Math.min((progress / max) * 100, 100);

  const getVariantClass = () => {
    switch (variant) {
      case 'success':
        return 'progress-bar-success';
      case 'warning':
        return 'progress-bar-warning';
      case 'error':
        return 'progress-bar-error';
      default:
        return 'progress-bar-default';
    }
  };

  const getStripedClass = () => {
    if (striped && animated) return 'progress-bar-striped progress-bar-animated';
    if (striped) return 'progress-bar-striped';
    return '';
  };

  return (
    <div className="progress-container">
      <div className="progress-bar">
        <div
          className={`progress-bar-fill ${getVariantClass()} ${getStripedClass()}`}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={max}
        >
          {showLabel && (
            <span className="progress-bar-label">{`${Math.round(percentage)}%`}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;