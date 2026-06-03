import React from 'react';
import styles from './TaskProgressBar.module.css';

interface TaskProgressBarProps {
  progress: number;
  label?: string;
  color?: string;
}

export const TaskProgressBar: React.FC<TaskProgressBarProps> = ({
  progress,
  label = '',
  color = '#3498db'
}) => {
  return (
    <div className={styles.progressContainer}>
      {label && <span className={styles.label}>{label}</span>}
      <div className={styles.progressBar}>
        <div 
          className={styles.progressFill}
          style={{ 
            width: `${progress}%`,
            backgroundColor: color
          }}
        ></div>
      </div>
      <span className={styles.progressText}>{progress}%</span>
    </div>
  );
};