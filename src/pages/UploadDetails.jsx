import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, List, Typography, Skeleton, message } from 'antd';
import api from '../api';

const { Title, Text } = Typography;

function UploadDetails() {
  const { upload_id } = useParams();
  const [loading, setLoading] = useState(true);
  const [upload, setUpload] = useState(null);

  useEffect(() => {
    const fetchUploadDetails = async () => {
      try {
        const res = await api.get(`/upload/${upload_id}`);
        setUpload(res.data);
      } catch (err) {
        console.error('Failed to load upload details.', err);
        message.error('Failed to load upload details.');
      } finally {
        setLoading(false);
      }
    };

    fetchUploadDetails();
  }, [upload_id]);

  const getPriorityColor = (priority) => {
    if (priority === 'High') return '#ff4d4f';
    if (priority === 'Medium') return '#faad14';
    if (priority === 'Low') return '#52c41a';
    return '#000'; // fallback
  };

  if (loading || !upload) {
    return <Skeleton active paragraph={{ rows: 10 }} />;
  }

  return (
    <div style={{ padding: '16px' }}>
      <Title level={3}>Upload Details</Title>

      <Card style={{ marginBottom: '16px' }}>
        <p><b>Description:</b> {upload.upload_description || 'No description provided'}</p>
        <p><b>Uploaded by:</b> {upload.username || 'Unknown'}</p>
        <p><b>Timestamp:</b> {new Date(upload.timestamp).toLocaleString()}</p>
        <p><b>Number of Files:</b> {upload.num_files}</p>
      </Card>

      <Title level={4}>Files</Title>
      <List
        bordered
        dataSource={upload.files}
        renderItem={(fileItem) => (
          <List.Item style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '12px 16px' }}>
            <Text strong>Filename: {fileItem.original_filename || fileItem.file}</Text>

            {/* Sanity Checked Bugs */}
            <div style={{ marginTop: '8px' }}>
              <Text underline>Sanity Checked Bugs:</Text>
              {fileItem.bugs_sanity_checked.length > 0 ? (
                <ul>
                  {fileItem.bugs_sanity_checked.map((bug, index) => (
                    <li key={index}>
                      {bug.description} — <b style={{ color: getPriorityColor(bug.priority) }}>
                        {bug.priority}
                      </b>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No sanity checked bugs.</p>
              )}
            </div>

            {/* Original Bugs */}
            <div style={{ marginTop: '8px' }}>
              <Text underline>Original Bugs:</Text>
              {fileItem.bugs_original.length > 0 ? (
                <ul>
                  {fileItem.bugs_original.map((bug, index) => (
                    <li key={index}>
                      {bug.description} — <b style={{ color: getPriorityColor(bug.priority) }}>
                        {bug.priority}
                      </b>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No original bugs.</p>
              )}
            </div>

            {/* Optimizations */}
            <div style={{ marginTop: '8px' }}>
              <Text underline>Optimizations:</Text>
              {fileItem.optimizations_sanity_checked.length > 0 ? (
                <ul>
                  {fileItem.optimizations_sanity_checked.map((opt, index) => (
                    <li key={index}>{opt.reason}</li>
                  ))}
                </ul>
              ) : (
                <p>No optimizations found.</p>
              )}
            </div>
          </List.Item>
        )}
      />
    </div>
  );
}

export default UploadDetails;
