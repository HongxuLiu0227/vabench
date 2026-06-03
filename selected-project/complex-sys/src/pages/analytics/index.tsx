import { Card, Row, Col, DatePicker, Button, Table, Select } from 'antd';
import { BarChartOutlined, PieChartOutlined, DownloadOutlined } from '@ant-design/icons';
import { Bar, Pie } from 'react-chartjs-2';
import 'chart.js/auto';

const { RangePicker } = DatePicker;
const { Option } = Select;

export default function AnalyticsPage() {
  const barData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Website Visits',
        data: [1200, 1900, 1500, 2000, 1800, 2200],
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  const pieData = {
    labels: ['Desktop', 'Mobile', 'Tablet'],
    datasets: [
      {
        data: [65, 25, 10],
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(75, 192, 192, 0.5)',
          'rgba(255, 205, 86, 0.5)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(255, 205, 86, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const columns = [
    { title: 'Page', dataIndex: 'page', key: 'page' },
    { title: 'Visits', dataIndex: 'visits', key: 'visits' },
    { title: 'Bounce Rate', dataIndex: 'bounceRate', key: 'bounceRate' },
    { title: 'Avg. Duration', dataIndex: 'duration', key: 'duration' },
  ];

  const data = [
    { key: '1', page: 'Home', visits: 1250, bounceRate: '32%', duration: '2m 15s' },
    { key: '2', page: 'Products', visits: 980, bounceRate: '45%', duration: '1m 50s' },
    { key: '3', page: 'Pricing', visits: 750, bounceRate: '52%', duration: '1m 20s' },
    { key: '4', page: 'Contact', visits: 620, bounceRate: '38%', duration: '2m 05s' },
  ];

  return (
    <div>
      <Card style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
          <RangePicker style={{ width: '300px' }} />
          <div>
            <Select defaultValue="all" style={{ width: 120, marginRight: '8px' }}>
              <Option value="all">All Data</Option>
              <Option value="web">Web Only</Option>
              <Option value="mobile">Mobile Only</Option>
            </Select>
            <Button type="primary" icon={<DownloadOutlined />}>Export</Button>
          </div>
        </div>

        <Row gutter={16}>
          <Col span={12}>
            <Card title="Traffic Overview" extra={<BarChartOutlined />}>
              <Bar data={barData} />
            </Card>
          </Col>
          <Col span={12}>
            <Card title="Device Distribution" extra={<PieChartOutlined />}>
              <Pie data={pieData} />
            </Card>
          </Col>
        </Row>

        <Card title="Page Statistics" style={{ marginTop: '24px' }}>
          <Table columns={columns} dataSource={data} />
        </Card>
      </Card>
    </div>
  );
}