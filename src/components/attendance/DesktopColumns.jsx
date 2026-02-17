import {Space, Tag, Tooltip, Button} from "antd";
import {
  UserOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  CommentOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";

const PRIMARY_COLOR = "#059669";

export const getDesktopColumns = (
  handleViewHistory,
  handleOpenRemarks,
  handleMarkAttendance,
  isLoading,
  markAttendanceMutation,
) => [
  {
    title: "#",
    key: "serialNumber",
    width: 80,
    render: (_, __, index) => index + 1,
  },
  {
    title: "Student Name",
    key: "studentName",
    render: (text, record) => {
      const profileImg = record?.user?.personalDetails?.profileImg;
      const hasRemarks = record?.remarks;

      return (
        <Space>
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
              position: "relative",
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
          <div>
            <div
              style={{
                fontWeight: 500,
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              {record?.user?.name}
              {hasRemarks && (
                <Tooltip title={record.remarks}>
                  <ExclamationCircleOutlined
                    style={{
                      color: "#faad14",
                      cursor: "help",
                      fontSize: "14px",
                    }}
                  />
                </Tooltip>
              )}
            </div>
          </div>
        </Space>
      );
    },
  },
  {
    title: "Contact",
    dataIndex: ["user", "contact"],
    key: "contact",
    render: (contact) => contact || "N/A",
  },
  {
    title: "Room",
    dataIndex: ["user", "stayDetails", "roomNumber"],
    key: "roomNumber",
    render: (roomNumber) => roomNumber || "N/A",
  },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
    render: (status) => {
      const statusConfig = {
        Present: {
          color: "success",
          icon: <CheckCircleOutlined />,
          text: "Present",
        },
        Absent: {
          color: "error",
          icon: <CloseCircleOutlined />,
          text: "Absent",
        },
        Late: {color: "warning", icon: <ClockCircleOutlined />, text: "Late"},
      };
      const config = statusConfig[status];
      return status ? (
        <Tag
          icon={config.icon}
          color={config.color}
          style={{padding: "4px 8px"}}
        >
          {config.text}
        </Tag>
      ) : (
        <Tag color="default">Not Marked</Tag>
      );
    },
  },
  {
    title: "Actions",
    key: "actions",
    width: 420,
    render: (_, record) => {
      const userId = record.user?._id || record._id;

      return (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            whiteSpace: "nowrap",
          }}
        >
          <div style={{borderRight: "1px solid #f0f0f0", paddingRight: "12px"}}>
            <Tooltip title="View History">
              <Button
                shape="circle"
                icon={<CalendarOutlined />}
                onClick={() => handleViewHistory(userId, record.user?.name)}
              />
            </Tooltip>
          </div>

          <div style={{borderRight: "1px solid #f0f0f0", paddingRight: "12px"}}>
            <Tooltip title={record.remarks ? "Edit Remarks" : "Add Remarks"}>
              <Button
                shape="circle"
                icon={<CommentOutlined />}
                type={record.remarks ? "primary" : "default"}
                ghost={record.remarks}
                onClick={() => handleOpenRemarks(record)}
              />
            </Tooltip>
          </div>

          <Space size="small">
            {["Present", "Absent", "Late"].map((status) => {
              const icons = {
                Present: <CheckCircleOutlined />,
                Absent: <CloseCircleOutlined />,
                Late: <ClockCircleOutlined />,
              };

              return (
                <Button
                  key={status}
                  size="small"
                  shape="round"
                  loading={
                    isLoading &&
                    markAttendanceMutation.variables?.status === status
                  }
                  type={record.status === status ? "primary" : "default"}
                  danger={status === "Absent" && record.status === "Absent"}
                  icon={icons[status]}
                  onClick={() =>
                    handleMarkAttendance(
                      userId,
                      status,
                      status === "Late" ? "Late arrival" : "",
                    )
                  }
                >
                  {status}
                </Button>
              );
            })}
          </Space>
        </div>
      );
    },
  },
];
