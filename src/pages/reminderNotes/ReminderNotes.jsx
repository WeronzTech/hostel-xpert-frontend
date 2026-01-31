import {PageHeader} from "../../components/index.js";
import {useSelector} from "react-redux";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {
  completeReminder,
  getActiveReminders,
  snoozeReminder,
} from "../../hooks/users/useUser.js";
import {useNavigate} from "react-router-dom";
import {Empty, Popconfirm, DatePicker, Input, message, Spin} from "antd";
import {useState} from "react";
import {EyeOutlined} from "@ant-design/icons";
import dayjs from "dayjs";

function ReminderNotes() {
  const {user} = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const {selectedProperty} = useSelector((state) => state.properties);
  const propertyId = selectedProperty.id;
  const queryClient = useQueryClient();
  const [messageApi, contextHolder] = message.useMessage();

  // State for reminder actions - track per reminder
  const [reminderStates, setReminderStates] = useState({});

  // Fetch active reminders using tanstack query with proper refetch options
  const {data, isLoading} = useQuery({
    queryKey: ["active-reminders", propertyId],
    queryFn: () => getActiveReminders(propertyId || null),
    staleTime: 0, // Set to 0 to always refetch
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const markReminderDone = useMutation({
    mutationFn: (data) =>
      completeReminder(user.name, data.reminderId, data.actionNote),
    onSuccess: (data) => {
      // Force refetch of active reminders
      queryClient.invalidateQueries({queryKey: ["active-reminders"]});
      queryClient.invalidateQueries({queryKey: ["dashboardStats"]});
      queryClient.invalidateQueries({queryKey: ["userNotes"]});

      messageApi.success({
        content: `${data.message}`,
        duration: 3,
      });
    },
    onError: (error) => {
      console.error("Reminder completion error:", error);
      messageApi.error({
        content: `${error.message}`,
        duration: 3,
      });
    },
  });

  const snoozeReminderMutation = useMutation({
    mutationFn: (data) =>
      snoozeReminder(user.name, data.reminderId, data.newDate, data.reason),
    onSuccess: (data) => {
      // Force refetch of active reminders
      queryClient.invalidateQueries({queryKey: ["active-reminders"]});
      queryClient.invalidateQueries({queryKey: ["dashboardStats"]});
      queryClient.invalidateQueries({queryKey: ["userNotes"]});

      messageApi.success({
        content: `${data.message}`,
        duration: 3,
      });
    },
    onError: (error) => {
      console.error("Reminder snooze error:", error);
      messageApi.error({
        content: `${error.message}`,
        duration: 3,
      });
    },
  });

  // Handler functions for reminder actions
  const handleMarkAsDone = async (reminderId) => {
    const actionNote = reminderStates[reminderId]?.actionNote || "";

    try {
      setReminderStates((prev) => ({
        ...prev,
        [reminderId]: {...prev[reminderId], confirmLoading: true},
      }));

      await markReminderDone.mutateAsync({
        reminderId,
        actionNote: actionNote.trim() || "Completed without note",
      });

      // Clear state for this reminder immediately
      setReminderStates((prev) => {
        const newState = {...prev};
        delete newState[reminderId];
        return newState;
      });
    } catch (error) {
      // Error is handled in the mutation
    } finally {
      setReminderStates((prev) => ({
        ...prev,
        [reminderId]: {...prev[reminderId], confirmLoading: false},
      }));
    }
  };

  const handleSnooze = async (reminderId) => {
    const snoozeDate = reminderStates[reminderId]?.snoozeDate;
    const snoozeReason = reminderStates[reminderId]?.snoozeReason || "";

    if (!snoozeDate) {
      message.warning("Please select a future date for snoozing");
      return;
    }

    try {
      setReminderStates((prev) => ({
        ...prev,
        [reminderId]: {...prev[reminderId], snoozeLoading: true},
      }));

      await snoozeReminderMutation.mutateAsync({
        reminderId,
        newDate: snoozeDate.format("YYYY-MM-DD"),
        reason: snoozeReason.trim() || "No reason provided",
      });

      // Clear state for this reminder immediately
      setReminderStates((prev) => {
        const newState = {...prev};
        delete newState[reminderId];
        return newState;
      });
    } catch (error) {
      // Error is handled in the mutation
    } finally {
      setReminderStates((prev) => ({
        ...prev,
        [reminderId]: {...prev[reminderId], snoozeLoading: false},
      }));
    }
  };

  const handleSnoozeButtonClick = (reminderId) => {
    setReminderStates((prev) => ({
      ...prev,
      [reminderId]: {
        ...prev[reminderId],
        activeSnooze: true,
      },
    }));
  };

  const handleCancelConfirm = (reminderId) => {
    setReminderStates((prev) => ({
      ...prev,
      [reminderId]: {
        ...prev[reminderId],
        actionNote: "",
      },
    }));
  };

  const handleCancelSnooze = (reminderId) => {
    setReminderStates((prev) => ({
      ...prev,
      [reminderId]: {
        ...prev[reminderId],
        snoozeReason: "",
        snoozeDate: null,
        activeSnooze: false,
      },
    }));
  };

  const updateReminderState = (reminderId, updates) => {
    setReminderStates((prev) => ({
      ...prev,
      [reminderId]: {...prev[reminderId], ...updates},
    }));
  };

  const disabledSnoozeDate = (current) => {
    return current && current < dayjs().startOf("day");
  };

  // Show loading spinner while fetching
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 pt-4 pb-8 xl:px-12 lg:px-6 flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  // No data state - check both data existence and length
  const hasData =
    data?.data && Array.isArray(data.data) && data.data.length > 0;

  if (!hasData) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 pt-4 pb-8 xl:px-12 lg:px-6">
        <PageHeader
          title="Active Reminders"
          subtitle="Manage and track all active reminders"
        />
        <div className="mt-8">
          <Empty
            description="No active reminders found"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </div>
      </div>
    );
  }

  return (
    <>
      {contextHolder}
      <div className="min-h-screen bg-gray-50 px-4 pt-4 pb-8 xl:px-12 lg:px-6">
        <PageHeader
          title="Active Reminders"
          subtitle="Manage and track all active reminders"
        />

        {/* Reminders Grid - 4 cards per row */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {data.data.map((reminder) => {
            const reminderState = reminderStates[reminder._id] || {};

            return (
              <div
                key={reminder._id}
                className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm transition-shadow group"
              >
                <div className="flex justify-between items-start mb-3">
                  <div
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={() =>
                      navigate(`/resident/${reminder.userId || reminder._id}`)
                    }
                  >
                    <p className="text-sm font-medium text-gray-800">
                      {reminder.name}
                    </p>
                    <EyeOutlined className="text-gray-500 cursor-pointer hover:text-blue-500 transition-colors text-xs" />
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">
                      Reminder on{" "}
                      {dayjs(
                        reminder.reminderDate || reminder.createdAt
                      ).format("MMM D, YYYY")}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                  {reminder.content || "No reminder content available"}
                </p>

                <div className="flex justify-between items-center">
                  <div className="flex gap-2">
                    <Popconfirm
                      title="Mark as Done"
                      description={
                        <div className="space-y-2">
                          <p>Are you sure you want to mark this as done?</p>
                          <Input.TextArea
                            placeholder="Add an action note (optional)"
                            value={reminderState.actionNote || ""}
                            onChange={(e) =>
                              updateReminderState(reminder._id, {
                                actionNote: e.target.value,
                              })
                            }
                            rows={2}
                            maxLength={100}
                          />
                        </div>
                      }
                      onConfirm={() => handleMarkAsDone(reminder._id)}
                      onCancel={() => handleCancelConfirm(reminder._id)}
                      okText="Yes, Mark Done"
                      cancelText="Cancel"
                      okButtonProps={{
                        loading: reminderState.confirmLoading,
                        className: "bg-green-500 hover:bg-green-600",
                      }}
                    >
                      <button className="text-xs cursor-pointer bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition-colors">
                        Mark as Done
                      </button>
                    </Popconfirm>

                    <Popconfirm
                      title="Snooze Reminder"
                      description={
                        <div
                          className="space-y-3"
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "12px",
                          }}
                        >
                          <p>Select a new date and reason for snoozing:</p>
                          <DatePicker
                            value={reminderState.snoozeDate}
                            onChange={(date) =>
                              updateReminderState(reminder._id, {
                                snoozeDate: date,
                              })
                            }
                            format="YYYY-MM-DD"
                            disabledDate={disabledSnoozeDate}
                            placeholder="Select new reminder date"
                            className="w-full"
                          />
                          <Input.TextArea
                            placeholder="Enter reason for snoozing (optional)"
                            value={reminderState.snoozeReason || ""}
                            onChange={(e) =>
                              updateReminderState(reminder._id, {
                                snoozeReason: e.target.value,
                              })
                            }
                            rows={2}
                            maxLength={100}
                          />
                        </div>
                      }
                      onConfirm={() => handleSnooze(reminder._id)}
                      onCancel={() => handleCancelSnooze(reminder._id)}
                      okText="Snooze"
                      cancelText="Cancel"
                      okButtonProps={{
                        loading: reminderState.snoozeLoading,
                        className: "bg-blue-500 hover:bg-blue-600",
                        disabled: !reminderState.snoozeDate,
                      }}
                      open={reminderState.activeSnooze}
                      onOpenChange={(open) => {
                        if (!open) {
                          handleCancelSnooze(reminder._id);
                        }
                      }}
                    >
                      <button
                        className="text-xs cursor-pointer bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200 transition-colors"
                        onClick={() => handleSnoozeButtonClick(reminder._id)}
                      >
                        Snooze
                      </button>
                    </Popconfirm>
                  </div>
                  <span className="text-xs text-gray-400">
                    Created {dayjs(reminder.createdAt).format("MMM D, YYYY")}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

export default ReminderNotes;
