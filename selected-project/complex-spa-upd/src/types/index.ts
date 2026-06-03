export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  lastActive: string;
  avatar?: string;
}

export interface Metric {
  id: string;
  name: string;
  value: number;
  target: number;
  unit: string;
  trend: 'up' | 'down' | 'neutral';
}

export interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  attendees: number;
  color: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
}

export interface TimelineItem {
  id: string;
  title: string;
  description: string;
  date: string;
  status: 'completed' | 'in-progress' | 'pending';
  icon: string;
}

export interface FormField {
  id: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'select' | 'checkbox' | 'date';
  required: boolean;
  placeholder?: string;
  options?: string[];
  defaultValue?: string | boolean;
}

export interface CardData {
  id: string;
  title: string;
  value: string;
  change: number;
  icon: string;
  color: string;
}

export interface TableColumn<T> {
  key: keyof T;
  header: string;
  width?: string;
  render?: (value: any) => React.ReactNode;
}

export interface MapLocation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  users: number;
  status: 'active' | 'inactive' | 'maintenance';
}

export interface ProgressItem {
  id: string;
  name: string;
  progress: number;
  total: number;
  color: string;
  deadline: string;
}