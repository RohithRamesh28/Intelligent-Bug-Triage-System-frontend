import { useEffect, useState, useMemo } from "react";
import {
  Card,
  Typography,
  Skeleton,
  message,
  Row,
  Col,
  Input,
  theme,
  Tooltip,
  Badge,
  Select,
  Space,
} from "antd";
import { useNavigate } from "react-router-dom";
import api from "../api";

const { Title, Text } = Typography;
const { Option } = Select;

function MyUploadsPage() {
  const [loading, setLoading] = useState(true);
  const [uploads, setUploads] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [totalOperator, setTotalOperator] = useState(">=");
  const [totalBugFilter, setTotalBugFilter] = useState("");
  const [highOperator, setHighOperator] = useState(">=");
  const [highFilter, setHighFilter] = useState("");
  const [mediumOperator, setMediumOperator] = useState(">=");
  const [mediumFilter, setMediumFilter] = useState("");
  const [lowOperator, setLowOperator] = useState(">=");
  const [lowFilter, setLowFilter] = useState("");
  const [fileOperator, setFileOperator] = useState(">=");
  const [fileCountFilter, setFileCountFilter] = useState("");

  const navigate = useNavigate();
  const { token } = theme.useToken();

  useEffect(() => {
    const fetchMyUploads = async () => {
      try {
        const res = await api.get("/project/my-uploads");
        setUploads(res.data.uploads || []);
      } catch (err) {
        message.error("Failed to load My Uploads.", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMyUploads();
  }, []);

  const countBugsByPriority = (bugs, priority) => {
    return bugs.filter((bug) => bug.priority === priority).length;
  };

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

      const matchesDescription = (item.upload_description || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      const bugConditions =
        applyFilter(total, totalOperator, totalBugFilter) &&
        applyFilter(high, highOperator, highFilter) &&
        applyFilter(medium, mediumOperator, mediumFilter) &&
        applyFilter(low, lowOperator, lowFilter);

      const fileCondition = applyFilter(files, fileOperator, fileCountFilter);

      return matchesDescription && bugConditions && fileCondition;
    });
  }, [
    uploads,
    searchTerm,
    totalOperator,
    totalBugFilter,
    highOperator,
    highFilter,
    mediumOperator,
    mediumFilter,
    lowOperator,
    lowFilter,
    fileOperator,
    fileCountFilter,
  ]);

  const renderFilterGroup = (label, operator, setOperator, value, setValue) => (
    <Space size={0} style={{ border: "1px solid #d9d9d9", borderRadius: 6, overflow: "hidden" }}>
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

  return (
    <div style={{ padding: "24px" }}>
      <Title level={2} style={{ color: token.colorText }}>
        My Uploads
      </Title>

      <div
        style={{
          marginTop: 16,
          marginBottom: 24,
          display: "flex",
          gap: "16px",
          flexWrap: "wrap",
        }}
      >
        <Input
          placeholder="Search by description"
          allowClear
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: 240 }}
        />
        {renderFilterGroup("Total", totalOperator, setTotalOperator, totalBugFilter, setTotalBugFilter)}
        {renderFilterGroup("High", highOperator, setHighOperator, highFilter, setHighFilter)}
        {renderFilterGroup("Medium", mediumOperator, setMediumOperator, mediumFilter, setMediumFilter)}
        {renderFilterGroup("Low", lowOperator, setLowOperator, lowFilter, setLowFilter)}
        {renderFilterGroup("Files", fileOperator, setFileOperator, fileCountFilter, setFileCountFilter)}
      </div>

      {loading ? (
        <Skeleton active paragraph={{ rows: 8 }} style={{ marginTop: 24 }} />
      ) : (
        <Row gutter={[16, 16]}>
          {filteredUploads.map((item) => {
            const bugs = item.bugs_sanity_checked || [];
            const high = countBugsByPriority(bugs, "High");
            const medium = countBugsByPriority(bugs, "Medium");
            const low = countBugsByPriority(bugs, "Low");
            const total = high + medium + low;
            const fileCount = item.num_files || 1;
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
                    <Text strong>Total Bugs:</Text> <Text>{total}</Text>
                  </div>

                  <div style={{ marginBottom: 10 }}>
                    <Text strong>Filename:</Text>{" "}
                    {fileCount > 1 ? (
                      <Tooltip
                        title={
                          <div style={{ maxWidth: 250 }}>
                            {fileNames.join(", ")}
                          </div>
                        }
                      >
                        <Text underline style={{ cursor: "pointer" }}>
                          {item.original_filename || `${fileCount} files`}
                        </Text>
                      </Tooltip>
                    ) : (
                      <Text>{item.original_filename || "Unknown"}</Text>
                    )}
                  </div>

                  <div style={{ marginBottom: 10 }}>
                    <Text strong>Files:</Text>{" "}
                    {fileCount > 1 ? (
                      <Tooltip
                        title={
                          <div style={{ maxWidth: 250 }}>
                            {fileNames.join(", ")}
                          </div>
                        }
                      >
                        <Badge
                          count={fileCount}
                          showZero
                          style={{ backgroundColor: "#722ed1" }}
                        />
                      </Tooltip>
                    ) : (
                      <Text>{fileCount}</Text>
                    )}
                  </div>
                  <div
                    style={{ borderTop: "1px solid #d9d9d9", margin: "12px 0" }}
                  ></div>

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
      )}
    </div>
  );
}

export default MyUploadsPage;
