import {useState, useEffect} from "react";
import {
  Card,
  DatePicker,
  Table,
  Tag,
  Select,
  Input,
  Button,
  Modal,
  Form,
  message,
  Tooltip,
  Col,
  Row,
} from "antd";
import {FiEdit} from "react-icons/fi";
import dayjs from "dayjs";
import {useQuery} from "@tanstack/react-query";
import {getAvailableAttendanceDates} from "../../hooks/staff/useStaff";

const {Option} = Select;
const {Search} = Input;

const AttendanceOverviewTab = ({
  attendanceSummary = [],
  loading,
  error,
  filters,
  onFilterChange,
  onUpdateAttendance,
}) => {
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [employeeId, setEmployeeId] = useState(null);
  const [editForm] = Form.useForm();
  const [updateLoading, setUpdateLoading] = useState(false);
  const [selectedDateStatus, setSelectedDateStatus] = useState(null);
  console.log(attendanceSummary);
  const {data: attendanceDates, isLoading: attendanceLoading} = useQuery({
    queryKey: ["attendance-dates", employeeId],
    queryFn: () => getAvailableAttendanceDates(employeeId),
    enabled: !!employeeId,
  });

  // Get dynamic column title based on selected date
  const getDateColumnTitle = () => {
    if (filters.date) {
      const date = filters.date.format("YYYY-MM-DD");
      const today = dayjs().format("YYYY-MM-DD");

      if (date === today) {
        return "Today's Status";
      } else {
        return `Status (${filters.date.format("DD/MM/YYYY")})`;
      }
    } else if (filters.month && filters.year) {
      return `-`;
    } else {
      return "Today's Status";
    }
  };

  // Sync selectedDate with filters.date
  useEffect(() => {
    if (filters.date) {
    }
  }, [filters.date]);

  const handleDateChange = (date) => {
    const newFilters = {
      ...filters,
      date: date,
      month: null, // Clear month when date is selected
      year: null, // Clear year when date is selected
    };
    onFilterChange(newFilters);
  };

  const handleMonthChange = (date) => {
    if (date) {
      const month = date.month() + 1; // dayjs months are 0-indexed
      const year = date.year();
      const newFilters = {
        ...filters,
        month,
        year,
        date: null, // Clear specific date when month is selected
      };
      onFilterChange(newFilters);
    } else {
      // Month/year cleared → restore default today for date
      const newFilters = {
        ...filters,
        month: null,
        year: null,
        date: dayjs(), // ✅ reset date to today
      };
      onFilterChange(newFilters);
    }
  };

  // Handle edit attendance
  const handleEdit = (record) => {
    setEmployeeId(record.employeeId);
    setEditingRecord(record);

    const formValues = {
      status: null,
      remarks: "",
    };

    editForm.setFieldsValue(formValues);
    setIsEditModalVisible(true);
  };

  // Handle update attendance
  const handleUpdateAttendance = async (values) => {
    try {
      setUpdateLoading(true);

      const updateData = {
        employeeId: employeeId || editingRecord.employeeId,
        employeeType: editingRecord.employeeType,
        date: values.selectedDate
          ? dayjs(values.selectedDate).format("YYYY-MM-DD")
          : null,
        status: values.status,
        remarks: values.remarks || "",
      };

      await onUpdateAttendance(updateData);
      setSelectedDateStatus(null);
      setIsEditModalVisible(false);
      setEditingRecord(null);
      editForm.resetFields();

      message.success("Attendance updated successfully!");
    } catch (error) {
      message.error("Failed to update attendance: " + error.message);
    } finally {
      setUpdateLoading(false);
    }
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setIsEditModalVisible(false);
    setEditingRecord(null);
    editForm.resetFields();
  };

  const disabledDate = (current) => {
    if (!attendanceDates || !Array.isArray(attendanceDates)) {
      return false;
    }

    const availableDateStrings = attendanceDates.map((d) => d.date);
    return !availableDateStrings.includes(current.format("YYYY-MM-DD"));
  };

  const handleDateSelect = (date) => {
    if (!date || !attendanceDates) {
      setSelectedDateStatus(null);
      editForm.setFieldsValue({status: null});
      return;
    }

    const selectedDateStr = dayjs(date).format("YYYY-MM-DD");
    const found = attendanceDates.find((d) => d.date === selectedDateStr);

    if (found) {
      // ✅ Automatically set the form field and display current status
      editForm.setFieldsValue({status: found.status});
      setSelectedDateStatus(found.status);
    } else {
      setSelectedDateStatus(null);
      editForm.setFieldsValue({status: null});
    }
  };

  // Columns for attendance summary table
  const columns = [
    {
      title: "#",
      key: "serial",
      width: 60,
      align: "center",
      fixed: "left",
      render: (_, __, index) => index + 1,
    },
    {
      title: "Employee Name",
      dataIndex: "employeeName",
      key: "employeeName",
      width: 120,
      render: (text, record) => (
        <div>
          <div className="font-medium">{text}</div>
        </div>
      ),
    },
    {
      title: "Employee Type",
      dataIndex: "employeeType",
      key: "employeeType",
      width: 120,
      align: "center",
      render: (type) => (
        <Tag color={type === "Manager" ? "purple" : "blue"}>{type}</Tag>
      ),
    },
    {
      title: getDateColumnTitle(), // Dynamic title based on selected date
      dataIndex: "selectedDateStatus",
      key: "selectedDateStatus",
      width: 140,
      align: "center",
      render: (status) => {
        const statusConfig = {
          Present: {color: "green", text: "Present"},
          Absent: {color: "red", text: "Absent"},
          "Paid Leave": {color: "blue", text: "Paid Leave"},
          "Half Day": {color: "orange", text: "Half Day"},
          "Not Marked": {color: "default", text: "Not Marked"},
        };
        const config = statusConfig[status] || {color: "default", text: status};
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: "Monthly Summary",
      key: "monthlySummary",
      align: "center",
      children: [
        {
          title: "Present",
          dataIndex: "totalPresentDays",
          key: "totalPresentDays",
          width: 100,
          align: "center",
          render: (days) => (
            <Tooltip title={`${days} present days`}>
              <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                {days ?? 0} days
              </span>
            </Tooltip>
          ),
        },
        {
          title: "Absent",
          dataIndex: "totalAbsentDays",
          key: "totalAbsentDays",
          width: 100,
          align: "center",
          render: (days) => (
            <Tooltip title={`${days} absent days`}>
              <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                {days ?? 0} days
              </span>
            </Tooltip>
          ),
        },
        {
          title: "Leave",
          dataIndex: "totalLeaveDays",
          key: "totalLeaveDays",
          width: 100,
          align: "center",
          render: (days) => (
            <Tooltip title={`${days} leave days`}>
              <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                {days ?? 0} days
              </span>
            </Tooltip>
          ),
        },
        {
          title: "Half Day",
          dataIndex: "totalHalfDays",
          key: "totalHalfDays",
          width: 100,
          align: "center",
          render: (days) => (
            <Tooltip title={`${days} half days`}>
              <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                {days ?? 0} days
              </span>
            </Tooltip>
          ),
        },
      ],
    },
    {
      title: "Actions",
      key: "actions",
      width: 100,
      align: "center",
      render: (_, record) => (
        <Tooltip
          title={
            !filters.date
              ? "Please select a date to edit attendance"
              : "Edit attendance"
          }
        >
          <Button
            type="link"
            icon={<FiEdit />}
            onClick={() => handleEdit(record)}
            size="small"
            disabled={!filters.date}
          >
            Edit
          </Button>
        </Tooltip>
      ),
    },
  ];

  const handleFilterChange = (key, value) => {
    const newFilters = {
      ...filters,
      [key]: value,
    };
    onFilterChange(newFilters);
  };

  return (
    <div>
      {/* Edit Attendance Modal */}
      <Modal
        title={`Edit Attendance - ${editingRecord?.employeeName}`}
        open={isEditModalVisible}
        onCancel={handleCancelEdit}
        centered
        footer={[
          <Button key="cancel" onClick={handleCancelEdit}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={updateLoading}
            onClick={() => editForm.submit()}
          >
            Update Attendance
          </Button>,
        ]}
        width={600}
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleUpdateAttendance}
        >
          <Form.Item
            name="selectedDate"
            label="Select Available Date"
            extra={
              attendanceLoading
                ? "Loading available dates..."
                : `Select from ${attendanceDates?.length || 0} available dates`
            }
          >
            <DatePicker
              style={{width: "100%"}}
              format="YYYY-MM-DD"
              disabledDate={disabledDate}
              placeholder="Select available date"
              disabled={attendanceLoading}
              onChange={handleDateSelect} // ✅ Add this line
            />
          </Form.Item>
          {selectedDateStatus && (
            <div
              style={{
                marginTop: -10,
                marginBottom: 16,
                fontStyle: "italic",
                color: "#555",
              }}
            >
              Current status on this date:{" "}
              <strong style={{textTransform: "capitalize"}}>
                {selectedDateStatus}
              </strong>
            </div>
          )}
          <Form.Item
            name="status"
            label="Attendance Status"
            rules={[
              {required: true, message: "Please select attendance status"},
            ]}
          >
            <Select placeholder="Select status">
              <Option value="Present">Present</Option>
              <Option value="Absent">Absent</Option>
              <Option value="Paid Leave">Paid Leave</Option>
              <Option value="Half Day">Half Day</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Filters Section */}
      <Card className="mb-6">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Search
              placeholder="Search by employee name..."
              value={filters.searchText}
              onChange={(e) => handleFilterChange("searchText", e.target.value)}
              style={{width: "100%"}}
              allowClear
            />
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="Employee Type"
              value={filters.employeeType}
              onChange={(value) => handleFilterChange("employeeType", value)}
              style={{width: "100%"}}
              allowClear
            >
              <Option value="Staff">Staff</Option>
              <Option value="Manager">Manager</Option>
            </Select>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <DatePicker
              placeholder="Select Date"
              onChange={handleDateChange}
              value={filters.date || dayjs()} // show today if date is null
              style={{width: "100%"}}
              format="YYYY-MM-DD"
            />
          </Col>

          <Col xs={24} sm={12} md={6}>
            <DatePicker
              placeholder="Select Month"
              onChange={handleMonthChange}
              picker="month"
              value={
                filters.month && filters.year
                  ? dayjs()
                      .year(filters.year)
                      .month(filters.month - 1)
                  : null
              }
              style={{width: "100%"}}
              format="YYYY-MM"
            />
          </Col>
        </Row>
      </Card>

      <Table
        columns={columns}
        dataSource={attendanceSummary}
        rowKey="employeeId"
        loading={loading}
        pagination={{
          pageSize: 20,
        }}
        scroll={{x: 1200}}
        size="middle"
      />
      {/* Error Display */}
      {error && (
        <Card className="mt-6" style={{borderColor: "#ff4d4f"}}>
          <div style={{color: "#ff4d4f", textAlign: "center"}}>
            Error loading attendance data: {error.message}
          </div>
        </Card>
      )}
    </div>
  );
};

export default AttendanceOverviewTab;
