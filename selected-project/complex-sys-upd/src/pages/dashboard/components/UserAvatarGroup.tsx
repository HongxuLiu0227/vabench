import React from 'react';
import { Avatar, Tooltip } from 'antd';
import { UserOutlined } from '@ant-design/icons';

type User = {
  id: string;
  name: string;
  avatar?: string;
  role: string;
};

interface UserAvatarGroupProps {
  users: User[];
  maxCount?: number;
}

const UserAvatarGroup: React.FC<UserAvatarGroupProps> = ({ users, maxCount = 5 }) => {
  const visibleUsers = users.slice(0, maxCount);
  const remainingCount = users.length - maxCount;

  return (
    <Avatar.Group maxCount={maxCount}>
      {visibleUsers.map((user) => (
        <Tooltip key={user.id} title={`${user.name} (${user.role})`}>
          <Avatar 
            src={user.avatar} 
            icon={!user.avatar && <UserOutlined />} 
            style={{ backgroundColor: '#1890ff' }}
          />
        </Tooltip>
      ))}
      {remainingCount > 0 && (
        <Tooltip title={`+${remainingCount} more`}>
          <Avatar style={{ backgroundColor: '#f56a00' }}>+{remainingCount}</Avatar>
        </Tooltip>
      )}
    </Avatar.Group>
  );
};

export default UserAvatarGroup;