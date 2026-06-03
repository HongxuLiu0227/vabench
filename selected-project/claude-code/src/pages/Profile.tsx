import React from 'react';
import { useParams } from 'react-router-dom';
import { Row, Col, Card, Typography, Space, Button, Statistic, Tabs } from 'antd';
import {
  UserOutlined,
  MessageOutlined,
  UserAddOutlined,
  TeamOutlined,
  CameraOutlined,
} from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import ProfileHeader from '../components/Profile/ProfileHeader';
import EditProfileModal from '../components/Profile/EditProfileModal';
import PostList from '../components/Post/PostList';

const { Title } = Typography;
const { TabPane } = Tabs;

const Profile: React.FC = () => {
  const { userId } = useParams();
  const { user } = useAuth();
  const [editModalVisible, setEditModalVisible] = React.useState(false);

  // For now, we'll assume we're viewing the current user's profile
  // In a real app, we'd fetch the profile data based on userId
  const isOwnProfile = !userId || userId === user?.id;
  const profileUser = user; // In real app, fetch user by userId

  const stats = [
    { label: 'Posts', value: 24 },
    { label: 'Friends', value: 156 },
    { label: 'Following', value: 89 },
    { label: 'Followers', value: 245 },
  ];

  if (!profileUser) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <ProfileHeader user={profileUser} onEditClick={() => setEditModalVisible(true)} />
      
      <Row gutter={[24, 24]} style={{ marginTop: '24px' }}>
        <Col xs={24} lg={8}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Card>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Title level={4}>About</Title>
                {profileUser.bio && (
                  <div style={{ marginBottom: '16px' }}>
                    <strong>Bio:</strong>
                    <p style={{ margin: '8px 0 0 0' }}>{profileUser.bio}</p>
                  </div>
                )}
                {profileUser.location && (
                  <div style={{ marginBottom: '8px' }}>
                    <strong>Location:</strong>
                    <p style={{ margin: '4px 0 0 0' }}>{profileUser.location}</p>
                  </div>
                )}
                {profileUser.gender && (
                  <div style={{ marginBottom: '8px' }}>
                    <strong>Gender:</strong>
                    <p style={{ margin: '4px 0 0 0' }}>
                      {profileUser.gender.charAt(0).toUpperCase() + profileUser.gender.slice(1)}
                    </p>
                  </div>
                )}
                {profileUser.dateOfBirth && (
                  <div>
                    <strong>Birthday:</strong>
                    <p style={{ margin: '4px 0 0 0' }}>
                      {new Date(profileUser.dateOfBirth).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </Space>
            </Card>

            <Card>
              <Title level={4}>Stats</Title>
              <Row gutter={[16, 16]}>
                {stats.map((stat, index) => (
                  <Col xs={12} key={index}>
                    <Statistic
                      title={stat.label}
                      value={stat.value}
                      valueStyle={{ fontSize: '24px' }}
                    />
                  </Col>
                ))}
              </Row>
            </Card>

            {!isOwnProfile && (
              <Card>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Button type="primary" block icon={<UserAddOutlined />}>
                    Add Friend
                  </Button>
                  <Button block icon={<MessageOutlined />}>
                    Send Message
                  </Button>
                </Space>
              </Card>
            )}
          </Space>
        </Col>

        <Col xs={24} lg={16}>
          <Card>
            <Tabs defaultActiveKey="posts">
              <TabPane
                tab={
                  <span>
                    <UserOutlined />
                    Posts
                  </span>
                }
                key="posts"
              >
                <PostList />
              </TabPane>
              
              <TabPane
                tab={
                  <span>
                    <TeamOutlined />
                    Friends
                  </span>
                }
                key="friends"
              >
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <TeamOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
                  <Title level={4} style={{ marginTop: '16px' }}>
                    Friends List
                  </Title>
                  <p>Friends feature coming soon!</p>
                </div>
              </TabPane>
              
              <TabPane
                tab={
                  <span>
                    <CameraOutlined />
                    Photos
                  </span>
                }
                key="photos"
              >
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <CameraOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
                  <Title level={4} style={{ marginTop: '16px' }}>
                    Photo Gallery
                  </Title>
                  <p>Photo gallery feature coming soon!</p>
                </div>
              </TabPane>
            </Tabs>
          </Card>
        </Col>
      </Row>

      {isOwnProfile && (
        <EditProfileModal
          visible={editModalVisible}
          onCancel={() => setEditModalVisible(false)}
          onSuccess={() => setEditModalVisible(false)}
        />
      )}
    </div>
  );
};

export default Profile;