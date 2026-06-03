import React from 'react';
import { Avatar, Space } from 'antd';

interface TeamMember {
  name: string;
  role: string;
}

interface TeamAvatarGroupProps {
  teamMembers?: TeamMember[];
}

const TeamAvatarGroup: React.FC<TeamAvatarGroupProps> = ({ 
  teamMembers = [
    { name: 'John Doe', role: 'Developer' },
    { name: 'Jane Smith', role: 'Designer' },
    { name: 'Mike Johnson', role: 'PM' },
    { name: 'Sarah Williams', role: 'QA' },
    { name: 'David Brown', role: 'DevOps' }
  ]
}) => {
  return (
    <div className="team-avatar-group">
      <h3>Team Members</h3>
      <Space size="large">
        {teamMembers.map((member, index) => (
          <div key={index} className="team-member">
            <Avatar size={64}>{member.name.charAt(0)}</Avatar>
            <div className="member-info">
              <strong>{member.name}</strong>
              <span>{member.role}</span>
            </div>
          </div>
        ))}
      </Space>
    </div>
  );
};

export default TeamAvatarGroup;