import { useState } from 'react';
import { Header } from './components/Header';
import { SidebarNavigation } from './components/SidebarNavigation';
import { UserTable } from './components/UserTable';
import { SalesChart } from './components/SalesChart';
import { RegistrationForm } from './components/RegistrationForm';
import { ProjectCard } from './components/ProjectCard';
import { EventTimeline } from './components/EventTimeline';
import { TeamCalendar } from './components/TeamCalendar';
import { LocationMap } from './components/LocationMap';
import { TaskProgressBar } from './components/TaskProgressBar';
import { NotificationList } from './components/notification/NotificationList';
import { Footer } from './components/Footer';
import './App.css';

type ActiveTab = 'dashboard' | 'reports' | 'settings';

interface AppProps {}

export const App: React.FC<AppProps> = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  return (
    <div className="app-container">
      <Header />
      
      <div className="app-content">
        <main className="app-main">
          {activeTab === 'dashboard' && (
            <>
              <div className="dashboard-grid">
                <section className="dashboard-section" aria-label="User Data">
                  <UserTable users={[{id: '1', name: 'John Doe', email: 'john.doe@example.com', role: 'Admin', status: 'active', lastLogin: '2021-01-01'}, {id: '2', name: 'Jane Smith', email: 'jane.smith@example.com', role: 'User', status: 'inactive', lastLogin: '2021-01-02'}]} />
                </section>
                <section className="dashboard-section" aria-label="Sales Analytics">
                  <SalesChart data={[{month: 'Jan', revenue: 1000, profit: 200}, {month: 'Feb', revenue: 1200, profit: 250}, {month: 'Mar', revenue: 1100, profit: 220}]} />
                </section>
                
                <section className="dashboard-section" aria-label="Registration Form">
                  <RegistrationForm />
                </section>
                <section className="dashboard-section" aria-label="Project Overview">
                  <ProjectCard title="Project 1" description="Description 1" progress={50} deadline="2021-01-01" members={10} />
                </section>
                
                <section className="dashboard-section" aria-label="Event Timeline">
                  <EventTimeline events={[{id: '1', date: '2021-01-01', title: 'Event 1', description: 'Description 1', completed: true}, {id: '2', date: '2021-01-02', title: 'Event 2', description: 'Description 2', completed: false}]} />
                </section>
                <section className="dashboard-section" aria-label="Team Calendar">
                  <TeamCalendar events={[{id: '1', title: 'Event 1', date: new Date(), color: '#3498db'}, {id: '2', title: 'Event 2', date: new Date(), color: '#e74c3c'}]} />
                </section>
                
                <section className="dashboard-section" aria-label="Location Map">
                  <LocationMap latitude={37.7749} longitude={-122.4194} />
                </section>
                <section className="dashboard-section" aria-label="Task Progress">
                  <TaskProgressBar progress={50} />
                </section>
              </div>
              
              <section className="notification-section" aria-label="Notifications">
                <NotificationList />
              </section>
            </>
          )}

          {activeTab === 'reports' && (
            <div className="reports-view">
              <h2>Reports View</h2>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="settings-view">
              <h2>Settings View</h2>
            </div>
          )}
        </main>
      </div>
      
      <Footer />
    </div>
  );
};