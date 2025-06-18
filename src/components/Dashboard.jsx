import { useEffect, useMemo, useState } from "react";
import {
  Spin, Card, Row, Col, List, Button, Typography, message,
} from "antd";
import {
  PieChart, Pie, Cell, Tooltip as ReTooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";
import { useNavigate } from "react-router-dom";
import { TeamOutlined } from "@ant-design/icons";
import api from "../api";

const { Title } = Typography;
const COLORS = ["#ff4d4f", "#faad14", "#52c41a"];
const CHART_COLORS = ["#69c0ff", "#73d13d", "#ffc53d", "#ff85c0"];

function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [uploads, setUploads] = useState([]);
  const [userIdToNameMap, setUserIdToNameMap] = useState({});
  const [userCounts, setUserCounts] = useState({ developers: 0, teamLeads: 0 });
  const [projectName, setProjectName] = useState(
    localStorage.getItem("project_name") || "Current Project"
  );

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

        const projectRes = await api.get(`/project/${projectId}`);
        const name = projectRes.data.project_name;
        if (name) {
          setProjectName(name);
          localStorage.setItem("project_name", name);
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        message.error("Failed to load dashboard.");
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
    let high = 0, med = 0, low = 0;
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
      .slice(0, 5);
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

  const bugsPieData = useMemo(() => [
    { name: "High", value: highBugs },
    { name: "Medium", value: mediumBugs },
    { name: "Low", value: lowBugs },
  ], [highBugs, mediumBugs, lowBugs]);

  return (
    <>
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
          <Spin size="large" tip="Loading Dashboard..." />
        </div>
      ) : (
        <>
          <Row style={{ marginBottom: 24 }}>
            <Col xs={24}>
              <Card size="small" bordered={false} style={{ backgroundColor: '#f0f5ff' }}>
                <Title level={4}>Project: {projectName}</Title>
              </Card>
            </Col>
          </Row>

          <Row gutter={[24, 24]}>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Card title="Total Uploads" style={{ backgroundColor: '#e6fffb' }}><Title level={2}>{totalUploads}</Title></Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Card title="High Priority Bugs" style={{ backgroundColor: '#fff1f0' }}><Title level={2}>{highBugs}</Title></Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Card title="Medium Priority Bugs" style={{ backgroundColor: '#fffbe6' }}><Title level={2}>{mediumBugs}</Title></Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Card title="Low Priority Bugs" style={{ backgroundColor: '#f6ffed' }}><Title level={2}>{lowBugs}</Title></Card>
            </Col>
          </Row>

          <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
            <Col xs={24} md={8}>
              <Card title="Bugs by Priority">
                <PieChart width={300} height={250}>
                  <Pie
                    data={bugsPieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {bugsPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <ReTooltip />
                  <Legend />
                </PieChart>
              </Card>
            </Col>

            <Col xs={24} md={8}>
              <Card title="Uploads per User">
                <BarChart width={300} height={250} data={uploadsBarData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="user" />
                  <YAxis />
                  <ReTooltip />
                  <Legend />
                  <Bar dataKey="uploads">
                    {uploadsBarData.map((entry, index) => (
                      <Cell key={`bar-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </Card>
            </Col>

            {role === "team_lead" && (
              <Col xs={24} md={8}>
                <Card
                  title={<span><TeamOutlined /> Team Overview</span>}
                  style={{ backgroundColor: '#f0e9ff', height: '100%', border: '1px solid #d3adf7', boxShadow: '0 4px 12px rgba(108, 0, 255, 0.1)' }}
                  headStyle={{ color: '#722ed1', fontWeight: 'bold', fontSize: 16 }}
                  bodyStyle={{ fontSize: 15, color: '#3f3f3f', padding: '12px 20px' }}
                >
                  <p><strong>👨 Developers:</strong> {userCounts.developers}</p>
                  <p><strong>🧑Team Leads:</strong> {userCounts.teamLeads}</p>
                </Card>
              </Col>
            )}
          </Row>

          <Row style={{ marginTop: 24 }}>
            <Col span={24}>
              <Card title="Recent Uploads">
                <List
                  bordered
                  dataSource={recentUploads}
                  renderItem={(item) => (
                    <List.Item
                      onClick={() => navigate(`/upload/${item.upload_id}`)}
                      style={{
                        cursor: "pointer",
                        flexDirection: "column",
                        alignItems: "flex-start",
                        padding: "12px 16px",
                      }}
                    >
                      <div style={{ fontWeight: "bold", fontSize: 15, marginBottom: 4 }}>
                        {item.upload_description || "No description provided"}
                      </div>
                      <div style={{ fontSize: 14, color: "#555" }}>
                        Uploaded by: {item.username || userIdToNameMap[item.user_id] || "Unknown"}
                      </div>
                      <div style={{ fontSize: 14, color: "#555" }}>
                        Filename: {item.original_filename || "Unknown"}
                      </div>
                      <div style={{ fontSize: 14, color: "#555" }}>
                        Number of Files: {item.num_files}
                      </div>
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
          </Row>

          {role === "team_lead" && (
            <Row justify="center" style={{ marginTop: 24 }}>
              <Col>
                <Button type="primary" size="large" onClick={() => navigate("/all-uploads")}>View All Uploads</Button>
              </Col>
            </Row>
          )}
        </>
      )}
    </>
  );
}

export default Dashboard;
