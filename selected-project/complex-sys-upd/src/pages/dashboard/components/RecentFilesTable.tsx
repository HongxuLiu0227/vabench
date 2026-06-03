import React from 'react';
import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';

interface FileData {
  key: string;
  name: string;
  type: string;
  size: string;
  modified: string;
  sharedWith: string[];
}

const columns: ColumnsType<FileData> = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    render: (text) => <a>{text}</a>,
  },
  {
    title: 'Type',
    dataIndex: 'type',
    key: 'type',
  },
  {
    title: 'Size',
    dataIndex: 'size',
    key: 'size',
  },
  {
    title: 'Modified',
    dataIndex: 'modified',
    key: 'modified',
  },
  {
    title: 'Shared With',
    dataIndex: 'sharedWith',
    key: 'sharedWith',
    render: (_, { sharedWith }) => (
      <>
        {sharedWith.map((user) => (
          <span key={user} className="user-tag">
            {user}
          </span>
        ))}
      </>
    ),
  },
];

const data: FileData[] = [
  {
    key: '1',
    name: 'Q1 Financial Report',
    type: 'PDF',
    size: '2.4 MB',
    modified: '2023-04-15',
    sharedWith: ['Sarah', 'Michael'],
  },
  {
    key: '2',
    name: 'User Research Findings',
    type: 'PPTX',
    size: '5.1 MB',
    modified: '2023-04-12',
    sharedWith: ['Design Team'],
  },
  {
    key: '3',
    name: 'Product Roadmap',
    type: 'DOCX',
    size: '1.2 MB',
    modified: '2023-04-10',
    sharedWith: ['Engineering', 'Product'],
  },
  {
    key: '4',
    name: 'Marketing Strategy',
    type: 'XLSX',
    size: '3.7 MB',
    modified: '2023-04-08',
    sharedWith: ['Marketing Team'],
  },
];

export const RecentFilesTable: React.FC = () => {
  const [selectedRowKeys, setSelectedRowKeys] = React.useState<React.Key[]>([]);

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  return (
    <Table
      rowSelection={rowSelection}
      columns={columns}
      dataSource={data}
      pagination={false}
      size="small"
    />
  );
};