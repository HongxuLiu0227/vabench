import React from 'react';
import { List, Empty, Spin } from 'antd';
import { useAppContext } from '../../context/AppContext';
import PostCard from './PostCard';

const PostList: React.FC = () => {
  const { state } = useAppContext();
  const { posts, isLoading } = state.posts;

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <Empty
        description="No posts yet. Be the first to share something!"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    );
  }

  return (
    <List
      dataSource={posts}
      renderItem={(post) => (
        <List.Item key={post.id} style={{ border: 'none', padding: '16px 0' }}>
          <PostCard post={post} />
        </List.Item>
      )}
      pagination={{
        pageSize: 10,
        showSizeChanger: false,
        showQuickJumper: false,
        showTotal: (total, range) =>
          `${range[0]}-${range[1]} of ${total} posts`,
      }}
    />
  );
};

export default PostList;