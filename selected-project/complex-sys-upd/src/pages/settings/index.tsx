import React, { useState } from 'react';
import { Card, Form, Input, Button, Switch, Select, Table, Divider, message } from 'antd';
import { LockOutlined, MailOutlined, GlobalOutlined, KeyOutlined } from '@ant-design/icons';
import SettingsPage from './SettingsPage';

const { Option } = Select;

const SettingsIndex = () => {
  const [form] = Form.useForm();
  const [theme, setTheme] = useState('light');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [apiKeys, setApiKeys] = useState([
    { key: 'prod_7a8b9c0d1e2f', name: 'Production API', lastUsed: '2023-05-15', permissions: 'Full Access' },
    { key: 'dev_3f4e5d6c7b8a', name: 'Development API', lastUsed: '2023-06-20', permissions: 'Read Only' },
    { key: 'test_1g2h3i4j5k6l', name: 'Testing API', lastUsed: '2023-04-10', permissions: 'Write Only' }
  ]);

  const onFinish = (values: any) => {
    console.log('Success:', values);
    message.success('Settings updated successfully');
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo);
    message.error('Failed to update settings');
  };

  const handleThemeChange = (value: string) => {
    setTheme(value);
  };

  const handleNotificationsToggle = (checked: boolean) => {
    setNotificationsEnabled(checked);
  };

  const revokeApiKey = (key: string) => {
    setApiKeys(apiKeys.filter(apiKey => apiKey.key !== key));
    message.warning(`API key ${key} revoked`);
  };

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Key', dataIndex: 'key', key: 'key' },
    { title: 'Last Used', dataIndex: 'lastUsed', key: 'lastUsed' },
    { title: 'Permissions', dataIndex: 'permissions', key: 'permissions' },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: any) => (
        <Button danger onClick={() => revokeApiKey(record.key)}>
          Revoke
        </Button>
      ),
    },
  ];

  return (
    <SettingsPage>
      <Card title="Account Settings" style={{ marginBottom: 24 }}>
        <Form
          form={form}
          name="account_settings"
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          layout="vertical"
        >
          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, message: 'Please input your email!' }]}
          >
            <Input prefix={<MailOutlined />} placeholder="user@example.com" />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="••••••••" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              Update Account
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <Card title="Preferences" style={{ marginBottom: 24 }}>
        <Form layout="vertical">
          <Form.Item label="Theme">
            <Select defaultValue={theme} onChange={handleThemeChange}>
              <Option value="light">Light</Option>
              <Option value="dark">Dark</Option>
              <Option value="system">System Default</Option>
            </Select>
          </Form.Item>

          <Form.Item label="Notifications">
            <Switch checked={notificationsEnabled} onChange={handleNotificationsToggle} />
            <span style={{ marginLeft: 8 }}>
              {notificationsEnabled ? 'Enabled' : 'Disabled'}
            </span>
          </Form.Item>

          <Form.Item label="Language">
            <Select defaultValue="en">
              <Option value="en">English</Option>
              <Option value="es">Spanish</Option>
              <Option value="fr">French</Option>
              <Option value="de">German</Option>
            </Select>
          </Form.Item>
        </Form>
      </Card>

      <Card title="API Keys" style={{ marginBottom: 24 }}>
        <Table
          columns={columns}
          dataSource={apiKeys}
          rowKey="key"
          pagination={false}
        />
        <Divider />
        <Button type="primary" icon={<KeyOutlined />}>
          Generate New API Key
        </Button>
      </Card>

      <Card title="Security">
        <Form layout="vertical">
          <Form.Item label="Two-Factor Authentication">
            <Switch defaultChecked />
            <span style={{ marginLeft: 8 }}>Enabled</span>
          </Form.Item>

          <Form.Item label="Recent Activity">
            <div style={{ marginTop: 8 }}>
              <p>• Login from Chrome on MacOS - Today 10:30 AM</p>
              <p>• Login from Safari on iPhone - Yesterday 8:15 PM</p>
              <p>• Password changed - June 15, 2023</p>
            </div>
          </Form.Item>

          <Form.Item>
            <Button danger>Log Out All Devices</Button>
          </Form.Item>
        </Form>
      </Card>
    </SettingsPage>
  );
};

export default SettingsIndex;