import React, { useState, useEffect } from 'react';
import { KanbanBoard, TaskList, GanttChart, TeamMembers, ProjectTimeline, FileUploader, CommentsSection, MilestoneTracker, ResourceAllocationChart, ProjectOverviewCard } from '../../components/ProjectManagement';
import styles from './ProjectManagement.module.css';
import { useProjectTasks } from '../../hooks/useProjectTasks';

type ProjectData = {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'Not Started' | 'In Progress' | 'Completed' | 'On Hold';
  teamMembers: Array<{
    id: string;
    name: string;
    role: string;
    avatar: string;
  }>;
  milestones: Array<{
    id: string;
    name: string;
    dueDate: string;
    status: 'Pending' | 'Completed' | 'Delayed';
  }>;
  tasks: Array<{
    id: string;
    title: string;
    description: string;
    assignee: string;
    status: 'To Do' | 'In Progress' | 'Done';
    priority: 'Low' | 'Medium' | 'High';
    dueDate: string;
  }>;
  resources: Array<{
    id: string;
    name: string;
    type: 'Person' | 'Equipment' | 'Material';
    allocation: number;
  }>;
  files: Array<{
    id: string;
    name: string;
    type: string;
    size: string;
    uploadedBy: string;
    date: string;
  }>;
  comments: Array<{
    id: string;
    author: string;
    text: string;
    date: string;
  }>;
};

const ProjectManagementPage: React.FC = () => {
  const projectId = 'project-123';
  const { project, loading, error, updateTaskStatus } = useProjectTasks(projectId);

  // No need for useEffect or fetchProjectData, handled by hook

  const handleFileUpload = (file: File) => {
    console.log('Uploading file:', file.name);
    // TODO: Implement file upload logic
  };

  const handleAddComment = (commentText: string) => {
    // TODO: Implement add comment logic with backend
    console.log('Add comment:', commentText);
  };

  if (loading) return <div>Loading project data...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!project) return <div>No project data available</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>{project.name}</h1>
        <p>{project.description}</p>
      </div>

      <div className={styles.grid}>
        <div className={styles.overviewSection}>
          <ProjectOverviewCard 
            startDate={project.startDate} 
            endDate={project.endDate} 
            status={project.status} 
          />
        </div>

        <div className={styles.kanbanSection}>
          <KanbanBoard 
            tasks={project.tasks} 
            onTaskStatusChange={updateTaskStatus} 
          />
        </div>

        <div className={styles.timelineSection}>
          <ProjectTimeline 
            milestones={project.milestones} 
          />
        </div>

        <div className={styles.ganttSection}>
          <GanttChart 
            tasks={project.tasks} 
          />
        </div>

        <div className={styles.teamSection}>
          <TeamMembers 
            members={project.teamMembers} 
          />
        </div>

        <div className={styles.resourcesSection}>
          <ResourceAllocationChart 
            resources={project.resources} 
          />
        </div>

        <div className={styles.filesSection}>
          <FileUploader 
            files={project.files} 
            onUpload={handleFileUpload} 
          />
        </div>

        <div className={styles.commentsSection}>
          <CommentsSection 
            comments={project.comments} 
            onAddComment={handleAddComment} 
          />
        </div>

        <div className={styles.milestonesSection}>
          <MilestoneTracker 
            milestones={project.milestones} 
          />
        </div>

        <div className={styles.taskListSection}>
          <TaskList 
            tasks={project.tasks} 
          />
        </div>
      </div>
    </div>
  );
};

export default ProjectManagementPage;