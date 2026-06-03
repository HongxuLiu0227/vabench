import React from 'react';
import styles from './EventTimeline.module.css';

interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  completed: boolean;
}

interface EventTimelineProps {
  events: TimelineEvent[];
}

export const EventTimeline: React.FC<EventTimelineProps> = ({ events }) => {
  return (
    <div className={styles.timeline}>
      {events.map((event, index) => (
        <div key={event.id} className={styles.event}>
          <div className={styles.eventMarker}>
            <div className={`${styles.markerDot} ${event.completed ? styles.completed : ''}`}></div>
            {index !== events.length - 1 && <div className={styles.markerLine}></div>}
          </div>
          <div className={styles.eventContent}>
            <div className={styles.eventDate}>{event.date}</div>
            <h3 className={styles.eventTitle}>{event.title}</h3>
            <p className={styles.eventDescription}>{event.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
};