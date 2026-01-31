import {useState, useEffect} from "react";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {useSelector} from "react-redux";
import {FiCheckCircle, FiClock, FiXCircle, FiCalendar} from "react-icons/fi";
import {message, Tabs} from "antd";

import PageHeader from "../../components/common/PageHeader";
import StatsGrid from "../../components/common/StatsGrid";
import AttendanceTable from "./AttendanceTable";
import {
  getAllStaffForAttendance,
  getAttendanceSummary,
  markAttendance,
  updateAttendance,
} from "../../hooks/staff/useStaff";
import AttendanceOverviewTab from "./AttendanceOverviewTab";
import dayjs from "dayjs";

const {TabPane} = Tabs;

const AttendanceOverview = () => {
  const [filter, setFilter] = useState({});
  const [activeTab, setActiveTab] = useState("mark");
  const [attendanceFilters, setAttendanceFilters] = useState({
    date: dayjs(),
    month: null, // New
    year: null, // New
    employeeType: null,
    employeeId: null,
    searchText: "",
  });

  const queryClient = useQueryClient();
  const [messageApi, contextHolder] = message.useMessage();

  const selectedPropertyId = useSelector(
    (state) => state.properties.selectedProperty?.id
  );

  const [stats, setStats] = useState([
    {
      title: "Total Present",
      value: 0,
      icon: <FiCheckCircle className="text-xl" />,
      color: "bg-green-100 text-green-600",
    },
    {
      title: "Total Absent",
      value: 0,
      icon: <FiXCircle className="text-xl" />,
      color: "bg-red-100 text-red-600",
    },
    {
      title: "On Leave",
      value: 0,
      icon: <FiClock className="text-xl" />,
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Today's Attendance",
      value: "0%",
      icon: <FiCalendar className="text-xl" />,
      color: "bg-purple-100 text-purple-600",
    },
  ]);

  useEffect(() => {
    const newFilter = {manager: "true"};
    if (selectedPropertyId) newFilter.propertyId = selectedPropertyId;
    setFilter(newFilter);
  }, [selectedPropertyId]);

  // Build query parameters for attendance data - MATCH BACKEND EXPECTATIONS
  const buildAttendanceQueryParams = () => {
    const params = {
      propertyId: selectedPropertyId,
    };

    // Add date filter if provided
    if (attendanceFilters.date) {
      params.date = attendanceFilters.date;
    }

    // Add month/year filters if provided
    if (attendanceFilters.month && attendanceFilters.year) {
      params.month = attendanceFilters.month;
      params.year = attendanceFilters.year;
    }

    // Add other filters
    if (attendanceFilters.employeeType) {
      params.employeeType = attendanceFilters.employeeType;
    }

    if (attendanceFilters.employeeId) {
      params.employeeId = attendanceFilters.employeeId;
    }

    if (attendanceFilters.searchText) {
      params.searchText = attendanceFilters.searchText;
    }

    return params;
  };

  const attendanceQueryParams = buildAttendanceQueryParams();

  // Fetch all attendance data in parent component
  const {
    data: attendanceData,
    isLoading: attendanceLoading,
    error: attendanceError,
  } = useQuery({
    queryKey: ["attendance-summary", attendanceQueryParams],
    queryFn: () => getAttendanceSummary(attendanceQueryParams),
  });

  // Fetch staff data for marking attendance
  const {data: staffData, isLoading: staffLoading} = useQuery({
    queryKey: ["staff-list-attendance", filter],
    queryFn: () => getAllStaffForAttendance(filter),
  });

  // Mutation for marking attendance
  const markAttendanceMutation = useMutation({
    mutationFn: markAttendance,
    onSuccess: (data) => {
      // Invalidate both queries to refresh data
      queryClient.invalidateQueries({queryKey: ["staff-list-attendance"]});
      queryClient.invalidateQueries({queryKey: ["attendance-summary"]});
      messageApi.success({
        content: `${data.message}`,
        duration: 3,
      });
    },
    onError: (error) => {
      console.error("Attendance marking error:", error);
      messageApi.error({
        content: `${error.message}`,
        duration: 3,
      });
    },
  });

  const updateAttendanceMutation = useMutation({
    mutationFn: updateAttendance,
    onSuccess: (data) => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({queryKey: ["attendance-summary"]});
      queryClient.invalidateQueries({queryKey: ["staff-list-attendance"]});
      queryClient.invalidateQueries({queryKey: ["attendance-dates"]});

      messageApi.success({
        content: `${data.message}`,
        duration: 3,
      });
    },
    onError: (error) => {
      console.error("Update attendance error:", error);
      messageApi.error({
        content: `${error.message}`,
        duration: 3,
      });
    },
  });

  const handleUpdateAttendance = async (updateData) => {
    return await updateAttendanceMutation.mutateAsync(updateData);
  };

  // Update stats based on attendance data
  useEffect(() => {
    if (attendanceData?.data) {
      const records = attendanceData.data;
      const presentCount = records.filter(
        (r) => r.selectedDateStatus === "Present"
      ).length;
      const absentCount = records.filter(
        (r) => r.selectedDateStatus === "Absent"
      ).length;
      const leaveCount = records.filter(
        (r) => r.selectedDateStatus === "Paid Leave"
      ).length;
      const totalRecords = records.length;
      const attendanceRate =
        totalRecords > 0 ? Math.round((presentCount / totalRecords) * 100) : 0;

      setStats([
        {
          title: "Total Present",
          value: presentCount,
          icon: <FiCheckCircle className="text-xl" />,
          color: "bg-green-100 text-green-600",
        },
        {
          title: "Total Absent",
          value: absentCount,
          icon: <FiXCircle className="text-xl" />,
          color: "bg-red-100 text-red-600",
        },
        {
          title: "On Leave",
          value: leaveCount,
          icon: <FiClock className="text-xl" />,
          color: "bg-blue-100 text-blue-600",
        },
        {
          title: "Attendance Rate",
          value: `${attendanceRate}%`,
          icon: <FiCalendar className="text-xl" />,
          color: "bg-purple-100 text-purple-600",
        },
      ]);
    }
  }, [attendanceData]);

  // Handle quick attendance from the table
  const handleQuickAttendance = (attendanceData) => {
    console.log("Marking attendance:", attendanceData);
    markAttendanceMutation.mutate(attendanceData);
  };

  // Handle filter changes from child component
  const handleFilterChange = (newFilters) => {
    setAttendanceFilters(newFilters);
  };

  return (
    <>
      {contextHolder}
      <div>
        <PageHeader
          title="Attendance Overview"
          subtitle="Manage employee attendance records and tracking"
        />

        {activeTab === "overview" && <StatsGrid stats={stats} />}

        {/* Tabs Section */}
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          type="card"
          centered
        >
          <TabPane tab="Mark Attendance" key="mark">
            <AttendanceTable
              attendanceRecords={staffData?.staff || []}
              loading={staffLoading || markAttendanceMutation.isLoading}
              onQuickAttendance={handleQuickAttendance}
            />
          </TabPane>

          <TabPane tab="Attendance Overview" key="overview">
            <AttendanceOverviewTab
              attendanceSummary={attendanceData?.data || []}
              loading={attendanceLoading}
              error={attendanceError}
              filters={attendanceFilters}
              onFilterChange={handleFilterChange}
              onUpdateAttendance={handleUpdateAttendance}
            />
          </TabPane>
        </Tabs>
      </div>
    </>
  );
};

export default AttendanceOverview;
