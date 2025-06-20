import { useState } from 'react';
import { Button, Form, Input, Typography, message, Card } from 'antd';
import { useNavigate, Link } from 'react-router-dom';
import { FiFolderPlus } from 'react-icons/fi';
import api from '../api';

const { Title, Text } = Typography;

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
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #f0f5ff, #ffffff)',
        padding: '40px 16px',
      }}
    >
      <Card
        variant="borderless"
        style={{
          width: '100%',
          maxWidth: 440,
          padding: 32,
          borderRadius: 16,
          background: '#ffffff',
          boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 32, fontWeight: 600, color: '#3f3f3f' }}>
            Bug Triage System
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 8 }}>
            <FiFolderPlus size={20} style={{ marginRight: 8, color: '#1890ff' }} />
            <Title level={4} style={{ marginBottom: 0, color: '#3f3f3f' }}>Create New Project</Title>
          </div>
        </div>

        <Form layout="vertical" onFinish={onFinish} size="middle">
          <Form.Item
            name="project_name"
            label="Project Name"
            rules={[{ required: true, message: 'Please enter a project name' }]}
          >
            <Input placeholder="Enter project name" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Create Project
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Text>Already have an account? </Text>
          <Link to="/">Login</Link>
        </div>
      </Card>
    </div>
  );
}

export default ProjectCreatePage;
