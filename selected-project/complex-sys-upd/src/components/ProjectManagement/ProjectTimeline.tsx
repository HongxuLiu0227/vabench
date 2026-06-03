import React from 'react';

const ProjectTimeline: React.FC<{ milestones?: any[] }> = ({ milestones = [] }) => (
  <div>Project Timeline Placeholder ({milestones.length} milestones)</div>
);

export default ProjectTimeline; 