import React from 'react';
import styles from './ProjectCard.module.css';

interface ProjectCardProps {
  title: string;
  description: string;
  progress: number;
  deadline: string;
  members: number;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  title,
  description,
  progress,
  deadline,
  members
}) => {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.title}>{title}</h3>
        <span className={styles.deadline}>{deadline}</span>
      </div>
      
      <p className={styles.description}>{description}</p>
      
      <div className={styles.progressContainer}>
        <div className={styles.progressBar}>
          <div 
            className={styles.progressFill} 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <span className={styles.progressText}>{progress}%</span>
      </div>
      
      <div className={styles.footer}>
        <div className={styles.members}>
          <span className={styles.memberIcon}>👥</span>
          <span>{members} members</span>
        </div>
        <button className={styles.viewButton}>View Project</button>
      </div>
    </div>
  );
};