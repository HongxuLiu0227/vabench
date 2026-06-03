import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, Typography } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

const { Title } = Typography;

const Search: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q');

  return (
    <Card>
      <div style={{ textAlign: 'center', padding: '60px' }}>
        <SearchOutlined style={{ fontSize: '64px', color: '#1890ff' }} />
        <Title level={3} style={{ marginTop: '24px' }}>
          Search Results
        </Title>
        {query ? (
          <p style={{ fontSize: '16px', color: '#666' }}>
            Search for "{query}" - Advanced search functionality coming soon!
          </p>
        ) : (
          <p style={{ fontSize: '16px', color: '#666' }}>
            Search for users, posts, and hashtags
          </p>
        )}
        <p style={{ fontSize: '14px', color: '#999' }}>
          You'll be able to search across users, posts, and hashtags with filters and sorting.
        </p>
      </div>
    </Card>
  );
};

export default Search;