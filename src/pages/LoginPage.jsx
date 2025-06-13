import { useState } from 'react';
import { Button, Form, Input, Typography, message } from 'antd';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

const { Title } = Typography;

function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const res = await api.post('/login', values);
      const { token, user_id, project_id } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user_id', user_id);
      localStorage.setItem('project_id', project_id);

      message.success('Login successful!');
      setLoginError(''); // Clear error on success
      navigate('/dashboard');
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Login failed.';
      message.error(errorMsg);
      setLoginError(errorMsg); // Show below form
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '100px auto' }}>
      <Title level={2}>Login</Title>
      <Form layout="vertical" onFinish={onFinish}>
        <Form.Item
          name="username"
          label="Username"
          rules={[{ required: true, message: 'Please enter your username.' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="password"
          label="Password"
          rules={[{ required: true, message: 'Please enter your password.' }]}
        >
          <Input.Password />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            Login
          </Button>
        </Form.Item>
      </Form>

      {loginError && (
        <div style={{ color: 'red', textAlign: 'center', marginTop: 10 }}>
          {loginError}
        </div>
      )}

      <div style={{ textAlign: 'center', marginTop: 16 }}>
        Don't have an account? <Link to="/register">Register here</Link>
      </div>
    </div>
  );
}

export default LoginPage;
