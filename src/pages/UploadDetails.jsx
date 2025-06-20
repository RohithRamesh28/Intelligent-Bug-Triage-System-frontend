import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  message,
  Tabs,
  Table,
  Tag,
  Spin,
  Typography,
  theme,
  Button,
  Alert,
  Card,
} from 'antd';
import { ArrowLeftOutlined, DownloadOutlined } from '@ant-design/icons';
import axios from 'axios';
import Papa from 'papaparse';
import path from 'path-browserify';

const { Title, Paragraph } = Typography;

function UploadDetails() {
  const { uploadId } = useParams();
  const navigate = useNavigate();
  const [bugResults, setBugResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = theme.useToken();

  useEffect(() => {
    if (uploadId) {
      fetchBugResults(uploadId);
    }
  }, [uploadId]);

  const fetchBugResults = async (id) => {
    try {
      const response = await axios.get(`http://localhost:8080/file_bugs/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setBugResults(response.data || []);
    } catch (error) {
      console.error('Error fetching bug results:', error);
      message.error('Failed to load bug results.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCSV = () => {
    const allBugs = [];
    bugResults.forEach(({ file_path, bugs }) => {
      const file = path.basename(file_path);
      bugs.forEach((bug) => {
        allBugs.push({
          File: file,
          Line: bug.line,
          Description: bug.description,
          Priority: bug.priority,
        });
      });
    });
    const csv = Papa.unparse(allBugs);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `upload_${uploadId}_bugs.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const stripUUID = (filename) => {
  const parts = filename.split('_');
  return parts.length > 1 ? parts.slice(1).join('_') : filename;
};
  const groupedBugs = bugResults
    .map(({ file_path, bugs }) => {
      const label = stripUUID(path.basename(file_path)); 
      return { label, bugs: bugs || [] };
    })
    .sort((a, b) => b.bugs.length - a.bugs.length);

  const columns = [
    {
      title: '#',
      key: 'index',
      render: (_, __, index) => index + 1,
    },
    {
      title: 'Line',
      dataIndex: 'line',
      key: 'line',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority) => {
        let color = 'default';
        if (priority === 'High') color = 'red';
        else if (priority === 'Medium') color = 'orange';
        else if (priority === 'Low') color = 'green';
        return <Tag color={color}>{priority}</Tag>;
      },
    },
  ];

  const bugTabs = groupedBugs.map(({ label, bugs }) => ({
    key: label,
    label,
    children: bugs.length === 0 ? (
      <Alert message="No bugs found for this file." type="info" showIcon />
    ) : (
      <Table
        dataSource={bugs.map((bug, i) => ({ key: i, ...bug }))}
        columns={columns}
        pagination={{ pageSize: 5 }}
        bordered
      />
    ),
  }));

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate(-1)}
        style={{ marginBottom: '16px' }}
      >
        Back
      </Button>

      <Card variant="borderless">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={2} style={{ margin: 0, color: token.colorText }}>
            Upload Details — Bugs
          </Title>
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={handleDownloadCSV}
            size="middle"
            style={{
              backgroundColor: '#1890ff',
              borderColor: '#1890ff',
              fontWeight: '500',
              padding: '0 20px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
            }}
            disabled={bugResults.length === 0}
          >
            Download CSV
          </Button>
        </div>

        {loading ? (
          <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Spin size="large" />
          </div>
        ) : groupedBugs.length === 0 ? (
          <Paragraph style={{ color: token.colorText }}>
            No bugs found for this upload.
          </Paragraph>
        ) : (
          <Tabs
            defaultActiveKey={groupedBugs[0]?.label}
            type="card"
            items={bugTabs}
          />
        )}
      </Card>
    </div>
  );
}

export default UploadDetails;
