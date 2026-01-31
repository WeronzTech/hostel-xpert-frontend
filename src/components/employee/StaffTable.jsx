import {
  Avatar,
  Space,
  Spin,
  Table,
  Tag,
  Button,
  Switch,
  Dropdown,
  Tooltip,
} from "antd";
import {
  UserOutlined,
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
  CreditCardOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import PaymentModal from "../../modals/employee/staff/PaymentModal"; // 👈 Import modal

const StaffTable = ({
  staffList,
  loading,
  onEdit,
  onDelete,
  onStatusChange,
}) => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);

  // Open modal
  const handleOpenModal = (record) => {
    setSelectedStaff(record);
    setIsModalOpen(true);
  };

  // Close modal
  const handleCancel = () => {
    setIsModalOpen(false);
    setSelectedStaff(null);
  };

  // Handle submit
  const handlePaymentSubmit = (values, staff) => {
    console.log("Payment Submitted:", { values, staff });
    // You can replace this console.log with your API call
    setIsModalOpen(false);
  };

  const columns = [
    {
      title: "#",
      key: "serial",
      render: (_, __, index) => index + 1,
    },
    {
      title: "Employee ID",
      dataIndex: "staffId",
      key: "employeeId",
      render: (_, record) => (
        <a
          onClick={(e) => {
            e.stopPropagation();
            const employeeType = record.managerId ? "manager" : "staff";
            navigate(`/employees/${record._id}`, {
              state: { type: employeeType },
            });
          }}
          className="text-blue-600 hover:underline"
        >
          {record.staffId || record.managerId || "N/A"}
        </a>
      ),
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <Space>
          <Avatar src={record.photo} icon={<UserOutlined />} />
          <span>{text}</span>
        </Space>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Contact Number",
      dataIndex: "contactNumber",
      key: "contactNumber",
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (role) => role?.roleName || "N/A",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const color = status === "Active" ? "green" : "red";
        return <Tag color={color}>{status?.toUpperCase()}</Tag>;
      },
    },
    {
      title: "Actions",
      key: "actions",
      align: "center",
      render: (_, record) => {
        const menuItems = [
          {
            key: "1",
            label: "Edit",
            icon: <EditOutlined />,
            onClick: () => onEdit(record),
          },
          {
            key: "2",
            label: "Delete",
            icon: <DeleteOutlined />,
            danger: true,
            onClick: () => onDelete(record),
          },
        ];

        return (
          <Space size="middle">
            <Switch
              checked={record.status === "Active"}
              onChange={(checked) => onStatusChange(record, checked)}
              size="small"
            />
            <Tooltip title="Process Payment" placement="top">
              <Button
                type="text"
                icon={<CreditCardOutlined style={{ color: "#1890ff" }} />}
                shape="circle"
                style={{
                  border: "1px solid #d9d9d9",
                  borderRadius: "15px",
                }}
                onClick={() => handleOpenModal(record)}
              />
            </Tooltip>

            <Dropdown menu={{ items: menuItems }} trigger={["click"]}>
              <Button type="text" icon={<MoreOutlined />} />
            </Dropdown>
          </Space>
        );
      },
    },
  ];

  return (
    <>
      <Spin spinning={loading}>
        <Table
          columns={columns}
          dataSource={staffList}
          rowKey="_id"
          pagination={{ pageSize: 10 }}
          scroll={{ x: "max-content" }}
        />
      </Spin>

      {/* Payment Modal */}
      <PaymentModal
        open={isModalOpen}
        onCancel={handleCancel}
        staff={selectedStaff}
        onSubmit={handlePaymentSubmit}
      />
    </>
  );
};

export default StaffTable;
