import { useState } from 'react';
import { format, addDays, subDays, isSameDay } from 'date-fns';
import styles from './Calendar.module.css';

const mockEvents = [
  { id: 1, title: 'Team Meeting', date: new Date(), color: '#4caf50' },
  { id: 2, title: 'Product Demo', date: addDays(new Date(), 2), color: '#2196f3' },
  { id: 3, title: 'Client Call', date: addDays(new Date(), 5), color: '#ff9800' },
];

export const EventCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const nextDay = () => setCurrentDate(addDays(currentDate, 1));
  const prevDay = () => setCurrentDate(subDays(currentDate, 1));
  
  const todayEvents = mockEvents.filter(event => isSameDay(event.date, currentDate));

  return (
    <div className={styles.eventCalendar}>
      <div className={styles.eventHeader}>
        <button onClick={prevDay} className={styles.navButton}>&lt;</button>
        <h2 className={styles.dateTitle}>{format(currentDate, 'EEEE, MMMM d')}</h2>
        <button onClick={nextDay} className={styles.navButton}>&gt;</button>
      </div>
      
      <div className={styles.eventsList}>
        {todayEvents.length > 0 ? (
          todayEvents.map(event => (
            <div key={event.id} className={styles.eventItem} style={{ borderLeft: `4px solid ${event.color}` }}>
              <div className={styles.eventTime}>10:00 AM</div>
              <div className={styles.eventTitle}>{event.title}</div>
            </div>
          ))
        ) : (
          <div className={styles.noEvents}>No events scheduled</div>
        )}
      </div>
    </div>
  );
};