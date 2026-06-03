import { useState } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay } from 'date-fns';
import styles from './Calendar.module.css';

export const MiniCalendar = () => {
  const [currentDate] = useState(new Date());
  
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  return (
    <div className={styles.miniCalendar}>
      <div className={styles.miniHeader}>
        {format(currentDate, 'MMM yyyy')}
      </div>
      <div className={styles.miniDaysGrid}>
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
          <div key={day} className={styles.miniDayHeader}>{day}</div>
        ))}
        {daysInMonth.map(day => {
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isToday = isSameDay(day, new Date());
          
          return (
            <div 
              key={day.toString()} 
              className={`${styles.miniDayCell} ${isToday ? styles.miniToday : ''} ${!isCurrentMonth ? styles.miniOtherMonth : ''}`}
            >
              {format(day, 'd')}
            </div>
          );
        })}
      </div>
    </div>
  );
};