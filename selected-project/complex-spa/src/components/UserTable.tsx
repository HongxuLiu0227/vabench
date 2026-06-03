import React from 'react';
import { Table } from 'antd';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  joinDate: string;
}

interface UserTableProps {
  users: User[];
}

const columns = [
  { title: 'ID', dataIndex: 'id', key: 'id' },
  { title: 'Name', dataIndex: 'name', key: 'name' },
  { title: 'Email', dataIndex: 'email', key: 'email' },
  { title: 'Role', dataIndex: 'role', key: 'role' },
  { title: 'Join Date', dataIndex: 'joinDate', key: 'joinDate' },
];

const UserTable: React.FC<UserTableProps> = ({ users = [] }) => {
  return (
    <div>
      <h3>Users</h3>
      <Table
        dataSource={users}
        columns={columns}
        pagination={{ pageSize: 5 }}
        rowKey="id"
        style={{ width: '100%' }}
      />
    </div>
  );
};

export default UserTable;