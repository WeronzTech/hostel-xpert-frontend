import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button, Table, Tag, Space } from "antd";
import { FiPlus } from "react-icons/fi";
import { getAllRoles } from "../../hooks/employee/useEmployee";
import PageHeader from "../../components/common/PageHeader"; // Assuming this function exists
import { redButton } from "../../data/common/color";
import { AiOutlineEdit } from "react-icons/ai";
import { MdDelete } from "react-icons/md";
import ActionButton from "../common/ActionButton";
import AddRoleModal from "../../modals/employee/role/AddRoleModal";
import EditRoleModal from "../../modals/employee/role/EditRoleModal";
import DeleteRoleModal from "../../modals/employee/role/DeleteRoleModal";

const RolePage = () => {
  const [isAddRoleModalOpen, setIsAddRoleModalOpen] = useState(false);
  const [isEditRoleModalOpen, setIsEditRoleModalOpen] = useState(false);
  const [isDeleteRoleModalOpen, setIsDeleteRoleModalOpen] = useState(false);
  const [selectedData, setSelectedData] = useState(null);

  const { data: rolesData, isLoading } = useQuery({
    queryKey: ["roles"],
    queryFn: () => getAllRoles(),
  });

  const columns = [
    {
      title: "Role Name",
      dataIndex: "roleName",
      key: "roleName",
      render: (text) => <span className="font-semibold">{text}</span>,
    },
    {
      title: "Permissions",
      dataIndex: "permissions",
      key: "permissions",
      render: (permissions) => (
        <>
          {permissions.slice(0, 3).map((permission) => (
            <Tag color="blue" key={permission}>
              {permission}
            </Tag>
          ))}
          {permissions.length > 3 && <Tag>+{permissions.length - 3} more</Tag>}
        </>
      ),
    },
    {
      title: "Reports To",
      dataIndex: "reportTo",
      key: "reportTo",
      render: (reportTo) => reportTo?.roleName || "N/A",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          <ActionButton
            icon={<AiOutlineEdit />}
            onClick={() => handleEdit(record)}
          />
          <ActionButton
            customTheme={redButton}
            icon={<MdDelete />}
            onClick={() => handleDelete(record)}
          />
        </Space>
      ),
    },
  ];

  const handleEdit = (record) => {
    setSelectedData(record);
    setIsEditRoleModalOpen(true);
  };

  const handleDelete = (record) => {
    setSelectedData(record);
    setIsDeleteRoleModalOpen(true);
  };

  return (
    <>
      <div>
        <PageHeader
          title="Roles & Permissions"
          subtitle="Manage user roles and their associated permissions"
        />
        <div className="p-4 mb-6 flex justify-between items-center">
          <div></div>
          <div className="me-[20px]">
            <Button
              type="primary"
              icon={<FiPlus />}
              onClick={() => setIsAddRoleModalOpen(true)}
            >
              Add Role
            </Button>
          </div>
        </div>
        <Table
          columns={columns}
          dataSource={rolesData}
          loading={isLoading}
          rowKey="_id"
          pagination={{ pageSize: 10 }}
        />
      </div>
      <AddRoleModal
        open={isAddRoleModalOpen}
        onClose={() => setIsAddRoleModalOpen(false)}
      />
      <EditRoleModal
        open={isEditRoleModalOpen}
        onClose={() => setIsEditRoleModalOpen(false)}
        role={selectedData}
      />
      <DeleteRoleModal
        open={isDeleteRoleModalOpen}
        onClose={() => setIsDeleteRoleModalOpen(false)}
        role={selectedData}
      />
    </>
  );
};

export default RolePage;
