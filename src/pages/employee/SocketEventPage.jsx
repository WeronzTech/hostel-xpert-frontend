import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button, Table, Tag, Space } from "antd";
import { FiPlus } from "react-icons/fi";
import { AiOutlineEdit } from "react-icons/ai";
import { MdDelete } from "react-icons/md";

import { getAllEventPermissions } from "../../hooks/employee/useEmployee";
import { ActionButton, PageHeader } from "../../components";
import { redButton } from "../../data/common/color";
import AddEventModal from "../../modals/employee/events/AddEventModal";
import EditEventModal from "../../modals/employee/events/EditEventModal";
import DeleteEventModal from "../../modals/employee/events/DeleteEventModal";

const SocketEventPage = () => {
  // State for managing modals and selected data
  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);
  const [isEditEventModalOpen, setIsEditEventModalOpen] = useState(false);
  const [isDeleteEventModalOpen, setIsDeleteEventModalOpen] = useState(false);
  const [selectedData, setSelectedData] = useState(null);

  // Fetching event permissions data using react-query
  const { data: eventPermissions, isLoading } = useQuery({
    queryKey: ["eventPermissions"],
    queryFn: () => getAllEventPermissions(), // This function calls your GET all endpoint
  });

  // --- Table Column Definitions ---
  const columns = [
    {
      title: "Event Name",
      dataIndex: "eventName",
      key: "eventName",
      render: (text) => <span className="font-semibold">{text}</span>,
    },
    {
      title: "Permitted Roles",
      dataIndex: "userRoles",
      key: "userRoles",
      render: (userRoles) => (
        <>
          {/* Display up to 3 roles, then show a "+ more" tag */}
          {userRoles?.slice(0, 3).map((role) => (
            <Tag color="cyan" key={role._id}>
              {role.roleName}
            </Tag>
          ))}
          {userRoles?.length > 3 && <Tag>+{userRoles.length - 3} more</Tag>}
        </>
      ),
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

  // --- Handler Functions ---
  const handleEdit = (record) => {
    setSelectedData(record);
    setIsEditEventModalOpen(true);
  };

  const handleDelete = (record) => {
    setSelectedData(record);
    setIsDeleteEventModalOpen(true);
  };

  return (
    <>
      <div>
        <PageHeader
          title="Socket Event Permissions"
          subtitle="Manage which roles can trigger specific socket events"
        />
        <div className="p-4 mb-6 flex justify-between items-center">
          <div></div>
          <div className="me-[20px]">
            <Button
              type="primary"
              icon={<FiPlus />}
              onClick={() => setIsAddEventModalOpen(true)}
            >
              Add Event
            </Button>
          </div>
        </div>
        <Table
          columns={columns}
          dataSource={eventPermissions}
          loading={isLoading}
          rowKey="_id"
          pagination={{ pageSize: 10 }}
        />
      </div>

      {/* --- Modals for CRUD Operations --- */}
      <AddEventModal
        open={isAddEventModalOpen}
        onClose={() => setIsAddEventModalOpen(false)}
      />
      <EditEventModal
        open={isEditEventModalOpen}
        onClose={() => setIsEditEventModalOpen(false)}
        eventPermission={selectedData}
      />
      <DeleteEventModal
        open={isDeleteEventModalOpen}
        onClose={() => setIsDeleteEventModalOpen(false)}
        eventPermission={selectedData}
      />
    </>
  );
};

export default SocketEventPage;
