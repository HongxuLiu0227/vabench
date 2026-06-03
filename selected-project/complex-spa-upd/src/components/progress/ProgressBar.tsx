import { useState, useEffect } from 'react';
import styles from './ProgressBar.module.css';

export const ProgressBar = ({ value, max = 100, variant = 'primary' }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setProgress(value), 300);
    return () => clearTimeout(timer);
  }, [value]);

  return (
    <div className={`${styles.progressContainer} ${styles[variant]}`}>
      <div 
        className={styles.progressBar} 
        style={{ width: `${progress}%` }}
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={max}
      ></div>
      <span className={styles.progressLabel}>{progress}%</span>
    </div>
  );
};

export const AnimatedProgressBar = ({ duration = 3000 }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = 100;
    const increment = end / (duration / 16);
    
    const animate = () => {
      start += increment;
      if (start < end) {
        setProgress(Math.min(start, end));
        requestAnimationFrame(animate);
      } else {
        setProgress(end);
      }
    };
    
    animate();
    
    return () => cancelAnimationFrame(animate);
  }, [duration]);

  return (
    <div className={styles.progressContainer}>
      <div 
        className={`${styles.progressBar} ${styles.animated}`} 
        style={{ width: `${progress}%` }}
      ></div>
      <span className={styles.progressLabel}>{Math.round(progress)}%</span>
    </div>
  );
};

export const SegmentedProgressBar = ({ segments, colors }) => {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);
  
  return (
    <div className={styles.segmentedContainer}>
      {segments.map((segment, index) => (
        <div 
          key={index}
          className={styles.segment}
          style={{
            width: `${(segment.value / total) * 100}%`,
            backgroundColor: colors[index % colors.length]
          }}
          title={`${segment.label}: ${segment.value}`}
        ></div>
      ))}
      <div className={styles.segmentedLabels}>
        {segments.map((segment, index) => (
          <span key={index} className={styles.segmentLabel}>
            <span 
              className={styles.colorIndicator} 
              style={{ backgroundColor: colors[index % colors.length] }}
            />
            {segment.label}: {segment.value}
          </span>
        ))}
      </div>
    </div>
  );
};