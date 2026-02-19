import React, {useState} from "react";
import {
  Table,
  Button,
  Space,
  Tag,
  Modal,
  message,
  Alert,
  Tooltip,
  Row,
  Col,
  Select,
  DatePicker,
  Input,
  Badge,
  Descriptions,
  Typography,
  Divider,
  Card,
} from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  UserOutlined,
  SearchOutlined,
  FilterOutlined,
  PlusOutlined,
  ExclamationCircleOutlined,
  FileOutlined,
} from "@ant-design/icons";
import {useQuery, useMutation} from "@tanstack/react-query";
import dayjs from "dayjs";

import LeaveCategoryModal from "./LeaveCategoryModal";
import {
  createLeaveCategory,
  deleteLeaveCategory,
  getAllLeaveCategories,
  getAllLeaveRequests,
  respondToLeave,
} from "../../hooks/users/useUser";
import MobileLeaveDrawer from "./MobileLeaveDrawer";

const {RangePicker} = DatePicker;
const {Option} = Select;
const {Text} = Typography;
const PRIMARY_COLOR = "#059669";

const LeaveManagement = ({selectedProperty, queryClient}) => {
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState([
    dayjs().startOf("month"),
    dayjs().endOf("month"),
  ]);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [responseModalVisible, setResponseModalVisible] = useState(false);
  const [adminComment, setAdminComment] = useState("");
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [mobileDrawerVisible, setMobileDrawerVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Handle resize for mobile detection
  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch leave requests
  const {
    data: leaveRequests,
    isLoading: isLeaveLoading,
    error: leaveError,
    refetch: refetchLeaves,
  } = useQuery({
    queryKey: [
      "leaveRequests",
      selectedProperty?.id,
      searchText,
      statusFilter,
      dateRange?.[0] ? dateRange[0].format("YYYY-MM-DD") : undefined,
      dateRange?.[1] ? dateRange[1].format("YYYY-MM-DD") : undefined,
    ],
    queryFn: () =>
      getAllLeaveRequests({
        propertyId: selectedProperty?.id,
        search: searchText || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
        fromDate: dateRange?.[0]
          ? dateRange[0].format("YYYY-MM-DD")
          : undefined,
        toDate: dateRange?.[1] ? dateRange[1].format("YYYY-MM-DD") : undefined,
      }),
  });

  // Fetch leave categories
  const {data: categories} = useQuery({
    queryKey: ["leaveCategories"],
    queryFn: () => getAllLeaveCategories(),
  });

  // Separate pending and non-pending requests
  const pendingRequests =
    leaveRequests?.data?.filter(
      (req) => req.status?.toLowerCase() === "pending",
    ) || [];

  const otherRequests =
    leaveRequests?.data?.filter(
      (req) => req.status?.toLowerCase() !== "pending",
    ) || [];

  // Respond to leave mutation
  const respondMutation = useMutation({
    mutationFn: respondToLeave,
    onSuccess: () => {
      message.success("Leave request updated successfully");
      queryClient.invalidateQueries(["leaveRequests"]);
      setResponseModalVisible(false);
      setSelectedLeave(null);
      setAdminComment("");
    },
    onError: (error) => {
      message.error(error.message || "Failed to update leave request");
    },
  });

  // Create category mutation
  const createCategoryMutation = useMutation({
    mutationFn: createLeaveCategory,
    onSuccess: () => {
      message.success("Leave category created successfully");
      queryClient.invalidateQueries(["leaveCategories"]);
    },
    onError: (error) => {
      message.error(error.message || "Failed to create leave category");
    },
  });

  // Delete category mutation
  const deleteCategoryMutation = useMutation({
    mutationFn: deleteLeaveCategory,
    onSuccess: () => {
      message.success("Leave category deleted successfully");
      queryClient.invalidateQueries(["leaveCategories"]);
    },
    onError: (error) => {
      message.error(error.message || "Failed to delete leave category");
    },
  });

  const handleRespond = (status) => {
    if (!selectedLeave) return;

    respondMutation.mutate({
      leaveId: selectedLeave._id,
      status,
      adminComment: adminComment || undefined,
      reviewedBy: "Current User",
      adminName: "Admin Name",
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
    };
    const statusKey = status?.toLowerCase() || "pending";
    return (
      <Tag icon={config[statusKey]?.icon} color={config[statusKey]?.color}>
        {config[statusKey]?.text || status}
      </Tag>
    );
  };

  // Desktop Columns - Without fixed widths for better responsiveness
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
      responsive: ["lg"], // Hide on smaller screens
    },
    {
      title: "Leave Type",
      key: "category",
      responsive: ["md"],
      render: (_, record) => {
        const leaveType = record.leaveType;

        if (!leaveType?.name) return "General Leave";

        return (
          <Space size={4}>
            <span>{leaveType.name}</span>
            {leaveType.autoApprove && (
              <Tag color="green" style={{margin: 0}}>
                Auto
              </Tag>
            )}
          </Space>
        );
      },
    },
    {
      title: "Duration",
      key: "duration",
      render: (_, record) => (
        <Tooltip
          title={`From ${dayjs(record.startDate).format("DD MMM YYYY")} to ${dayjs(record.endDate).format("DD MMM YYYY")}`}
        >
          <span style={{whiteSpace: "nowrap"}}>
            {dayjs(record.startDate).format("DD MMM")} -{" "}
            {dayjs(record.endDate).format("DD MMM YYYY")}
          </span>
        </Tooltip>
      ),
    },
    {
      title: "Days",
      dataIndex: "totalDays",
      key: "days",
      align: "center",
      render: (days) => (
        <Badge count={days} style={{backgroundColor: PRIMARY_COLOR}} />
      ),
      width: 70,
    },
    {
      title: "Reason",
      dataIndex: "reason",
      key: "reason",
      ellipsis: true,
      render: (reason) => (
        <Tooltip title={reason}>
          <span>
            {reason?.length > 20 ? reason.substring(0, 20) + "..." : reason}
          </span>
        </Tooltip>
      ),
      responsive: ["md"], // Hide on mobile
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
            console.log(record);
            setSelectedLeave(record);
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

  if (leaveError) {
    return (
      <Alert
        message="Error"
        description={leaveError.message}
        type="error"
        showIcon
        action={<Button onClick={() => refetchLeaves()}>Retry</Button>}
      />
    );
  }

  return (
    <div style={{maxWidth: "100%", overflowX: "hidden"}}>
      {/* Header Actions - Responsive */}
      <Row gutter={[16, 16]} style={{marginBottom: 24}}>
        <Col xs={24} md={8}>
          <Input
            placeholder="Search student..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
          />
        </Col>

        <Col xs={24} md={16}>
          <Row gutter={[8, 8]} justify="end">
            <Col xs={24} sm={8} md={6}>
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

            <Col xs={24} sm={8} md={8}>
              <RangePicker
                value={dateRange}
                onChange={setDateRange}
                format="YYYY-MM-DD"
                style={{width: "100%"}}
                size="middle"
              />
            </Col>

            <Col xs={24} sm={8} md={8}>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setCategoryModalVisible(true)}
                style={{
                  backgroundColor: PRIMARY_COLOR,
                  borderColor: PRIMARY_COLOR,
                  width: "100%",
                }}
              >
                Manage Categories
              </Button>
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
            <div style={{minWidth: isMobile ? "100%" : 800}}>
              <Table
                columns={columns}
                dataSource={pendingRequests}
                loading={isLeaveLoading}
                rowKey="_id"
                pagination={false}
                size="small"
                scroll={{x: isMobile ? 800 : undefined}}
                onRow={(record) => ({
                  onClick: () => {
                    if (isMobile) {
                      setSelectedLeave(record);
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
          <div style={{minWidth: isMobile ? 800 : "100%"}}>
            <Table
              columns={columns}
              dataSource={otherRequests}
              loading={isLeaveLoading}
              rowKey="_id"
              pagination={false}
              size="small"
              scroll={{x: isMobile ? 800 : undefined}}
              onRow={(record) => ({
                onClick: () => {
                  if (isMobile) {
                    setSelectedLeave(record);
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
          <p style={{marginTop: 16, color: "#999"}}>No leave requests found</p>
        </div>
      )}

      {/* Response Modal */}
      <Modal
        title={`Respond to Leave Request - ${selectedLeave?.user?.name}`}
        open={responseModalVisible}
        onCancel={() => {
          setResponseModalVisible(false);
          setSelectedLeave(null);
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
        {selectedLeave && (
          <div>
            <Descriptions column={1} size="small" bordered>
              <Descriptions.Item label="Student">
                {selectedLeave.user?.name}
              </Descriptions.Item>
              <Descriptions.Item label="Leave Type">
                {selectedLeave.categoryId?.name || "General Leave"}
              </Descriptions.Item>
              <Descriptions.Item label="Duration">
                {dayjs(selectedLeave.fromDate).format("DD MMM YYYY")} to{" "}
                {dayjs(selectedLeave.toDate).format("DD MMM YYYY")}
              </Descriptions.Item>
              <Descriptions.Item label="Total Days">
                {selectedLeave.totalDays}
              </Descriptions.Item>
              <Descriptions.Item label="Reason">
                {selectedLeave.reason}
              </Descriptions.Item>
              {selectedLeave?.adminComment?.trim() && (
                <Descriptions.Item label="Admin Comment">
                  {selectedLeave.adminComment}
                </Descriptions.Item>
              )}
            </Descriptions>

            {/* Attachments Section */}
            {selectedLeave.attachments &&
              selectedLeave.attachments.length > 0 && (
                <div style={{marginTop: 16}}>
                  <Text strong style={{fontSize: 14}}>
                    Attachments:
                  </Text>
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "12px",
                      marginTop: 8,
                      padding: 8,
                      backgroundColor: "#f9f9f9",
                      borderRadius: 6,
                    }}
                  >
                    {selectedLeave.attachments.map((attachment, index) => {
                      // Check if it's an image based on file type or URL pattern
                      const isImage =
                        attachment.match(
                          /\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i,
                        ) || attachment.includes("image");

                      return (
                        <div key={index} style={{textAlign: "center"}}>
                          {isImage ? (
                            <div style={{position: "relative"}}>
                              <img
                                src={attachment}
                                alt={`Attachment ${index + 1}`}
                                style={{
                                  width: 100,
                                  height: 100,
                                  objectFit: "cover",
                                  borderRadius: 8,
                                  border: "1px solid #d9d9d9",
                                  cursor: "pointer",
                                }}
                                onClick={() =>
                                  window.open(attachment, "_blank")
                                }
                              />
                              <Button
                                type="link"
                                size="small"
                                icon={<SearchOutlined />}
                                style={{
                                  position: "absolute",
                                  bottom: 4,
                                  right: 4,
                                  backgroundColor: "rgba(255,255,255,0.8)",
                                  borderRadius: 4,
                                }}
                                onClick={() =>
                                  window.open(attachment, "_blank")
                                }
                              />
                            </div>
                          ) : (
                            <div
                              style={{
                                width: 100,
                                height: 100,
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                backgroundColor: "#f0f0f0",
                                borderRadius: 8,
                                border: "1px solid #d9d9d9",
                                cursor: "pointer",
                                padding: 8,
                              }}
                              onClick={() => window.open(attachment, "_blank")}
                            >
                              <FileOutlined
                                style={{fontSize: 32, color: PRIMARY_COLOR}}
                              />
                              <span
                                style={{
                                  fontSize: 10,
                                  marginTop: 4,
                                  wordBreak: "break-all",
                                }}
                              >
                                {attachment
                                  .split("/")
                                  .pop()
                                  ?.substring(0, 10) || "File"}
                                {attachment.split("/").pop()?.length > 10
                                  ? "..."
                                  : ""}
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Download All Button */}
                  {selectedLeave.attachments.length > 1 && (
                    <div style={{marginTop: 8, textAlign: "right"}}>
                      <Button
                        size="small"
                        icon={<DownloadOutlined />}
                        onClick={() => {
                          // You can implement download all functionality here
                          selectedLeave.attachments.forEach((url) =>
                            window.open(url, "_blank"),
                          );
                        }}
                      >
                        Download All ({selectedLeave.attachments.length})
                      </Button>
                    </div>
                  )}
                </div>
              )}

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

      {/* Mobile Leave Drawer */}
      <MobileLeaveDrawer
        visible={mobileDrawerVisible}
        onClose={() => {
          setMobileDrawerVisible(false);
          setSelectedLeave(null);
          setAdminComment("");
        }}
        selectedLeave={selectedLeave}
        onRespond={handleRespond}
        adminComment={adminComment}
        setAdminComment={setAdminComment}
        isResponding={respondMutation.isLoading}
      />

      {/* Leave Category Modal */}
      <LeaveCategoryModal
        visible={categoryModalVisible}
        onCancel={() => setCategoryModalVisible(false)}
        categories={categories?.data || []}
        onCreateCategory={(values) => createCategoryMutation.mutate(values)}
        onDeleteCategory={(id) => deleteCategoryMutation.mutate(id)}
        loading={
          createCategoryMutation.isLoading || deleteCategoryMutation.isLoading
        }
        propertyId={selectedProperty?.id}
      />
    </div>
  );
};

export default LeaveManagement;
