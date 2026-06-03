export interface Event {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  attendees: string[];
  status: 'planned' | 'in-progress' | 'completed' | 'cancelled';
  color: string;
}

export const events: Event[] = [
  {
    id: 'event-1',
    title: 'Product Launch',
    description: 'Launch of new product line with media coverage',
    startDate: '2023-06-15T09:00:00',
    endDate: '2023-06-15T11:30:00',
    location: 'Main Conference Hall',
    attendees: ['john.doe@example.com', 'jane.smith@example.com', 'mike.johnson@example.com'],
    status: 'planned',
    color: '#4CAF50'
  },
  {
    id: 'event-2',
    title: 'Team Retrospective',
    description: 'Monthly team retrospective and planning session',
    startDate: '2023-06-16T14:00:00',
    endDate: '2023-06-16T16:00:00',
    location: 'Meeting Room B',
    attendees: ['sarah.williams@example.com', 'david.brown@example.com', 'emily.davis@example.com'],
    status: 'in-progress',
    color: '#2196F3'
  },
  {
    id: 'event-3',
    title: 'Client Workshop',
    description: 'Hands-on workshop with key client stakeholders',
    startDate: '2023-06-18T10:00:00',
    endDate: '2023-06-18T15:00:00',
    location: 'Client HQ',
    attendees: ['alex.miller@client.com', 'taylor.wilson@client.com', 'chris.lee@example.com'],
    status: 'completed',
    color: '#FF9800'
  },
  {
    id: 'event-4',
    title: 'Code Review',
    description: 'Cross-team code review session',
    startDate: '2023-06-20T13:00:00',
    endDate: '2023-06-20T14:30:00',
    location: 'Virtual (Zoom)',
    attendees: ['dev.team@example.com'],
    status: 'planned',
    color: '#9C27B0'
  },
  {
    id: 'event-5',
    title: 'Quarterly Planning',
    description: 'Executive planning for Q3 initiatives',
    startDate: '2023-06-22T09:00:00',
    endDate: '2023-06-22T17:00:00',
    location: 'Executive Boardroom',
    attendees: ['ceo@example.com', 'cto@example.com', 'cfo@example.com', 'vp.engineering@example.com'],
    status: 'planned',
    color: '#F44336'
  }
];