import {Table, Button, Tag, Tooltip, Dropdown} from "antd";
import {FiCheck, FiX, FiClock, FiCalendar} from "react-icons/fi";
import dayjs from "dayjs";

const AttendanceTable = ({attendanceRecords, loading, onQuickAttendance}) => {
  console.log(attendanceRecords);
  const handleQuickStatusChange = (record, status) => {
    const attendanceData = {
      employeeId: record._id,
      employeeName: record.name,
      employeeType: record.staffId
        ? "Staff"
        : record.managerId
        ? "Manager"
        : "Employee",
      propertyId: record.propertyId,
      date: new Date().toISOString().split("T")[0],
      status: status,
      remarks: `Quick marked as ${status}`,
    };
    onQuickAttendance(attendanceData);
  };

  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = now.getFullYear();
  const currentMonthYear = `${month}-${year}`;

  // Get button config based on today's status
  const getButtonConfig = (record) => {
    const todayStatus = record.todayStatus;

    const configs = {
      Present: {
        color: "#52c41a",
        backgroundColor: "#f6ffed",
        borderColor: "#b7eb8f",
        text: "Present",
        icon: <FiCheck />,
      },
      Absent: {
        color: "#ff4d4f",
        backgroundColor: "#fff2f0",
        borderColor: "#ffccc7",
        text: "Absent",
        icon: <FiX />,
      },
      "Paid Leave": {
        color: "#1890ff",
        backgroundColor: "#f0f8ff",
        borderColor: "#91d5ff",
        text: "Paid Leave",
        icon: <FiCalendar />,
      },
      "Half Day": {
        color: "#fa8c16",
        backgroundColor: "#fff7e6",
        borderColor: "#ffd591",
        text: "Half Day",
        icon: <FiClock />,
      },
      "Not Marked": {
        color: "#d9d9d9",
        backgroundColor: "#fafafa",
        borderColor: "#d9d9d9",
        text: "Mark Attendance",
        icon: <FiClock />,
      },
    };

    return configs[todayStatus] || configs["Not Marked"];
  };

  const columns = [
    {
      title: "#",
      key: "serial",
      render: (_, __, index) => index + 1,
      width: 60,
      align: "center",
      fixed: "left",
    },
    {
      title: "Employee Name",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <div>
          <div className="font-medium">{text}</div>
        </div>
      ),
    },
    {
      title: "Job Title",
      dataIndex: "jobTitle",
      key: "jobTitle",
      align: "center",
      render: (jobTitle) =>
        jobTitle ? (
          <Tooltip title={jobTitle}>
            <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
              {jobTitle}
            </span>
          </Tooltip>
        ) : (
          <span className="text-gray-400">N/A</span>
        ),
    },
    {
      title: "Type / Department",
      dataIndex: "department",
      key: "department",
      align: "center",
      render: (text, record) => {
        const employeeType = record.staffId
          ? "Staff"
          : record.managerId
          ? "Manager"
          : "Employee";
        return (
          <div>
            <Tag color={employeeType === "Manager" ? "purple" : "blue"}>
              {employeeType}
            </Tag>
            {text && <Tag color="geekblue">{text}</Tag>}
          </div>
        );
      },
    },
    {
      title: `Total Present (${currentMonthYear})`,
      dataIndex: "monthlyPresentDays",
      key: "monthlyPresentDays",
      align: "center",
      render: (count) => (
        <Tooltip title={count}>
          <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
            {count ?? 0} days
          </span>
        </Tooltip>
      ),
    },
    // {
    //   title: "Last Day Status",
    //   dataIndex: "lastDayStatus",
    //   key: "lastDayStatus",
    //   align: "center",
    //   render: (_, record) => {
    //     // Determine if today's attendance is already marked
    //     const today = new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"
    //     const attendanceDate = record?.todayAttendanceDate
    //       ? new Date(record.todayAttendanceDate).toISOString().split("T")[0]
    //       : null;

    //     const isTodayMarked =
    //       record?.todayStatus &&
    //       record.todayStatus !== "Not Marked" &&
    //       attendanceDate === today;

    //     // If today's attendance not marked, display today's status (if available)
    //     const statusToShow = !isTodayMarked
    //       ? record.todayStatus || record.lastDayStatus
    //       : record.lastDayStatus;

    //     if (!statusToShow || statusToShow === "Not Marked") {
    //       return <Tag color="default">Not Marked</Tag>;
    //     }

    //     let color;
    //     switch (statusToShow) {
    //       case "Present":
    //         color = "green";
    //         break;
    //       case "Absent":
    //         color = "red";
    //         break;
    //       case "Paid Leave":
    //         color = "blue";
    //         break;
    //       case "Half Day":
    //         color = "orange";
    //         break;
    //       default:
    //         color = "default";
    //     }

    //     return <Tag color={color}>{statusToShow}</Tag>;
    //   },
    // },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      align: "center",
      render: (status) => (
        <Tag color={status === "Active" ? "green" : "red"}>{status}</Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      align: "center",
      width: 140,
      render: (_, record) => {
        if (record.status !== "Active") {
          return (
            <Tooltip title="Employee is inactive">
              <Button
                type="default"
                size="small"
                disabled
                style={{
                  color: "#d9d9d9",
                  borderColor: "#d9d9d9",
                  backgroundColor: "#f5f5f5",
                }}
              >
                Mark Attendance
              </Button>
            </Tooltip>
          );
        }

        const buttonConfig = getButtonConfig(record);

        const menuItems = [
          {
            key: "present",
            label: (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 0",
                }}
                onClick={() => handleQuickStatusChange(record, "Present")}
              >
                <FiCheck style={{color: "#52c41a"}} />
                <span>Present</span>
              </div>
            ),
          },
          {
            key: "absent",
            label: (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 0",
                }}
                onClick={() => handleQuickStatusChange(record, "Absent")}
              >
                <FiX style={{color: "#ff4d4f"}} />
                <span>Absent</span>
              </div>
            ),
          },
          {
            key: "leave",
            label: (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 0",
                }}
                onClick={() => handleQuickStatusChange(record, "Paid Leave")}
              >
                <FiCalendar style={{color: "#1890ff"}} />
                <span>Paid Leave</span>
              </div>
            ),
          },
          {
            key: "half Day",
            label: (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 0",
                }}
                onClick={() => handleQuickStatusChange(record, "Half Day")}
              >
                <FiClock style={{color: "#fa8c16"}} />
                <span>Half Day</span>
              </div>
            ),
          },
        ];

        // ✅ Determine if today’s attendance is already marked
        const today = dayjs().format("YYYY-MM-DD");
        const attendanceDate = record?.todayAttendanceDate
          ? dayjs(record.todayAttendanceDate).format("YYYY-MM-DD")
          : null;

        const isTodayMarked =
          record?.todayStatus &&
          record.todayStatus !== "Not Marked" &&
          attendanceDate === today;

        // ✅ If already marked for today, show static status button
        if (isTodayMarked) {
          console.log("isTodayMarked");
          return (
            <Button
              size="small"
              icon={buttonConfig.icon}
              loading={loading}
              style={{
                color: buttonConfig.color,
                backgroundColor: buttonConfig.backgroundColor,
                borderColor: buttonConfig.borderColor,
                fontWeight: 500,
                cursor: "default", // 👈 disables pointer cursor
              }}
            >
              {buttonConfig.text}
            </Button>
          );
        }

        // ✅ If not marked today, show dropdown to mark attendance
        return (
          <Dropdown
            menu={{items: menuItems}}
            placement="bottomRight"
            trigger={["hover"]}
          >
            <Button type="primary" size="small" loading={loading}>
              Mark Attendance
            </Button>
          </Dropdown>
        );
      },
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={attendanceRecords}
      loading={loading}
      rowKey="_id"
      pagination={{
        pageSize: 10,
      }}
      scroll={{x: 1200}}
    />
  );
};

export default AttendanceTable;
