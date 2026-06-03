import { Card, Form, Input, Button, Switch, Select, Divider, Alert } from 'antd';
import { LockOutlined, MailOutlined, NotificationOutlined, GlobalOutlined } from '@ant-design/icons';

const { Option } = Select;

export default function SettingsPage() {
  const onFinish = (values: any) => {
    console.log('Received values of form: ', values);
  };

  return (
    <div>
      <Card title="Account Settings" style={{ marginBottom: '24px' }}>
        <Form
          layout="vertical"
          onFinish={onFinish}
        >
          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, message: 'Please input your email!' }]}
          >
            <Input prefix={<MailOutlined />} placeholder="your.email@example.com" />
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

      <Card title="Preferences" style={{ marginBottom: '24px' }}>
        <Form layout="vertical">
          <Form.Item label="Language" name="language">
            <Select defaultValue="en">
              <Option value="en">English</Option>
              <Option value="es">Spanish</Option>
              <Option value="fr">French</Option>
              <Option value="de">German</Option>
            </Select>
          </Form.Item>

          <Form.Item label="Timezone" name="timezone">
            <Select defaultValue="utc">
              <Option value="utc">UTC</Option>
              <Option value="est">Eastern Time (EST)</Option>
              <Option value="pst">Pacific Time (PST)</Option>
              <Option value="cet">Central European Time (CET)</Option>
            </Select>
          </Form.Item>

          <Form.Item label="Dark Mode" name="darkMode" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Card>

      <Card title="Notifications">
        <Form layout="vertical">
          <Form.Item label="Email Notifications" name="emailNotifications" valuePropName="checked">
            <Switch checkedChildren="On" unCheckedChildren="Off" defaultChecked />
          </Form.Item>

          <Form.Item label="Push Notifications" name="pushNotifications" valuePropName="checked">
            <Switch checkedChildren="On" unCheckedChildren="Off" defaultChecked />
          </Form.Item>

          <Divider />

          <Alert
            message="Security Tip"
            description="Always keep your password secure and never share it with others."
            type="info"
            showIcon
          />
        </Form>
      </Card>
    </div>
  );
}