export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'completed' | 'on-hold' | 'planned';
  startDate: string;
  endDate: string;
  budget: number;
  teamSize: number;
  client: string;
  technologies: string[];
}

export const projects: Project[] = [
  {
    id: 'proj-001',
    name: 'E-commerce Platform',
    description: 'Development of a full-featured online store with payment integration and inventory management',
    status: 'active',
    startDate: '2023-01-15',
    endDate: '2023-09-30',
    budget: 125000,
    teamSize: 8,
    client: 'RetailCorp Inc.',
    technologies: ['React', 'Node.js', 'MongoDB', 'Stripe API']
  },
  {
    id: 'proj-002',
    name: 'Healthcare Analytics Dashboard',
    description: 'Interactive data visualization platform for hospital performance metrics',
    status: 'completed',
    startDate: '2022-08-01',
    endDate: '2023-02-28',
    budget: 85000,
    teamSize: 5,
    client: 'MediHealth Systems',
    technologies: ['TypeScript', 'D3.js', 'Python', 'PostgreSQL']
  },
  {
    id: 'proj-003',
    name: 'Mobile Banking App',
    description: 'Cross-platform mobile application for personal banking services',
    status: 'on-hold',
    startDate: '2023-03-10',
    endDate: '2023-12-15',
    budget: 150000,
    teamSize: 6,
    client: 'First National Bank',
    technologies: ['React Native', 'Firebase', 'Redux', 'Jest']
  },
  {
    id: 'proj-004',
    name: 'Smart Home IoT System',
    description: 'Centralized control system for home automation devices',
    status: 'planned',
    startDate: '2023-07-01',
    endDate: '2023-11-30',
    budget: 95000,
    teamSize: 4,
    client: 'HomeTech Solutions',
    technologies: ['Python', 'Raspberry Pi', 'MQTT', 'React']
  },
  {
    id: 'proj-005',
    name: 'Corporate Learning Portal',
    description: 'Employee training platform with course management and certification tracking',
    status: 'active',
    startDate: '2023-02-20',
    endDate: '2023-10-31',
    budget: 110000,
    teamSize: 7,
    client: 'Global Enterprises',
    technologies: ['Angular', 'NestJS', 'MySQL', 'AWS S3']
  }
];