import React, { useState } from 'react';
import './EventCalendar.css';

type Event = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  description: string;
};

const EventCalendar = () => {
  const [events] = useState<Event[]>([
    {
      id: '1',
      title: 'Marketing Strategy',
      start: new Date(2023, 5, 15, 10, 0),
      end: new Date(2023, 5, 15, 11, 30),
      description: 'Quarterly marketing strategy discussion'
    },
    {
      id: '2',
      title: 'Product Demo',
      start: new Date(2023, 5, 18, 14, 0),
      end: new Date(2023, 5, 18, 15, 0),
      description: 'Demo for potential investors'
    }
  ]);

  return (
    <div className="event-calendar">
      <h2>Upcoming Events</h2>
      <div className="event-list">
        {events.map(event => (
          <div key={event.id} className="event-item">
            <div className="event-time">
              {event.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
              {event.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div className="event-details">
              <h3>{event.title}</h3>
              <p>{event.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventCalendar;