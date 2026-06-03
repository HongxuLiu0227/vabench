import React from 'react';
import { ClockCircleOutlined } from '@ant-design/icons';
import { Timeline } from 'antd';

type ActivityItem = {
  id: string;
  time: string;
  action: string;
  user: string;
  details: string;
  icon?: React.ReactNode;
};

const ActivityTimeline: React.FC = () => {
  const [activities, setActivities] = React.useState<ActivityItem[]>([
    {
      id: '1',
      time: '09:30 AM',
      action: 'Uploaded file',
      user: 'Sarah Johnson',
      details: 'Project_requirements.pdf',
      icon: <ClockCircleOutlined />,
    },
    {
      id: '2',
      time: '10:15 AM',
      action: 'Completed task',
      user: 'Michael Chen',
      details: 'Dashboard UI redesign',
      icon: <ClockCircleOutlined />,
    },
    {
      id: '3',
      time: '11:45 AM',
      action: 'Commented',
      user: 'Emma Rodriguez',
      details: 'The analytics look great! Let\'s discuss the next steps.',
      icon: <ClockCircleOutlined />,
    },
    {
      id: '4',
      time: '1:30 PM',
      action: 'Started meeting',
      user: 'David Wilson',
      details: 'Q2 Planning Session',
      icon: <ClockCircleOutlined />,
    },
  ]);

  return (
    <div className="activity-timeline">
      <h3>Recent Activity</h3>
      <Timeline mode="left">
        {activities.map((activity) => (
          <Timeline.Item key={activity.id} dot={activity.icon}>
            <div className="timeline-item">
              <div className="timeline-time">{activity.time}</div>
              <div className="timeline-content">
                <strong>{activity.user}</strong> {activity.action}: {activity.details}
              </div>
            </div>
          </Timeline.Item>
        ))}
      </Timeline>
    </div>
  );
};

export default ActivityTimeline;