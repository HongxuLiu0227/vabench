import { useState } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay } from 'date-fns';
import styles from './Calendar.module.css';

export const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  return (
    <div className={styles.calendarContainer}>
      <div className={styles.header}>
        <button onClick={prevMonth} className={styles.navButton}>&lt;</button>
        <h2 className={styles.monthTitle}>{format(currentDate, 'MMMM yyyy')}</h2>
        <button onClick={nextMonth} className={styles.navButton}>&gt;</button>
      </div>
      <div className={styles.daysGrid}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className={styles.dayHeader}>{day}</div>
        ))}
        {daysInMonth.map(day => {
          const dayNumber = format(day, 'd');
          const isSelected = isSameDay(day, selectedDate);
          const isCurrentMonth = isSameMonth(day, currentDate);
          
          return (
            <div 
              key={day.toString()} 
              className={`${styles.dayCell} ${isSelected ? styles.selected : ''} ${!isCurrentMonth ? styles.otherMonth : ''}`}
              onClick={() => setSelectedDate(day)}
            >
              {dayNumber}
            </div>
          );
        })}
      </div>
    </div>
  );
};