import React, { useState } from 'react';
import './MiniCalendar.css';
import { Calendar, Badge } from 'antd';
import type { BadgeProps } from 'antd';
import type { Dayjs } from 'dayjs';

type EventType = {
  type: 'success' | 'warning' | 'error';
  content: string;
};

type EventListType = {
  [key: string]: EventType[];
};

const MiniCalendar: React.FC = () => {
  const [events, setEvents] = useState<EventListType>({
    '2023-11-15': [
      { type: 'warning', content: 'Team meeting' },
      { type: 'success', content: 'Project deadline' },
    ],
    '2023-11-20': [
      { type: 'error', content: 'Client call' },
    ],
    '2023-11-25': [
      { type: 'success', content: 'Product launch' },
    ],
  });

  const dateCellRender = (value: Dayjs) => {
    const dateStr = value.format('YYYY-MM-DD');
    const currentEvents = events[dateStr] || [];

    return (
      <ul className="events">
        {currentEvents.map((event, index) => (
          <li key={index}>
            <Badge status={event.type as BadgeProps['status']} text={event.content} />
          </li>
        ))}
      </ul>
    );
  };

  const onSelect = (date: Dayjs) => {
    const dateStr = date.format('YYYY-MM-DD');
    console.log('Selected date:', dateStr);
  };

  return (
    <div className="mini-calendar-container">
      <Calendar 
        fullscreen={false} 
        dateCellRender={dateCellRender} 
        onSelect={onSelect}
      />
    </div>
  );
};

export default MiniCalendar;