import {
  Drawer,
  Descriptions,
  Tag,
  Button,
  Typography,
  Divider,
  Input,
  Empty,
} from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  UserOutlined,
  FileOutlined,
  DownloadOutlined,
  SearchOutlined,
  PaperClipOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const {Text} = Typography;
const PRIMARY_COLOR = "#059669";

const MobileLeaveDrawer = ({
  visible,
  onClose,
  selectedLeave,
  onRespond,
  adminComment,
  setAdminComment,
  isResponding,
}) => {
  if (!selectedLeave) return null;

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
      <Tag
        icon={config[statusKey]?.icon}
        color={config[statusKey]?.color}
        style={{marginLeft: 8}}
      >
        {config[statusKey]?.text || status}
      </Tag>
    );
  };

  const handleApprove = () => {
    onRespond("Approved");
  };

  const handleReject = () => {
    onRespond("Rejected");
  };

  const hasAttachments =
    selectedLeave.attachments && selectedLeave.attachments.length > 0;

  return (
    <Drawer
      title={
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span>Leave Request Details</span>
          {getStatusTag(selectedLeave.status)}
        </div>
      }
      placement="bottom"
      height="85vh"
      open={visible}
      onClose={onClose}
      destroyOnClose
      closeIcon
      footer={
        <div style={{display: "flex", gap: 8}}>
          <Button
            block
            type="primary"
            style={{
              backgroundColor: "#52c41a",
              borderColor: "#52c41a",
              height: 44,
            }}
            icon={<CheckCircleOutlined />}
            onClick={handleApprove}
            loading={isResponding}
          >
            Approve
          </Button>
          <Button
            block
            danger
            style={{height: 44}}
            icon={<CloseCircleOutlined />}
            onClick={handleReject}
            loading={isResponding}
          >
            Reject
          </Button>
        </div>
      }
    >
      <div style={{padding: "8px 0"}}>
        {/* Student Info */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 16,
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              overflow: "hidden",
              backgroundColor: PRIMARY_COLOR + "20",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {selectedLeave.user?.personalDetails?.profileImg ? (
              <img
                src={selectedLeave.user.personalDetails.profileImg}
                alt="profile"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            ) : (
              <UserOutlined style={{color: PRIMARY_COLOR, fontSize: 24}} />
            )}
          </div>
          <div style={{flex: 1}}>
            <div style={{fontSize: 18, fontWeight: 600}}>
              {selectedLeave.user?.name}
            </div>
            <div style={{fontSize: 14, color: "#666"}}>
              {selectedLeave.user?.contact || "No contact"}
            </div>
          </div>
        </div>

        <Divider style={{margin: "16px 0"}} />

        {/* Leave Details */}
        <Descriptions
          column={1}
          size="small"
          bordered
          labelStyle={{width: "40%"}}
        >
          <Descriptions.Item label="Leave Type">
            {selectedLeave.categoryId?.name || "General Leave"}
          </Descriptions.Item>
          <Descriptions.Item label="Duration">
            <div>{dayjs(selectedLeave.fromDate).format("DD MMM YYYY")}</div>
            <div style={{color: "#666"}}>
              to {dayjs(selectedLeave.toDate).format("DD MMM YYYY")}
            </div>
          </Descriptions.Item>
          <Descriptions.Item label="Total Days">
            <Tag color={PRIMARY_COLOR}>{selectedLeave.totalDays} days</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Reason">
            <div style={{whiteSpace: "pre-wrap", wordBreak: "break-word"}}>
              {selectedLeave.reason}
            </div>
          </Descriptions.Item>
          {selectedLeave?.reviewedBy?.trim() && (
            <Descriptions.Item label="Reviewed By">
              {selectedLeave.reviewedBy}
            </Descriptions.Item>
          )}
          {selectedLeave?.adminComment?.trim() && (
            <Descriptions.Item label="Admin Comment">
              {selectedLeave.adminComment}
            </Descriptions.Item>
          )}
        </Descriptions>

        {/* Attachments Section */}
        <div style={{marginTop: 16}}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 12,
            }}
          >
            <PaperClipOutlined style={{color: PRIMARY_COLOR}} />
            <Text strong style={{fontSize: 16}}>
              Attachments
            </Text>
            {hasAttachments && (
              <Tag color="blue" style={{marginLeft: "auto"}}>
                {selectedLeave.attachments.length} file(s)
              </Tag>
            )}
          </div>

          {hasAttachments ? (
            <>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
                  gap: "12px",
                  marginTop: 8,
                }}
              >
                {selectedLeave.attachments.map((attachment, index) => {
                  const isImage =
                    attachment.match(/\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i) ||
                    attachment.includes("image");

                  return (
                    <div
                      key={index}
                      style={{
                        border: "1px solid #f0f0f0",
                        borderRadius: 8,
                        overflow: "hidden",
                        cursor: "pointer",
                        transition: "all 0.3s",
                      }}
                      onClick={() => window.open(attachment, "_blank")}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.boxShadow =
                          "0 2px 8px rgba(0,0,0,0.09)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.boxShadow = "none")
                      }
                    >
                      {isImage ? (
                        <div style={{position: "relative"}}>
                          <img
                            src={attachment}
                            alt={`Attachment ${index + 1}`}
                            style={{
                              width: "100%",
                              height: 100,
                              objectFit: "cover",
                            }}
                          />
                          <div
                            style={{
                              position: "absolute",
                              bottom: 4,
                              right: 4,
                              backgroundColor: "rgba(255,255,255,0.9)",
                              borderRadius: 4,
                              padding: "2px 6px",
                              fontSize: 11,
                            }}
                          >
                            <SearchOutlined /> View
                          </div>
                        </div>
                      ) : (
                        <div
                          style={{
                            height: 100,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: "#f5f5f5",
                            padding: 8,
                          }}
                        >
                          <FileOutlined
                            style={{fontSize: 32, color: PRIMARY_COLOR}}
                          />
                          <span
                            style={{
                              fontSize: 11,
                              marginTop: 4,
                              wordBreak: "break-all",
                              textAlign: "center",
                            }}
                          >
                            {attachment.split("/").pop()?.substring(0, 12) ||
                              "File"}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {selectedLeave.attachments.length > 1 && (
                <Button
                  type="link"
                  icon={<DownloadOutlined />}
                  onClick={() =>
                    selectedLeave.attachments.forEach((url) =>
                      window.open(url, "_blank"),
                    )
                  }
                  style={{marginTop: 12}}
                  block
                >
                  Open All ({selectedLeave.attachments.length})
                </Button>
              )}
            </>
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <span style={{color: "#999"}}>
                  No attachments with this leave request
                </span>
              }
              style={{
                backgroundColor: "#fafafa",
                padding: "20px",
                borderRadius: 8,
                marginTop: 8,
              }}
            />
          )}
        </div>

        {/* Admin Comment Input - Only for pending */}
        <>
          <Divider style={{margin: "16px 0"}} />
          <div>
            <Text strong>Add Admin Comment (Optional):</Text>
            <Input.TextArea
              rows={3}
              value={adminComment}
              onChange={(e) => setAdminComment(e.target.value)}
              placeholder="Add your comments here..."
              style={{marginTop: 8}}
            />
          </div>
        </>
      </div>
    </Drawer>
  );
};

export default MobileLeaveDrawer;
