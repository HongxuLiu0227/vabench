import React from 'react';

const TaskList: React.FC<{ tasks?: any[] }> = ({ tasks = [] }) => (
  <div>Task List Placeholder ({tasks.length} tasks)</div>
);

export default TaskList; 