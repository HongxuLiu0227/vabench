import type { User, UserProfile, Achievement, Friend } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const fetchUser = async (userId: string): Promise<User> => {
  const response = await fetch(`${API_BASE_URL}/users/${userId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch user');
  }
  return response.json();
};

export const updateUserSettings = async () => {};

// Mock user profile data
const mockUserProfile = {
  id: 'user-1',
  name: 'Jane Doe',
  email: 'jane.doe@example.com',
  bio: 'Product Manager at Example Inc.',
  avatarUrl: 'https://randomuser.me/api/portraits/women/1.jpg',
  role: 'Product Manager',
  coverImageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
  stats: {
    posts: 42,
    followers: 1280,
    following: 345,
  },
  badges: [
    { id: 'b1', label: 'Top Performer', iconUrl: '' },
    { id: 'b2', label: 'Team Player', iconUrl: '' },
  ],
  friends: [
    { id: 'f1', name: 'John Smith' },
    { id: 'f2', name: 'Alice Johnson' },
  ],
  achievements: [
    { id: 'a1', title: 'Employee of the Month', date: '2023-03-01' },
    { id: 'a2', title: '5 Years at Company', date: '2022-11-15' },
  ],
  photos: [
    { id: 'p1', url: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308', caption: 'At the summit' },
    { id: 'p2', url: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca', caption: 'Team event' },
  ],
  events: [
    { id: 'e1', title: 'Annual Review', date: '2023-06-10' },
    { id: 'e2', title: 'Team Offsite', date: '2023-07-20' },
  ],
  activities: [
    { id: 1, description: 'Completed project milestone', date: '2023-05-01' },
    { id: 2, description: 'Attended leadership workshop', date: '2023-04-15' },
  ],
  settings: {
    theme: 'light',
    notifications: true,
    language: 'en',
  },
};

export const getUserProfile = async (userId: string) => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300));
  return mockUserProfile;
};

export const updateUserProfile = async (userId: string, updatedFields: Partial<typeof mockUserProfile>) => {
  // Simulate API delay and update
  await new Promise((resolve) => setTimeout(resolve, 300));
  return { ...mockUserProfile, ...updatedFields };
};

export const fetchUserAchievements = async (userId: string): Promise<Achievement[]> => {
  const response = await fetch(`${API_BASE_URL}/users/${userId}/achievements`);
  if (!response.ok) {
    throw new Error('Failed to fetch achievements');
  }
  return response.json();
};

export const fetchUserFriends = async (userId: string): Promise<Friend[]> => {
  const response = await fetch(`${API_BASE_URL}/users/${userId}/friends`);
  if (!response.ok) {
    throw new Error('Failed to fetch friends');
  }
  return response.json();
};

export const addFriend = async (userId: string, friendId: string): Promise<Friend> => {
  const response = await fetch(`${API_BASE_URL}/users/${userId}/friends`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ friendId }),
  });
  if (!response.ok) {
    throw new Error('Failed to add friend');
  }
  return response.json();
};

export const removeFriend = async (userId: string, friendId: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/users/${userId}/friends/${friendId}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to remove friend');
  }
};

export const uploadProfilePhoto = async (userId: string, file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('photo', file);
  
  const response = await fetch(`${API_BASE_URL}/users/${userId}/profile/photo`, {
    method: 'POST',
    body: formData,
  });
  
  if (!response.ok) {
    throw new Error('Failed to upload photo');
  }
  
  const { photoUrl } = await response.json();
  return photoUrl;
};

export const changePassword = async (userId: string, currentPassword: string, newPassword: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/users/${userId}/password`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to change password');
  }
};

// Mock project data
export const mockProject = {
  id: 'project-1',
  name: 'AI Dashboard Redesign',
  description: 'A project to redesign the analytics dashboard with AI-powered insights.',
  startDate: '2023-01-10',
  endDate: '2023-07-15',
  status: 'In Progress',
  teamMembers: [
    { id: 'tm1', name: 'Jane Doe', role: 'Product Manager', avatar: 'https://randomuser.me/api/portraits/women/1.jpg' },
    { id: 'tm2', name: 'John Smith', role: 'Frontend Developer', avatar: 'https://randomuser.me/api/portraits/men/2.jpg' },
    { id: 'tm3', name: 'Alice Johnson', role: 'Backend Developer', avatar: 'https://randomuser.me/api/portraits/women/3.jpg' },
  ],
  milestones: [
    { id: 'm1', name: 'Design Complete', dueDate: '2023-03-01', status: 'Completed' },
    { id: 'm2', name: 'MVP Launch', dueDate: '2023-05-15', status: 'Pending' },
    { id: 'm3', name: 'Full Release', dueDate: '2023-07-15', status: 'Pending' },
  ],
  tasks: [
    { id: 't1', title: 'Wireframe UI', description: 'Create wireframes for new dashboard', assignee: 'John Smith', status: 'Done', priority: 'High', dueDate: '2023-02-01' },
    { id: 't2', title: 'API Integration', description: 'Integrate backend APIs', assignee: 'Alice Johnson', status: 'In Progress', priority: 'Medium', dueDate: '2023-04-10' },
    { id: 't3', title: 'User Testing', description: 'Conduct user testing sessions', assignee: 'Jane Doe', status: 'To Do', priority: 'Low', dueDate: '2023-06-01' },
  ],
  resources: [
    { id: 'r1', name: 'Jane Doe', type: 'Person', allocation: 80 },
    { id: 'r2', name: 'AWS EC2', type: 'Equipment', allocation: 60 },
    { id: 'r3', name: 'UI Kit', type: 'Material', allocation: 100 },
  ],
  files: [
    { id: 'f1', name: 'requirements.pdf', type: 'pdf', size: '1.2MB', uploadedBy: 'Jane Doe', date: '2023-01-12' },
    { id: 'f2', name: 'design.sketch', type: 'sketch', size: '3.4MB', uploadedBy: 'John Smith', date: '2023-02-10' },
  ],
  comments: [
    { id: 'c1', author: 'Alice Johnson', text: 'API endpoints ready for integration.', date: '2023-03-15' },
    { id: 'c2', author: 'Jane Doe', text: 'Wireframes look great!', date: '2023-02-05' },
  ],
};

// Mock analytics data
export const mockAnalyticsData = {
  summary: {
    sessions: 12450,
    users: 8900,
    avgDuration: 5.2,
    bounceRate: 38.5,
  },
  trends: [
    { date: '2023-06-01', sessions: 2000 },
    { date: '2023-06-02', sessions: 2100 },
    { date: '2023-06-03', sessions: 1800 },
    { date: '2023-06-04', sessions: 2200 },
    { date: '2023-06-05', sessions: 2350 },
    { date: '2023-06-06', sessions: 2000 },
    { date: '2023-06-07', sessions: 2000 },
  ],
  sources: [
    { name: 'Direct', value: 4200 },
    { name: 'Referral', value: 2100 },
    { name: 'Organic Search', value: 3500 },
    { name: 'Social', value: 1650 },
  ],
  topPages: [
    { page: '/dashboard', engagement: 95 },
    { page: '/analytics', engagement: 88 },
    { page: '/settings', engagement: 70 },
  ],
  devices: [
    { device: 'Desktop', percentage: 62 },
    { device: 'Mobile', percentage: 30 },
    { device: 'Tablet', percentage: 8 },
  ],
  pages: [
    { key: '1', page: '/dashboard', sessions: 4000, users: 3200, avgDuration: '6m 10s', bounceRate: '30%' },
    { key: '2', page: '/analytics', sessions: 3500, users: 2500, avgDuration: '5m 20s', bounceRate: '40%' },
    { key: '3', page: '/settings', sessions: 2950, users: 2200, avgDuration: '4m 50s', bounceRate: '45%' },
  ],
};
