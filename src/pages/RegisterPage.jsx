import { useState, useEffect } from "react";
import {
  Button,
  Form,
  Input,
  Select,
  Typography,
  message,
  Card,
} from "antd";
import { useNavigate, Link } from "react-router-dom";
import { FiUserPlus } from "react-icons/fi";
import api from "../api";

const { Title, Text } = Typography;

function RegisterPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await api.get("/projects/list");
        setProjects(res.data.projects);
      } catch {
        message.error("Failed to load projects.");
      }
    };
    fetchProjects();
  }, []);

  const onFinish = async (values) => {
    setLoading(true);

    const username = values.username.trim().toLowerCase();
    const password = values.password.trim();

    if (password.length < 6) {
      form.setFields([
        {
          name: "password",
          errors: ["Password must be at least 6 characters."],
        },
      ]);
      setLoading(false);
      return;
    }

    try {
      await api.post("/register", {
        username,
        password,
        project_id: values.project_id,
        role: values.role,
      });

      message.success("Registration successful! Please login.");
      navigate("/");
    } catch (err) {
      const detail = err.response?.data?.detail;

      if (detail?.includes("Username already exists")) {
        form.setFields([
          {
            name: "username",
            errors: ["Username already exists for this role and project."],
          },
        ]);
      } else if (detail?.includes("Invalid project_id")) {
        form.setFields([
          {
            name: "project_id",
            errors: ["Selected project does not exist."],
          },
        ]);
      } else {
        message.error("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #f0f5ff, #ffffff)",
        padding: "40px 16px",
      }}
    >
      <Card
        bordered={false}
        style={{
          width: "100%",
          maxWidth: 480,
          padding: 32,
          borderRadius: 16,
          background: "#ffffff",
          boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 32, fontWeight: 600, color: "#3f3f3f" }}>
            Bug Triage System
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              marginTop: 8,
            }}
          >
            <FiUserPlus
              size={20}
              style={{ marginRight: 8, color: "#1890ff" }}
            />
            <Title level={4} style={{ marginBottom: 0, color: "#3f3f3f" }}>
              Create Your Account
            </Title>
          </div>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          size="middle"
          scrollToFirstError
        >
          <Form.Item
            name="username"
            label="Username"
            rules={[
              { required: true, message: "Please enter a username" },
              { whitespace: true, message: "Username cannot be empty" },
            ]}
          >
            <Input placeholder="Choose a username" autoComplete="username" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: "Please enter a password" }]}
          >
            <Input.Password
              placeholder="Create a password"
              autoComplete="new-password"
            />
          </Form.Item>

          <Form.Item
            name="project_id"
            label="Select Project"
            rules={[{ required: true, message: "Please select a project" }]}
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

          <Form.Item
            name="role"
            label="Select Role"
            rules={[{ required: true, message: "Please select a role" }]}
          >
            <Select placeholder="Select a Role">
              <Select.Option value="developer">Developer</Select.Option>
              <Select.Option value="team_lead">Team Lead</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Register
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: "center", marginTop: 16 }}>
          <Text>Want to create a new project? </Text>
          <Link to="/projects/create">Click here</Link>
        </div>

        <div style={{ textAlign: "center", marginTop: 12 }}>
          <Text>Already have an account? </Text>
          <Link to="/">Login</Link>
        </div>
      </Card>
    </div>
  );
}

export default RegisterPage;
