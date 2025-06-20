import { useEffect, useMemo, useState } from "react";
import { ResponsiveContainer } from "recharts";

import {
  Spin,
  Card,
  Row,
  Col,
  Table,
  Button,
  Typography,
  message,
} from "antd";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as ReTooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { useNavigate } from "react-router-dom";
import { TeamOutlined } from "@ant-design/icons";
import api from "../api";

const { Title, Text } = Typography;
const COLORS = ["#ff4d4f", "#faad14", "#52c41a"];
const CHART_COLORS = ["#69c0ff", "#73d13d", "#ffc53d", "#ff85c0"];

function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [uploads, setUploads] = useState([]);
  const [userIdToNameMap, setUserIdToNameMap] = useState({});
  const [userCounts, setUserCounts] = useState({ developers: 0, teamLeads: 0 });

  const navigate = useNavigate();
  const userId = localStorage.getItem("user_id");
  const projectId = localStorage.getItem("project_id");
  const role = localStorage.getItem("role");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const uploadRes =
          role === "team_lead"
            ? await api.get("/project/dashboard")
            : await api.get("/project/my-uploads");

        const uploadsData = uploadRes.data.uploads || [];
        setUploads(uploadsData);

        const map = {};
        uploadsData.forEach((upload) => {
          if (upload.user_id && upload.username) {
            map[upload.user_id] = upload.username;
          }
        });
        setUserIdToNameMap(map);

        if (role === "team_lead") {
          const statsRes = await api.get("/project/user-stats");
          setUserCounts({
            developers: statsRes.data.developers,
            teamLeads: statsRes.data.team_leads,
          });
        }
      } catch (err) {
        message.error("Failed to load dashboard.", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [projectId, role]);

  const userUploads = useMemo(() => {
    return role === "developer"
      ? uploads.filter((u) => u.user_id === userId)
      : uploads;
  }, [uploads, userId, role]);

  const { highBugs, mediumBugs, lowBugs } = useMemo(() => {
    let high = 0,
      med = 0,
      low = 0;
    userUploads.forEach((upload) => {
      const bugs = upload.bugs_sanity_checked || [];
      bugs.forEach((bug) => {
        if (bug.priority === "High") high++;
        else if (bug.priority === "Medium") med++;
        else if (bug.priority === "Low") low++;
      });
    });
    return { highBugs: high, mediumBugs: med, lowBugs: low };
  }, [userUploads]);

  const totalUploads = userUploads.length;

  const recentUploads = useMemo(() => {
    return [...userUploads]
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 4);
  }, [userUploads]);

  const uploadsBarData = useMemo(() => {
    const perUser = {};
    userUploads.forEach((upload) => {
      const uid = upload.user_id;
      perUser[uid] = (perUser[uid] || 0) + 1;
    });
    return Object.keys(perUser).map((uid) => ({
      user:
        userIdToNameMap[uid] ||
        (uid === userId ? "You" : `User ${uid.slice(-4)}`),
      uploads: perUser[uid],
    }));
  }, [userUploads, userIdToNameMap, userId]);

  const bugsPieData = useMemo(
    () => [
      { name: "High", value: highBugs },
      { name: "Medium", value: mediumBugs },
      { name: "Low", value: lowBugs },
    ],
    [highBugs, mediumBugs, lowBugs]
  );

  return loading ? (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "60vh",
      }}
    >
      <Spin size="large" tip="Loading Dashboard..." />
    </div>
  ) : (
    <>
      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card title="Total Uploads" style={{ backgroundColor: "#e6fffb" }}>
            <Title level={2}>
              {totalUploads > 0 ? totalUploads : <Text type="secondary">No Uploads yet</Text>}
            </Title>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card title="High Priority Bugs" style={{ backgroundColor: "#fff1f0" }}>
            <Title level={2}>
              {highBugs > 0 ? highBugs : <Text type="secondary">No Bugs yet</Text>}
            </Title>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>   
          <Card title="Medium Priority Bugs" style={{ backgroundColor: "#fffbe6" }}>
            <Title level={2}>
              {mediumBugs > 0 ? mediumBugs : <Text type="secondary">No Bugs yet</Text>}
            </Title>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card title="Low Priority Bugs" style={{ backgroundColor: "#f6ffed" }}>
            <Title level={2}>
              {lowBugs > 0 ? lowBugs : <Text type="secondary">No Bugs yet</Text>}
            </Title>
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col xs={24} md={role === "team_lead" ? 8 : 12}>
          <Card title="Bugs by Priority">
            {highBugs + mediumBugs + lowBugs === 0 ? (
              <div style={{ padding: 32, textAlign: "center" }}>
                <Text type="secondary">No data to display</Text>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={bugsPieData}
                    cx="40%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {bugsPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend layout="vertical" align="right" verticalAlign="middle" />
                  <ReTooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Card>
        </Col>

        <Col xs={24} md={role === "team_lead" ? 8 : 12}>
          <Card title="Uploads per User">
            {uploadsBarData.length === 0 ? (
              <div style={{ padding: 32, textAlign: "center" }}>
                <Text type="secondary">No uploads yet</Text>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={uploadsBarData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="user" />
                  <YAxis />
                  <ReTooltip />
                  <Legend layout="vertical" align="right" verticalAlign="middle" />
                  <Bar dataKey="uploads">
                    {uploadsBarData.map((entry, index) => (
                      <Cell key={`bar-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>
        </Col>

        {role === "team_lead" && (
          <Col xs={24} md={8}>
            <Card
              title={<span><TeamOutlined /> Team Overview</span>}
              style={{
                backgroundColor: "#f0e9ff",
                height: "100%",
                border: "1px solid #d3adf7",
                boxShadow: "0 4px 12px rgba(108, 0, 255, 0.1)",
              }}
            >
              <div style={{ fontSize: 15, color: "#3f3f3f", padding: "12px 20px" }}>
                <p><strong>Developers:</strong> {userCounts.developers > 0 ? userCounts.developers : <Text type="secondary">No data</Text>}</p>
                <p><strong>Team Leads:</strong> {userCounts.teamLeads > 0 ? userCounts.teamLeads : <Text type="secondary">No data</Text>}</p>
              </div>
            </Card>
          </Col>
        )}
      </Row>

      <Card
  title="Recent Uploads"
  style={{ marginTop: 24 }}
  extra={
    role === "team_lead" && (
      <Button type="primary" onClick={() => navigate("/all-uploads")}>
        View All Uploads
      </Button>
    )
  }
>
        <Table
          rowKey="upload_id"
          dataSource={recentUploads}
          pagination={false}
          size="middle"
          bordered
          locale={{ emptyText: "No recent uploads found" }}
          onRow={(record) => ({
            onClick: () => navigate(`/upload/${record.upload_id}`),
            style: { cursor: "pointer" },
          })}
          columns={[
            {
              title: "Description",
              dataIndex: "upload_description",
              key: "desc",
              render: (text) => text || <i>No description</i>,
            },
            {
              title: "User",
              dataIndex: "username",
              key: "user",
              render: (u, row) => u || userIdToNameMap[row.user_id] || <i>Unknown</i>,
            },
            {
              title: "Filename",
              dataIndex: "original_filename",
              key: "file",
            },
            {
              title: "Files",
              dataIndex: "num_files",
              key: "files",
              align: "center",
            },
            {
              title: "Uploaded",
              dataIndex: "timestamp",
              key: "time",
              render: (t) =>
                new Date(t).toLocaleString("en-IN", {
                  timeZone: "Asia/Kolkata",
                  dateStyle: "medium",
                  timeStyle: "short",
                }),
            },
          ]}
        />
      </Card>

    
    </>
  );
}

export default Dashboard;
