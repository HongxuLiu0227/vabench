import React, { useState } from 'react';
import './Timeline.css';
import { useTimelineEvents } from './useTimelineEvents';

type TimelineEvent = {
  id: string;
  title: string;
  description: string;
  date: string;
  icon: string;
  color: string;
};

type TimelineProps = {
  variant?: 'default' | 'compact' | 'detailed';
  events?: TimelineEvent[];
};

const Timeline: React.FC<TimelineProps> = ({
  variant = 'default',
  events: initialEvents,
}) => {
  const [activeEvent, setActiveEvent] = useState<string | null>(null);
  const { events } = useTimelineEvents(initialEvents);

  const handleEventClick = (id: string) => {
    setActiveEvent(activeEvent === id ? null : id);
  };

  const renderDefaultVariant = () => (
    <div className="timeline-default">
      {events.map((event) => (
        <div
          key={event.id}
          className={`timeline-item ${activeEvent === event.id ? 'active' : ''}`}
          onClick={() => handleEventClick(event.id)}
          style={{ borderLeftColor: event.color }}
        >
          <div className="timeline-icon" style={{ backgroundColor: event.color }}>
            <span className={`anticon anticon-${event.icon}`} />
          </div>
          <div className="timeline-content">
            <h4>{event.title}</h4>
            <p className="timeline-date">{event.date}</p>
            {activeEvent === event.id && (
              <p className="timeline-description">{event.description}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  const renderCompactVariant = () => (
    <div className="timeline-compact">
      {events.map((event) => (
        <div
          key={event.id}
          className="timeline-item-compact"
          style={{ borderBottomColor: event.color }}
        >
          <div className="timeline-header">
            <span className={`anticon anticon-${event.icon}`} style={{ color: event.color }} />
            <h5>{event.title}</h5>
            <span className="timeline-date">{event.date}</span>
          </div>
        </div>
      ))}
    </div>
  );

  const renderDetailedVariant = () => (
    <div className="timeline-detailed">
      {events.map((event) => (
        <div key={event.id} className="timeline-item-detailed" style={{ borderColor: event.color }}>
          <div className="timeline-marker" style={{ backgroundColor: event.color }}>
            <span className={`anticon anticon-${event.icon}`} />
          </div>
          <div className="timeline-card">
            <h3>{event.title}</h3>
            <p className="timeline-date">{event.date}</p>
            <p className="timeline-description">{event.description}</p>
            <button className="timeline-action">View Details</button>
          </div>
        </div>
      ))}
    </div>
  );

  switch (variant) {
    case 'compact':
      return renderCompactVariant();
    case 'detailed':
      return renderDetailedVariant();
    default:
      return renderDefaultVariant();
  }
};

export default Timeline;