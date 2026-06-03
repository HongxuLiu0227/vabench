import React, { useState } from 'react';
import { Calendar as AntCalendar, Badge, Card } from 'antd';
import type { BadgeProps } from 'antd';
import type { Dayjs } from 'dayjs';
import './Calendar.css';

type Event = {
  id: string;
  title: string;
  date: string;
  type: 'success' | 'warning' | 'error' | 'processing' | 'default';
};

const Calendar: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([
    {
      id: '1',
      title: 'Project Kickoff',
      date: '2023-06-15',
      type: 'success',
    },
    {
      id: '2',
      title: 'Client Meeting',
      date: '2023-06-18',
      type: 'processing',
    },
    {
      id: '3',
      title: 'Deadline - Feature A',
      date: '2023-06-22',
      type: 'warning',
    },
    {
      id: '4',
      title: 'Team Retrospective',
      date: '2023-06-25',
      type: 'default',
    },
    {
      id: '5',
      title: 'Server Maintenance',
      date: '2023-06-28',
      type: 'error',
    },
  ]);

  const getListData = (value: Dayjs) => {
    return events.filter((event) => event.date === value.format('YYYY-MM-DD'));
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

  const onSelect = (date: Dayjs) => {
    const selectedDate = date.format('YYYY-MM-DD');
    const eventsOnDate = events.filter((event) => event.date === selectedDate);
    console.log('Selected date:', selectedDate, 'Events:', eventsOnDate);
  };

  return (
    <Card title="Project Calendar" bordered={false} className="calendar-card">
      <AntCalendar
        dateCellRender={dateCellRender}
        onSelect={onSelect}
        mode="month"
      />
    </Card>
  );
};

export default Calendar;