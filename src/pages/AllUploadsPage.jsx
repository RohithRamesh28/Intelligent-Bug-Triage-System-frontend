import { useEffect, useState, useMemo } from 'react';
import {
  Card,
  Typography,
  Skeleton,
  message,
  Row,
  Col,
  Input,
  Select,
  Tabs,
  theme,
  Popover,
} from 'antd';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

function AllUploadsPage() {
  const [loading, setLoading] = useState(true);
  const [uploads, setUploads] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [selectedUser, setSelectedUser] = useState('all');
  const navigate = useNavigate();
  const { token } = theme.useToken();

  useEffect(() => {
    const fetchAllUploads = async () => {
      try {
        const res = await api.get('/project/dashboard');
        setUploads(res.data.uploads || []);
      } catch (err) {
        message.error('Failed to load All Uploads.', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllUploads();
  }, []);

  const uniqueUsers = useMemo(() => {
    const usernames = uploads.map((u) => u.username).filter(Boolean);
    return ['all', ...Array.from(new Set(usernames))];
  }, [uploads]);

  const countBugsByPriority = (bugs, priority) =>
    bugs.filter((bug) => bug.priority === priority).length;

  const filteredUploads = useMemo(() => {
    return uploads.filter((item) => {
      const matchesDescription = item.upload_description
        ?.toLowerCase()
        .includes(searchText.toLowerCase());
      const matchesUser =
        selectedUser === 'all' || item.username === selectedUser;
      return matchesDescription && matchesUser;
    });
  }, [uploads, searchText, selectedUser]);

  const renderUploads = (items) =>
    loading ? (
      <Skeleton active paragraph={{ rows: 8 }} style={{ marginTop: 24 }} />
    ) : (
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        {items.map((item) => {
          const bugs = item.bugs_sanity_checked || [];
          const high = countBugsByPriority(bugs, 'High');
          const medium = countBugsByPriority(bugs, 'Medium');
          const low = countBugsByPriority(bugs, 'Low');
          const total = high + medium + low;
          const fileCount = item.num_files || 1;
          const fileNames = item.file_names || [];

          return (
            <Col xs={24} sm={12} md={8} key={item.upload_id}>
              <Card
                title={<span style={{ fontWeight: 600 }}>{item.upload_description || 'No description provided'}</span>}
                hoverable
                onClick={() => navigate(`/upload/${item.upload_id}`)}
                style={{
                  height: '100%',
                  background: '#f0f5ff',
                  border: '1px solid #d6e4ff',
                  borderRadius: '10px',
                  boxShadow: '0 2px 8px rgba(24, 144, 255, 0.1)',
                }}
              >
                <div style={{ marginBottom: 10 }}>
                  <Text strong>Uploaded by:</Text> <Text>{item.username || 'Unknown'}</Text>
                </div>

                <div style={{ marginBottom: 10 }}>
                  <Text strong>Total Bugs:</Text> <Text>{total}</Text>
                </div>

                <div style={{ marginBottom: 10 }}>
                  <Text strong>Filename:</Text>{' '}
                  {fileCount > 1 ? (
                    <Popover
                      title={`Files (${fileCount})`}
                      content={
                        <div style={{ maxHeight: 150, overflowY: 'auto', maxWidth: 300 }}>
                          {fileNames.map((name, idx) => (
                            <div key={idx} style={{ marginBottom: 4 }}>{name}</div>
                          ))}
                        </div>
                      }
                      trigger="hover"
                    >
                      <Text underline style={{ cursor: 'pointer' }}>
                        {`${fileCount} files`}
                      </Text>
                    </Popover>
                  ) : (
                    <Text>{fileNames[0] || item.original_filename || 'Unknown'}</Text>
                  )}
                </div>

                <div style={{ marginBottom: 10 }}>
                  <Text strong>Files:</Text>{' '}
                  {fileCount > 1 ? (
                    <Popover
                      content={
                        <div style={{ maxHeight: 150, overflowY: 'auto', maxWidth: 300 }}>
                          {fileNames.map((name, idx) => (
                            <div key={idx} style={{ marginBottom: 4 }}>{name}</div>
                          ))}
                        </div>
                      }
                      trigger="hover"
                    >
                      <span style={{
                        backgroundColor: '#722ed1',
                        color: '#fff',
                        padding: '0 8px',
                        borderRadius: '10px',
                        fontSize: '13px',
                        display: 'inline-block',
                      }}>
                        {fileCount}
                      </span>
                    </Popover>
                  ) : (
                    <Text>{fileCount}</Text>
                  )}
                </div>

                <div>
                  <Text strong>Bugs → </Text>
                  <span style={{ color: '#ff4d4f', marginRight: 8 }}>High: {high}</span>
                  <span style={{ color: '#faad14', marginRight: 8 }}>Medium: {medium}</span>
                  <span style={{ color: '#52c41a' }}>Low: {low}</span>
                </div>
              </Card>
            </Col>
          );
        })}
      </Row>
    );

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2} style={{ color: token.colorText }}>All Uploads</Title>
      <Text type="secondary">Browse all uploads or search by user/description.</Text>

      <Tabs defaultActiveKey="1" style={{ marginTop: 24 }}>
        <TabPane tab="All Uploads" key="1">
          {renderUploads(uploads)}
        </TabPane>
        <TabPane tab="Search by User" key="2">
          <div style={{ marginBottom: 16, display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <Input
              placeholder="Search by description"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 300 }}
            />
            <Select
              value={selectedUser}
              onChange={setSelectedUser}
              style={{ width: 200 }}
            >
              {uniqueUsers.map((user) => (
                <Option key={user} value={user}>
                  {user === 'all' ? 'All Users' : user}
                </Option>
              ))}
            </Select>
          </div>
          {renderUploads(filteredUploads)}
        </TabPane>
      </Tabs>
    </div>
  );
}

export default AllUploadsPage;
