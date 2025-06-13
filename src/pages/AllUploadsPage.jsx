import { useEffect, useState } from 'react';
import { Card, List, Typography, Skeleton, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const { Title, Text } = Typography;

function AllUploadsPage() {
  const [loading, setLoading] = useState(true);
  const [uploads, setUploads] = useState([]);
  const navigate = useNavigate();

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

  const countBugsByPriority = (bugs, priority) => {
    return bugs.filter((bug) => bug.priority === priority).length;
  };

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>All Uploads</Title>
      <Text type="secondary">List of all uploads in this project.</Text>

      <Card style={{ marginTop: '24px' }}>
        {loading ? (
          <Skeleton active paragraph={{ rows: 8 }} />
        ) : (
          <List
            bordered
            dataSource={uploads}
            renderItem={(item) => {
              const bugs = item.bugs_sanity_checked || [];
              const high = countBugsByPriority(bugs, 'High');
              const medium = countBugsByPriority(bugs, 'Medium');
              const low = countBugsByPriority(bugs, 'Low');

              return (
                <List.Item
                  onClick={() => navigate(`/upload/${item.upload_id}`)}
                  style={{
                    cursor: 'pointer',
                    display: 'flex',
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
                  <div style={{ fontSize: '14px', color: '#555', marginBottom: '4px' }}>
                    Number of Files: {item.num_files}
                  </div>
                  <div style={{ fontSize: '14px', color: '#555' }}>
                    Bugs →{' '}
                    <span style={{ color: '#ff4d4f' }}>High: {high}</span> |{' '}
                    <span style={{ color: '#faad14' }}>Medium: {medium}</span> |{' '}
                    <span style={{ color: '#52c41a' }}>Low: {low}</span>
                  </div>
                </List.Item>
              );
            }}
          />
        )}
      </Card>
    </div>
  );
}

export default AllUploadsPage;
