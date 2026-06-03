import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Tag, Input, Popconfirm, message } from 'antd';
import { SearchOutlined, DeleteOutlined, CopyOutlined } from '@ant-design/icons';
import type { ApiKey } from '../types';

interface ApiKeysTableProps {
  apiKeys: ApiKey[];
  onDelete: (id: string) => Promise<void>;
  onCreate: () => Promise<void>;
  loading: boolean;
}

const ApiKeysTable: React.FC<ApiKeysTableProps> = ({ apiKeys, onDelete, onCreate, loading }) => {
  const [searchText, setSearchText] = useState('');
  const [filteredKeys, setFilteredKeys] = useState<ApiKey[]>([]);

  useEffect(() => {
    setFilteredKeys(
      apiKeys.filter(key => 
        key.name.toLowerCase().includes(searchText.toLowerCase()) ||
        key.key.toLowerCase().includes(searchText.toLowerCase())
      )
    );
  }, [searchText, apiKeys]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    message.success('API key copied to clipboard');
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Key',
      dataIndex: 'key',
      key: 'key',
      render: (text: string) => (
        <Space>
          <span className="truncated-key">{text.substring(0, 8)}...</span>
          <Button 
            icon={<CopyOutlined />} 
            size="small" 
            onClick={() => handleCopy(text)}
          />
        </Space>
      ),
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Status',
      dataIndex: 'active',
      key: 'status',
      render: (active: boolean) => (
        <Tag color={active ? 'green' : 'red'}>
          {active ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: ApiKey) => (
        <Space size="middle">
          <Popconfirm
            title="Are you sure you want to delete this API key?"
            onConfirm={() => onDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="api-keys-table">
      <div className="table-header">
        <Input
          placeholder="Search API keys"
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 300, marginBottom: 16 }}
        />
        <Button 
          type="primary" 
          onClick={onCreate}
          loading={loading}
        >
          Generate New API Key
        </Button>
      </div>
      <Table 
        columns={columns} 
        dataSource={filteredKeys} 
        rowKey="id"
        pagination={{ pageSize: 5 }}
        loading={loading}
      />
    </div>
  );
};

export default ApiKeysTable;