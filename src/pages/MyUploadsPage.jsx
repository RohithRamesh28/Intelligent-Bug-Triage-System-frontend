import { useEffect, useState } from 'react';
import { Card, Typography, Skeleton, message, Row, Col, Input, theme, Tooltip, Badge } from 'antd';
import { useNavigate } from 'react-router-dom';
import api from '../api';


const { Title, Text } = Typography;

function MyUploadsPage() {
  const [loading, setLoading] = useState(true);
  const [uploads, setUploads] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const { token } = theme.useToken();

  useEffect(() => {
    const fetchMyUploads = async () => {
      try {
        const res = await api.get('/project/my-uploads');
        setUploads(res.data.uploads || []);
      } catch (err) {
        message.error('Failed to load My Uploads.', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMyUploads();
  }, []);

  const countBugsByPriority = (bugs, priority) => {
    return bugs.filter((bug) => bug.priority === priority).length;
  };

  const filteredUploads = uploads.filter((item) =>
    (item.upload_description || '')
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2} style={{ color: token.colorText }}>My Uploads</Title>

      <Input.Search
        placeholder="Search by description"
        allowClear
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ marginTop: 16, marginBottom: 24, maxWidth: 400 }}
      />

      {loading ? (
        <Skeleton active paragraph={{ rows: 8 }} style={{ marginTop: 24 }} />
      ) : (
        <Row gutter={[16, 16]}>
          {filteredUploads.map((item) => {
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
                    <Text strong>Total Bugs:</Text> <Text>{total}</Text>
                  </div>

                  <div style={{ marginBottom: 10 }}>
                    <Text strong>Filename:</Text>{' '}
                    {fileCount > 1 ? (
                      <Tooltip title={<div style={{ maxWidth: 250 }}>{fileNames.join(', ')}</div>}>
                        <Text underline style={{ cursor: 'pointer' }}>
                          {item.original_filename || `${fileCount} files`}
                        </Text>
                      </Tooltip>
                    ) : (
                      <Text>{item.original_filename || 'Unknown'}</Text>
                    )}
                  </div>

                  <div style={{ marginBottom: 10 }}>
                    <Text strong>Files:</Text>{' '}
                    {fileCount > 1 ? (
                      <Tooltip title={<div style={{ maxWidth: 250 }}>{fileNames.join(', ')}</div>}>
                        <Badge count={fileCount} showZero style={{ backgroundColor: '#722ed1' }} />
                      </Tooltip>
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
      )}
    </div>
  );
}

export default MyUploadsPage;