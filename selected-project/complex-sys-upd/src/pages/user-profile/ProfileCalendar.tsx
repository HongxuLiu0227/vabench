import React, { useState } from 'react';
import { Calendar, Badge } from 'antd';
import type { BadgeProps } from 'antd';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';

type EventType = {
  id: string;
  title: string;
  date: string;
  type: 'success' | 'warning' | 'error' | 'processing';
};

const ProfileCalendar: React.FC = () => {
  const [events, setEvents] = useState<EventType[]>([
    {
      id: '1',
      title: 'Team Standup',
      date: '2023-11-15',
      type: 'processing',
    },
    {
      id: '2',
      title: 'Project Deadline',
      date: '2023-11-20',
      type: 'error',
    },
    {
      id: '3',
      title: 'Birthday Party',
      date: '2023-11-25',
      type: 'success',
    },
    {
      id: '4',
      title: 'Doctor Appointment',
      date: '2023-12-05',
      type: 'warning',
    },
  ]);

  const getListData = (value: Dayjs) => {
    return events.filter((event) => dayjs(event.date).isSame(value, 'day'));
  };

  const dateCellRender = (value: Dayjs) => {
    const listData = getListData(value);
    return (
      <ul className="events">
        {listData.map((item) => (
          <li key={item.id}>
            <Badge status={item.type as BadgeProps['status']} text={item.title} />
          </li>
        ))}
      </ul>
    );
  };

  const handleAddEvent = (date: Dayjs, title: string) => {
    const newEvent: EventType = {
      id: Math.random().toString(36).substring(2, 9),
      title,
      date: date.format('YYYY-MM-DD'),
      type: ['success', 'warning', 'error', 'processing'][Math.floor(Math.random() * 4)] as EventType['type'],
    };
    setEvents([...events, newEvent]);
  };

  const onSelect = (value: Dayjs) => {
    const title = prompt('Enter event title:');
    if (title) {
      handleAddEvent(value, title);
    }
  };

  return (
    <div className="profile-calendar">
      <h3>Personal Calendar</h3>
      <Calendar 
        dateCellRender={dateCellRender} 
        onSelect={onSelect}
        style={{ backgroundColor: '#fff', borderRadius: '8px', padding: '16px' }}
      />
    </div>
  );
};

export default ProfileCalendar;