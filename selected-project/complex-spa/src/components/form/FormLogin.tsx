import React, { useState } from 'react';
import { Button, Form, Input, Checkbox, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import './FormLogin.css';

interface FormValues {
  username: string;
  password: string;
  remember: boolean;
}

export const FormLogin: React.FC = () => {
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: FormValues) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      message.success(`Welcome back, ${values.username}!`);
    } catch (error) {
      message.error('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-form-container">
      <h2>Login to Your Account</h2>
      <Form
        name="login"
        initialValues={{ remember: true }}
        onFinish={onFinish}
        className="login-form"
      >
        <Form.Item
          name="username"
          rules={[
            { required: true, message: 'Please input your username!' },
            { min: 4, message: 'Username must be at least 4 characters' }
          ]}
        >
          <Input prefix={<UserOutlined />} placeholder="Username" />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[
            { required: true, message: 'Please input your password!' },
            { min: 6, message: 'Password must be at least 6 characters' }
          ]}
        >
          <Input
            prefix={<LockOutlined />}
            type="password"
            placeholder="Password"
          />
        </Form.Item>

        <Form.Item name="remember" valuePropName="checked">
          <Checkbox>Remember me</Checkbox>
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            className="login-form-button"
          >
            Log in
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};
