import {
  Modal,
  Space,
  Calendar,
  Badge,
  Card,
  Row,
  Col,
  Statistic,
  Spin,
  Alert,
  Tooltip,
  Divider,
  Button,
  Typography,
  DatePicker,
} from "antd";
import {
  CalendarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import {useQuery} from "@tanstack/react-query";
import dayjs from "dayjs";
import {getUserAttendance} from "../../hooks/users/useUser";
import {useState} from "react";

const {Text, Title} = Typography;
const {RangePicker} = DatePicker;
const PRIMARY_COLOR = "#059669";

const StudentAttendanceCalendar = ({userId, visible, isMobile}) => {
  const [selectedRange, setSelectedRange] = useState([
    dayjs().startOf("month"),
    dayjs().endOf("month"),
  ]);

  // Fetch user attendance history
  const {
    data: attendanceHistory,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["userAttendance", userId, selectedRange[0], selectedRange[1]],
    queryFn: () =>
      getUserAttendance({
        userId,
        startDate: selectedRange[0].format("YYYY-MM-DD"),
        endDate: selectedRange[1].format("YYYY-MM-DD"),
      }),
    enabled: !!userId && visible,
  });

  // Calculate summary stats
  const summaryStats = attendanceHistory?.data?.reduce(
    (acc, record) => {
      acc[record.status] = (acc[record.status] || 0) + 1;
      return acc;
    },
    {Present: 0, Absent: 0, Late: 0},
  );

  // Create attendance map for calendar
  const getAttendanceData = (value) => {
    if (!attendanceHistory?.data) return null;

    const dateStr = value.format("YYYY-MM-DD");
    const attendance = attendanceHistory.data.find(
      (item) => dayjs(item.date).format("YYYY-MM-DD") === dateStr,
    );

    if (attendance) {
      return {
        status: attendance.status,
        markedBy: attendance.markedBy,
        remarks: attendance.remarks,
      };
    }
    return null;
  };

  // Date cell render for calendar
  const dateCellRender = (value) => {
    const attendance = getAttendanceData(value);
    if (!attendance) return null;

    const statusConfig = {
      Present: {color: "#3f8600", icon: "✓", bgColor: "#3f8600"},
      Absent: {color: "#cf1322", icon: "✗", bgColor: "#cf1322"},
      Late: {color: "#faad14", icon: "⏰", bgColor: "#faad14"},
    };

    const config = statusConfig[attendance.status];

    return (
      <Tooltip
        title={
          <div>
            <div>Status: {attendance.status}</div>
            <div>Marked by: {attendance.markedBy || "System"}</div>
            {attendance.remarks && <div>Remarks: {attendance.remarks}</div>}
          </div>
        }
      >
        <div
          style={{
            backgroundColor: config.color + "15",
            color: config.color,
            padding: isMobile ? "2px" : "4px",
            borderRadius: "4px",
            textAlign: "center",
            fontWeight: "bold",
            border: `1px solid ${config.color}`,
            fontSize: isMobile ? "12px" : "14px",
          }}
        >
          {config.icon}
        </div>
      </Tooltip>
    );
  };

  if (isLoading) {
    return (
      <div style={{textAlign: "center", padding: isMobile ? "30px" : "50px"}}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Error"
        description={error.message}
        type="error"
        showIcon
        action={
          <Button size="small" onClick={() => refetch()}>
            Retry
          </Button>
        }
      />
    );
  }

  return (
    <div>
      {/* Summary Cards */}
      {summaryStats && (
        <Row gutter={[8, 8]} style={{marginBottom: "24px"}}>
          <Col xs={8} sm={8}>
            <Card size="small" bodyStyle={{padding: isMobile ? "8px" : "12px"}}>
              <Statistic
                title="Present"
                value={summaryStats.Present || 0}
                valueStyle={{
                  color: "#3f8600",
                  fontSize: isMobile ? "16px" : "20px",
                }}
                prefix={<CheckCircleOutlined />}
              />
            </Card>
          </Col>
          <Col xs={8} sm={8}>
            <Card size="small" bodyStyle={{padding: isMobile ? "8px" : "12px"}}>
              <Statistic
                title="Absent"
                value={summaryStats.Absent || 0}
                valueStyle={{
                  color: "#cf1322",
                  fontSize: isMobile ? "16px" : "20px",
                }}
                prefix={<CloseCircleOutlined />}
              />
            </Card>
          </Col>
          <Col xs={8} sm={8}>
            <Card size="small" bodyStyle={{padding: isMobile ? "8px" : "12px"}}>
              <Statistic
                title="Late"
                value={summaryStats.Late || 0}
                valueStyle={{
                  color: "#faad14",
                  fontSize: isMobile ? "16px" : "20px",
                }}
                prefix={<ClockCircleOutlined />}
              />
            </Card>
          </Col>
        </Row>
      )}

      <div style={{marginBottom: "16px", overflowX: "auto"}}>
        <Space
          direction={isMobile ? "vertical" : "horizontal"}
          style={{width: "100%"}}
        >
          <Text strong>Select Date Range:</Text>
          <RangePicker
            value={selectedRange}
            onChange={setSelectedRange}
            format="YYYY-MM-DD"
            allowClear={false}
            style={{width: isMobile ? "100%" : "auto"}}
            size={isMobile ? "small" : "middle"}
          />
        </Space>
      </div>

      <Calendar
        fullscreen={false}
        dateCellRender={dateCellRender}
        headerRender={({value, onChange}) => (
          <div
            style={{
              padding: "8px 0",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexDirection: isMobile ? "column" : "row",
              gap: isMobile ? "8px" : 0,
            }}
          >
            <Title level={isMobile ? 5 : 4} style={{margin: 0}}>
              {value.format("MMMM YYYY")}
            </Title>
            <Space size={isMobile ? "small" : "middle"}>
              <Button
                size={isMobile ? "small" : "middle"}
                onClick={() => onChange(value.clone().subtract(1, "month"))}
              >
                Previous
              </Button>
              <Button
                size={isMobile ? "small" : "middle"}
                onClick={() => onChange(dayjs())}
              >
                Today
              </Button>
              <Button
                size={isMobile ? "small" : "middle"}
                onClick={() => onChange(value.clone().add(1, "month"))}
              >
                Next
              </Button>
            </Space>
          </div>
        )}
      />

      {/* Legend */}
      <Divider style={{margin: "16px 0 8px"}} />
      <div
        style={{
          display: "flex",
          gap: isMobile ? "12px" : "24px",
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        <Badge color="#3f8600" text="Present" />
        <Badge color="#cf1322" text="Absent" />
        <Badge color="#faad14" text="Late" />
        <Badge color="#d9d9d9" text="No Record" />
      </div>
    </div>
  );
};

const AttendanceHistoryModal = ({
  visible,
  onCancel,
  selectedUser,
  isMobile,
}) => {
  return (
    <Modal
      title={
        <Space>
          <CalendarOutlined style={{color: PRIMARY_COLOR}} />
          <span>Attendance History - {selectedUser?.name || "Student"}</span>
        </Space>
      }
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={isMobile ? "95%" : 800}
      destroyOnClose
      bodyStyle={{
        maxHeight: "80vh",
        overflowY: "auto",
        padding: isMobile ? "12px" : "24px",
      }}
      style={{top: 20}}
    >
      {selectedUser && (
        <StudentAttendanceCalendar
          userId={selectedUser.id}
          visible={visible}
          onCancel={onCancel}
          isMobile={isMobile}
        />
      )}
    </Modal>
  );
};

export default AttendanceHistoryModal;
