// src/pages/UploadDetails.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { message, Tabs, Table, Tag, Spin } from 'antd';
import axios from 'axios';

const UploadDetails = () => {
  const { uploadId } = useParams();
  const [bugResults, setBugResults] = useState([]);
  const [loading, setLoading] = useState(true);

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
      setBugResults(response.data.bugs || []);
    } catch (error) {
      console.error('Error fetching bug results:', error);
      message.error('Failed to load bug results.');
    } finally {
      setLoading(false);
    }
  };

  // Group bugs by file
  const groupedBugs = bugResults.reduce((acc, bug) => {
    const fileKey = `${bug.file_name}`;
    if (!acc[fileKey]) {
      acc[fileKey] = [];
    }
    acc[fileKey].push(bug);
    return acc;
  }, {});

  // Table columns
  const columns = [
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

  const bugTabs = Object.keys(groupedBugs).map((fileKey) => ({
    key: fileKey,
    label: fileKey,
    children: groupedBugs[fileKey].length === 0 ? (
      <p>No bugs found for this file.</p>
    ) : (
      <Table
        dataSource={groupedBugs[fileKey].map((bug, index) => ({ key: index, ...bug }))}
        columns={columns}
        pagination={{ pageSize: 5 }}
        bordered
      />
    ),
  }));

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">🪲 Upload Details — Bugs</h1>

      {loading ? (
        <div className="flex justify-center items-center h-48">
          <Spin size="large" />
        </div>
      ) : (
        <>
          {bugTabs.length === 0 ? (
            <p>No bugs found for this upload.</p>
          ) : (
            <Tabs
              defaultActiveKey={bugTabs[0]?.key}
              type="card"
              items={bugTabs}
            />
          )}
        </>
      )}
    </div>
  );
};

export default UploadDetails;
