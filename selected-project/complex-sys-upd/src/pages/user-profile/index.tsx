import React, { useState, useEffect } from 'react';
import { useUserProfile } from '../../hooks/useUserProfile';
import ProfileCard from './ProfileCard';
import EditableProfileForm from './EditableProfileForm';
import AchievementsList from './AchievementsList';
import FriendsList from './FriendsList';
import RecentActivityFeed from './RecentActivityFeed';
import PhotoGallery from './PhotoGallery';
import SettingsAccordion from './SettingsAccordion';
import Badges from './Badges';
import ContactInfo from './ContactInfo';
import ProfileCalendar from './ProfileCalendar';
import './user-profile.css';

export default function UserProfilePage() {
  const { profile, isLoading, error } = useUserProfile('user-1');
  const user = profile;
  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  if (isLoading) return <div>Loading profile...</div>;
  if (error) return <div>Error loading profile: {error}</div>;
  if (!user) return <div>No user profile found.</div>;

  return (
    <div className="user-profile-container">
      <div className="profile-header">
        <h1>{user.name}'s Profile</h1>
        <div className="tab-nav">
          <button 
            className={activeTab === 'overview' ? 'active' : ''} 
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            className={activeTab === 'activity' ? 'active' : ''} 
            onClick={() => setActiveTab('activity')}
          >
            Activity
          </button>
          <button 
            className={activeTab === 'settings' ? 'active' : ''} 
            onClick={() => setActiveTab('settings')}
          >
            Settings
          </button>
        </div>
      </div>

      <div className="profile-content">
        <div className="profile-sidebar">
          <ProfileCard 
            name={user.name}
            role={user.role || ''}
            email={user.email}
            phone={user.phone || ''}
            location={user.location || ''}
            status={user.status || 'active'}
            joinDate={user.joinDate || ''}
            skills={user.skills || []}
            avatarUrl={user.avatarUrl}
            onEditClick={() => setEditMode(true)}
          />
          <ContactInfo user={user} />
          <Badges badges={user.badges || []} />
          <FriendsList friends={user.friends || []} />
        </div>

        <div className="profile-main">
          {editMode ? (
            <EditableProfileForm 
              user={user} 
              onCancel={() => setEditMode(false)} 
              onSave={(updatedUser: typeof user) => {
                // Handle save logic
                setEditMode(false);
              }} 
            />
          ) : (
            <>
              {activeTab === 'overview' && (
                <>
                  <AchievementsList achievements={user.achievements || []} />
                  <PhotoGallery photos={user.photos || []} />
                  <ProfileCalendar events={user.events || []} />
                </>
              )}
              {activeTab === 'activity' && (
                <RecentActivityFeed activities={user.activities || []} />
              )}
              {activeTab === 'settings' && (
                <SettingsAccordion settings={user.settings || {}} />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
