import {useQuery} from "@tanstack/react-query";
import {Modal, Typography, Avatar, Spin, Empty, Timeline, Tag} from "antd";
import {
  FiActivity,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiAlertCircle,
  FiUser,
  FiMessageSquare,
  FiLogIn,
  FiLogOut,
  FiCalendar,
} from "react-icons/fi";
import dayjs from "dayjs";
import {getUserStatusRequests} from "../../../hooks/users/useUser";

const {Text, Title} = Typography;

const ActivityTimelineModal = ({residentId, visible, onClose}) => {
  const {data, isLoading, isError, error} = useQuery({
    queryKey: ["userStatusRequests", residentId],
    queryFn: () => getUserStatusRequests(residentId),
    enabled: visible,
  });

  // Status configuration
  const statusConfig = {
    approved: {
      icon: <FiCheckCircle className="text-emerald-500" />,
      color: "green",
      label: "Approved",
    },
    rejected: {
      icon: <FiXCircle className="text-rose-500" />,
      color: "red",
      label: "Rejected",
    },
    pending: {
      icon: <FiClock className="text-rose-500" />,
      color: "red",
      label: "Pending",
    },
    default: {
      icon: <FiAlertCircle className="text-gray-500" />,
      color: "gray",
      label: "Unknown",
    },
  };

  // Activity type configuration
  const activityConfig = {
    checked_in: {
      icon: <FiLogIn className="text-green-500" />,
      label: "Checked In",
      color: "green",
    },
    checked_out: {
      icon: <FiLogOut className="text-red-500" />,
      label: "Checked Out",
      color: "red",
    },
    on_leave: {
      icon: <FiCalendar className="text-yellow-500" />,
      label: "Leave Request",
      color: "yellow",
    },
    default: {
      icon: <FiUser className="text-gray-500" />,
      label: "Status Change",
      color: "gray",
    },
  };

  if (isError) {
    return (
      <Modal
        title={
          <div className="flex items-center gap-3">
            <div className="bg-indigo-100 p-2 rounded-lg">
              <FiActivity className="text-indigo-600 text-xl" />
            </div>
            <Title level={5} className="mb-0">
              Activity History
            </Title>
          </div>
        }
        open={visible}
        onCancel={onClose}
        footer={null}
        centered
        width={600}
      >
        <Empty
          image={<FiAlertCircle className="text-4xl text-rose-500" />}
          description={
            <div className="flex flex-col items-center">
              <Text className="text-lg font-medium text-gray-800 mb-1">
                Failed to load activity data
              </Text>
              <Text className="text-gray-500 text-center">
                {error.message || "Please try again later"}
              </Text>
            </div>
          }
        />
      </Modal>
    );
  }

  return (
    <Modal
      title={
        <div className="flex items-center gap-3">
          <div className="bg-indigo-100 p-2 rounded-lg">
            <FiActivity className="text-indigo-600 text-xl" />
          </div>
          <div>
            <Title level={5} className="mb-0">
              Resident Activity Timeline
            </Title>
          </div>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={700}
      centered
      className="activity-timeline-modal"
    >
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Spin size="large" />
        </div>
      ) : (
        <div className="flex flex-col h-full">
          {/* Activity timeline */}
          <div
            className="p-3 overflow-y-auto scrollbar-hide"
            style={{maxHeight: "60vh"}}
          >
            {data?.requests?.length ? (
              <Timeline
                mode="left"
                className="custom-timeline"
                items={data.requests.map((item) => {
                  const status =
                    statusConfig[item.status] || statusConfig.default;
                  const activity =
                    activityConfig[item.type] || activityConfig.default;

                  return {
                    color: status.color,
                    children: (
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                            <div
                              className={`bg-${activity.color}-100 p-2 rounded-lg`}
                            >
                              {activity.icon}
                            </div>
                            <div>
                              <Text
                                strong
                                className={`text-${activity.color}-600`}
                              >
                                {activity.label}
                              </Text>
                              <div className="flex items-center gap-2 mt-1">
                                <Text type="secondary" className="text-xs">
                                  {dayjs(item.requestedAt).format(
                                    "MMM D, YYYY • h:mm A"
                                  )}
                                </Text>
                                <Tag color={status.color} className="text-xs">
                                  {status.label}
                                </Tag>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Activity content */}
                        <div className="mt-3 space-y-2">
                          {item.reason && (
                            <div className="flex gap-2 bg-white p-2 rounded border border-gray-100">
                              <FiMessageSquare className="text-gray-400 mt-0.5 flex-shrink-0" />
                              <Text className="text-sm text-gray-700">
                                <span className="font-medium">Note:</span>{" "}
                                {item.reason}
                              </Text>
                            </div>
                          )}

                          {item.reviewerComment && (
                            <div className="flex gap-2 bg-white p-2 rounded border border-gray-100">
                              <Avatar
                                size="small"
                                className="bg-indigo-100 text-indigo-600"
                              >
                                <FiUser size={12} />
                              </Avatar>
                              <Text className="text-sm text-gray-700">
                                <span className="font-medium">Admin:</span>{" "}
                                {item.reviewerComment}
                              </Text>
                            </div>
                          )}
                        </div>

                        {/* Review details */}
                        {item.reviewedAt && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <Text type="secondary" className="text-xs">
                              Reviewed on{" "}
                              {dayjs(item.reviewedAt).format(
                                "MMM D, YYYY • h:mm A"
                              )}
                              {item.reviewedBy && (
                                <>
                                  {" "}
                                  by{" "}
                                  <span className="font-medium">
                                    {item.reviewedBy}
                                  </span>
                                </>
                              )}
                            </Text>
                          </div>
                        )}
                      </div>
                    ),
                  };
                })}
              />
            ) : (
              <Empty
                description={
                  <div className="flex flex-col items-center">
                    <Text className="text-gray-800 font-medium mb-1">
                      No activities found
                    </Text>
                    <Text className="text-gray-500 text-sm">
                      This resident has no recorded activities yet
                    </Text>
                  </div>
                }
                className="py-12"
                imageStyle={{height: 80}}
              />
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-3 border-t border-gray-200  flex justify-center items-center">
            <Text type="secondary" className="text-xs">
              Showing {data?.requests?.length || 0} of {data?.total || 0}{" "}
              activities
            </Text>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default ActivityTimelineModal;
