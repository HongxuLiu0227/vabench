import React from 'react';
import { Row, Col, Card, Typography, Space } from 'antd';
import PostForm from '../components/Post/PostForm';
import PostList from '../components/Post/PostList';
import TrendingHashtags from '../components/Sidebar/TrendingHashtags';
import SuggestedFriends from '../components/Sidebar/SuggestedFriends';

const { Title } = Typography;

const Home: React.FC = () => {
  return (
    <Row gutter={[24, 24]}>
      <Col xs={24} lg={16}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Card>
            <Title level={3}>Create a Post</Title>
            <PostForm />
          </Card>
          
          <Card>
            <Title level={3}>Timeline</Title>
            <PostList />
          </Card>
        </Space>
      </Col>
      
      <Col xs={24} lg={8}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <TrendingHashtags />
          <SuggestedFriends />
        </Space>
      </Col>
    </Row>
  );
};

export default Home;