import { useState } from 'react';
import styles from './Timeline.module.css';

interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  status: 'completed' | 'in-progress' | 'upcoming';
}

export const Timeline = () => {
  const [events, setEvents] = useState<TimelineEvent[]>([
    {
      id: '1',
      date: '2023-01-15',
      title: 'Project Kickoff',
      description: 'Initial meeting with stakeholders to define project scope',
      status: 'completed'
    },
    {
      id: '2',
      date: '2023-02-28',
      title: 'UI Design Approval',
      description: 'Client approved the final UI mockups and design system',
      status: 'completed'
    },
    {
      id: '3',
      date: '2023-04-10',
      title: 'Development Phase',
      description: 'Core functionality implementation started',
      status: 'in-progress'
    },
    {
      id: '4',
      date: '2023-06-01',
      title: 'QA Testing',
      description: 'Begin comprehensive testing of all features',
      status: 'upcoming'
    }
  ]);

  return (
    <div className={styles.timelineContainer}>
      <h2 className={styles.title}>Project Timeline</h2>
      <div className={styles.timeline}>
        {events.map((event, index) => (
          <div key={event.id} className={`${styles.event} ${styles[event.status]}`}>
            <div className={styles.eventMarker}></div>
            <div className={styles.eventContent}>
              <h3 className={styles.eventTitle}>{event.title}</h3>
              <p className={styles.eventDate}>{event.date}</p>
              <p className={styles.eventDescription}>{event.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
