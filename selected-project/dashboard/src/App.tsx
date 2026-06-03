import { Layout, Menu, Card, Statistic, Table, Collapse, Alert, Input, Avatar, Badge, Dropdown, Space } from 'antd';
import { AreaChartOutlined, DashboardOutlined, FileTextOutlined, SettingOutlined, BellOutlined, SearchOutlined, UserOutlined } from '@ant-design/icons';
import { Area } from '@ant-design/charts';
import './App.css';

const { Header, Sider, Content } = Layout;
const { Panel } = Collapse;

const Dashboard = () => {
  // Sample data for the dashboard
  const summaryData = [
    { title: 'Total Users', value: 1245, change: 12 },
    { title: 'Revenue', value: '$34,546', change: -2.5 },
    { title: 'Conversion Rate', value: '3.6%', change: 0.7 },
    { title: 'Active Sessions', value: 423, change: 5.8 }
  ];

  const trafficData = [
    { date: '2023-01', value: 350 },
    { date: '2023-02', value: 420 },
    { date: '2023-03', value: 380 },
    { date: '2023-04', value: 510 },
    { date: '2023-05', value: 490 },
    { date: '2023-06', value: 620 },
  ];

  const transactions = [
    { id: '1', customer: 'John Doe', amount: '$120', status: 'Completed', date: '2023-06-01' },
    { id: '2', customer: 'Jane Smith', amount: '$85', status: 'Pending', date: '2023-06-02' },
    { id: '3', customer: 'Robert Johnson', amount: '$230', status: 'Completed', date: '2023-06-02' },
    { id: '4', customer: 'Emily Davis', amount: '$65', status: 'Failed', date: '2023-06-03' },
    { id: '5', customer: 'Michael Wilson', amount: '$175', status: 'Completed', date: '2023-06-04' },
  ];

  const alerts = [
    { id: '1', message: 'Server maintenance scheduled for tonight at 2 AM', severity: 'info' },
    { id: '2', message: 'Unusual activity detected in user accounts', severity: 'warning' },
    { id: '3', message: 'New feature update available', severity: 'success' },
  ];

  const trafficConfig = {
    data: trafficData,
    xField: 'date',
    yField: 'value',
    xAxis: { range: [0, 1] },
    areaStyle: { fill: '#1890ff' },
    color: '#1890ff',
    smooth: true,
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', sorter: (a, b) => a.id.localeCompare(b.id) },
    { title: 'Customer', dataIndex: 'customer', key: 'customer', sorter: (a, b) => a.customer.localeCompare(b.customer) },
    { title: 'Amount', dataIndex: 'amount', key: 'amount', sorter: (a, b) => parseFloat(a.amount.slice(1)) - parseFloat(b.amount.slice(1)) },
    { title: 'Status', dataIndex: 'status', key: 'status', filters: [
      { text: 'Completed', value: 'Completed' },
      { text: 'Pending', value: 'Pending' },
      { text: 'Failed', value: 'Failed' },
    ], onFilter: (value, record) => record.status === value },
    { title: 'Date', dataIndex: 'date', key: 'date', sorter: (a, b) => new Date(a.date) - new Date(b.date) },
  ];

  const userMenu = (
    <Menu
      items={[
        { key: '1', label: 'Profile' },
        { key: '2', label: 'Settings' },
        { key: '3', label: 'Logout' },
      ]}
    />
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible breakpoint="lg" collapsedWidth="0">
        <div className="logo" style={{ height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <h1 style={{ color: 'white', margin: 0 }}>Analytics</h1>
        </div>
        <Menu theme="dark" mode="inline" defaultSelectedKeys={['1']}>
          <Menu.Item key="1" icon={<DashboardOutlined />}>Dashboard</Menu.Item>
          <Menu.Item key="2" icon={<AreaChartOutlined />}>Analytics</Menu.Item>
          <Menu.Item key="3" icon={<FileTextOutlined />}>Reports</Menu.Item>
          <Menu.Item key="4" icon={<SettingOutlined />}>Settings</Menu.Item>
        </Menu>
      </Sider>
      <Layout>
        <Header style={{ padding: 0, background: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ padding: '0 24px' }}>
            <Input
              placeholder="Search..."
              prefix={<SearchOutlined />}
              style={{ width: 200 }}
            />
          </div>
          <Space style={{ padding: '0 24px' }} size="middle">
            <Badge count={5}>
              <BellOutlined style={{ fontSize: '18px' }} />
            </Badge>
            <Dropdown overlay={userMenu} placement="bottomRight">
              <Avatar icon={<UserOutlined />} />
            </Dropdown>
          </Space>
        </Header>
        <Content style={{ margin: '24px 16px 0' }}>
          <div style={{ padding: 24, background: 'white', minHeight: 'calc(100vh - 112px)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              {summaryData.map((item, index) => (
                <Card key={index}>
                  <Statistic
                    title={item.title}
                    value={item.value}
                    precision={typeof item.value === 'number' ? 0 : undefined}
                    valueStyle={{ color: item.change >= 0 ? '#3f8600' : '#cf1322' }}
                    suffix={item.change >= 0 ? `+${item.change}%` : `${item.change}%`}
                  />
                </Card>
              ))}
            </div>

            <Card title="Traffic Trends" style={{ marginBottom: '24px' }}>
              <Area {...trafficConfig} />
            </Card>

            <Card title="Recent Transactions" style={{ marginBottom: '24px' }}>
              <Table 
                dataSource={transactions} 
                columns={columns} 
                rowKey="id"
                pagination={{ pageSize: 5 }}
              />
            </Card>

            <Collapse defaultActiveKey={['1']}>
              <Panel header="System Alerts" key="1">
                {alerts.map(alert => (
                  <Alert 
                    key={alert.id}
                    message={alert.message}
                    type={alert.severity}
                    showIcon
                    style={{ marginBottom: '8px' }}
                  />
                ))}
              </Panel>
            </Collapse>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default Dashboard;