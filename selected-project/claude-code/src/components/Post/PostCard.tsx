import React, { useState } from 'react';
import { Card, Avatar, Typography, Space, Button, Image, Tag } from 'antd';
import {
  HeartOutlined,
  HeartFilled,
  CommentOutlined,
  ShareAltOutlined,
  MoreOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useAppContext } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { Post } from '../../types';
import PostCommentForm from './PostCommentForm';
import PostCommentList from './PostCommentList';

dayjs.extend(relativeTime);

const { Text, Paragraph } = Typography;

interface PostCardProps {
  post: Post;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const { dispatch } = useAppContext();
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);

  const isLiked = user && post.likes.includes(user.id);

  const handleLike = () => {
    if (!user) return;
    
    const updatedPost: Post = {
      ...post,
      likes: isLiked
        ? post.likes.filter(id => id !== user.id)
        : [...post.likes, user.id],
    };
    
    dispatch({ type: 'UPDATE_POST', payload: updatedPost });
  };



  const renderMedia = () => {
    if (!post.media || post.media.length === 0) return null;

    if (post.media.length === 1) {
      return (
        <Image
          src={post.media[0]}
          alt="Post media"
          style={{ width: '100%', borderRadius: '8px' }}
          placeholder
        />
      );
    }

    return (
      <Image.PreviewGroup>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
          {post.media.slice(0, 4).map((media, index) => (
            <div
              key={index}
              style={{
                position: 'relative',
                aspectRatio: '1',
                borderRadius: '8px',
                overflow: 'hidden',
              }}
            >
              <Image
                src={media}
                alt={`Post media ${index + 1}`}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                placeholder
              />
              {index === 3 && post.media && post.media.length > 4 && (
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '18px',
                    fontWeight: 'bold',
                  }}
                >
                  +{post.media.length - 4}
                </div>
              )}
            </div>
          ))}
        </div>
      </Image.PreviewGroup>
    );
  };

  return (
    <Card
      style={{ width: '100%' }}
      bodyStyle={{ padding: '16px' }}
      actions={[
        <Button
          key="like"
          type="text"
          icon={isLiked ? <HeartFilled style={{ color: '#ff4d4f' }} /> : <HeartOutlined />}
          onClick={handleLike}
        >
          {post.likes.length}
        </Button>,
        <Button
          key="comment"
          type="text"
          icon={<CommentOutlined />}
          onClick={() => setShowComments(!showComments)}
        >
          Comment
        </Button>,
        <Button key="share" type="text" icon={<ShareAltOutlined />}>
          Share
        </Button>,
      ]}
    >
      <Card.Meta
        avatar={
          <Avatar
            src={post.authorId === user?.id ? user.profilePicture : undefined}
            icon={!user?.profilePicture && <MoreOutlined />}
          />
        }
        title={
          <Space>
            <Text strong>{user?.fullName || 'User'}</Text>
            <Text type="secondary">•</Text>
            <Text type="secondary">{dayjs(post.createdAt).fromNow()}</Text>
          </Space>
        }
        description={
          <Space direction="vertical" style={{ width: '100%' }}>
            <Paragraph style={{ margin: 0 }}>
              {post.content}
            </Paragraph>
            
            {post.hashtags && post.hashtags.length > 0 && (
              <Space wrap>
                {post.hashtags.map((hashtag, index) => (
                  <Tag key={index} color="blue">
                    #{hashtag}
                  </Tag>
                ))}
              </Space>
            )}
          </Space>
        }
      />
      
      {renderMedia()}
      
      {showComments && (
        <div style={{ marginTop: '16px' }}>
          <PostCommentForm postId={post.id} />
          <PostCommentList postId={post.id} />
        </div>
      )}
    </Card>
  );
};

export default PostCard;