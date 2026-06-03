import type { Project, Task, TeamMember } from '../types/index';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const fetchProjects = async (userId: string): Promise<Project[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/projects?userId=${userId}`);
    if (!response.ok) throw new Error('Failed to fetch projects');
    return await response.json();
  } catch (error) {
    console.error('Error fetching projects:', error);
    throw error;
  }
};

export const createProject = async (project: Omit<Project, 'id'>): Promise<Project> => {
  try {
    const response = await fetch(`${API_BASE_URL}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(project)
    });
    if (!response.ok) throw new Error('Failed to create project');
    return await response.json();
  } catch (error) {
    console.error('Error creating project:', error);
    throw error;
  }
};

export const updateProject = async (project: Project): Promise<Project> => {
  try {
    const response = await fetch(`${API_BASE_URL}/projects/${project.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(project)
    });
    if (!response.ok) throw new Error('Failed to update project');
    return await response.json();
  } catch (error) {
    console.error('Error updating project:', error);
    throw error;
  }
};

export const deleteProject = async (projectId: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete project');
  } catch (error) {
    console.error('Error deleting project:', error);
    throw error;
  }
};

export const fetchProjectTasks = async (projectId: string): Promise<Task[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/tasks`);
    if (!response.ok) throw new Error('Failed to fetch project tasks');
    return await response.json();
  } catch (error) {
    console.error('Error fetching project tasks:', error);
    throw error;
  }
};

export const updateTaskStatus = async (projectId: string, taskId: string, newStatus: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/tasks/${taskId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });
    if (!response.ok) throw new Error('Failed to update task status');
  } catch (error) {
    console.error('Error updating task status:', error);
    throw error;
  }
};

export const addTask = async (projectId: string, task: Omit<Task, 'id'>): Promise<Task> => {
  try {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task)
    });
    if (!response.ok) throw new Error('Failed to add task');
    return await response.json();
  } catch (error) {
    console.error('Error adding task:', error);
    throw error;
  }
};

export const fetchTeamMembers = async (projectId: string): Promise<TeamMember[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/team`);
    if (!response.ok) throw new Error('Failed to fetch team members');
    return await response.json();
  } catch (error) {
    console.error('Error fetching team members:', error);
    throw error;
  }
};

export const addTeamMember = async (projectId: string, member: Omit<TeamMember, 'id'>): Promise<TeamMember> => {
  try {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/team`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(member)
    });
    if (!response.ok) throw new Error('Failed to add team member');
    return await response.json();
  } catch (error) {
    console.error('Error adding team member:', error);
    throw error;
  }
};

export const removeTeamMember = async (projectId: string, memberId: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/team/${memberId}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to remove team member');
  } catch (error) {
    console.error('Error removing team member:', error);
    throw error;
  }
};

export const fetchProjectById = async (projectId: string): Promise<Project> => {
  try {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}`);
    if (!response.ok) throw new Error('Failed to fetch project');
    return await response.json();
  } catch (error) {
    console.error('Error fetching project:', error);
    throw error;
  }
};
