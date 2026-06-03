import React from 'react';
import { Card, Avatar, Button, Space, Typography } from 'antd';
import { EditOutlined, CameraOutlined } from '@ant-design/icons';
import { User } from '../../types';

const { Title, Text } = Typography;

interface ProfileHeaderProps {
  user: User;
  onEditClick?: () => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ user, onEditClick }) => {
  const isOwnProfile = true; // In real app, check if viewing own profile

  return (
    <Card
      style={{
        position: 'relative',
        overflow: 'hidden',
        padding: 0,
      }}
      bodyStyle={{ padding: 0 }}
    >
      {/* Cover Photo */}
      <div
        style={{
          height: '200px',
          background: user.coverPhoto
            ? `url(${user.coverPhoto}) center/cover`
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          position: 'relative',
        }}
      >
        {isOwnProfile && (
          <Button
            type="primary"
            icon={<CameraOutlined />}
            style={{
              position: 'absolute',
              bottom: '16px',
              right: '16px',
            }}
          >
            Update Cover
          </Button>
        )}
      </div>

      {/* Profile Info */}
      <div
        style={{
          padding: '24px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '24px',
        }}
      >
        <div style={{ position: 'relative' }}>
          <Avatar
            size={120}
            src={user.profilePicture}
            style={{
              border: '4px solid #fff',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              marginTop: '-60px',
            }}
          />
          {isOwnProfile && (
            <Button
              type="primary"
              shape="circle"
              icon={<CameraOutlined />}
              size="small"
              style={{
                position: 'absolute',
                bottom: '8px',
                right: '8px',
              }}
            />
          )}
        </div>

        <div style={{ flex: 1 }}>
          <Space direction="vertical" size="small">
            <div>
              <Title level={2} style={{ margin: 0 }}>
                {user.fullName}
              </Title>
              <Text type="secondary" style={{ fontSize: '16px' }}>
                @{user.username}
              </Text>
            </div>
            
            {user.bio && (
              <Text style={{ fontSize: '16px', maxWidth: '600px' }}>
                {user.bio}
              </Text>
            )}
            
            <Space>
              {user.location && (
                <Text type="secondary">📍 {user.location}</Text>
              )}
              <Text type="secondary">•</Text>
              <Text type="secondary">
                Joined {new Date(user.createdAt).toLocaleDateString()}
              </Text>
            </Space>
          </Space>
        </div>

        {isOwnProfile && (
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={onEditClick}
            size="large"
          >
            Edit Profile
          </Button>
        )}
      </div>
    </Card>
  );
};

export default ProfileHeader;