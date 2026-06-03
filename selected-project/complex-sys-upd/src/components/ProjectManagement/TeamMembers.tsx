import React from 'react';

const TeamMembers: React.FC<{ members?: any[] }> = ({ members = [] }) => (
  <div>Team Members Placeholder ({members.length} members)</div>
);

export default TeamMembers; 