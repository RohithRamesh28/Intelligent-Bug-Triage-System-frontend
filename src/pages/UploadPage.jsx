// src/pages/UploadPage.jsx
import React, { useState, useEffect } from 'react';
import { Upload, Button, message, Progress, Tabs, Table, Tag, Input } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Dragger } = Upload;
const { TextArea } = Input;

const UploadPage = () => {
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadId, setUploadId] = useState(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('No upload started yet.');
  const [done, setDone] = useState(false);
  const [bugResults, setBugResults] = useState([]);
  const [uploadDescription, setUploadDescription] = useState(''); // upload description state

  // Prevent accidental reload
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (!done && uploadId) {
        e.preventDefault();
        e.returnValue = 'Are you sure you want to reload? Progress will not be saved.';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [done, uploadId]);

  // WebSocket hook
  useEffect(() => {
    if (!uploadId) return;

    const ws = new WebSocket(`ws://localhost:8080/ws/progress/${uploadId}`);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.status) setStatus(data.status);
      if (data.progress !== undefined) setProgress(data.progress);

      if (data.status === 'DONE 🚀') {
        setDone(true);
        ws.close();
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => ws.close();
  }, [uploadId]);

  // After done → fetch bugs
  useEffect(() => {
    if (done && uploadId) {
      axios
        .get(`http://localhost:8080/file_bugs/${uploadId}`)
        .then((response) => {
          setBugResults(response.data.bugs || []);
        })
        .catch((error) => {
          console.error('Error fetching bug results:', error);
        });
    }
  }, [done, uploadId]);

  // Upload submit handler
  const handleSubmit = async () => {
    if (fileList.length === 0) {
      message.error('Please select files first.');
      return;
    }

    const formData = new FormData();
    fileList.forEach((file) => {
      formData.append('files', file.originFileObj);
    });
    formData.append('upload_description', uploadDescription); // send upload description

    setUploading(true);
    try {
      const response = await axios.post('http://localhost:8080/upload/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      message.success('Upload started!');
      setUploadId(response.data.upload_id);
    } catch (error) {
      console.error('Upload failed:', error);
      message.error('Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  // Bug results grouped by file
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
        pagination={{ pageSize: 20 }}
        bordered
      />
    ),
  }));

  // Upload config
  const uploadProps = {
    multiple: true,
    fileList,
    onChange: ({ fileList: newFileList }) => setFileList(newFileList),
    beforeUpload: () => false,
    accept: '.zip,.js,.jsx,.py,.ts,.tsx',
    listType: 'text',
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">📂 File Upload & Bug Analysis</h1>

      <Dragger {...uploadProps} style={{ padding: '20px' }}>
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">Click or drag ZIP / Code files here</p>
        <p className="ant-upload-hint">Supports ZIP, JS, TS, JSX, PY files</p>
      </Dragger>

      {/* Upload Description */}
      <div className="mt-4">
        <label className="block mb-1 font-semibold">Upload Description</label>
        <TextArea
          rows={3}
          placeholder="Enter a description for this upload..."
          value={uploadDescription}
          onChange={(e) => setUploadDescription(e.target.value)}
        />
      </div>

      {/* Submit Button */}
      <Button
        type="primary"
        block
        size="large"
        onClick={handleSubmit}
        disabled={fileList.length === 0 || uploading || uploadId !== null}
        loading={uploading}
        className="mt-4"
      >
        {uploading ? 'Uploading...' : 'Submit for Analysis'}
      </Button>

      {/* Progress */}
      {uploadId && (
        <>
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-2">Upload Progress</h2>
            <Progress percent={progress} status={done ? 'success' : 'active'} />
            <p className="mt-2 text-lg">Status: <strong>{status}</strong></p>
          </div>

          {/* Bug Results */}
          {done && (
            <div className="mt-8">
              <h2 className="text-xl font-bold mb-4">🪲 Bug Results</h2>
              {bugTabs.length === 0 ? (
                <p>No bugs found for this upload.</p>
              ) : (
                <Tabs
                  defaultActiveKey={bugTabs[0]?.key}
                  type="card"
                  items={bugTabs}
                />
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default UploadPage;
