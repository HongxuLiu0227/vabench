export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'done' | 'To Do' | 'In Progress' | 'Done';
  priority: 'low' | 'medium' | 'high' | 'Low' | 'Medium' | 'High';
  dueDate: string;
  assignedTo?: string;
  assignee?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
}

export interface Milestone {
  id: string;
  name: string;
  dueDate: string;
  status: 'Pending' | 'Completed' | 'Delayed';
}

export interface Resource {
  id: string;
  name: string;
  type: 'Person' | 'Equipment' | 'Material';
  allocation: number;
}

export interface FileItem {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadedBy: string;
  date: string;
}

export interface Comment {
  id: string;
  author: string;
  text: string;
  date: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  startDate?: string;
  endDate?: string;
  status?: 'Not Started' | 'In Progress' | 'Completed' | 'On Hold';
  teamMembers?: TeamMember[];
  milestones?: Milestone[];
  tasks: Task[];
  resources?: Resource[];
  files?: FileItem[];
  comments?: Comment[];
}

export interface KpiData {
  id: number;
  title: string;
  value: number;
  change: number;
  trend: 'up' | 'down';
}

export interface RecentFile {
  id: number;
  name: string;
  date: string;
  size: string;
}

export interface Activity {
  id: number;
  description: string;
  date: string;
}

export interface Announcement {
  id: number;
  message: string;
  date: string;
}

export interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  icon?: any;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  bio?: string;
  avatarUrl?: string;
  role?: string;
  coverImageUrl?: string;
  stats?: {
    posts: number;
    followers: number;
    following: number;
  };
  badges?: Badge[];
  friends?: Friend[];
  achievements?: Achievement[];
  photos?: Photo[];
  events?: CalendarEvent[];
  activities?: Activity[];
  settings?: UserSettings;
}

export interface Badge {
  id: string;
  label: string;
  iconUrl?: string;
}

export interface Photo {
  id: string;
  url: string;
  caption?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
}

export interface UserSettings {
  [key: string]: any;
}

export interface Achievement {
  id: string;
  title: string;
  date: string;
}

export interface Friend {
  id: string;
  name: string;
}

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  createdAt: string;
  active: boolean;
} 