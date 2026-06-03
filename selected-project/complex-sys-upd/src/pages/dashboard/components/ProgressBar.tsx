import React from 'react';
import { Progress } from 'antd';

type ProgressBarProps = {
  title: string;
  percent: number;
  color?: string;
  showInfo?: boolean;
};

const ProgressBar: React.FC<ProgressBarProps> = ({
  title,
  percent,
  color = '#1890ff',
  showInfo = true,
}) => {
  return (
    <div className="progress-bar-container">
      <div className="progress-bar-header">
        <span className="progress-bar-title">{title}</span>
        {showInfo && (
          <span className="progress-bar-percent">{percent}%</span>
        )}
      </div>
      <Progress
        percent={percent}
        strokeColor={color}
        showInfo={false}
        strokeLinecap="square"
      />
    </div>
  );
};

export default ProgressBar;