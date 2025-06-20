import { useEffect, useState } from "react";
import {
  Button,
  Form,
  Input,
  Typography,
  message,
  Card,
  Select,
  Space,
} from "antd";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";

const { Title, Text } = Typography;
const { Option } = Select;

const roles = [
  { label: "Developer", value: "developer" },
  { label: "Team Lead", value: "team_lead" },
];

function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [projects, setProjects] = useState([]);
  const navigate = useNavigate();

  const fetchProjects = async () => {
    try {
      const res = await api.get("/projects/list");
      setProjects(res.data.projects || []);
    } catch (err) {
      console.error("Failed to load projects", err);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const res = await api.post("/login", values);
      const { token, user_id, project_id, role } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user_id", user_id);
      localStorage.setItem("project_id", project_id);
      localStorage.setItem("role", role);
      localStorage.setItem("username", res.data.username);

      message.success("Login successful!");
      setLoginError("");
      navigate("/dashboard");
    } catch (err) {
      const errorMsg = err.response?.data?.detail || "Login failed.";
      message.error(errorMsg);
      setLoginError(errorMsg);
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
        variant="borderless"
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
        </div>

        <Form layout="vertical" onFinish={onFinish} size="middle">
          <Form.Item label="Login as" style={{ marginBottom: 4 }} required>
            <Space.Compact style={{ width: "100%" }}>
              <Form.Item
                name="username"
                noStyle
                rules={[{ required: true, message: "Username is required" }]}
              >
                <Input
                  style={{ width: "40%" }}
                  placeholder="Username"
                  autoComplete="username"
                />
              </Form.Item>

              <Form.Item
                name="role"
                noStyle
                rules={[{ required: true, message: "Role is required" }]}
              >
                <Select style={{ width: "30%" }} placeholder="Role">
                  {roles.map((role) => (
                    <Option key={role.value} value={role.value}>
                      {role.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="project_id"
                noStyle
                rules={[{ required: true, message: "Project is required" }]}
              >
                <Select style={{ width: "30%" }} placeholder="Project">
                  {projects.map((p) => (
                    <Option key={p.project_id} value={p.project_id}>
                      {p.project_name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Space.Compact>
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: "Please enter your password." }]}
          >
            <Input.Password
              placeholder="Enter your password"
              autoComplete="current-password"
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Login
            </Button>
          </Form.Item>
        </Form>

        {loginError && (
          <Text
            type="danger"
            style={{ display: "block", textAlign: "center", marginBottom: 12 }}
          >
            {loginError}
          </Text>
        )}

        <div style={{ textAlign: "center", marginTop: 16 }}>
          <Text>Don't have an account? </Text>
          <Link to="/register">Register here</Link>
        </div>
      </Card>
    </div>
  );
}

export default LoginPage;
