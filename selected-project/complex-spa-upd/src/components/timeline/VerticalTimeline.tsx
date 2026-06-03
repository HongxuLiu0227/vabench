import { useState } from 'react';
import styles from './VerticalTimeline.module.css';

interface Milestone {
  id: string;
  year: string;
  title: string;
  description: string;
  icon: string;
}

export const VerticalTimeline = () => {
  const [milestones, setMilestones] = useState<Milestone[]>([
    {
      id: '1',
      year: '2018',
      title: 'Company Founded',
      description: 'Started operations with 5 employees in a small office space',
      icon: '🏢'
    },
    {
      id: '2',
      year: '2019',
      title: 'Series A Funding',
      description: 'Raised $5M in Series A funding from top venture capitalists',
      icon: '💰'
    },
    {
      id: '3',
      year: '2020',
      title: 'Product Launch',
      description: 'Launched our flagship product with 100+ enterprise customers',
      icon: '🚀'
    },
    {
      id: '4',
      year: '2022',
      title: 'International Expansion',
      description: 'Opened offices in 3 new countries across Europe and Asia',
      icon: '🌍'
    }
  ]);

  return (
    <div className={styles.container}>
      <h2 className={styles.header}>Company Milestones</h2>
      <div className={styles.timeline}>
        {milestones.map((milestone) => (
          <div key={milestone.id} className={styles.milestone}>
            <div className={styles.year}>{milestone.year}</div>
            <div className={styles.content}>
              <div className={styles.icon}>{milestone.icon}</div>
              <h3 className={styles.title}>{milestone.title}</h3>
              <p className={styles.description}>{milestone.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
