import { Row, Col, Card, Statistic, Progress, Timeline, List, Divider, Tag } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, ClockCircleOutlined, CheckCircleOutlined } from '@ant-design/icons';

export default function DashboardPage() {
  const kpiData = [
    { title: 'Total Revenue', value: '$12,345', change: 12.5, status: 'up' },
    { title: 'Active Users', value: '1,234', change: 8.2, status: 'up' },
    { title: 'Conversion Rate', value: '3.2%', change: -1.8, status: 'down' },
    { title: 'Avg. Session', value: '4m 23s', change: 2.4, status: 'up' },
  ];

  const recentActivities = [
    { time: '08:45', action: 'New project created', user: 'John Doe' },
    { time: '10:30', action: 'Monthly report generated', user: 'Jane Smith' },
    { time: '12:15', action: 'System update completed', user: 'Admin' },
    { time: '14:00', action: 'New user registered', user: 'Alex Johnson' },
  ];

  const quickLinks = [
    { title: 'Project Management', url: '/projects' },
    { title: 'User Settings', url: '/settings' },
    { title: 'Analytics Dashboard', url: '/analytics' },
    { title: 'Support Center', url: '/help' },
  ];

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        {kpiData.map((item, index) => (
          <Col span={6} key={index}>
            <Card>
              <Statistic
                title={item.title}
                value={item.value}
                precision={2}
                valueStyle={{ color: item.status === 'up' ? '#3f8600' : '#cf1322' }}
                prefix={item.status === 'up' ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                suffix="%"
              />
              <Progress percent={Math.abs(item.change)} showInfo={false} strokeColor={item.status === 'up' ? '#52c41a' : '#f5222d'} />
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Card title="Recent Activities">
            <Timeline mode="left">
              {recentActivities.map((activity, index) => (
                <Timeline.Item key={index} label={activity.time} dot={<ClockCircleOutlined />}>
                  {activity.action} by {activity.user}
                </Timeline.Item>
              ))}
            </Timeline>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Quick Links">
            <List
              dataSource={quickLinks}
              renderItem={(item) => (
                <List.Item>
                  <a href={item.url}>{item.title}</a>
                </List.Item>
              )}
            />
            <Divider />
            <div>
              <h4>System Status</h4>
              <div style={{ marginTop: '8px' }}>
                <Tag icon={<CheckCircleOutlined />} color="success">
                  All systems operational
                </Tag>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}