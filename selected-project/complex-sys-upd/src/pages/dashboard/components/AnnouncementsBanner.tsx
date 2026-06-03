import React, { useState, useEffect } from 'react';
import { Alert } from 'antd';
import { CloseOutlined } from '@ant-design/icons';

interface Announcement {
  id: string;
  title: string;
  message: string;
  date: string;
  priority: 'low' | 'medium' | 'high';
}

export const AnnouncementsBanner: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [visible, setVisible] = useState<boolean>(true);

  useEffect(() => {
    // Simulate API fetch
    const fetchAnnouncements = async () => {
      // In a real app, this would be an API call
      const mockAnnouncements: Announcement[] = [
        {
          id: '1',
          title: 'System Maintenance',
          message: 'Planned maintenance this Saturday from 2-4 AM EST. Some features may be temporarily unavailable.',
          date: '2023-06-10',
          priority: 'medium'
        },
        {
          id: '2',
          title: 'New Feature Released',
          message: 'Check out the new project analytics dashboard now available in the Projects section.',
          date: '2023-06-08',
          priority: 'low'
        },
        {
          id: '3',
          title: 'Security Update Required',
          message: 'All users must update their passwords by June 15th to comply with new security policies.',
          date: '2023-06-05',
          priority: 'high'
        }
      ];
      setAnnouncements(mockAnnouncements);
    };

    fetchAnnouncements();
  }, []);

  const getPriorityColor = (priority: Announcement['priority']) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'info';
    }
  };

  const handleClose = (id: string) => {
    setAnnouncements(prev => prev.filter(ann => ann.id !== id));
  };

  if (!visible || announcements.length === 0) return null;

  return (
    <div className="announcements-banner">
      {announcements.map(ann => (
        <Alert
          key={ann.id}
          message={ann.title}
          description={ann.message}
          type={getPriorityColor(ann.priority)}
          closable
          closeIcon={<CloseOutlined />}
          onClose={() => handleClose(ann.id)}
          showIcon
          className="announcement-item"
        />
      ))}
    </div>
  );
};
