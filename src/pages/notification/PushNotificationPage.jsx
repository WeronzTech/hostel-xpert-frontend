import { useState } from "react";
import { IoAddCircleOutline, IoFilter } from "../../icons/index.js";
import {
  PushNotificationModal,
  PushNotificationTable,
  PageHeader,
  ActionButton,
  ErrorState,
  ConfirmationModal,
} from "../../components/index.js";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notificationService } from "../../hooks/notifications/useNotification.js";
import LoadingSpinner from "../../ui/loadingSpinner/LoadingSpinner.jsx";
import { Button, Checkbox, Dropdown, message } from "antd";

function PushNotificationPage() {
  const queryClient = useQueryClient();
  const [messageApi, contextHolder] = message.useMessage();
  const [selectedId, setSelectedId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);

  // State for filters
  const [filters, setFilters] = useState({
    studentOnly: false,
    workerOnly: false,
    dailyRentOnly: false,
    messOnly: false,
  });

  // Fetch all push notifications using tanstack query
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["pushNotifications", filters],
    queryFn: () => {
      const activeFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value) // keep only true
      );
      return notificationService.getPushNotifications(activeFilters);
    },
  });

  // Create push notification using tanstack query
  const createNotification = useMutation({
    mutationFn: (payload) =>
      notificationService.createPushNotification(payload),
    onSuccess: () => {
      queryClient.invalidateQueries(["pushNotifications"]);
      messageApi.success("Push notification created successfully!");
      setIsModalOpen(false); // close modal after success
    },
    onError: () => {
      const errMsg = "Failed to create push notification";
      messageApi.error(errMsg);
    },
  });

  // Delete push notification using tanstack query
  const deleteNotification = useMutation({
    mutationFn: (id) => notificationService.deletePushNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["pushNotifications"]);
      messageApi.success("Push notification deleted successfully!");
      setIsDeleteModalOpen(false);
    },
    onError: () => {
      messageApi.error("Failed to delete push notification");
    },
  });

  // Send push notification using tanstack query
  const sendNotification = useMutation({
    mutationFn: (id) => notificationService.sendPushNotification(id),
    onSuccess: () => {
      messageApi.success("Push notification sent successfully!");
      setIsSendModalOpen(false);
    },
    onError: () => {
      messageApi.error("Failed to send push notification");
    },
  });

  // Transform backend data
  const transformedNotifications =
    data?.notifications?.map((n) => ({
      ...n,
      image: { url: n.imageUrl }, // match table's image format
      users: [
        n.studentOnly && "studentOnly",
        n.messOnly && "messOnly",
        n.workerOnly && "workerOnly",
        n.dailyRentOnly && "dailyRentOnly",
      ].filter(Boolean), // remove false/null
    })) || [];

  // Action handler for creating push notification
  const handleCreateNotification = async (formData) => {
    const { resetModal, ...values } = formData;

    const fd = new FormData();

    fd.append("title", values.title);
    fd.append("description", values.description);
    fd.append("messOnly", values.users.includes("messOnly"));
    fd.append("studentOnly", values.users.includes("studentOnly"));
    fd.append("workerOnly", values.users.includes("workerOnly"));
    fd.append("dailyRentOnly", values.users.includes("dailyRentOnly"));

    if (values.image) {
      fd.append("pushNotifications", values.image); // This name MUST match multer's `upload.single("image")`
    }

    // console.log("FormData being sent to backend:", [...fd.entries()]); // debug log
    await createNotification.mutateAsync(fd);
    resetModal();
    setIsModalOpen(false);
  };

  // Action handler for deleting push notification
  const handleDeleteClick = (id) => {
    setSelectedId(id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedId) {
      deleteNotification.mutate(selectedId);
    }
  };

  // Action handler for sending push notification
  const handleSendClick = (id) => {
    setSelectedId(id);
    setIsSendModalOpen(true);
  };

  const handleConfirmSend = () => {
    if (selectedId) {
      sendNotification.mutate(selectedId);
    }
  };

  // Filter dropdown content
  const filterMenu = (
    <div
      style={{
        padding: 12,
        width: 240,
        background: "#fff",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        borderRadius: 4,
      }}
    >
      <div className="mb-3 text-md font-semibold">
        User Types
      </div>
      {/* First row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 8,
        }}
      >
        <Checkbox
          checked={filters.studentOnly}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, studentOnly: e.target.checked }))
          }
        >
          Student
        </Checkbox>
        <Checkbox
          checked={filters.workerOnly}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, workerOnly: e.target.checked }))
          }
        >
          Worker
        </Checkbox>
      </div>

      {/* Second row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 8,
        }}
      >
        <Checkbox
          checked={filters.messOnly}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, messOnly: e.target.checked }))
          }
        >
          Mess Only
        </Checkbox>
        <Checkbox
          checked={filters.dailyRentOnly}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, dailyRentOnly: e.target.checked }))
          }
        >
          Daily Rent
        </Checkbox>
      </div>

      {/* Clear button */}
      <Button
        type="link"
        style={{ padding: 0 }}
        onClick={() =>
          setFilters({
            studentOnly: false,
            workerOnly: false,
            dailyRentOnly: false,
            messOnly: false,
          })
        }
      >
        Clear All
      </Button>
    </div>
  );

  // Loading state
  if (isLoading) return <LoadingSpinner />;

  // Error state
  if (isError) {
    const msg = error?.message || "Something went wrong";

    return (
      <ErrorState
        message="Failed to load push notifications"
        description={msg}
        onAction={() => refetch()}
        actionText="Try AGain"
      />
    );
  }

  return (
    <>
      {contextHolder}
      {/* Header */}
      <div className="min-h-screen bg-gray-50 xl:px-12 lg:px-4 lg:pt-6 lg:pb-12 px-4 pt-4 pb-8">
        <PageHeader
          title="Push Notifications"
          subtitle="Create, manage, and send real-time notifications to users"
        />

        <div className="flex justify-between mb-4">
          {/* Filter button */}
          <Dropdown
            popupRender={() => filterMenu}
            trigger={["click"]}
            placement="bottomRight"
          >
            <ActionButton
              type="default"
              icon={<IoFilter className="text-lg mt-1" />}
            >
              Filters
            </ActionButton>
          </Dropdown>
          {/* Create push notification button */}
          <ActionButton
            icon={<IoAddCircleOutline className="text-lg mt-1" />}
            onClick={() => setIsModalOpen(true)}
          >
            Create Notification
          </ActionButton>
        </div>

        {/* Push Notification Modal */}
        <PushNotificationModal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleCreateNotification}
          loading={createNotification.isPending}
        />

        {/* Push Notification Table */}
        <div className="mt-4">
          <PushNotificationTable
            data={transformedNotifications}
            onDelete={handleDeleteClick}
            onSend={handleSendClick}
          />
        </div>

        {/* Delete Confirmation Modal */}
        <ConfirmationModal
          open={isDeleteModalOpen}
          title="Delete Push Notification"
          message="Are you sure you want to delete this push notification?"
          confirmText="Delete"
          cancelText="Cancel"
          variant="danger"
          confirmLoading={deleteNotification.isPending}
          onConfirm={handleConfirmDelete}
          onCancel={() => setIsDeleteModalOpen(false)}
        />

        {/* Send Confirmation Modal */}
        <ConfirmationModal
          open={isSendModalOpen}
          title="Send Push Notification"
          message="Are you sure you want to send this push notification?"
          confirmText="Send"
          cancelText="Cancel"
          confirmLoading={sendNotification.isPending}
          variant="primary"
          onConfirm={handleConfirmSend}
          onCancel={() => setIsSendModalOpen(false)}
        />
      </div>
    </>
  );
}

export default PushNotificationPage;
