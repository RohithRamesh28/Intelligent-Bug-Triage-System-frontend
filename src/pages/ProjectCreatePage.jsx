import { useState } from 'react';
import { Button, Form, Input, Typography, message } from 'antd';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

const { Title } = Typography;

function ProjectCreatePage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await api.post('/projects/create', {
        project_name: values.project_name,
      });
      message.success('Project created! Please register.');
      navigate('/register');
    } catch (err) {
      message.error(err.response?.data?.detail || 'Project creation failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '100px auto' }}>
      <Title level={2}>Create Project</Title>
      <Form layout="vertical" onFinish={onFinish}>
        <Form.Item name="project_name" label="Project Name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            Create Project
          </Button>
        </Form.Item>
      </Form>
      <div style={{ textAlign: 'center', marginTop: 16 }}>
        Already have an account? <Link to="/">Login</Link>
      </div>
    </div>
  );
}

export default ProjectCreatePage;
