import { useEffect, useState, useMemo } from "react";
import {
  Card,
  Typography,
  Skeleton,
  message,
  Row,
  Col,
  Input,
  Select,
  theme,
  Popover,
  Space,
} from "antd";
import { useNavigate } from "react-router-dom";
import api from "../api";

const { Title, Text } = Typography;
const { Option } = Select;

function AllUploadsPage() {
  const [loading, setLoading] = useState(true);
  const [uploads, setUploads] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [selectedUser, setSelectedUser] = useState("all");

  const [fileOperator, setFileOperator] = useState(">=");
  const [fileValue, setFileValue] = useState("");
  const [totalOperator, setTotalOperator] = useState(">=");
  const [totalValue, setTotalValue] = useState("");
  const [highOperator, setHighOperator] = useState(">=");
  const [highValue, setHighValue] = useState("");
  const [mediumOperator, setMediumOperator] = useState(">=");
  const [mediumValue, setMediumValue] = useState("");
  const [lowOperator, setLowOperator] = useState(">=");
  const [lowValue, setLowValue] = useState("");

  const navigate = useNavigate();
  const { token } = theme.useToken();

  useEffect(() => {
    console.log("Fetching all uploads...", api.get("/project/dashboard"));
    const fetchAllUploads = async () => {
      try {
        const res = await api.get("/project/dashboard");
        setUploads(res.data.uploads || []);
      } catch (err) {
        message.error("Failed to load All Uploads.", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllUploads();
  }, []);

  const uniqueUsers = useMemo(() => {
    const usernames = uploads.map((u) => u.username).filter(Boolean);
    return ["all", ...Array.from(new Set(usernames))];
  }, [uploads]);

  const countBugsByPriority = (bugs, priority) =>
    bugs.filter((bug) => bug.priority === priority).length;

  const applyFilter = (val, op, threshold) => {
    if (threshold === "") return true;
    const num = Number(threshold);
    return op === ">=" ? val >= num : val <= num;
  };

  const filteredUploads = useMemo(() => {
    return uploads.filter((item) => {
      const bugs = item.bugs_sanity_checked || [];
      const high = countBugsByPriority(bugs, "High");
      const medium = countBugsByPriority(bugs, "Medium");
      const low = countBugsByPriority(bugs, "Low");
      const total = high + medium + low;
      const files = item.num_files || 1;

      const matchesDescription = item.upload_description
        ?.toLowerCase()
        .includes(searchText.toLowerCase());
      const matchesUser =
        selectedUser === "all" || item.username === selectedUser;

      return (
        matchesDescription &&
        matchesUser &&
        applyFilter(files, fileOperator, fileValue) &&
        applyFilter(total, totalOperator, totalValue) &&
        applyFilter(high, highOperator, highValue) &&
        applyFilter(medium, mediumOperator, mediumValue) &&
        applyFilter(low, lowOperator, lowValue)
      );
    });
  }, [
    uploads,
    searchText,
    selectedUser,
    fileOperator,
    fileValue,
    totalOperator,
    totalValue,
    highOperator,
    highValue,
    mediumOperator,
    mediumValue,
    lowOperator,
    lowValue,
  ]);

  const stripUUID = (filename) => {
    const parts = filename.split("_");
    return parts.length > 1 ? parts.slice(1).join("_") : filename;
  };

  const renderFilterGroup = (label, operator, setOperator, value, setValue) => (
    <Space
      size={0}
      style={{
        border: "1px solid #d9d9d9",
        borderRadius: 6,
        overflow: "hidden",
      }}
    >
      <Select
        value={operator}
        onChange={setOperator}
        bordered={false}
        style={{ width: 80 }}
      >
        <Option value=">=">{label} ≥</Option>
        <Option value="<=">{label} ≤</Option>
      </Select>
      <Input
        type="number"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="no"
        bordered={false}
        style={{ width: 60 }}
      />
    </Space>
  );

  const renderUploads = (items) =>
    loading ? (
      <Skeleton active paragraph={{ rows: 8 }} style={{ marginTop: 24 }} />
    ) : (
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        {items.map((item) => {
          const bugs = item.bugs_sanity_checked || [];
          const high = countBugsByPriority(bugs, "High");
          const medium = countBugsByPriority(bugs, "Medium");
          const low = countBugsByPriority(bugs, "Low");
          const total = high + medium + low;

          const fileNames = item.file_names || [];

          const formattedDescription =
            (item.upload_description || "No description provided")
              .charAt(0)
              .toUpperCase() +
            (item.upload_description || "No description provided").slice(1);

          return (
            <Col xs={24} sm={12} md={8} key={item.upload_id}>
              <Card
                title={
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "16px" }}>
                      {formattedDescription}
                    </div>
                    <div
                      style={{ borderTop: "1px solid #d9d9d9", marginTop: 8 }}
                    />
                  </div>
                }
                hoverable
                onClick={() => navigate(`/upload/${item.upload_id}`)}
                style={{
                  height: "100%",
                  background: "#f0f5ff",
                  border: "1px solid #d6e4ff",
                  borderRadius: "10px",
                  boxShadow: "0 2px 8px rgba(24, 144, 255, 0.1)",
                }}
              >
                <div style={{ marginBottom: 10 }}>
                  <Text strong>Uploaded by:</Text>{" "}
                  <Text>{item.username || "Unknown"}</Text>
                </div>
                <div style={{ marginBottom: 10 }}>
                  <Text strong>Total Bugs:</Text> <Text>{total}</Text>
                </div>
                <div style={{ marginBottom: 10 }}>
                  <Text strong>Filename:</Text>{" "}
                  <Text>
                    {stripUUID(
                      fileNames[0] || item.original_filename || "Unknown"
                    )}
                  </Text>
                </div>
                <div
                  style={{ borderTop: "1px solid #d9d9d9", margin: "12px 0" }}
                />
                <div>
                  <Text strong>Bugs → </Text>
                  <span style={{ color: "#ff4d4f", marginRight: 8 }}>
                    High: {high}
                  </span>
                  <span style={{ color: "#faad14", marginRight: 8 }}>
                    Medium: {medium}
                  </span>
                  <span style={{ color: "#52c41a" }}>Low: {low}</span>
                </div>
              </Card>
            </Col>
          );
        })}
      </Row>
    );

  return (
    <div style={{ padding: "24px" }}>
      <Title level={2} style={{ color: token.colorText }}>
        All Uploads
      </Title>
      <Text type="secondary">
        Filter uploads by description, user, bugs, or file count.
      </Text>

      <div
        style={{
          marginTop: 24,
          marginBottom: 16,
          display: "flex",
          gap: "12px",
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <Input
          placeholder="Search description"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 200 }}
        />
        <Select
          value={selectedUser}
          onChange={setSelectedUser}
          style={{ width: 140 }}
        >
          {uniqueUsers.map((user) => (
            <Option key={user} value={user}>
              {user === "all" ? "All Users" : user}
            </Option>
          ))}
        </Select>

        {renderFilterGroup(
          "Files",
          fileOperator,
          setFileOperator,
          fileValue,
          setFileValue
        )}
        {renderFilterGroup(
          "Total",
          totalOperator,
          setTotalOperator,
          totalValue,
          setTotalValue
        )}
        {renderFilterGroup(
          "High",
          highOperator,
          setHighOperator,
          highValue,
          setHighValue
        )}
        {renderFilterGroup(
          "Med",
          mediumOperator,
          setMediumOperator,
          mediumValue,
          setMediumValue
        )}
        {renderFilterGroup(
          "Low",
          lowOperator,
          setLowOperator,
          lowValue,
          setLowValue
        )}
      </div>

      {renderUploads(filteredUploads)}
    </div>
  );
}

export default AllUploadsPage;
