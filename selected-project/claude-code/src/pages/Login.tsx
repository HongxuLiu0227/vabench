import React from 'react';
import { Form, Input, Button, Card, Typography, Space, Divider } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const { Title, Text } = Typography;

const Login: React.FC = () => {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const onFinish = async (values: { email: string; password: string }) => {
    const success = await login(values.email, values.password);
    if (success) {
      navigate('/');
    } else {
      form.setFields([
        {
          name: 'password',
          errors: ['Invalid email or password'],
        },
      ]);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <Card
        style={{
          width: '100%',
          maxWidth: '400px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          borderRadius: '12px',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Title level={2} style={{ color: '#1890ff', marginBottom: '8px' }}>
            Social Network
          </Title>
          <Text type="secondary">Sign in to your account</Text>
        </div>

        <Form
          form={form}
          name="login"
          onFinish={onFinish}
          autoComplete="off"
          layout="vertical"
        >
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please input your email!' },
              { type: 'email', message: 'Please enter a valid email!' },
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="Enter your email"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Enter your password"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={isLoading}
              size="large"
              block
            >
              Sign In
            </Button>
          </Form.Item>
        </Form>

        <Divider>
          <Text type="secondary">Demo Accounts</Text>
        </Divider>

        <Space direction="vertical" style={{ width: '100%' }}>
          <Button
            type="dashed"
            block
            onClick={() => {
              form.setFieldsValue({
                email: 'john@example.com',
                password: 'password',
              });
            }}
          >
            <UserOutlined /> Regular User
          </Button>
          <Button
            type="dashed"
            block
            onClick={() => {
              form.setFieldsValue({
                email: 'admin@example.com',
                password: 'password',
              });
            }}
          >
            <UserOutlined /> Admin User
          </Button>
        </Space>

        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <Text type="secondary">
            Don't have an account?{' '}
            <Link to="/register">
              <Text strong style={{ color: '#1890ff' }}>
                Sign up
              </Text>
            </Link>
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default Login;