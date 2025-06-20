import { Layout, Menu, Typography, Spin } from "antd";
import {
  DashboardOutlined,
  UploadOutlined,
  UserOutlined,
  LogoutOutlined,
  FolderOpenOutlined,
} from "@ant-design/icons";
import { BiBug } from "react-icons/bi";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useMemo, useEffect } from "react";
import api from "../api";

const { Sider, Content } = Layout;
const { Title, Text } = Typography;

function DashboardLayout({ children }) {
  const [hovering, setHovering] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();

  const username = localStorage.getItem("username");
  const role = localStorage.getItem("role") || "developer";

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const handleMenuClick = ({ key }) => {
    if (key === "logout") {
      handleLogout();
    } else if (key === "settings") {
      navigate("/settings");
    } else {
      navigate(`/${key}`);
    }
  };

  const mainMenuItems = useMemo(() => {
    const items = [
      { key: "profile", icon: <UserOutlined />, label: "Profile" },
      { key: "dashboard", icon: <DashboardOutlined />, label: "Dashboard" },
    ];

    if (role === "developer") {
      items.push(
        { key: "uploads", icon: <UploadOutlined />, label: "Uploads" },
        { key: "my-uploads", icon: <FolderOpenOutlined />, label: "My Uploads" }
      );
    }

    if (role === "team_lead") {
      items.push({
        key: "all-uploads",
        icon: <FolderOpenOutlined />,
        label: "All Uploads",
      });
    }

    return items;
  }, [role]);

  const currentPath = location.pathname;
  const currentPage = currentPath.startsWith("/profile")
    ? "profile"
    : currentPath.startsWith("/uploads") &&
      !currentPath.startsWith("/my-uploads")
    ? "uploads"
    : currentPath.startsWith("/my-uploads")
    ? "my-uploads"
    : currentPath.startsWith("/all-uploads")
    ? "all-uploads"
    : currentPath.startsWith("/dashboard")
    ? "dashboard"
    : currentPath.startsWith("/settings")
    ? "settings"
    : "";

  useEffect(() => {
    const fetchProjectName = async () => {
      try {
        const projectId = localStorage.getItem("project_id");
        const res = await api.get(`/project/${projectId}`);
        setProjectName(res.data.project_name || "Project");
      } catch (err) {
        console.error("Failed to load project name", err);
        setProjectName("Project");
      } finally {
        setLoading(false);
      }
    };
    fetchProjectName();
  }, []);

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        collapsed={!hovering}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        width={200}
        collapsedWidth={80}
        style={{
          position: "fixed",
          height: "100vh",
          left: 0,
          top: 0,
          zIndex: 1000,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            color: "white",
            padding: 16,
            textAlign: "center",
            fontWeight: "bold",
            fontSize: 18,
          }}
        >
          {hovering ? "Bug Triage" : <BiBug size={24} />}
        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[currentPage]}
          onClick={handleMenuClick}
          style={{
            flex: 1,
            overflow: "auto",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
          items={[
            {
              type: "group",
              label: "",
              children: mainMenuItems,
            },
          ]}
        />
      </Sider>

      <Layout
        style={{
          marginLeft: hovering ? 200 : 80,
          transition: "margin-left 0.2s",
        }}
      >
        <div
          style={{
            position: "sticky",
            top: 0,
            zIndex: 900,
            background: "#fff",
            padding: "0 24px",
            borderBottom: "1px solid #f0f0f0",
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {loading ? (
              <Spin size="small" />
            ) : (
              <Title level={4} style={{ margin: 0, color: "#1f1f1f" }}>
                Project: <span style={{ fontWeight: 600 }}>{projectName}</span>
              </Title>
            )}
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              background: "#f5f5f5",
              padding: "6px 12px",
              borderRadius: "999px",
              gap: 12,
            }}
          >
            <Text style={{ fontSize: 14, color: "#595959", margin: 0 }}>
              <span style={{ fontWeight: 500 }}>
                {username?.charAt(0).toUpperCase() + username?.slice(1)}
              </span>{" "}
              <span style={{ color: "#8c8c8c" }}>
                ({role === "team_lead" ? "Team Lead" : "Developer"})
              </span>
            </Text>

            <LogoutOutlined
              onClick={handleLogout}
              style={{
                color: "#ff4d4f",
                fontSize: 18,
                cursor: "pointer",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => (e.target.style.color = "#cf1322")}
              onMouseLeave={(e) => (e.target.style.color = "#ff4d4f")}
            />
          </div>
        </div>

        <Content style={{ margin: "16px", marginTop: 8 }}>{children}</Content>
      </Layout>
    </Layout>
  );
}

export default DashboardLayout;
