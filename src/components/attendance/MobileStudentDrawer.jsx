import {
  Drawer,
  Descriptions,
  Tag,
  Divider,
  Row,
  Col,
  Button,
  Typography,
} from "antd";
import {
  UserOutlined,
  CalendarOutlined,
  CommentOutlined,
} from "@ant-design/icons";

const {Title} = Typography;
const PRIMARY_COLOR = "#059669";

const MobileStudentDrawer = ({
  visible,
  onClose,
  student,
  onMarkAttendance,
  onViewHistory,
  onOpenRemarks,
}) => {
  if (!student) return null;

  return (
    <Drawer
      title="Student Details"
      placement="bottom"
      height="auto"
      open={visible}
      onClose={onClose}
      destroyOnClose
    >
      <div>
        <div style={{textAlign: "center", marginBottom: 24}}>
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              overflow: "hidden",
              backgroundColor: PRIMARY_COLOR + "20",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 12px",
            }}
          >
            {student.user?.personalDetails?.profileImg ? (
              <img
                src={student.user.personalDetails.profileImg}
                alt="profile"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            ) : (
              <UserOutlined style={{color: PRIMARY_COLOR, fontSize: 32}} />
            )}
          </div>
          <Title level={4} style={{margin: 0}}>
            {student.user?.name}
          </Title>
        </div>

        <Descriptions column={1} bordered size="small">
          <Descriptions.Item label="Contact">
            {student.user?.contact || "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="Room">
            {student.user?.stayDetails?.roomNumber || "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="Status">
            <Tag
              color={
                student.status === "Present"
                  ? "success"
                  : student.status === "Absent"
                    ? "error"
                    : student.status === "Late"
                      ? "warning"
                      : "default"
              }
            >
              {student.status || "Not Marked"}
            </Tag>
          </Descriptions.Item>
          {student.remarks && (
            <Descriptions.Item label="Remarks">
              {student.remarks}
            </Descriptions.Item>
          )}
        </Descriptions>

        <Divider>Quick Actions</Divider>

        <Row gutter={[8, 8]}>
          {["Present", "Absent", "Late"].map((status) => (
            <Col span={8} key={status}>
              <Button
                block
                type={student.status === status ? "primary" : "default"}
                danger={status === "Absent"}
                onClick={() => {
                  onMarkAttendance(
                    student.user?._id || student._id,
                    status,
                    status === "Late" ? "Late arrival" : "",
                  );
                  onClose();
                }}
              >
                {status}
              </Button>
            </Col>
          ))}
        </Row>

        <div style={{marginTop: 12}}>
          <Button
            block
            icon={<CalendarOutlined />}
            onClick={() => {
              onClose();
              onViewHistory(
                student.user?._id || student._id,
                student.user?.name,
              );
            }}
          >
            View History
          </Button>
        </div>

        <div style={{marginTop: 8}}>
          <Button
            block
            icon={<CommentOutlined />}
            onClick={() => {
              onClose();
              onOpenRemarks(student);
            }}
          >
            {student.remarks ? "Edit Remarks" : "Add Remarks"}
          </Button>
        </div>
      </div>
    </Drawer>
  );
};

export default MobileStudentDrawer;
