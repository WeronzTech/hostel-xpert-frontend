import {
  Drawer,
  Descriptions,
  Tag,
  Button,
  Typography,
  Divider,
  Input,
  Space,
} from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  UserOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const {Text} = Typography;
const PRIMARY_COLOR = "#059669";

const MobileGatePassDrawer = ({
  visible,
  onClose,
  selectedGatePass,
  onRespond,
  adminComment,
  setAdminComment,
  isResponding,
}) => {
  if (!selectedGatePass) return null;

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
          <span>Gate Pass Details</span>
          {getStatusTag(selectedGatePass.status)}
        </div>
      }
      placement="bottom"
      height="75vh"
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
            {selectedGatePass.user?.personalDetails?.profileImg ? (
              <img
                src={selectedGatePass.user.personalDetails.profileImg}
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
              {selectedGatePass.user?.name}
            </div>
            <Space split="•" style={{fontSize: 14, color: "#666"}}>
              <span>
                Room {selectedGatePass.user?.stayDetails?.roomNumber || "N/A"}
              </span>
              <span>{selectedGatePass.user?.contact || "No contact"}</span>
            </Space>
          </div>
        </div>

        <Divider style={{margin: "16px 0"}} />

        {/* Gate Pass Details */}
        <Descriptions
          column={1}
          size="small"
          bordered
          labelStyle={{width: "40%"}}
        >
          <Descriptions.Item label="Date">
            <div>{dayjs(selectedGatePass.date).format("DD MMM YYYY")}</div>
          </Descriptions.Item>

          <Descriptions.Item label="Purpose">
            <div style={{whiteSpace: "pre-wrap", wordBreak: "break-word"}}>
              {selectedGatePass.description}
            </div>
          </Descriptions.Item>
          {selectedGatePass?.reviewedBy?.trim() && (
            <Descriptions.Item label="Reviewed By">
              {selectedGatePass.reviewedBy}
            </Descriptions.Item>
          )}
          {selectedGatePass?.adminComment?.trim() && (
            <Descriptions.Item label="Admin Comment">
              {selectedGatePass.adminComment}
            </Descriptions.Item>
          )}
        </Descriptions>

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

export default MobileGatePassDrawer;
