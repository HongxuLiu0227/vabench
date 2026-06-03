import React from 'react';
import { Timeline, TimelineItem, TimelineSeparator, TimelineDot, TimelineConnector, TimelineContent } from '@mui/lab';

type ActivityItem = {
  id: string;
  time: string;
  user: string;
  action: string;
  details: string;
};

export const ActivityTimeline: React.FC<{ activities: ActivityItem[] }> = ({ activities }) => {
  return (
    <Timeline position="alternate">
      {activities.map((activity) => (
        <TimelineItem key={activity.id}>
          <TimelineSeparator>
            <TimelineDot color="primary" />
            <TimelineConnector />
          </TimelineSeparator>
          <TimelineContent>
            <div>
              <strong>{activity.time}</strong> - {activity.user}
            </div>
            <div>{activity.action}</div>
            <div style={{ color: 'gray' }}>{activity.details}</div>
          </TimelineContent>
        </TimelineItem>
      ))}
    </Timeline>
  );
};