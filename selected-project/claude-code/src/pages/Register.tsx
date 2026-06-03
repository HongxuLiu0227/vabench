import React from 'react';
import { Form, Input, Button, Card, Typography, Select, DatePicker } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

const Register: React.FC = () => {
  const { register, isLoading } = useAuth();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const onFinish = async (values: any) => {
    const userData = {
      ...values,
      dateOfBirth: values.dateOfBirth ? values.dateOfBirth.format('YYYY-MM-DD') : undefined,
    };
    
    const success = await register(userData);
    if (success) {
      navigate('/');
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
          maxWidth: '500px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          borderRadius: '12px',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Title level={2} style={{ color: '#1890ff', marginBottom: '8px' }}>
            Join Social Network
          </Title>
          <Text type="secondary">Create your account</Text>
        </div>

        <Form
          form={form}
          name="register"
          onFinish={onFinish}
          autoComplete="off"
          layout="vertical"
          scrollToFirstError
        >
          <Form.Item
            name="fullName"
            label="Full Name"
            rules={[{ required: true, message: 'Please input your full name!' }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Enter your full name"
              size="large"
            />
          </Form.Item>

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
            name="username"
            label="Username"
            rules={[{ required: true, message: 'Please choose a username!' }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Choose a username"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[
              { required: true, message: 'Please input your password!' },
              { min: 6, message: 'Password must be at least 6 characters!' },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Create a password"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="gender"
            label="Gender"
          >
            <Select placeholder="Select gender" size="large">
              <Option value="male">Male</Option>
              <Option value="female">Female</Option>
              <Option value="other">Other</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="dateOfBirth"
            label="Date of Birth"
          >
            <DatePicker
              style={{ width: '100%' }}
              size="large"
              placeholder="Select your birth date"
              disabledDate={(current) => current && current > dayjs().endOf('day')}
            />
          </Form.Item>

          <Form.Item
            name="location"
            label="Location"
          >
            <Input
              prefix={<EnvironmentOutlined />}
              placeholder="Enter your location"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="bio"
            label="Bio"
          >
            <Input.TextArea
              placeholder="Tell us about yourself"
              rows={3}
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
              Create Account
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <Text type="secondary">
            Already have an account?{' '}
            <Link to="/login">
              <Text strong style={{ color: '#1890ff' }}>
                Sign in
              </Text>
            </Link>
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default Register;