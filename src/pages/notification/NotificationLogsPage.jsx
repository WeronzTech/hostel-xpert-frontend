import { useQuery } from "@tanstack/react-query";
import { NotificationLogsTable, PageHeader } from "../../components/index.js";
import { notificationService } from "../../hooks/notifications/useNotification.js"; // import service
import { message, Spin } from "antd";

function NotificationLogsPage({ userId }) {
  // Fetch notification logs using TanStack Query
  const { data: logs = [], isLoading, error } = useQuery({
    queryKey: ["notificationLogs", userId],
    queryFn: async () => {
      // Call API from notificationService
      const logs = await notificationService.getNotificationLogs(userId);
      return logs.map((log) => ({
        key: log._id,
        title: log.title,
        description: log.description,
        image: log.image || "",
        notificationType: log.notificationType || "alertNotification",
        userType: log.userType || [],
        sentAt: log.createdAt,
      }));
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    onError: (err) => {
      message.error(err?.message || "Failed to fetch notification logs");
    },
  });

  return (
    <div className="min-h-screen bg-gray-50 xl:px-12 lg:px-4 lg:pt-6 lg:pb-12 px-4 pt-4 pb-8">
      <PageHeader
        title="Notification Logs"
        subtitle="View the complete history of all sent notifications"
      />

      <div className="bg-white p-4 rounded-md shadow mt-4">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Spin size="large" />
          </div>
        ) : (
          <NotificationLogsTable data={logs} />
        )}
      </div>
    </div>
  );
}

export default NotificationLogsPage;
