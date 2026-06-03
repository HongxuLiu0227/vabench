import { Card, Avatar, Descriptions, Tabs, List, Badge, Calendar } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, EnvironmentOutlined, TrophyOutlined, TeamOutlined } from '@ant-design/icons';

const { TabPane } = Tabs;

export default function ProfilePage() {
  const userData = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    position: 'Senior Developer',
    department: 'Engineering',
    joinDate: 'January 15, 2018',
  };

  const achievements = [
    { title: 'Employee of the Month', date: 'March 2023', description: 'Recognized for outstanding performance' },
    { title: 'Project Excellence Award', date: 'November 2022', description: 'Led successful product launch' },
    { title: 'Innovation Champion', date: 'July 2021', description: 'Developed new workflow process' },
  ];

  const friends = [
    { name: 'Jane Smith', status: 'online', role: 'Product Manager' },
    { name: 'Alex Johnson', status: 'offline', role: 'UX Designer' },
    { name: 'Michael Brown', status: 'online', role: 'Backend Developer' },
    { name: 'Sarah Wilson', status: 'away', role: 'QA Engineer' },
  ];

  return (
    <div>
      <Card style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
          <Avatar size={64} icon={<UserOutlined />} style={{ marginRight: '16px' }} />
          <div>
            <h2>{userData.name}</h2>
            <p>{userData.position} • {userData.department}</p>
          </div>
        </div>

        <Descriptions bordered column={2}>
          <Descriptions.Item label={<><MailOutlined /> Email</>}>{userData.email}</Descriptions.Item>
          <Descriptions.Item label={<><PhoneOutlined /> Phone</>}>{userData.phone}</Descriptions.Item>
          <Descriptions.Item label={<><EnvironmentOutlined /> Location</>}>{userData.location}</Descriptions.Item>
          <Descriptions.Item label="Join Date">{userData.joinDate}</Descriptions.Item>
        </Descriptions>
      </Card>

      <Tabs defaultActiveKey="1">
        <TabPane tab="Achievements" key="1">
          <List
            dataSource={achievements}
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta
                  avatar={<TrophyOutlined style={{ fontSize: '24px' }} />}
                  title={item.title}
                  description={`${item.date} • ${item.description}`}
                />
              </List.Item>
            )}
          />
        </TabPane>
        <TabPane tab="Friends" key="2">
          <List
            dataSource={friends}
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta
                  avatar={<Avatar icon={<UserOutlined />} />}
                  title={<>{item.name} <Badge status={item.status === 'online' ? 'success' : item.status === 'away' ? 'warning' : 'default'} /></>}
                  description={item.role}
                />
              </List.Item>
            )}
          />
        </TabPane>
        <TabPane tab="Calendar" key="3">
          <Calendar fullscreen={false} />
        </TabPane>
      </Tabs>
    </div>
  );
}