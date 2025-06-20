import React, { useState, useEffect } from "react";
import {
  Upload,
  Button,
  message,
  Progress,
  Tabs,
  Table,
  Tag,
  Input,
  Typography,
  Space,
  Alert,
  Card,
} from "antd";
import { InboxOutlined } from "@ant-design/icons";
import axios from "axios";
import path from "path-browserify";
const cleanFilename = (name) => {
  const parts = name.split("_");
  return parts.length > 1 ? parts.slice(1).join("_") : name;
};

const { Dragger } = Upload;
const { TextArea } = Input;
const { Title } = Typography;

const UploadPage = () => {
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadId, setUploadId] = useState(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("No upload started yet.");
  const [done, setDone] = useState(false);
  const [bugResults, setBugResults] = useState([]);
  const [uploadDescription, setUploadDescription] = useState("");
  const [fileError, setFileError] = useState("");
  const [descError, setDescError] = useState("");

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (!done && uploading) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [done, uploading]);

  useEffect(() => {
    if (!uploadId) return;
    const ws = new WebSocket(`ws://localhost:8080/ws/progress/${uploadId}`);
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.status) setStatus(data.status);
      if (data.progress !== undefined) setProgress(data.progress);
      if (data.status === "DONE 🚀") {
        //dont remove the emoji helps the websocket to understand and close
        setDone(true);
        ws.close();
      }
    };
    ws.onerror = (err) => console.error("WebSocket error:", err);
    return () => ws.close();
  }, [uploadId]);

  useEffect(() => {
    if (done && uploadId) {
      axios
        .get(
          `https://intelligent-bug-triage-system.onrender.com/file_bugs/${uploadId}`
        )
        .then((res) => {
          setBugResults(res.data || []);
          setUploadId(null);
          setDone(false);
          setProgress(0);
          setStatus("No upload started yet.");
        })
        .catch((err) => console.error(" Failed to fetch bugs:", err));
    }
  }, [done, uploadId]);

  const handleSubmit = async () => {
    let hasError = false;
    setFileError("");
    setDescError("");

    if (fileList.length === 0) {
      setFileError("Please upload at least one file or ZIP.");
      hasError = true;
    }
    if (!uploadDescription.trim()) {
      setDescError("Please enter an upload description.");
      hasError = true;
    }
    if (hasError) return;

    setBugResults([]);
    setUploadId(null);
    setProgress(0);
    setDone(false);
    setStatus("Starting...");

    const formData = new FormData();
    fileList.forEach((file) => {
      formData.append("files", file.originFileObj);
    });
    formData.append("upload_description", uploadDescription);

    setUploading(true);
    try {
      const res = await axios.post(
        "https://intelligent-bug-triage-system.onrender.com/upload/",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setUploadId(res.data.upload_id);
      setStatus("Waiting for analysis...");
      message.success("Upload started!");
    } catch (err) {
      console.error(err);
      message.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const groupedBugs = bugResults
    .map(({ zip_name, file_path, bugs }) => {
      const rawFilename = path.basename(file_path);
      const filename = cleanFilename(rawFilename);
      const display = zip_name ? `${zip_name}/${filename}` : filename;
      return { label: display, bugs: bugs || [] };
    })
    .sort((a, b) => b.bugs.length - a.bugs.length);

  const columns = [
    {
      title: "S.No",
      key: "index",
      render: (_, __, index) => index + 1,
    },
    { title: "Line", dataIndex: "line", key: "line" },
    { title: "Description", dataIndex: "description", key: "description" },
    {
      title: "Priority",
      dataIndex: "priority",
      key: "priority",
      render: (priority) => {
        let color = "default";
        if (priority === "High") color = "red";
        else if (priority === "Medium") color = "orange";
        else if (priority === "Low") color = "green";
        return <Tag color={color}>{priority}</Tag>;
      },
    },
  ];

  const bugTabs = groupedBugs.map(({ label, bugs }) => ({
    key: label,
    label,
    children:
      bugs.length === 0 ? (
        <Alert message="No bugs found in this file." type="info" showIcon />
      ) : (
        <Table
          dataSource={bugs.map((b, i) => ({ key: i, ...b }))}
          columns={columns}
          pagination={{ pageSize: 10 }}
          bordered
        />
      ),
  }));

  const uploadProps = {
    multiple: true,
    fileList,
    onChange: ({ fileList: newList }) => setFileList(newList),
    beforeUpload: () => false,
    accept:
      ".zip,.js,.jsx,.ts,.tsx,.py,.java,.cpp,.c,.cs,.rb,.go,.rs,.php,.swift,.kt,.m,.scala",

    listType: "text",
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <Card variant="borderless" style={{ marginBottom: "24px" }}>
        <Title level={2} className="text-center">
          Upload Files for Bug Analysis
        </Title>
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <div>
            <Dragger
              {...uploadProps}
              disabled={uploading || (uploadId && !done)}
              style={{ padding: "20px" }}
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">
                Click or drag ZIP / code files here
              </p>
              <p className="ant-upload-hint">Supports ZIPS,FILES</p>
            </Dragger>
            {fileError && (
              <Alert
                message={fileError}
                type="error"
                showIcon
                className="mt-2"
              />
            )}
          </div>

          <div>
            <label
              className="block mb-1 font-medium"
              style={{ marginBottom: 8 }}
            >
              Upload Description <span style={{ color: "#ff4d4f" }}>*</span>
            </label>
            <TextArea
              value={uploadDescription}
              onChange={(e) => setUploadDescription(e.target.value)}
              disabled={uploading || (uploadId && !done)}
              placeholder="Describe this upload..."
              maxLength={100}
              showCount
              style={{
                marginTop: 8,
                maxHeight: 120,
                minHeight: 80,
                resize: "none",
                borderRadius: 6,
              }}
              rows={5}
            />
            {descError && (
              <Alert
                message={descError}
                type="error"
                showIcon
                style={{ marginTop: 8 }}
              />
            )}
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              width: "100%",
            }}
          >
            <Button
              type="primary"
              onClick={handleSubmit}
              disabled={
                fileList.length === 0 || uploading || (uploadId && !done)
              }
              loading={uploading}
              style={{
                padding: "4px 16px",
                fontSize: 14,
                height: 36,
                borderRadius: 6,
                marginTop: 8,
              }}
            >
              {uploading ? "Uploading..." : "Submit"}
            </Button>
          </div>

          {uploadId && (
            <div className="space-y-2">
              <Title level={4}>Upload Progress</Title>
              <Progress
                percent={progress}
                status={done ? "success" : "active"}
              />
              <p>
                Status: <strong>{status}</strong>
              </p>
            </div>
          )}
        </Space>
      </Card>

      {bugTabs.length > 0 && (
        <Card title="Bug Results" variant="borderless">
          <Tabs defaultActiveKey={bugTabs[0].key} type="card" items={bugTabs} />
        </Card>
      )}
    </div>
  );
};

export default UploadPage;
