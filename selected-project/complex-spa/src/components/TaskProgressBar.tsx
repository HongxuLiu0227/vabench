import React from 'react';
import { Progress, Typography } from 'antd';

interface TaskProgressBarProps {
  value: number;
  label?: string;
}

const TaskProgressBar: React.FC<TaskProgressBarProps> = ({ value = 0, label = 'Task Progress' }) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <div style={{ flex: 1 }}>
        <Typography.Text>{label}</Typography.Text>
        <Progress percent={value} showInfo={false} />
      </div>
      <Typography.Text type="secondary">{`${Math.round(value)}%`}</Typography.Text>
    </div>
  );
};

export default TaskProgressBar;