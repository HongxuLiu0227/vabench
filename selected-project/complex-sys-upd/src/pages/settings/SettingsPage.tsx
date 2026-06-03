import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Switch, Select, Button, Table, message } from 'antd';
import { LockOutlined, MailOutlined, GlobalOutlined, KeyOutlined } from '@ant-design/icons';
import { useSettingsForm } from '../../hooks/useSettingsForm';
import ApiKeysTable from '../../components/ApiKeysTable';
import './settings.css';

const { Option } = Select;

const SettingsPage = () => {
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  const [connectedApps, setConnectedApps] = useState([
    { id: 1, name: 'Google Drive', lastUsed: '2023-05-15', permissions: ['Read', 'Write'] },
    { id: 2, name: 'Slack', lastUsed: '2023-06-22', permissions: ['Read'] },
    { id: 3, name: 'GitHub', lastUsed: '2023-04-10', permissions: ['Read', 'Write', 'Admin'] },
  ]);

  const { settings, updateSettings } = useSettingsForm();

  useEffect(() => {
    if (settings) {
      form.setFieldsValue(settings);
    }
  }, [settings, form]);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      await updateSettings(values);
      message.success('Settings updated successfully');
    } catch (error) {
      message.error('Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  const revokeApp = (appId) => {
    setConnectedApps(connectedApps.filter(app => app.id !== appId));
    message.success('App access revoked');
  };

  const tabs = [
    { key: 'general', label: 'General Settings' },
    { key: 'security', label: 'Security' },
    { key: 'integrations', label: 'Integrations' },
    { key: 'api', label: 'API Keys' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <Card title="General Preferences">
            <Form form={form} layout="vertical" onFinish={handleSubmit}>
              <Form.Item name="theme" label="Theme">
                <Select>
                  <Option value="light">Light</Option>
                  <Option value="dark">Dark</Option>
                  <Option value="system">System Default</Option>
                </Select>
              </Form.Item>
              <Form.Item name="language" label="Language">
                <Select>
                  <Option value="en">English</Option>
                  <Option value="es">Español</Option>
                  <Option value="fr">Français</Option>
                  <Option value="de">Deutsch</Option>
                </Select>
              </Form.Item>
              <Form.Item name="notifications" label="Notifications" valuePropName="checked">
                <Switch checkedChildren="On" unCheckedChildren="Off" />
              </Form.Item>
              <Form.Item name="emailNotifications" label="Email Notifications" valuePropName="checked">
                <Switch checkedChildren="On" unCheckedChildren="Off" />
              </Form.Item>
              <Button type="primary" htmlType="submit" loading={loading}>
                Save Preferences
              </Button>
            </Form>
          </Card>
        );
      case 'security':
        return (
          <Card title="Security Settings">
            <Form form={form} layout="vertical" onFinish={handleSubmit}>
              <Form.Item name="currentPassword" label="Current Password" rules={[{ required: true }]}>
                <Input.Password prefix={<LockOutlined />} placeholder="Enter current password" />
              </Form.Item>
              <Form.Item name="newPassword" label="New Password" rules={[{ required: true }]}>
                <Input.Password prefix={<LockOutlined />} placeholder="Enter new password" />
              </Form.Item>
              <Form.Item name="confirmPassword" label="Confirm Password" dependencies={['newPassword']} rules={[
                { required: true },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('newPassword') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('The two passwords do not match!'));
                  },
                }),
              ]}>
                <Input.Password prefix={<LockOutlined />} placeholder="Confirm new password" />
              </Form.Item>
              <Form.Item name="twoFactorAuth" label="Two-Factor Authentication" valuePropName="checked">
                <Switch checkedChildren="Enabled" unCheckedChildren="Disabled" />
              </Form.Item>
              <Button type="primary" htmlType="submit" loading={loading}>
                Update Security Settings
              </Button>
            </Form>
          </Card>
        );
      case 'integrations':
        return (
          <Card title="Connected Apps">
            <Table
              columns={[
                { title: 'App Name', dataIndex: 'name', key: 'name' },
                { title: 'Last Used', dataIndex: 'lastUsed', key: 'lastUsed' },
                { title: 'Permissions', dataIndex: 'permissions', key: 'permissions', render: perms => perms.join(', ') },
                {
                  title: 'Actions',
                  key: 'actions',
                  render: (_, record) => (
                    <Button danger onClick={() => revokeApp(record.id)}>
                      Revoke
                    </Button>
                  ),
                },
              ]}
              dataSource={connectedApps}
              rowKey="id"
              pagination={false}
            />
          </Card>
        );
      case 'api':
        return (
          <Card title="API Keys Management">
            <ApiKeysTable />
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <div className="settings-container">
      <div className="settings-tabs">
        {tabs.map(tab => (
          <Button
            key={tab.key}
            type={activeTab === tab.key ? 'primary' : 'default'}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </Button>
        ))}
      </div>
      <div className="settings-content">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default SettingsPage;