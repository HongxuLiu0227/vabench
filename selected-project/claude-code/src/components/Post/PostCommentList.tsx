import React from 'react';
import { List, Avatar, Typography, Space, Button, Empty } from 'antd';
import { HeartOutlined, HeartFilled, MessageOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useAuth } from '../../context/AuthContext';
import { Comment } from '../../types';

dayjs.extend(relativeTime);

const { Text, Paragraph } = Typography;

interface PostCommentListProps {
  postId: string;
}

// Mock comments data - in a real app, this would come from context/API
const mockComments: Comment[] = [
  {
    id: '1',
    postId: '1',
    authorId: '2',
    content: 'Great post! Thanks for sharing this.',
    likes: ['1'],
    createdAt: '2023-01-01T12:00:00Z',
  },
  {
    id: '2',
    postId: '1',
    authorId: '3',
    content: 'I completely agree with this perspective!',
    likes: [],
    createdAt: '2023-01-01T13:30:00Z',
  },
];

const PostCommentList: React.FC<PostCommentListProps> = ({ postId }) => {
  const { user } = useAuth();
  
  // Filter comments for this post
  const comments = mockComments.filter(comment => comment.postId === postId);

  if (comments.length === 0) {
    return (
      <Empty
        description="No comments yet. Be the first to comment!"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        style={{ marginTop: '16px' }}
      />
    );
  }

  return (
    <List
      dataSource={comments}
      renderItem={(comment) => (
        <List.Item key={comment.id} style={{ border: 'none', padding: '8px 0' }}>
          <Space align="start" style={{ width: '100%' }}>
            <Avatar size="small" />
            <div style={{ flex: 1 }}>
              <Space>
                <Text strong>User {comment.authorId}</Text>
                <Text type="secondary">•</Text>
                <Text type="secondary">
                  {dayjs(comment.createdAt).fromNow()}
                </Text>
              </Space>
              <Paragraph style={{ margin: '4px 0 0 0' }}>
                {comment.content}
              </Paragraph>
              <Space size="middle" style={{ marginTop: '4px' }}>
                <Button
                  type="text"
                  size="small"
                  icon={
                    comment.likes.includes(user?.id || '') ? (
                      <HeartFilled style={{ color: '#ff4d4f' }} />
                    ) : (
                      <HeartOutlined />
                    )
                  }
                >
                  {comment.likes.length}
                </Button>
                <Button type="text" size="small" icon={<MessageOutlined />}>
                  Reply
                </Button>
              </Space>
            </div>
          </Space>
        </List.Item>
      )}
      style={{ marginTop: '16px' }}
    />
  );
};

export default PostCommentList;