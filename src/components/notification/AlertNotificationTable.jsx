import { Table, Tag, Tooltip, Popconfirm, Spin, Image } from "antd";
import { useQuery } from "@tanstack/react-query";
import ActionButton from "../common/ActionButton";
import { IoTrashOutline } from "../../icons/index.js";
import { getResidentById } from "../../hooks/users/useUser.js";

// Custom hook to fetch resident data
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

// Component to display resident information with user type
const ResidentCell = ({ residentId }) => {
  const { data: resident, isLoading, error } = useResidentData(residentId);

  if (isLoading) {
    return <Spin size="small" />;
  }

  if (error || !resident) {
    return (
      <div className="text-center">
        <Tag color="default">User not found</Tag>
      </div>
    );
  }

  // Format user type for display
  const formatUserType = (type) => {
    if (!type) return "Unknown";
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  return (
    <div className="flex flex-col gap-1 items-center">
      <Tooltip title={`${resident.name} (${resident.email})`}>
        <Tag color="blue" className="mb-1">
          {resident.name || resident.email || `User ${residentId}`}{" "}
          {resident.userType ? `(${formatUserType(resident.userType)})` : ""}
        </Tag>
      </Tooltip>
    </div>
  );
};

const AlertNotificationTable = ({
  data = [],
  onDelete,
  isLoading = false,
  isDeleting = false,
  deletingId = null,
}) => {
  const columns = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      width: 180,
      align: "center",
      ellipsis: true,
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
      width: 220,
      align: "center",
      ellipsis: true,
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
      title: "Sent To User",
      dataIndex: "userId",
      key: "userId",
      align: "center",
      width: 200,
      render: (userId, record) => {
        const actualUserId = userId || record.userId;

        if (!actualUserId) {
          return <Tag color="default">All users</Tag>;
        }

        return <ResidentCell residentId={actualUserId} />;
      },
    },
    {
      title: "Actions",
      key: "actions",
      width: 100,
      align: "center",
      render: (_, record) => (
        <div className="flex justify-center">
          <Popconfirm
            title="Are you sure you want to delete this notification?"
            onConfirm={() => onDelete && onDelete(record._id)}
            okText="Yes"
            cancelText="No"
            disabled={isDeleting}
          >
            <ActionButton
              icon={
                isDeleting && deletingId === record._id ? (
                  <Spin size="small" />
                ) : (
                  <IoTrashOutline className="text-lg mt-1" />
                )
              }
              danger
              loading={isDeleting && deletingId === record._id}
              disabled={isDeleting}
            />
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <>
      {/* Fullscreen loading spinner */}
      <Spin 
        spinning={isLoading} 
        fullscreen 
        // tip="Loading notifications..." 
        size="large"
      />
      
      <div className="bg-white p-4 rounded-md shadow-sm">
        <Table
          columns={columns}
          dataSource={data}
          rowKey={(record) => record._id || record.key}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} items`,
          }}
          bordered
          scroll={{ x: 1000 }}
          locale={{
            emptyText: "No notifications found",
          }}
        />
      </div>
    </>
  );
};

export default AlertNotificationTable;