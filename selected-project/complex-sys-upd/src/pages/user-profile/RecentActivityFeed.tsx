import React, { useState, useEffect } from 'react';
import { List, Avatar, Tag, Space } from 'antd';
import { ClockCircleOutlined, CheckCircleOutlined, CommentOutlined, LikeOutlined } from '@ant-design/icons';

type ActivityType = 'post' | 'comment' | 'like' | 'achievement' | 'friend';

interface Activity {
  id: string;
  type: ActivityType;
  user: {
    name: string;
    avatar: string;
  };
  content: string;
  timestamp: string;
  meta?: {
    postTitle?: string;
    achievementName?: string;
    friendName?: string;
  };
}

const RecentActivityFeed: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API fetch
    const fetchActivities = async () => {
      setLoading(true);
      try {
        // Mock data - in a real app this would come from an API
        const mockActivities: Activity[] = [
          {
            id: '1',
            type: 'post',
            user: {
              name: 'Alex Johnson',
              avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
            },
            content: 'Published a new project update',
            timestamp: '2 hours ago',
            meta: {
              postTitle: 'Q3 Marketing Strategy',
            },
          },
          {
            id: '2',
            type: 'comment',
            user: {
              name: 'Sarah Miller',
              avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
            },
            content: 'Left a comment on your post',
            timestamp: '4 hours ago',
            meta: {
              postTitle: 'Team Building Workshop',
            },
          },
          {
            id: '3',
            type: 'achievement',
            user: {
              name: 'You',
              avatar: 'https://randomuser.me/api/portraits/men/22.jpg',
            },
            content: 'Unlocked a new achievement',
            timestamp: '1 day ago',
            meta: {
              achievementName: 'Project Champion',
            },
          },
          {
            id: '4',
            type: 'friend',
            user: {
              name: 'Jamie Wilson',
              avatar: 'https://randomuser.me/api/portraits/women/63.jpg',
            },
            content: 'Started following you',
            timestamp: '2 days ago',
          },
          {
            id: '5',
            type: 'like',
            user: {
              name: 'Taylor Smith',
              avatar: 'https://randomuser.me/api/portraits/men/41.jpg',
            },
            content: 'Liked your photo',
            timestamp: '3 days ago',
          },
        ];

        setActivities(mockActivities);
      } catch (error) {
        console.error('Error fetching activities:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  const getActivityIcon = (type: ActivityType) => {
    switch (type) {
      case 'post':
        return <ClockCircleOutlined style={{ color: '#1890ff' }} />;
      case 'comment':
        return <CommentOutlined style={{ color: '#52c41a' }} />;
      case 'like':
        return <LikeOutlined style={{ color: '#f5222d' }} />;
      case 'achievement':
        return <CheckCircleOutlined style={{ color: '#faad14' }} />;
      case 'friend':
        return <Avatar size="small" icon="user" style={{ backgroundColor: '#722ed1' }} />;
      default:
        return null;
    }
  };

  const getActivityDescription = (activity: Activity) => {
    switch (activity.type) {
      case 'post':
        return (
          <span>
            <strong>{activity.user.name}</strong> {activity.content}: "{activity.meta?.postTitle}"
          </span>
        );
      case 'comment':
        return (
          <span>
            <strong>{activity.user.name}</strong> {activity.content}: "{activity.meta?.postTitle}"
          </span>
        );
      case 'achievement':
        return (
          <span>
            <strong>{activity.user.name}</strong> {activity.content}: "{activity.meta?.achievementName}"
          </span>
        );
      case 'friend':
        return (
          <span>
            <strong>{activity.user.name}</strong> {activity.content}
          </span>
        );
      case 'like':
        return (
          <span>
            <strong>{activity.user.name}</strong> {activity.content}
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="recent-activity-feed">
      <h3>Recent Activity</h3>
      <List
        itemLayout="horizontal"
        dataSource={activities}
        loading={loading}
        renderItem={(activity) => (
          <List.Item>
            <List.Item.Meta
              avatar={<Avatar src={activity.user.avatar} icon="user" />}
              title={getActivityDescription(activity)}
              description={
                <Space>
                  {getActivityIcon(activity.type)}
                  <span>{activity.timestamp}</span>
                  {activity.type === 'achievement' && (
                    <Tag color="gold">Achievement</Tag>
                  )}
                </Space>
              }
            />
          </List.Item>
        )}
      />
    </div>
  );
};

export default RecentActivityFeed;