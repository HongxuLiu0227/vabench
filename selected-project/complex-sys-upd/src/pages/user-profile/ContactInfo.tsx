import React from 'react';
import { MailOutlined, PhoneOutlined, EnvironmentOutlined, LinkOutlined } from '@ant-design/icons';
import { Card, List, Typography } from 'antd';

const { Text } = Typography;

const contactMethods = [
  {
    icon: <MailOutlined />,
    title: 'Email',
    value: 'jane.doe@example.com',
    verified: true
  },
  {
    icon: <PhoneOutlined />,
    title: 'Phone',
    value: '+1 (555) 123-4567',
    verified: true
  },
  {
    icon: <EnvironmentOutlined />,
    title: 'Location',
    value: 'San Francisco, CA',
    verified: false
  },
  {
    icon: <LinkOutlined />,
    title: 'Website',
    value: 'janedoe.dev',
    verified: true
  }
];

const ContactInfo: React.FC = () => {
  const [editing, setEditing] = React.useState(false);
  const [contacts, setContacts] = React.useState(contactMethods);

  const handleEditClick = () => {
    setEditing(!editing);
  };

  const handleContactChange = (index: number, newValue: string) => {
    const updatedContacts = [...contacts];
    updatedContacts[index].value = newValue;
    setContacts(updatedContacts);
  };

  return (
    <Card 
      title="Contact Information" 
      extra={
        <Text 
          type="link" 
          onClick={handleEditClick}
          style={{ cursor: 'pointer' }}
        >
          {editing ? 'Save' : 'Edit'}
        </Text>
      }
    >
      <List
        itemLayout="horizontal"
        dataSource={contacts}
        renderItem={(item, index) => (
          <List.Item>
            <List.Item.Meta
              avatar={item.icon}
              title={item.title}
              description={
                editing ? (
                  <input 
                    type="text" 
                    value={item.value} 
                    onChange={(e) => handleContactChange(index, e.target.value)}
                    className="ant-input"
                    style={{ width: '100%' }}
                  />
                ) : (
                  <div>
                    <Text>{item.value}</Text>
                    {item.verified && (
                      <Text type="success" style={{ marginLeft: 8 }}>
                        Verified
                      </Text>
                    )}
                  </div>
                )
              }
            />
          </List.Item>
        )}
      />
    </Card>
  );
};

export default ContactInfo;