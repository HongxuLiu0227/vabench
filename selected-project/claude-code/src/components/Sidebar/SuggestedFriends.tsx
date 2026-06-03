import React from 'react';
import { Card, Avatar, Button, Typography, Space, List } from 'antd';
import { UserAddOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const SuggestedFriends: React.FC = () => {
  const suggestedUsers = [
    {
      id: '3',
      name: 'Alice Johnson',
      username: 'alicej',
      avatar: 'https://via.placeholder.com/40',
      mutualFriends: 5,
    },
    {
      id: '4',
      name: 'Bob Smith',
      username: 'bobsmith',
      avatar: 'https://via.placeholder.com/40',
      mutualFriends: 3,
    },
    {
      id: '5',
      name: 'Carol Davis',
      username: 'carold',
      avatar: 'https://via.placeholder.com/40',
      mutualFriends: 8,
    },
  ];

  const handleAddFriend = (userId: string) => {
    // In a real app, this would send a friend request
    console.log('Send friend request to:', userId);
  };

  return (
    <Card>
      <Title level={4} style={{ margin: 0, marginBottom: '16px' }}>
        People You May Know
      </Title>
      
      <List
        dataSource={suggestedUsers}
        renderItem={(user) => (
          <List.Item
            style={{ border: 'none', padding: '12px 0' }}
            actions={[
              <Button
                key="add"
                type="primary"
                size="small"
                icon={<UserAddOutlined />}
                onClick={() => handleAddFriend(user.id)}
              >
                Add
              </Button>,
            ]}
          >
            <List.Item.Meta
              avatar={<Avatar src={user.avatar} />}
              title={
                <Space direction="vertical" size={0}>
                  <Text strong>{user.name}</Text>
                  <Text type="secondary">@{user.username}</Text>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    {user.mutualFriends} mutual friends
                  </Text>
                </Space>
              }
            />
          </List.Item>
        )}
      />
    </Card>
  );
};

export default SuggestedFriends;