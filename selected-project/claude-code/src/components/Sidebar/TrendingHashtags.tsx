import React from 'react';
import { Card, Tag, Typography, Space } from 'antd';
import { FireOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const TrendingHashtags: React.FC = () => {
  const navigate = useNavigate();

  const trendingHashtags = [
    { name: 'reactjs', count: 1250 },
    { name: 'typescript', count: 980 },
    { name: 'webdev', count: 850 },
    { name: 'programming', count: 720 },
    { name: 'javascript', count: 650 },
  ];

  const handleHashtagClick = (hashtag: string) => {
    navigate(`/search?q=%23${hashtag}`);
  };

  return (
    <Card>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Title level={4} style={{ margin: 0 }}>
          <FireOutlined style={{ color: '#ff4d4f', marginRight: '8px' }} />
          Trending Hashtags
        </Title>
        
        {trendingHashtags.map((hashtag, index) => (
          <div
            key={hashtag.name}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '8px 0',
              borderBottom: index < trendingHashtags.length - 1 ? '1px solid #f0f0f0' : 'none',
            }}
          >
            <Tag
              color="blue"
              style={{ cursor: 'pointer', margin: 0 }}
              onClick={() => handleHashtagClick(hashtag.name)}
            >
              #{hashtag.name}
            </Tag>
            <Text type="secondary">{hashtag.count.toLocaleString()} posts</Text>
          </div>
        ))}
      </Space>
    </Card>
  );
};

export default TrendingHashtags;