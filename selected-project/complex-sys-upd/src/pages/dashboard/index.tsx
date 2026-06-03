import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Progress, Table, Timeline, Avatar, Button, Space, Alert } from 'antd';
import { UserOutlined, ClockCircleOutlined, FileOutlined, LinkOutlined, BellOutlined, EnvironmentOutlined } from '@ant-design/icons';
import LineChart from './components/LineChart';
import WeatherWidget from './components/WeatherWidget';
import useDashboardData from './hooks/useDashboardData';
import './dashboard.css';

type RecentFile = {
  key: string;
  name: string;
  type: string;
  modified: string;
  size: string;
};

type ActivityItem = {
  key: string;
  time: string;
  action: string;
  user: string;
};

type KpiCard = {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  icon: React.ReactNode;
};

type QuickLink = {
  title: string;
  url: string;
  icon: React.ReactNode;
};

type Notification = {
  id: string;
  title: string;
  description: string;
  time: string;
  isRead: boolean;
};

type Announcement = {
  id: string;
  title: string;
  content: string;
  date: string;
};

const DashboardPage: React.FC = () => {
  const { data, loading, error } = useDashboardData();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [recentFiles, setRecentFiles] = useState<RecentFile[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [kpiCards, setKpiCards] = useState<KpiCard[]>([]);
  const [quickLinks, setQuickLinks] = useState<QuickLink[]>([]);
  const [userAvatars, setUserAvatars] = useState<string[]>([]);

  useEffect(() => {
    if (data) {
      setNotifications([
        {
          id: '1',
          title: 'New project assigned',
          description: 'You have been assigned to the Marketing Dashboard project',
          time: '10 min ago',
          isRead: false
        },
        {
          id: '2',
          title: 'System update',
          description: 'Scheduled maintenance tonight at 2:00 AM',
          time: '1 hour ago',
          isRead: true
        },
        {
          id: '3',
          title: 'New comment',
          description: 'John Smith commented on your report',
          time: '3 hours ago',
          isRead: false
        }
      ]);

      setRecentFiles([
        { key: '1', name: 'Q3_Report.pdf', type: 'PDF', modified: '2023-11-15', size: '2.4 MB' },
        { key: '2', name: 'User_Research.xlsx', type: 'Excel', modified: '2023-11-14', size: '5.1 MB' },
        { key: '3', name: 'Dashboard_Design.fig', type: 'Figma', modified: '2023-11-12', size: '8.7 MB' },
        { key: '4', name: 'Meeting_Notes.docx', type: 'Word', modified: '2023-11-10', size: '1.2 MB' }
      ]);

      setActivities([
        { key: '1', time: '09:30 AM', action: 'Created new project', user: 'You' },
        { key: '2', time: 'Yesterday', action: 'Updated dashboard settings', user: 'Sarah Johnson' },
        { key: '3', time: 'Nov 14', action: 'Completed task #1234', user: 'Michael Chen' },
        { key: '4', time: 'Nov 12', action: 'Uploaded new files', user: 'You' },
        { key: '5', time: 'Nov 10', action: 'Commented on report', user: 'Emma Wilson' }
      ]);

      setAnnouncements([
        {
          id: '1',
          title: 'Office Holiday Party',
          content: 'Join us on December 15th for our annual holiday celebration!',
          date: '2023-12-01'
        },
        {
          id: '2',
          title: 'New Benefits Package',
          content: 'Review the updated employee benefits package in your HR portal',
          date: '2023-11-20'
        }
      ]);

      setKpiCards([
        {
          title: 'Active Projects',
          value: '24',
          change: '+12%',
          isPositive: true,
          icon: <FileOutlined />
        },
        {
          title: 'Tasks Completed',
          value: '156',
          change: '+5%',
          isPositive: true,
          icon: <ClockCircleOutlined />
        },
        {
          title: 'Team Members',
          value: '18',
          change: '+2',
          isPositive: true,
          icon: <UserOutlined />
        },
        {
          title: 'Open Issues',
          value: '7',
          change: '-3',
          isPositive: false,
          icon: <BellOutlined />
        }
      ]);

      setQuickLinks([
        { title: 'Project Docs', url: '/projects', icon: <FileOutlined /> },
        { title: 'Team Directory', url: '/team', icon: <UserOutlined /> },
        { title: 'Calendar', url: '/calendar', icon: <ClockCircleOutlined /> },
        { title: 'Resources', url: '/resources', icon: <LinkOutlined /> }
      ]);

      setUserAvatars([
        'https://randomuser.me/api/portraits/women/44.jpg',
        'https://randomuser.me/api/portraits/men/32.jpg',
        'https://randomuser.me/api/portraits/women/68.jpg',
        'https://randomuser.me/api/portraits/men/75.jpg',
        'https://randomuser.me/api/portraits/women/90.jpg'
      ]);
    }
  }, [data]);

  const markNotificationAsRead = (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, isRead: true } : n
    ));
  };

  const recentFilesColumns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Type', dataIndex: 'type', key: 'type' },
    { title: 'Modified', dataIndex: 'modified', key: 'modified' },
    { title: 'Size', dataIndex: 'size', key: 'size' },
  ];

  return (
    <div className="dashboard-container">
      {error && <Alert message="Error loading dashboard data" type="error" showIcon />}
      
      {/* KPI Cards Row */}
      <Row gutter={16} className="kpi-row">
        {kpiCards.map((card, index) => (
          <Col span={6} key={index}>
            <Card loading={loading}>
              <div className="kpi-card">
                <div className="kpi-icon">{card.icon}</div>
                <div className="kpi-content">
                  <h3>{card.title}</h3>
                  <div className="kpi-value">{card.value}</div>
                  <div className={`kpi-change ${card.isPositive ? 'positive' : 'negative'}`}>
                    {card.change}
                  </div>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Main Content Row */}
      <Row gutter={16} className="main-content-row">
        {/* Left Column */}
        <Col span={16}>
          {/* Chart Section */}
          <Card title="Project Progress" className="chart-card" loading={loading}>
            <LineChart data={data?.chartData || []} />
          </Card>

          {/* Recent Files Section */}
          <Card title="Recent Files" className="files-card" loading={loading}>
            <Table 
              columns={recentFilesColumns} 
              dataSource={recentFiles} 
              pagination={false} 
              size="small" 
            />
          </Card>
        </Col>

        {/* Right Column */}
        <Col span={8}>
          {/* Activity Timeline */}
          <Card title="Recent Activity" className="activity-card" loading={loading}>
            <Timeline mode="left">
              {activities.map(activity => (
                <Timeline.Item key={activity.key} label={activity.time}>
                  <div className="activity-item">
                    <strong>{activity.user}</strong>: {activity.action}
                  </div>
                </Timeline.Item>
              ))}
            </Timeline>
          </Card>

          {/* Quick Links */}
          <Card title="Quick Links" className="links-card" loading={loading}>
            <Space direction="vertical" style={{ width: '100%' }}>
              {quickLinks.map((link, index) => (
                <Button 
                  key={index} 
                  type="text" 
                  icon={link.icon} 
                  block 
                  onClick={() => window.location.href = link.url}
                >
                  {link.title}
                </Button>
              ))}
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Bottom Row */}
      <Row gutter={16} className="bottom-row">
        <Col span={8}>
          {/* Notifications */}
          <Card title="Notifications" className="notifications-card" loading={loading}>
            <Space direction="vertical" style={{ width: '100%' }}>
              {notifications.map(notification => (
                <Alert 
                  key={notification.id}
                  message={notification.title}
                  description={notification.description}
                  type={notification.isRead ? 'info' : 'warning'}
                  showIcon
                  closable
                  afterClose={() => markNotificationAsRead(notification.id)}
                />
              ))}
            </Space>
          </Card>
        </Col>

        <Col span={8}>
          {/* Weather Widget */}
          <Card title="Weather" className="weather-card" loading={loading}>
            <WeatherWidget location="New York" />
          </Card>

          {/* User Avatars */}
          <Card title="Team Online" className="avatars-card" loading={loading}>
            <Avatar.Group>
              {userAvatars.map((avatar, index) => (
                <Avatar key={index} src={avatar} />
              ))}
              <Avatar style={{ backgroundColor: '#1890ff' }}>+5</Avatar>
            </Avatar.Group>
          </Card>
        </Col>

        <Col span={8}>
          {/* Announcements */}
          <Card title="Announcements" className="announcements-card" loading={loading}>
            <Space direction="vertical" style={{ width: '100%' }}>
              {announcements.map(announcement => (
                <Alert 
                  key={announcement.id}
                  message={announcement.title}
                  description={announcement.content}
                  type="info"
                  icon={<EnvironmentOutlined />}
                />
              ))}
            </Space>
          </Card>

          {/* Progress Bar */}
          <Card title="Monthly Goals" className="progress-card" loading={loading}>
            <div className="progress-item">
              <span>Project Completion</span>
              <Progress percent={75} status="active" />
            </div>
            <div className="progress-item">
              <span>Team Utilization</span>
              <Progress percent={82} status="active" />
            </div>
            <div className="progress-item">
              <span>Budget Spent</span>
              <Progress percent={65} status="active" />
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardPage;