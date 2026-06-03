import React from 'react';
import { Timeline } from 'antd';

interface TimelineEvent {
  date: string;
  title: string;
  description: string;
}

interface ProjectTimelineProps {
  events: TimelineEvent[];
}

const ProjectTimeline: React.FC<ProjectTimelineProps> = ({ events = [] }) => {
  return (
    <div>
      <h3>Project Timeline</h3>
      <Timeline mode="alternate">
        {events.length > 0 ? (
          events.map((event, index) => (
            <Timeline.Item key={index}>
              <h4>{event.title}</h4>
              <p>{event.date}</p>
              <p>{event.description}</p>
            </Timeline.Item>
          ))
        ) : (
          <Timeline.Item>No events to display</Timeline.Item>
        )}
      </Timeline>
    </div>
  );
};

export default ProjectTimeline;