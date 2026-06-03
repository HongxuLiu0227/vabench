import React from 'react';
import { Row, Col } from 'antd';
import UserTable from '../components/UserTable';
import SalesChart from '../components/SalesChart';
import ContactForm from '../components/ContactForm';
import ProductCard from '../components/ProductCard';
import ProjectTimeline from '../components/ProjectTimeline';
import EventCalendar from '../components/calendar/EventCalendar';
import LocationMap from '../components/LocationMap';
import TaskProgressBar from '../components/TaskProgressBar';
import NotificationList from '../components/notification/NotificationList';
import TeamAvatarGroup from '../components/TeamAvatarGroup';

const Dashboard = () => {
  const users: any[] = [
    { id: 1, name: 'Alice Johnson', email: 'alice@example.com', role: 'Admin', status: 'Active' },
    { id: 2, name: 'Bob Smith', email: 'bob@example.com', role: 'User', status: 'Inactive' },
    { id: 3, name: 'Charlie Brown', email: 'charlie@example.com', role: 'Manager', status: 'Active' },
  ];

  const salesData: any[] = [
    { month: 'Jan', value: 1200, category: 'Sales' },
    { month: 'Feb', value: 1500, category: 'Sales' },
    { month: 'Mar', value: 1700, category: 'Sales' },
    { month: 'Jan', value: 800, category: 'Revenue' },
    { month: 'Feb', value: 950, category: 'Revenue' },
    { month: 'Mar', value: 1100, category: 'Revenue' },
  ];

  const timelineEvents: any[] = [
    {
      date: '2024-01-10',
      title: 'Project Kickoff',
      description: 'Initial project kickoff meeting with stakeholders.',
    },
    {
      date: '2024-02-05',
      title: 'Phase 1 Complete',
      description: 'Completed the first phase of the project.',
    },
    {
      date: '2024-03-15',
      title: 'Beta Release',
      description: 'Released beta version to selected users.',
    },
  ];
  
  return (
    <div className="dashboard">
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <h1>Dashboard</h1>
        </Col>
        
        <Col xs={24} md={12} lg={8}>
          <UserTable users={users} />
        </Col>
        
        <Col xs={24} md={12} lg={16}>
          <SalesChart data={salesData} />
        </Col>
        
        <Col xs={24} md={12} lg={8}>
          <ContactForm onSubmit={() => {}} />
        </Col>
        
        <Col xs={24} md={12} lg={8}>
          <ProductCard 
            image="" 
            title="" 
            description="" 
            price={0} 
            onAddToCart={() => {}} 
          />
        </Col>
        
        <Col xs={24} md={12} lg={8}>
          <ProjectTimeline events={timelineEvents} />
        </Col>
        
        <Col xs={24} md={12} lg={12}>
          <EventCalendar />
        </Col>
        
        <Col xs={24} md={12} lg={12}>
          <LocationMap latitude={0} longitude={0} />
        </Col>
        
        <Col xs={24} md={12} lg={8}>
          <TaskProgressBar value={0} />
        </Col>
        
        <Col xs={24} md={12} lg={8}>
          <NotificationList />
        </Col>
        
        <Col xs={24} md={12} lg={8}>
          <TeamAvatarGroup />
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;