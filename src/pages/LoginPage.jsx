import { useState } from 'react';
import { Button, Form, Input, Typography, message, Card } from 'antd';
import { useNavigate, Link } from 'react-router-dom';
import { FiLogIn } from 'react-icons/fi';
import api from '../api';

const { Title, Text } = Typography;

function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const res = await api.post('/login', values);
      const { token, user_id, project_id, role } = res.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user_id', user_id);
      localStorage.setItem('project_id', project_id);
      localStorage.setItem('role', role);

      message.success('Login successful!');
      setLoginError('');
      navigate('/dashboard');
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Login failed.';
      message.error(errorMsg);
      setLoginError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: 'linear-gradient(135deg, #f0f5ff, #ffffff)',
      padding: '40px 16px'
    }}>
      <Card
        bordered={false}
        style={{
          width: '100%',
          maxWidth: 440,
          padding: 32,
          borderRadius: 16,
          background: '#ffffff',
          boxShadow: '0 8px 24px rgba(0,0,0,0.08)'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 32, fontWeight: 600, color: '#3f3f3f' }}>
            Bug Triage System
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 8 }}>
            <FiLogIn size={20} style={{ marginRight: 8, color: '#1890ff' }} />
            <Title level={4} style={{ marginBottom: 0, color: '#3f3f3f' }}>Welcome Back</Title>
          </div>
        </div>

        <Form layout="vertical" onFinish={onFinish} size="middle">
          <Form.Item
            name="username"
            label="Username"
            rules={[{ required: true, message: 'Please enter your username.' }]}
          >
            <Input placeholder="Enter your username" autoComplete="username" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: 'Please enter your password.' }]}
          >
            <Input.Password placeholder="Enter your password" autoComplete="current-password" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Login
            </Button>
          </Form.Item>
        </Form>

        {loginError && (
          <Text type="danger" style={{ display: 'block', textAlign: 'center', marginBottom: 12 }}>
            {loginError}
          </Text>
        )}

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Text>Don't have an account? </Text>
          <Link to="/register">Register here</Link>
        </div>
      </Card>
    </div>
  );
}

export default LoginPage;