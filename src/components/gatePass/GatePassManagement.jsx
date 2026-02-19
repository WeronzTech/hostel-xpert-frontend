import React, {useState} from "react";
import {
  Table,
  Button,
  Space,
  Tag,
  Modal,
  message,
  Alert,
  Row,
  Col,
  Select,
  DatePicker,
  Input,
  Descriptions,
  Typography,
  Divider,
  Card,
  Tooltip,
} from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  UserOutlined,
  SearchOutlined,
  FilterOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import {useQuery, useMutation} from "@tanstack/react-query";
import dayjs from "dayjs";
import {
  getAllGatePassRequests,
  respondToGatePass,
} from "../../hooks/users/useUser";
import MobileGatePassDrawer from "./MobileGatePassDrawer";

const {Option} = Select;
const {Text} = Typography;
const PRIMARY_COLOR = "#059669";

const GatePassManagement = ({selectedProperty, queryClient}) => {
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [selectedGatePass, setSelectedGatePass] = useState(null);
  const [responseModalVisible, setResponseModalVisible] = useState(false);
  const [mobileDrawerVisible, setMobileDrawerVisible] = useState(false);
  const [adminComment, setAdminComment] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Handle resize for mobile detection
  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch gate pass requests
  const {
    data: gatePassRequests,
    isLoading: isGatePassLoading,
    error: gatePassError,
    refetch: refetchGatePass,
  } = useQuery({
    queryKey: [
      "gatePassRequests",
      selectedProperty?.id,
      searchText,
      statusFilter,
      selectedDate?.format("YYYY-MM-DD"),
    ],
    queryFn: () =>
      getAllGatePassRequests({
        propertyId: selectedProperty?.id,
        search: searchText || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
        date: selectedDate?.format("YYYY-MM-DD"),
      }),
  });

  // Separate pending and non-pending requests
  const pendingRequests =
    gatePassRequests?.data?.filter(
      (req) => req.status?.toLowerCase() === "pending",
    ) || [];

  const otherRequests =
    gatePassRequests?.data?.filter(
      (req) => req.status?.toLowerCase() !== "pending",
    ) || [];

  // Respond to gate pass mutation
  const respondMutation = useMutation({
    mutationFn: respondToGatePass,
    onSuccess: () => {
      message.success("Gate pass request updated successfully");
      queryClient.invalidateQueries(["gatePassRequests"]);
      setResponseModalVisible(false);
      setMobileDrawerVisible(false);
      setSelectedGatePass(null);
      setAdminComment("");
    },
    onError: (error) => {
      message.error(error.message || "Failed to update gate pass request");
    },
  });

  const handleRespond = (status) => {
    if (!selectedGatePass) return;

    respondMutation.mutate({
      gatePassId: selectedGatePass._id,
      status,
      adminComment,
    });
  };

  const getStatusTag = (status) => {
    const config = {
      pending: {
        color: "warning",
        icon: <ClockCircleOutlined />,
        text: "Pending",
      },
      approved: {
        color: "success",
        icon: <CheckCircleOutlined />,
        text: "Approved",
      },
      rejected: {
        color: "error",
        icon: <CloseCircleOutlined />,
        text: "Rejected",
      },
      completed: {
        color: "processing",
        icon: <CheckCircleOutlined />,
        text: "Completed",
      },
    };
    const statusKey = status?.toLowerCase() || "pending";
    return (
      <Tag icon={config[statusKey]?.icon} color={config[statusKey]?.color}>
        {config[statusKey]?.text || status}
      </Tag>
    );
  };

  const columns = [
    {
      title: "#",
      key: "serialNumber",
      width: 60,
      render: (_, __, index) => index + 1,
    },
    {
      title: "Student",
      key: "student",
      render: (_, record) => {
        const profileImg = record.user?.personalDetails?.profileImg;

        return (
          <Space size="small">
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                overflow: "hidden",
                backgroundColor: PRIMARY_COLOR + "20",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {profileImg ? (
                <img
                  src={profileImg}
                  alt="profile"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <UserOutlined style={{color: PRIMARY_COLOR}} />
              )}
            </div>
            <div style={{fontWeight: 500, whiteSpace: "nowrap"}}>
              {record.user?.name}
            </div>
          </Space>
        );
      },
    },
    {
      title: "Contact",
      dataIndex: ["user", "contact"],
      key: "contact",
      render: (contact) => contact || "-",
      responsive: ["lg"],
    },
    {
      title: "Purpose",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
      render: (description) => (
        <Tooltip title={description}>
          <span>
            {description?.length > 20
              ? description.substring(0, 20) + "..."
              : description}
          </span>
        </Tooltip>
      ),
      responsive: ["md"], // Hide on mobile
    },
    {
      title: "Date",
      key: "date",
      render: (_, record) => (
        <Tooltip title={dayjs(record.date).format("DD MMM YYYY")}>
          <span style={{whiteSpace: "nowrap"}}>
            {dayjs(record.date).format("DD MMM YYYY")}
          </span>
        </Tooltip>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      align: "center",
      render: getStatusTag,
      width: 100,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Button
          size="small"
          type="primary"
          onClick={() => {
            setSelectedGatePass(record);
            if (isMobile) {
              setMobileDrawerVisible(true);
            } else {
              setResponseModalVisible(true);
            }
          }}
        >
          View Details
        </Button>
      ),
    },
  ];

  if (gatePassError) {
    return (
      <Alert
        message="Error"
        description={gatePassError.message}
        type="error"
        showIcon
        action={<Button onClick={() => refetchGatePass()}>Retry</Button>}
      />
    );
  }

  return (
    <div style={{maxWidth: "100%", overflowX: "hidden"}}>
      {/* Filters */}
      <Row gutter={[16, 16]} style={{marginBottom: 24}}>
        <Col xs={24} md={8}>
          <Input
            placeholder="Search student or vehicle..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
          />
        </Col>
        <Col xs={24} md={16}>
          <Row gutter={[8, 8]} justify="end">
            <Col xs={12} md={8}>
              <Select
                value={statusFilter}
                onChange={setStatusFilter}
                style={{width: "100%"}}
                placeholder="Status"
                suffixIcon={<FilterOutlined />}
              >
                <Option value="all">All Status</Option>
                <Option value="Pending">Pending</Option>
                <Option value="Approved">Approved</Option>
                <Option value="Rejected">Rejected</Option>
              </Select>
            </Col>
            <Col xs={12} md={8}>
              <DatePicker
                value={selectedDate}
                onChange={setSelectedDate}
                format="YYYY-MM-DD"
                style={{width: "100%"}}
                placeholder="Select Date"
              />
            </Col>
          </Row>
        </Col>
      </Row>

      {/* Pending Requests Section */}
      {pendingRequests.length > 0 && (
        <>
          <div style={{marginBottom: 16}}>
            <Space align="center">
              <ExclamationCircleOutlined
                style={{color: "#faad14", fontSize: 20}}
              />
              <Text strong style={{fontSize: 16, color: "#faad14"}}>
                Pending Requests ({pendingRequests.length})
              </Text>
            </Space>
          </div>

          <Card
            size="small"
            style={{
              marginBottom: 24,
              borderColor: "#faad14",
              backgroundColor: "#fffbe6",
              overflowX: "auto",
            }}
            bodyStyle={{padding: isMobile ? 8 : 12}}
          >
            <div style={{minWidth: isMobile ? "100%" : 900}}>
              <Table
                columns={columns}
                dataSource={pendingRequests}
                loading={isGatePassLoading}
                rowKey="_id"
                pagination={false}
                size="small"
                scroll={{x: isMobile ? 900 : undefined}}
                onRow={(record) => ({
                  onClick: () => {
                    if (isMobile) {
                      setSelectedGatePass(record);
                      setMobileDrawerVisible(true);
                    }
                  },
                  style: {cursor: isMobile ? "pointer" : "default"},
                })}
              />
            </div>
          </Card>

          {otherRequests.length > 0 && (
            <Divider style={{margin: "16px 0"}}>
              <Tag color="blue">
                Processed Requests ({otherRequests.length})
              </Tag>
            </Divider>
          )}
        </>
      )}

      {/* Other Requests Section */}
      {otherRequests.length > 0 && (
        <div style={{overflowX: "auto"}}>
          <div style={{minWidth: isMobile ? 900 : "100%"}}>
            <Table
              columns={columns}
              dataSource={otherRequests}
              loading={isGatePassLoading}
              rowKey="_id"
              pagination={false}
              size="small"
              scroll={{x: isMobile ? 900 : undefined}}
              onRow={(record) => ({
                onClick: () => {
                  if (isMobile) {
                    setSelectedGatePass(record);
                    setMobileDrawerVisible(true);
                  }
                },
                style: {cursor: isMobile ? "pointer" : "default"},
              })}
            />
          </div>
        </div>
      )}

      {/* Empty State */}
      {pendingRequests.length === 0 && otherRequests.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: "40px 20px",
            backgroundColor: "#fafafa",
            borderRadius: "8px",
          }}
        >
          <UserOutlined style={{fontSize: 48, color: "#d9d9d9"}} />
          <p style={{marginTop: 16, color: "#999"}}>
            No gate pass requests found
          </p>
        </div>
      )}

      {/* Response Modal (Desktop) */}
      <Modal
        title={`Respond to Gate Pass Request - ${selectedGatePass?.user?.name}`}
        open={responseModalVisible}
        onCancel={() => {
          setResponseModalVisible(false);
          setSelectedGatePass(null);
          setAdminComment("");
        }}
        width={700}
        footer={[
          <Button key="cancel" onClick={() => setResponseModalVisible(false)}>
            Cancel
          </Button>,
          <Button
            key="approve"
            type="primary"
            style={{backgroundColor: "#52c41a", borderColor: "#52c41a"}}
            onClick={() => handleRespond("Approved")}
            loading={respondMutation.isLoading}
          >
            Approve
          </Button>,
          <Button
            key="reject"
            danger
            onClick={() => handleRespond("Rejected")}
            loading={respondMutation.isLoading}
          >
            Reject
          </Button>,
        ]}
      >
        {selectedGatePass && (
          <div>
            <Descriptions column={1} size="small" bordered>
              <Descriptions.Item label="Student">
                {selectedGatePass.user?.name}
              </Descriptions.Item>
              <Descriptions.Item label="Room">
                {selectedGatePass.user?.stayDetails?.roomNumber || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Contact">
                {selectedGatePass.user?.contact || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Date">
                {dayjs(selectedGatePass.date).format("DD MMM YYYY")}
              </Descriptions.Item>
              <Descriptions.Item label="Purpose">
                {selectedGatePass.description}
              </Descriptions.Item>
              {selectedGatePass.adminComment && (
                <Descriptions.Item label="Admin Comment">
                  {selectedGatePass.adminComment}
                </Descriptions.Item>
              )}
            </Descriptions>

            <div style={{marginTop: 16}}>
              <Text strong>Admin Comment (Optional):</Text>
              <Input.TextArea
                rows={3}
                value={adminComment}
                onChange={(e) => setAdminComment(e.target.value)}
                placeholder="Add your comments here..."
                style={{marginTop: 8}}
              />
            </div>
          </div>
        )}
      </Modal>

      {/* Mobile Drawer */}
      <MobileGatePassDrawer
        visible={mobileDrawerVisible}
        onClose={() => {
          setMobileDrawerVisible(false);
          setSelectedGatePass(null);
          setAdminComment("");
        }}
        selectedGatePass={selectedGatePass}
        onRespond={handleRespond}
        adminComment={adminComment}
        setAdminComment={setAdminComment}
        isResponding={respondMutation.isLoading}
      />
    </div>
  );
};

export default GatePassManagement;
