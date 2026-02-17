import {Tooltip, Dropdown, Button} from "antd";
import {
  UserOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  // CalendarOutlined,
  // CommentOutlined,
  ExclamationCircleOutlined,
  DownOutlined,
} from "@ant-design/icons";

const PRIMARY_COLOR = "#059669";

export const getMobileColumns = (
  handleViewStudentDetails,
  // handleViewHistory,
  // handleOpenRemarks,
  handleMarkAttendance,
) => [
  {
    title: "Student",
    key: "student",
    render: (_, record, index) => {
      const profileImg = record?.user?.personalDetails?.profileImg;
      const hasRemarks = record?.remarks;
      const status = record?.status;

      const statusColors = {
        Present: "#52c41a",
        Absent: "#f5222d",
        Late: "#faad14",
      };

      return (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            cursor: "pointer",
          }}
          onClick={() => handleViewStudentDetails(record)}
        >
          {/* Serial Number with subtle background */}
          <div
            style={{
              width: 28,
              textAlign: "center",
              fontSize: "13px",
              fontWeight: "500",
              color: "#8c8c8c",
              borderRight: "1px solid #f0f0f0",
              paddingRight: "8px",
              marginRight: "4px",
            }}
          >
            {index + 1}
          </div>

          <div style={{position: "relative"}}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                overflow: "hidden",
                backgroundColor: PRIMARY_COLOR + "20",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
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
          </div>
          <div style={{flex: 1}}>
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
                    style={{color: "#faad14", fontSize: "12px"}}
                  />
                </Tooltip>
              )}
            </div>
            <div style={{fontSize: "12px", color: "#666"}}>
              Room: {record?.user?.stayDetails?.roomNumber || "N/A"} •
              <span
                style={{
                  color: statusColors[status] || "#999",
                  marginLeft: "4px",
                }}
              >
                {status || "Not Marked"}
              </span>
            </div>
          </div>
        </div>
      );
    },
  },
  {
    title: "Actions",
    key: "actions",
    width: 100,
    render: (_, record) => {
      const userId = record.user?._id || record._id;

      return (
        <Dropdown
          menu={{
            items: [
              {
                key: "present",
                label: "Mark Present",
                icon: <CheckCircleOutlined style={{color: "#52c41a"}} />,
                onClick: () => handleMarkAttendance(userId, "Present", ""),
              },
              {
                key: "absent",
                label: "Mark Absent",
                icon: <CloseCircleOutlined style={{color: "#f5222d"}} />,
                onClick: () => handleMarkAttendance(userId, "Absent", ""),
              },
              {
                key: "late",
                label: "Mark Late",
                icon: <ClockCircleOutlined style={{color: "#faad14"}} />,
                onClick: () =>
                  handleMarkAttendance(userId, "Late", "Late arrival"),
              },
              //   {
              //     type: "divider",
              //   },
              //   {
              //     key: "history",
              //     label: "View History",
              //     icon: <CalendarOutlined />,
              //     onClick: () => handleViewHistory(userId, record.user?.name),
              //   },
              //   {
              //     key: "remarks",
              //     label: record.remarks ? "Edit Remarks" : "Add Remarks",
              //     icon: <CommentOutlined />,
              //     onClick: () => handleOpenRemarks(record),
              //   },
            ],
          }}
          trigger={["click"]}
        >
          <Button size="middile" icon={<DownOutlined />}>
            Actions
          </Button>
        </Dropdown>
      );
    },
  },
];
