import React from 'react';
import { Avatar, List, Button, Badge } from 'antd';
import type { Friend } from '../../types';

type FriendsListProps = { friends: Friend[] };

const FriendsList: React.FC<FriendsListProps> = ({ friends }) => {
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'online': return 'green';
      case 'away': return 'orange';
      default: return 'gray';
    }
  };

  return (
    <div className="friends-list">
      <div className="friends-header">
        <h3>Friends ({friends.length})</h3>
        <div className="friends-actions">
          <Button type="primary">Add Friend</Button>
        </div>
      </div>

      <List
        itemLayout="horizontal"
        dataSource={friends}
        renderItem={(friend) => (
          <List.Item
            actions={[
              <Button type="link">Message</Button>,
              <Button type="link">View Projects</Button>
            ]}
          >
            <List.Item.Meta
              avatar={
                <Badge 
                  dot 
                  color={getStatusColor(friend.status)}
                  offset={[-5, 35]}
                >
                  <Avatar src={friend.avatar} size="large" />
                </Badge>
              }
              title={<span>{friend.name}</span>}
              description={
                <>
                  <div>{friend.lastActive}</div>
                  <div>{friend.mutualProjects} mutual projects</div>
                </>
              }
            />
          </List.Item>
        )}
      />
    </div>
  );
};

export default FriendsList;