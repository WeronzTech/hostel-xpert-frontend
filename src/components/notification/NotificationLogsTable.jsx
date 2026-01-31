import { Table, Tag, Tooltip,Image } from "antd";
import dayjs from "dayjs";
import { useQuery } from "@tanstack/react-query";
import { getResidentById } from "../../hooks/users/useUser.js";

// 🟩 User type mapping
const userGroups = [
  { label: "Mess Only", value: "messOnly" },
  { label: "Students", value: "studentsOnly" },
  { label: "Workers", value: "workersOnly" },
  { label: "Daily Rent", value: "dailyRentOnly" },
];

// 🟩 Utility to map user type
const getUserTypeLabel = (values) => {
  if (!Array.isArray(values)) return [];
  return values.map(
    (val) => userGroups.find((g) => g.value === val)?.label || val
  );
};

// 🟩 Custom hook to fetch resident details
const useResidentData = (residentId) => {
  return useQuery({
    queryKey: ["resident", residentId],
    queryFn: async () => {
      if (!residentId) return null;
      const resident = await getResidentById(residentId);
      return resident;
    },
    enabled: !!residentId,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
};

// 🟩 Resident cell renderer
const ResidentCell = ({ residentId }) => {
  const { data: resident } = useResidentData(residentId);

  const formatUserType = (type) => {
    if (!type) return "Unknown";
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  return (
    <div className="flex flex-col gap-1 items-center">
      <Tooltip title={`${resident?.name || "Unknown"} (${resident?.email || "N/A"})`}>
        <Tag color="blue" className="mb-1">
          {resident?.name || resident?.email || `User ${residentId}`}{" "}
          {resident?.userType ? `(${formatUserType(resident.userType)})` : ""}
        </Tag>
      </Tooltip>
    </div>
  );
};

// 🟩 Notification Logs Table
const NotificationLogsTable = ({ data }) => {
  const columns = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      width: 250,
      align: "center",
      fixed: "left",
      render: (text) => (
        <Tooltip title={text}>
          <span>{text}</span>
        </Tooltip>
      ),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
      width: 300,
      align: "center",
      render: (text) => (
        <Tooltip title={text}>
          <span>{text}</span>
        </Tooltip>
      ),
    },
    {
      title: "Image",
      dataIndex: "image",
      key: "image",
      width: 200,
      align: "center",
      render: (image) =>
        image ? (
          <div className="flex justify-center items-center">
            <Image
              src={
                image.thumbUrl ||
                image.url ||
                (image.originFileObj
                  ? URL.createObjectURL(image.originFileObj)
                  : "")
              }
              alt="notification"
              width={56}
              height={56}
              style={{ objectFit: "cover", borderRadius: 8 }}
              preview={{ mask: "Click to preview" }}
              onError={(e) => {
                e.target.src = "/placeholder-image.png";
              }}
            />
          </div>
        ) : (
          "-"
        ),
    },
    {
      title: "Notification Type",
      dataIndex: "notificationType",
      key: "notificationType",
      width: 180,
      align: "center",
      render: (type) =>
        type === "pushNotification" ? (
          <Tag color="blue">Push Notification</Tag>
        ) : (
          <Tag color="red">Alert Notification</Tag>
        ),
    },
    // {
    //   title: "User Type",
    //   dataIndex: "userType",
    //   key: "userType",
    //   width: 220,
    //   align: "center",
    //   render: (values) =>
    //     getUserTypeLabel(values).length > 0 ? (
    //       getUserTypeLabel(values).map((label) => (
    //         <Tag color="geekblue" key={label}>
    //           {label}
    //         </Tag>
    //       ))
    //     ) : (
    //       <Tag color="default">All Users</Tag>
    //     ),
    // },
    {
      title: "Date Sent",
      dataIndex: "createdAt",
      key: "date",
      width: 120,
      align: "center",
      render: (date) => dayjs(date).format("DD-MM-YYYY"),
    },
    {
      title: "Time Sent",
      dataIndex: "createdAt",
      key: "time",
      width: 100,
      align: "center",
      render: (date) => dayjs(date).format("hh:mm A"),
    },
  ];

  // 🟩 Map backend data to table format
  const tableData = (data || []).map((item) => ({
    key: item._id,
    ...item,
  }));

  return (
    <Table
      dataSource={tableData}
      columns={columns}
      pagination={{ pageSize: 10 }}
      bordered
      scroll={{ x: 1000 }}
    />
  );
};

export default NotificationLogsTable;
