import React, {useState} from "react";
import {Table, Card, Alert, message, Button, Row, Col} from "antd";
import {UserOutlined} from "@ant-design/icons";
import {useQuery, useMutation, useQueryClient} from "@tanstack/react-query";
import dayjs from "dayjs";
import {
  getAllAttendanceByDate,
  getRoomsByDate,
  markAttendance,
  bulkMarkAttendance,
} from "../../hooks/users/useUser";
import {useSelector} from "react-redux";
import {PageHeader} from "../../components";
import AttendanceStats from "../../components/attendance/AttendanceStats";
import AttendanceFilters from "../../components/attendance/AttendanceFilters";
import MobileStudentDrawer from "../../components/attendance/MobileStudentDrawer";
import AttendanceHistoryModal from "../../components/attendance/AttendanceHistoryModal";
import RemarksModal from "../../components/attendance/RemarksModal";
import {getDesktopColumns} from "../../components/attendance/DesktopColumns";
import {getMobileColumns} from "../../components/attendance/MobileColumns";

const PRIMARY_COLOR = "#059669";

const AttendanceManagement = () => {
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedRoomId, setSelectedRoomId] = useState(null); // Store roomId instead of roomNumber
  const {selectedProperty} = useSelector((state) => state.properties);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isCalendarModalVisible, setIsCalendarModalVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [selectedStudentForDrawer, setSelectedStudentForDrawer] =
    useState(null);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [remarksModalVisible, setRemarksModalVisible] = useState(false);
  const [selectedRemarksStudent, setSelectedRemarksStudent] = useState(null);
  const [remarksText, setRemarksText] = useState("");
  const [isBulkLoading, setIsBulkLoading] = useState(false);

  const [messageApi, contextHolder] = message.useMessage();

  // Helper to get selected room details
  const getSelectedRoomDetails = () => {
    if (!selectedRoomId || !rooms?.data) return null;
    return rooms.data.find((room) => room._id === selectedRoomId);
  };

  // Handle resize for mobile detection
  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch today's attendance
  const {
    data: attendanceData,
    isLoading: isAttendanceLoading,
    error: attendanceError,
    refetch,
  } = useQuery({
    queryKey: [
      "attendance",
      selectedDate?.format("YYYY-MM-DD"),
      searchText,
      statusFilter,
      selectedRoomId, // Use roomId in query key
      selectedProperty?.id,
    ],
    queryFn: () =>
      getAllAttendanceByDate({
        date: selectedDate?.format("YYYY-MM-DD"),
        search: searchText || undefined,
        propertyId: selectedProperty?.id,
        status: statusFilter !== "all" ? statusFilter : undefined,
        roomId: selectedRoomId || undefined, // Pass roomId to API
      }),
  });

  // Fetch rooms (now returns rooms with _id and roomNumber)
  const {data: rooms} = useQuery({
    queryKey: ["rooms", selectedProperty?.id],
    queryFn: () =>
      getRoomsByDate({
        propertyId: selectedProperty?.id,
      }),
  });

  // Mark attendance mutation (individual)
  const markAttendanceMutation = useMutation({
    mutationFn: markAttendance,
    onSuccess: () => {
      messageApi.success({
        content: "Attendance marked successfully",
      });
      queryClient.invalidateQueries([
        "attendance",
        selectedDate.format("YYYY-MM-DD"),
      ]);
      setRemarksModalVisible(false);
      setRemarksText("");
      setSelectedRemarksStudent(null);
    },
    onError: (error) => {
      messageApi.error({
        content: error.message || "Failed to mark attendance",
      });
    },
  });

  // Bulk mark attendance mutation
  const bulkMarkAttendanceMutation = useMutation({
    mutationFn: bulkMarkAttendance,
    onMutate: () => {
      setIsBulkLoading(true);
    },
    onSuccess: () => {
      queryClient.invalidateQueries([
        "attendance",
        selectedDate.format("YYYY-MM-DD"),
      ]);
      setIsBulkLoading(false);
      setSelectedRoomId(null);
    },
    onError: (error) => {
      messageApi.error({
        content: error.message || "Failed to mark bulk attendance",
      });
      setIsBulkLoading(false);
    },
  });

  // Handle marking attendance with optional remarks
  const handleMarkAttendance = (userId, status, remarks = "") => {
    markAttendanceMutation.mutate({
      userId,
      status,
      markedBy: "Current User",
      remarks: remarks || (status === "Late" ? "Late arrival" : ""),
      date: selectedDate.format("YYYY-MM-DD"),
    });
  };

  // Handle update remarks only
  const handleUpdateRemarksOnly = () => {
    if (!selectedRemarksStudent) return;

    const currentStatus = selectedRemarksStudent.currentStatus || "Present";
    handleMarkAttendance(
      selectedRemarksStudent.userId,
      currentStatus,
      remarksText,
    );
  };

  // Handle view student details in mobile drawer
  const handleViewStudentDetails = (record) => {
    setSelectedStudentForDrawer(record);
    setIsDrawerVisible(true);
  };

  // Handle view history
  const handleViewHistory = (userId, userName) => {
    setSelectedUser({id: userId, name: userName});
    setIsCalendarModalVisible(true);
  };

  // Handle open remarks modal
  const handleOpenRemarksModal = (record) => {
    setSelectedRemarksStudent({
      userId: record.user?._id || record._id,
      name: record.user?.name,
      currentRemarks: record.remarks,
      currentStatus: record.status,
      attendanceId: record._id,
    });
    setRemarksText(record.remarks || "");
    setRemarksModalVisible(true);
  };

  // Handle bulk mark attendance for a specific room (only for Present)
  const handleBulkMarkAttendance = (status, roomId, roomNumber) => {
    console.log("Mark Present clicked for:", {status, roomId, roomNumber});

    if (!attendanceData?.data || !roomId) return;

    const studentsInRoom = attendanceData.data.filter(
      (student) =>
        student.user?.stayDetails?.roomId?.toString() === roomId.toString(),
    );

    if (studentsInRoom.length === 0) {
      messageApi.info(`No students found in Room ${roomNumber}`);
      return;
    }

    // Get students who are NOT Present
    const studentsToMark = studentsInRoom.filter(
      (student) => student.status !== "Present",
    );

    if (studentsToMark.length === 0) {
      messageApi.success(
        `All students in Room ${roomNumber} are already Present!`,
      );
      return;
    }

    const userIds = studentsToMark.map(
      (student) => student.user?._id || student._id,
    );

    // 🚀 Direct API call (No Modal)
    bulkMarkAttendanceMutation.mutate({
      userIds,
      status: "Present",
      markedBy: "Current User",
      remarks: "",
      date: selectedDate.format("YYYY-MM-DD"),
      roomId,
      roomNumber,
    });

    messageApi.success(
      `${studentsToMark.length} student(s) marked Present in Room ${roomNumber}`,
    );
  };

  // Filter attendance data based on selected room (client-side filtering using roomId)
  const filteredAttendanceData = selectedRoomId
    ? attendanceData?.data?.filter(
        (student) =>
          student.user?.stayDetails?.roomId?.toString() ===
          selectedRoomId.toString(),
      )
    : attendanceData?.data;

  // Get selected room details for display
  const selectedRoomDetails = getSelectedRoomDetails();

  const count = filteredAttendanceData?.length || 0;

  // Get columns based on device
  const desktopColumns = getDesktopColumns(
    handleViewHistory,
    handleOpenRemarksModal,
    handleMarkAttendance,
    markAttendanceMutation.isLoading,
    markAttendanceMutation,
  );

  const mobileColumns = getMobileColumns(
    handleViewStudentDetails,
    handleViewHistory,
    handleOpenRemarksModal,
    handleMarkAttendance,
  );

  return (
    <div className="min-h-screen bg-gray-50 xl:px-12 lg:px-4 lg:pt-6 lg:pb-12 px-4 pt-4 pb-8">
      {contextHolder}
      {/* Header */}
      <PageHeader
        title="Attendance Management"
        subtitle="Manage student attendance for your hostel"
      />

      {/* Stats Grid - Show stats for filtered data if room selected */}
      <Row>
        <Col xs={0} md={24}>
          <AttendanceStats data={filteredAttendanceData} />
        </Col>
      </Row>

      {/* Filters */}
      <AttendanceFilters
        searchText={searchText}
        onSearchChange={setSearchText}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        selectedDate={selectedDate}
        roomsData={rooms}
        onDateChange={setSelectedDate}
        selectedRoomId={selectedRoomId}
        onRoomChange={setSelectedRoomId}
        onBulkMark={handleBulkMarkAttendance}
        isBulkLoading={isBulkLoading}
      />

      {/* Room Info Banner */}
      {selectedRoomDetails && (
        <div
          style={{
            backgroundColor: PRIMARY_COLOR + "10",
            padding: "8px 16px",
            borderRadius: "8px",
            marginBottom: "16px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {/* Left Side */}
          <span>
            Showing <strong>{count}</strong>{" "}
            {count === 1 ? "student" : "students"}
          </span>

          {/* Right Side */}
          <span>
            <strong>Room {selectedRoomDetails.roomNumber}</strong>
          </span>
        </div>
      )}

      {/* Attendance Table */}
      <Card bodyStyle={{padding: isMobile ? "12px" : "24px"}}>
        {attendanceError ? (
          <Alert
            message="Error"
            description={attendanceError.message}
            type="error"
            showIcon
            action={
              <Button size="small" onClick={() => refetch()}>
                Retry
              </Button>
            }
          />
        ) : (
          <Table
            columns={isMobile ? mobileColumns : desktopColumns}
            dataSource={filteredAttendanceData || []}
            loading={
              isAttendanceLoading || bulkMarkAttendanceMutation.isLoading
            }
            rowKey={(record) => record._id || record.user?._id}
            pagination={false}
            scroll={isMobile ? {x: true} : undefined}
            size={isMobile ? "small" : "middle"}
            locale={{
              emptyText: (
                <div
                  style={{
                    textAlign: "center",
                    padding: isMobile ? "20px" : "40px",
                  }}
                >
                  <UserOutlined
                    style={{
                      fontSize: isMobile ? "30px" : "40px",
                      color: "#d9d9d9",
                    }}
                  />
                  <p style={{marginTop: "16px", color: "#999"}}>
                    {selectedRoomDetails
                      ? `No students found in Room ${selectedRoomDetails.roomNumber}`
                      : "No attendance records found"}
                  </p>
                </div>
              ),
            }}
          />
        )}
      </Card>

      {/* Mobile Student Details Drawer */}
      <MobileStudentDrawer
        visible={isDrawerVisible}
        onClose={() => setIsDrawerVisible(false)}
        student={selectedStudentForDrawer}
        onMarkAttendance={handleMarkAttendance}
        onViewHistory={handleViewHistory}
        onOpenRemarks={handleOpenRemarksModal}
      />

      {/* Student Attendance History Modal */}
      <AttendanceHistoryModal
        visible={isCalendarModalVisible}
        onCancel={() => setIsCalendarModalVisible(false)}
        selectedUser={selectedUser}
        isMobile={isMobile}
      />

      {/* Remarks Modal */}
      <RemarksModal
        visible={remarksModalVisible}
        onCancel={() => {
          setRemarksModalVisible(false);
          setRemarksText("");
          setSelectedRemarksStudent(null);
        }}
        onOk={handleUpdateRemarksOnly}
        studentName={selectedRemarksStudent?.name}
        remarksText={remarksText}
        onRemarksChange={setRemarksText}
        loading={markAttendanceMutation.isLoading}
      />
    </div>
  );
};

export default AttendanceManagement;
