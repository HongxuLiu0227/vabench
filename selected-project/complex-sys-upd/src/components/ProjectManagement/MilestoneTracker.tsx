import React from 'react';

const MilestoneTracker: React.FC<{ milestones?: any[] }> = ({ milestones = [] }) => (
  <div>Milestone Tracker Placeholder ({milestones.length} milestones)</div>
);

export default MilestoneTracker; 