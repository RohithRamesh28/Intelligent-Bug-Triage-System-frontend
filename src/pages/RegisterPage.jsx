import { useState, useEffect } from "react";
import { Button, Form, Input, Select, Typography, message } from "antd";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";

const { Title } = Typography;

function RegisterPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Load project list
    const fetchProjects = async () => {
      try {
        const res = await api.get("/projects/list");
        setProjects(res.data.projects);
      } catch (err) {
        message.error("Failed to load projects.", err);
      }
    };
    fetchProjects();
  }, []);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await api.post("/register", {
        username: values.username,
        password: values.password,
        project_id: values.project_id,
      });
      message.success("Registration successful! Please login.");
      navigate("/");
    } catch (err) {
      message.error(err.response?.data?.detail || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "100px auto" }}>
      <Title level={2}>Register</Title>
      <Form layout="vertical" onFinish={onFinish}>
        <Form.Item
          name="username"
          label="Username"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="password"
          label="Password"
          rules={[{ required: true }]}
        >
          <Input.Password />
        </Form.Item>
        <Form.Item
          name="project_id"
          label="Select Project"
          rules={[{ required: true }]}
        >
          <Select placeholder="Select a Project">
            {projects.map((project) => (
              <Select.Option
                key={project.project_id}
                value={project.project_id}
              >
                {project.project_name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            Register
          </Button>
        </Form.Item>
      </Form>
      <div style={{ textAlign: 'center', marginTop: 16 }}>
  Want to create a new Project?{' '}
  <Link to="/projects/create">Click here</Link>
</div>

      <div style={{ textAlign: "center", marginTop: 16 }}>
        Already have an account? <Link to="/">Login</Link>
      </div>
    </div>
  );
}

export default RegisterPage;
