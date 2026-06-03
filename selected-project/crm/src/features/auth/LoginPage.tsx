import { Button, Card, Form, Input, Typography } from 'antd';
import { LockOutlined, MailOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import './LoginPage.css';

const { Title } = Typography;

const LoginPage = () => {
  const navigate = useNavigate();
  const onFinish = (values: any) => {
    // Always succeed and redirect to /customers
    navigate('/customers');
  };

  return (
    <Card className="login-card">
      <Title level={2} className="login-title">
        CRM Login
      </Title>
      <Form
        name="login"
        initialValues={{ remember: true }}
        onFinish={onFinish}
        layout="vertical"
      >
        <Form.Item name="email">
          <Input prefix={<MailOutlined />} placeholder="Email" />
        </Form.Item>
        <Form.Item name="password">
          <Input
            prefix={<LockOutlined />}
            type="password"
            placeholder="Password"
          />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            Log in
          </Button>
        </Form.Item>
      </Form>
      <div className="login-footer">
        <Link to="/forgot-password">Forgot password?</Link>
      </div>
    </Card>
  );
};

export default LoginPage;