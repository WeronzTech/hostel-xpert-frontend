import {useNavigate} from "react-router-dom";
import {useSelector} from "react-redux";
import StatCard from "../../components/home/StatCard";
import TodaysCheckoutsSection from "../../components/home/TodaysCheckoutsSection";
import OccupancyPieChart from "../../components/home/OccupancyPieChart";
import FinanceBarChart from "../../components/home/FinanceBarChart";
import NewOnboardingSection from "../../components/home/NewOnboardingSection";
import PageHeader from "../../components/common/PageHeader";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {getDashboardStats} from "../../hooks/property/useProperty";
import {
  EyeOutlined,
  FiAlertCircle,
  FiArrowRight,
  FiBell,
  FiCheckCircle,
  FiClock,
  FiTool,
  FiUser,
  FiUsers,
  GoArrowUpRight,
  HiOutlineUserGroup,
  MdCalendarToday,
} from "../../icons/index.js";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {getMonthlyIncomeExpenseSummary} from "../../hooks/accounts/useAccounts.js";
import {useEffect, useState} from "react";
import {Select, Popconfirm, Input, message, DatePicker} from "antd";
import {completeReminder, snoozeReminder} from "../../hooks/users/useUser.js";

dayjs.extend(relativeTime);

const Dashboard = () => {
  const {selectedProperty} = useSelector((state) => state.properties);
  const {user} = useSelector((state) => state.auth);
  const [availableYears, setAvailableYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [actionNote, setActionNote] = useState("");
  const [snoozeReason, setSnoozeReason] = useState("");
  const [snoozeDate, setSnoozeDate] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [snoozeLoading, setSnoozeLoading] = useState(false);
  const [activeSnoozeReminder, setActiveSnoozeReminder] = useState(null);

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [messageApi, contextHolder] = message.useMessage();

  const {
    data: dashboardData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["dashboardStats", selectedProperty.id],
    queryFn: () => getDashboardStats(selectedProperty.id),
    staleTime: 1000 * 60 * 5,
  });

  // summary data query
  const {
    data: summaryData,
    isLoading: summaryLoading,
    error: summaryError,
  } = useQuery({
    queryKey: ["incomeExpense-summary", selectedProperty?.id, selectedYear],
    queryFn: () =>
      getMonthlyIncomeExpenseSummary(selectedProperty?.id, selectedYear),
  });

  const markReminderDone = useMutation({
    mutationFn: (data) =>
      completeReminder(user.name, data.reminderId, data.actionNote),
    onSuccess: (data) => {
      // Invalidate both queries to refresh data
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
      // Invalidate both queries to refresh data
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

  useEffect(() => {
    if (summaryData?.availableYears?.length) {
      setAvailableYears(summaryData?.availableYears);
    }
  }, [summaryData]);

  const handleYearChange = (year) => {
    setSelectedYear(year);
  };

  const handleMarkAsDone = async (reminderId) => {
    try {
      setConfirmLoading(true);
      await markReminderDone.mutateAsync({
        reminderId,
        actionNote: actionNote.trim() || "Completed without note",
      });
      setActionNote(""); // Reset note after successful submission
    } catch (error) {
      // Error is handled in the mutation
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleCancelConfirm = () => {
    setActionNote(""); // Reset note when canceling
  };

  const handleSnooze = async (reminderId) => {
    if (!snoozeDate) {
      messageApi.warning("Please select a future date for snoozing");
      return;
    }

    try {
      setSnoozeLoading(true);
      await snoozeReminderMutation.mutateAsync({
        reminderId,
        newDate: snoozeDate.format("YYYY-MM-DD"),
        reason: snoozeReason.trim() || "No reason provided",
      });
      // Reset states after successful submission
      setSnoozeReason("");
      setSnoozeDate(null);
      setActiveSnoozeReminder(null);
    } catch (error) {
      // Error is handled in the mutation
    } finally {
      setSnoozeLoading(false);
    }
  };

  const handleCancelSnooze = () => {
    setSnoozeReason("");
    setSnoozeDate(null);
    setActiveSnoozeReminder(null);
  };

  const handleSnoozeButtonClick = (reminderId) => {
    setActiveSnoozeReminder(reminderId);
  };

  // Disable past dates for snooze
  const disabledSnoozeDate = (current) => {
    return current && current < dayjs().startOf("day");
  };

  const stats = [
    {
      title: "Total Residents",
      value: dashboardData?.data.residents || 0,
      icon: <FiUsers className="text-xl" />,
      color: "primary",
      link: "/monthlyRent",
    },
    {
      title: "Total Daily Renters",
      value: dashboardData?.data.dailyRenters || 0,
      icon: <MdCalendarToday className="text-xl" />,
      color: "renters",
      link: "/dailyRent",
    },
    {
      title: "Total Employees",
      value: dashboardData?.data.employees || 0,
      icon: <HiOutlineUserGroup className="text-xl" />,
      color: "employees",
      link: "/employees",
    },
    {
      title: "Maintenance Issues",
      value: dashboardData?.data?.maintenance?.count || 0,
      icon: <FiAlertCircle className="text-xl" />,
      color: "maintenance",
      link: "/maintenance",
    },
  ];

  const paymentReminders = [
    {
      id: 1,
      residentName: "John Doe",
      note: "Will pay rent on 15th July",
      dueDate: "2023-07-15",
      amount: 15000,
      status: "pending",
    },
    {
      id: 2,
      residentName: "John Doe",
      note: "Will pay rent on 15th July",
      dueDate: "2023-07-15",
      amount: 15000,
      status: "pending",
    },
    // ... more reminders
  ];

  const handleVacate = (resident) => {
    console.log("Checkout processing for:", resident);
    // Navigate or show modal if needed
  };

  const handleProcessOnboarding = (requestId) => {
    navigate(`/onboarding/${requestId}`);
    console.log("Processing onboarding for:", requestId);
  };

  if (isLoading || summaryLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4d44b5] mx-auto"></div>
        </div>
      </div>
    );
  }

  if (isError || summaryError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-2xl mb-4">⚠️</div>
          <p className="text-gray-800 font-medium">{isError.message}</p>
          <p className="text-gray-600 mt-2">
            {isError.details || "Failed to load dashboard data"}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-[#4d44b5] text-white rounded-lg hover:bg-[#3a32a0]"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 xl:px-12 lg:px-4 lg:pt-6 lg:pb-12 px-4 pt-4 pb-8">
      {contextHolder}

      {/* Header */}
      <PageHeader
        title="Dashboard Overview"
        subtitle={`Welcome! ${user.name}`}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 md:gap-6 gap-6 xl:gap-11 xl:mb-10 md:mb-10 mb-10">
        {stats.map((stat, index) => (
          <StatCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
            link={stat.link}
          />
        ))}
      </div>

      <NewOnboardingSection onProcess={handleProcessOnboarding} />

      <TodaysCheckoutsSection onVacate={handleVacate} />

      {/* Main Content - Now single column */}
      <div className="space-y-6">
        {/* Finance + Occupancy Section - Full width */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex flex-col xl:flex-row justify-between gap-6">
            {/* Finance Overview Chart - Adjust width as needed */}
            <div className="flex-1 xl:w-[55%]">
              {/* Header with filter on the right */}
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-md font-semibold text-gray-700 transition-all duration-300">
                  Finance Overview{selectedYear ? ` - ${selectedYear}` : ""}
                </h4>
                <Select
                  value={selectedYear}
                  onChange={handleYearChange}
                  style={{width: 120}}
                  size="small"
                >
                  {availableYears.map((year) => (
                    <Option key={year} value={year}>
                      {year}
                    </Option>
                  ))}
                </Select>
              </div>

              <FinanceBarChart
                data={summaryData?.data}
                loading={summaryLoading}
              />
            </div>

            {/* Occupancy Chart - Adjust width as needed */}
            <div className="flex-1 xl:w-[45%]">
              {" "}
              {/* Reduced to 45% */}
              <h4 className="text-md font-semibold text-gray-700 mb-4">
                Occupancy Rate
              </h4>
              <OccupancyPieChart
                occupied={dashboardData?.data?.occupancy?.occupiedBeds}
                total={dashboardData?.data?.occupancy?.totalBeds}
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Maintenance Issues - Left */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <FiTool className="w-5 h-5 text-amber-500" />
                    Active Maintenance{" "}
                  </h3>
                </div>
                {dashboardData?.data?.maintenance?.latest?.length > 0 && (
                  <button
                    onClick={() => navigate("/maintenance")}
                    className=" bg-black text-white rounded-full p-2 shadow-md  cursor-pointer"
                  >
                    <GoArrowUpRight className="w-5 h-5" />
                  </button>
                )}
              </div>
              <div className="space-y-3">
                {dashboardData?.data?.maintenance?.latest
                  ?.slice(0, 5)
                  .map((issue) => {
                    const statusColor =
                      {
                        Pending: "text-red-500",
                        Ongoing: "text-yellow-500",
                        Resolved: "text-green-500",
                      }[issue.status] || "text-gray-500";

                    return (
                      <div
                        key={issue._id}
                        className="flex flex-col gap-2 p-3 border border-gray-100 rounded-lg"
                      >
                        {/* Top Row */}
                        <div className="flex items-start gap-3">
                          <div className={`mt-1 ${statusColor}`}>
                            {issue.status === "Resolved" ? (
                              <FiCheckCircle className="w-4 h-4" />
                            ) : issue.status === "Ongoing" ? (
                              <FiClock className="w-4 h-4" />
                            ) : (
                              <FiAlertCircle className="w-4 h-4" />
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 truncate">
                              {issue.issue}
                            </p>

                            {/* Room No left, Date right */}
                            <div className="flex justify-between items-center mt-1 text-xs text-gray-500">
                              <span>
                                {issue.roomNo
                                  ? `Room ${issue.roomNo}`
                                  : `${user.name}`}
                              </span>
                              <span>
                                Reported At{" "}
                                {dayjs(issue.reportedAt).format(
                                  "MMM D, YYYY [at] hh:mm A"
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                {!dashboardData?.data?.maintenance?.latest?.length && (
                  <div className="text-center py-6 text-gray-500 text-sm border border-gray-200 rounded-lg bg-gray-50">
                    <FiCheckCircle className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="font-medium">All caught up!</p>
                    <p className="text-xs mt-1">No active maintenance</p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              {/* Section Heading */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <FiBell className="w-5 h-5 text-amber-500" />
                    Things to Follow Up
                    {dashboardData?.data?.reminders?.data?.length > 0 && (
                      <span className="text-sm font-normal px-2 py-1 rounded-full">
                        ({dashboardData.data.reminders.data.length})
                      </span>
                    )}
                  </h3>
                </div>

                {dashboardData?.data?.reminders?.data?.length >= 4 && (
                  <button
                    onClick={() => navigate("/active-reminders")}
                    className="bg-black text-white rounded-full p-2 shadow-md cursor-pointer"
                  >
                    <GoArrowUpRight className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Reminders List */}
              {(dashboardData?.data?.reminders?.data || [])
                .slice(0, 3)
                .map((reminder) => (
                  <div
                    key={reminder._id}
                    className="p-3 border border-gray-200 rounded-lg bg-white shadow-sm transition-shadow group"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div
                        className="flex items-center gap-2 cursor-pointer"
                        onClick={() => navigate(`/resident/${reminder.userId}`)}
                      >
                        <p className="text-sm font-medium text-gray-800">
                          {reminder.name}
                        </p>
                        <EyeOutlined className="text-black cursor-pointer hover:text-blue-500 transition-colors" />
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">
                          Reminder on{" "}
                          {dayjs(reminder.reminderDate).format("MMM D, YYYY")}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                      {reminder.content}
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
                                value={actionNote}
                                onChange={(e) => setActionNote(e.target.value)}
                                rows={2}
                                maxLength={100}
                              />
                            </div>
                          }
                          onConfirm={() => handleMarkAsDone(reminder._id)}
                          onCancel={handleCancelConfirm}
                          okText="Yes, Mark Done"
                          cancelText="Cancel"
                          okButtonProps={{
                            loading: confirmLoading,
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
                                value={snoozeDate}
                                onChange={setSnoozeDate}
                                format="YYYY-MM-DD"
                                disabledDate={disabledSnoozeDate}
                                placeholder="Select new reminder date"
                                className="w-full"
                              />
                              <Input.TextArea
                                placeholder="Enter reason for snoozing (optional)"
                                value={snoozeReason}
                                onChange={(e) =>
                                  setSnoozeReason(e.target.value)
                                }
                                rows={2}
                                maxLength={100}
                              />
                            </div>
                          }
                          onConfirm={() => handleSnooze(reminder._id)}
                          onCancel={handleCancelSnooze}
                          okText="Snooze"
                          cancelText="Cancel"
                          okButtonProps={{
                            loading: snoozeLoading,
                            className: "bg-blue-500 hover:bg-blue-600",
                            disabled: !snoozeDate,
                          }}
                          open={activeSnoozeReminder === reminder._id}
                          onOpenChange={(open) => {
                            if (!open) {
                              handleCancelSnooze();
                            }
                          }}
                        >
                          <button
                            className="text-xs cursor-pointer bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200 transition-colors"
                            onClick={() =>
                              handleSnoozeButtonClick(reminder._id)
                            }
                          >
                            Snooze
                          </button>
                        </Popconfirm>
                      </div>
                      <span className="text-xs text-gray-400">
                        Created {dayjs(reminder.createdAt).format("MMM D")}
                      </span>
                    </div>
                  </div>
                ))}

              {/* Empty State */}
              {!dashboardData?.data?.reminders?.data?.length && (
                <div className="text-center py-6 text-gray-500 text-sm border border-gray-200 rounded-lg bg-gray-50">
                  <FiCheckCircle className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="font-medium">All caught up!</p>
                  <p className="text-xs mt-1">
                    No follow-ups needed at the moment
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
