import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { IoAddCircleOutline } from "../../icons/index.js";
import {
  ActionButton,
  AlertNotficationModal,
  AlertNotificationTable,
  PageHeader,
} from "../../components/index.js";
import { message } from "antd";
import { notificationService } from "../../hooks/notifications/useNotification.js";
import { useState } from "react";

function AlertNotificationPage({ userId }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const queryClient = useQueryClient();

  // 🟢 Use Query for fetching notifications
  const {
    data: notifications = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["notifications", userId],
    queryFn: async () => {
      const res = await notificationService.getAlertNotification({ userId });
      return res.data.notifications.map((n) => ({
        ...n,
        image: { url: n.imageUrl },
        users: n.userType ? [n.userType] : [],
      }));
    },
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
  });

  // 🟢 Use Mutation for creating notifications
  const createMutation = useMutation({
    mutationFn: async (values) => {
      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("description", values.description);

      if (Array.isArray(values.users)) {
        values.users.forEach((id) => formData.append("userId", id));
      } else if (values.users) {
        formData.append("userId", values.users);
      }

      if (values.image?.originFileObj) {
        formData.append("alertNotificationImage", values.image.originFileObj);
      }

      const res = await notificationService.addAlertNotification(formData);
      return res.data;
    },
    onSuccess: (data) => {
      message.success("Notification sent successfully!");
      // 🟢 Invalidate and refetch notifications to update the list
      queryClient.invalidateQueries({ queryKey: ["notifications", userId] });
      setIsModalOpen(false);
    },
    onError: (err) => {
      console.error("Error sending notification:", err);
      message.error(err?.message || "Failed to send notification");
    },
  });

  // 🟢 Use Mutation for deleting notifications
  const deleteMutation = useMutation({
    mutationFn: (id) => notificationService.deleteAlertNotification(id),
    onSuccess: () => {
      message.success("Notification deleted successfully!");
      // 🟢 Invalidate and refetch notifications to update the list
      queryClient.invalidateQueries({ queryKey: ["notifications", userId] });
    },
    onError: (err) => {
      console.error("Error deleting notification:", err);
      message.error(err?.message || "Failed to delete notification");
    },
  });

  // 🟢 Submit handler using mutation
  const handleSubmit = async (values) => {
    createMutation.mutate(values);
  };

  // 🟢 Delete handler using mutation
  const handleDelete = async (id) => {
    deleteMutation.mutate(id);
  };

  // 🟢 Display error if fetch failed
  if (error) {
    message.error(error?.message || "Failed to fetch notifications");
  }

  return (
    <div className="min-h-screen bg-gray-50 xl:px-12 lg:px-4 lg:pt-6 lg:pb-12 px-4 pt-4 pb-8">
      <PageHeader
        title="Alert Notifications"
        subtitle="Create and deliver critical alerts instantly"
      />

      {/* Create notification button */}
      <div className="flex justify-end mb-4">
        <ActionButton
          icon={<IoAddCircleOutline className="text-lg mt-1" />}
          onClick={() => setIsModalOpen(true)}
          loading={createMutation.isPending}
        >
          Create Notification
        </ActionButton>
      </div>

      {/* Notification Modal */}
      <AlertNotficationModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
      />

      {/* Notification Table with loading state */}
      <div className="mt-4">
        {isLoading ? (
          <div>Loading notifications...</div>
        ) : (
          <AlertNotificationTable
            data={notifications}
            onDelete={handleDelete}
          />
        )}
      </div>
    </div>
  );
}

export default AlertNotificationPage;
