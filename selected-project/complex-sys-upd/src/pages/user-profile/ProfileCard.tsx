import React from 'react';
import { Avatar, Card, Tag, Space, Typography } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, EnvironmentOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

type ProfileCardProps = {
  name: string;
  role: string;
  email: string;
  phone: string;
  location: string;
  status: 'active' | 'inactive' | 'on leave';
  joinDate: string;
  skills: string[];
  avatarUrl?: string;
};

const ProfileCard = (props) => {
  const {
    name = 'Alex Johnson',
    role = 'Senior Frontend Developer',
    email = 'alex.johnson@example.com',
    phone = '+1 (555) 123-4567',
    location = 'San Francisco, CA',
    status = 'active',
    joinDate = 'March 15, 2020',
    skills = ['React', 'TypeScript', 'Node.js', 'GraphQL', 'UI/UX'],
    avatarUrl,
  } = props;

  const statusColor = {
    active: 'green',
    inactive: 'red',
    'on leave': 'orange',
  }[status];

  return (
    <Card
      style={{ width: '100%', maxWidth: 400 }}
      cover={
        <div style={{ padding: 24, display: 'flex', justifyContent: 'center' }}>
          <Avatar 
            size={128} 
            src={avatarUrl} 
            icon={<UserOutlined />} 
            style={{ backgroundColor: '#1890ff' }}
          />
        </div>
      }
    >
      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <Title level={3}>{name}</Title>
        <Text type="secondary">{role}</Text>
        <div style={{ marginTop: 8 }}>
          <Tag color={statusColor}>{status.toUpperCase()}</Tag>
        </div>
      </div>

      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <div>
          <Text strong>Contact Information</Text>
          <div style={{ marginTop: 8 }}>
            <Space size="middle">
              <MailOutlined />
              <Text>{email}</Text>
            </Space>
          </div>
          <div style={{ marginTop: 8 }}>
            <Space size="middle">
              <PhoneOutlined />
              <Text>{phone}</Text>
            </Space>
          </div>
          <div style={{ marginTop: 8 }}>
            <Space size="middle">
              <EnvironmentOutlined />
              <Text>{location}</Text>
            </Space>
          </div>
        </div>

        <div>
          <Text strong>Member Since</Text>
          <div style={{ marginTop: 8 }}>
            <Text>{joinDate}</Text>
          </div>
        </div>

        <div>
          <Text strong>Skills</Text>
          <div style={{ marginTop: 8 }}>
            <Space size={[8, 8]} wrap>
              {skills.map((skill) => (
                <Tag key={skill}>{skill}</Tag>
              ))}
            </Space>
          </div>
        </div>
      </Space>
    </Card>
  );
};

export default ProfileCard;
