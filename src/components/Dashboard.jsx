import { useEffect, useState } from 'react';
import { Card, Row, Col, List, Button, Skeleton, Typography, message } from 'antd';
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
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const { Title } = Typography;

const COLORS = ['#ff4d4f', '#faad14', '#52c41a']; // High / Medium / Low bug colors

function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [uploads, setUploads] = useState([]);
  const navigate = useNavigate();

  const userId = localStorage.getItem('user_id');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/project/dashboard');
        setUploads(res.data.uploads || []);
      } catch (err) {
        console.error('Failed to load project dashboard.', err);
        message.error('Failed to load project dashboard.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const countBugs = (priority) => {
    let count = 0;
    uploads.forEach((upload) => {
      const bugs = upload.bugs_sanity_checked || [];
      count += bugs.filter((bug) => bug.priority === priority).length;
    });
    return count;
  };

  const totalUploads = uploads.length;
  const myUploads = uploads.filter((upload) => upload.user_id === userId).length;
  const highBugs = countBugs('High');
  const mediumBugs = countBugs('Medium');
  const lowBugs = countBugs('Low');

  const recentUploads = uploads
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 5);

  // Pie chart data → Bugs by Priority
  const bugsPieData = [
    { name: 'High', value: highBugs },
    { name: 'Medium', value: mediumBugs },
    { name: 'Low', value: lowBugs },
  ];

  // Bar chart data → Uploads per User
  const uploadsPerUser = {};
  uploads.forEach((upload) => {
    const uid = upload.user_id;
    uploadsPerUser[uid] = (uploadsPerUser[uid] || 0) + 1;
  });
  const uploadsBarData = Object.keys(uploadsPerUser).map((uid) => ({
    user: uid === userId ? 'You' : `User ${uid.slice(-4)}`,
    uploads: uploadsPerUser[uid],
  }));

  return (
    <>
      {loading ? (
        <Skeleton active paragraph={{ rows: 10 }} />
      ) : (
        <>
          {/* Row 1 → Metrics */}
          <Row gutter={[24, 24]}>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Card title="Total Uploads" variant="borderless">
                <Title level={2}>{totalUploads}</Title>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Card title="My Uploads" variant="borderless">
                <Title level={2}>{myUploads}</Title>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Card title="High Priority Bugs" variant="borderless">
                <Title level={2}>{highBugs}</Title>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Card title="Medium Priority Bugs" variant="borderless">
                <Title level={2}>{mediumBugs}</Title>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Card title="Low Priority Bugs" variant="borderless">
                <Title level={2}>{lowBugs}</Title>
              </Card>
            </Col>
          </Row>

          {/* Row 2 → Visuals */}
          <Row gutter={[24, 24]} style={{ marginTop: '24px' }}>
            <Col xs={24} md={12}>
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

            <Col xs={24} md={12}>
              <Card title="Uploads per User">
                <BarChart width={400} height={250} data={uploadsBarData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="user" />
                  <YAxis />
                  <ReTooltip />
                  <Legend />
                  <Bar dataKey="uploads" fill="#1890ff" />
                </BarChart>
              </Card>
            </Col>
          </Row>

          {/* Row 3 → Recent Uploads */}
          <Row style={{ marginTop: '24px' }}>
            <Col span={24}>
              <Card title="Recent Uploads">
            <List
  bordered
  dataSource={recentUploads}
  renderItem={(item) => (
    <List.Item
      onClick={() => navigate(`/upload/${item.upload_id}`)}
      style={{
        cursor: 'pointer',
        flexDirection: 'column',
        alignItems: 'flex-start',
        padding: '12px 16px',
      }}
    >
      <div style={{ fontWeight: 'bold', fontSize: '15px', marginBottom: '4px' }}>
  {item.upload_description || 'No description provided'}
</div>
<div style={{ fontSize: '14px', color: '#555', marginBottom: '4px' }}>
  Uploaded by: {item.username || 'Unknown'}
</div>
<div style={{ fontSize: '14px', color: '#555', marginBottom: '4px' }}>
  Filename: {item.original_filename || 'Unknown'}
</div>
<div style={{ fontSize: '14px', color: '#555' }}>
  Number of Files: {item.num_files}
</div>

    </List.Item>
  )}
/>

              </Card>
            </Col>
          </Row>

          {/* Row 4 → Quick Actions */}
          <Row justify="center" style={{ marginTop: '24px' }}>
            <Col>
              <Button type="primary" size="large" onClick={() => navigate('/all-uploads')}>
                View All Uploads
              </Button>
            </Col>
          </Row>
        </>
      )}
    </>
  );
}

export default Dashboard;
