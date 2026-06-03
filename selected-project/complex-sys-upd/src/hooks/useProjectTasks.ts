import { useState, useEffect } from 'react';
import { mockProject } from '../services/userService';
import type { Project, Task } from '../types/index';

export const useProjectTasks = (projectId: string) => {
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    // Simulate API delay
    setTimeout(() => {
      setProject(mockProject);
      setLoading(false);
    }, 300);
  }, [projectId]);

  const updateTaskStatus = (taskId: string, status: string) => {
    setProject((prev: any) => {
      if (!prev) return prev;
      return {
        ...prev,
        tasks: prev.tasks.map((task: any) =>
          task.id === taskId ? { ...task, status } : task
        ),
      };
    });
  };

  return { project, loading, error, updateTaskStatus };
};
