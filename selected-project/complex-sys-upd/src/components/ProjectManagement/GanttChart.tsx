import React from 'react';

const GanttChart: React.FC<{ tasks?: any[] }> = ({ tasks = [] }) => (
  <div>Gantt Chart Placeholder ({tasks.length} tasks)</div>
);

export default GanttChart; 