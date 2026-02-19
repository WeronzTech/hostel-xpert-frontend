import {Modal, Table, Tag, Spin, Alert, Space, Badge} from "antd";
import {CalendarOutlined} from "@ant-design/icons";
import {useQuery} from "@tanstack/react-query";
import dayjs from "dayjs";
import {getUserLeaves} from "../../hooks/users/useUser";

const PRIMARY_COLOR = "#059669";

const UserLeaveHistoryModal = ({visible, onCancel, userId, userName}) => {
  const {
    data: leaveHistory,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["userLeaveHistory", userId],
    queryFn: () => getUserLeaves(userId),
    enabled: !!userId && visible,
  });

  const getStatusTag = (status) => {
    const config = {
      pending: {color: "warning", text: "Pending"},
      approved: {color: "success", text: "Approved"},
      rejected: {color: "error", text: "Rejected"},
    };
    return <Tag color={config[status?.toLowerCase()]?.color}>{status}</Tag>;
  };

  const columns = [
    {
      title: "Leave Type",
      dataIndex: ["categoryId", "name"],
      key: "category",
      render: (name) => name || "General Leave",
    },
    {
      title: "Duration",
      key: "duration",
      render: (_, record) => (
        <div>
          {dayjs(record.fromDate).format("DD MMM YYYY")} -{" "}
          {dayjs(record.toDate).format("DD MMM YYYY")}
        </div>
      ),
    },
    {
      title: "Days",
      dataIndex: "totalDays",
      key: "days",
      render: (days) => (
        <Badge count={days} style={{backgroundColor: PRIMARY_COLOR}} />
      ),
    },
    {
      title: "Reason",
      dataIndex: "reason",
      key: "reason",
      ellipsis: true,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: getStatusTag,
    },
    {
      title: "Admin Comment",
      dataIndex: "adminComment",
      key: "adminComment",
      render: (comment) => comment || "-",
    },
    {
      title: "Reviewed By",
      dataIndex: "adminName",
      key: "adminName",
      render: (name) => name || "-",
    },
  ];

  return (
    <Modal
      title={
        <Space>
          <CalendarOutlined style={{color: PRIMARY_COLOR}} />
          <span>Leave History - {userName}</span>
        </Space>
      }
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={1000}
      destroyOnClose
    >
      {isLoading ? (
        <div style={{textAlign: "center", padding: 50}}>
          <Spin size="large" />
        </div>
      ) : error ? (
        <Alert
          message="Error"
          description={error.message}
          type="error"
          showIcon
        />
      ) : (
        <Table
          columns={columns}
          dataSource={leaveHistory?.data || []}
          rowKey="_id"
          pagination={{
            pageSize: 5,
            showTotal: (total) => `Total ${total} leave requests`,
          }}
        />
      )}
    </Modal>
  );
};

export default UserLeaveHistoryModal;
