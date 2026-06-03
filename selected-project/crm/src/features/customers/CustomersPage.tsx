import { Button, Card, Input, Space, Table, Typography } from 'antd';
import { SearchOutlined, PlusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { Title } = Typography;

interface CustomerType {
  key: string;
  name: string;
  email: string;
  phone: string;
  company: string;
}

const columns: ColumnsType<CustomerType> = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: 'Email',
    dataIndex: 'email',
    key: 'email',
  },
  {
    title: 'Phone',
    dataIndex: 'phone',
    key: 'phone',
  },
  {
    title: 'Company',
    dataIndex: 'company',
    key: 'company',
  },
  {
    title: 'Action',
    key: 'action',
    render: (_, record) => (
      <Space size="middle">
        <a onClick={() => alert(`Edit customer: ${record.name}`)}>Edit</a>
        <a onClick={() => alert(`Delete customer: ${record.name}`)}>Delete</a>
      </Space>
    ),
  },
];

const data: CustomerType[] = [
  {
    key: '1',
    name: 'John Brown',
    email: 'john@example.com',
    phone: '123-456-7890',
    company: 'ABC Corp',
  },
  {
    key: '2',
    name: 'Jim Green',
    email: 'jim@example.com',
    phone: '234-567-8901',
    company: 'XYZ Inc',
  },
  {
    key: '3',
    name: 'Joe Black',
    email: 'joe@example.com',
    phone: '345-678-9012',
    company: '123 LLC',
  },
];

const CustomersPage = () => {
  return (
    <Card>
      <div style={{ marginBottom: 16 }}>
        <Title level={4}>Customers</Title>
        <Space>
          <Input
            placeholder="Search customers"
            prefix={<SearchOutlined />}
            style={{ width: 200 }}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={() => alert('Add Customer clicked!')}>
            Add Customer
          </Button>
        </Space>
      </div>
      <Table columns={columns} dataSource={data} />
    </Card>
  );
};

export default CustomersPage;