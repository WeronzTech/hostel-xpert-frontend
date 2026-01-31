import {
  Table,
  Tooltip,
  Modal,
  Form,
  Select,
  TimePicker,
  message,
  Input,
} from "antd";
import dayjs from "dayjs";
import ActionButton from "../common/ActionButton";
import {useEffect, useState} from "react";
import {useAssignStaff} from "../../hooks/maintenance/useAssignStaff";
import {useQuery, useQueryClient} from "@tanstack/react-query";
import {useSelector} from "react-redux";
import {markMaintenanceAsResolved} from "../../hooks/property/useProperty";
import {getStaffAccordingToKitchenId} from "../../hooks/inventory/useInventory";

const formatDate = (dateString) => dayjs(dateString).format("DD-MM-YYYY");

const formatMinutes = (totalMinutes) => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const hrs = hours > 0 ? `${hours} hr${hours > 1 ? "s" : ""}` : "";
  const mins = minutes > 0 ? `${minutes} min${minutes > 1 ? "s" : ""}` : "";
  return [hrs, mins].filter(Boolean).join(" ");
};

const getTimeRemaining = (timeNeeded, startedAt) => {
  if (!timeNeeded || !startedAt) return "N/A";
  const now = dayjs();
  const startTime = dayjs(startedAt);
  const elapsedMinutes = now.diff(startTime, "minute");
  const remaining = Math.max(0, timeNeeded - elapsedMinutes);
  if (remaining <= 0) return "Time Expired";
  return formatMinutes(remaining);
};

const MaintenanceTable = ({
  data,
  status,
  currentPage,
  pageSize,
  total,
  onPageChange,
  loading = false,
  onRowClick,
}) => {
  const [isAssignModalVisible, setIsAssignModalVisible] = useState(false);
  const [isResolveModalVisible, setIsResolveModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isResolving, setIsResolving] = useState(false);
  const [form] = Form.useForm();
  const [resolveForm] = Form.useForm();
  const [filter, setFilter] = useState({manager: "true"});
  const {assignStaff, isLoading: isAssigning} = useAssignStaff();

  const queryClient = useQueryClient();

  // Get selected property from Redux
  const selectedProperty = useSelector(
    (state) => state.properties.selectedProperty
  );
  const selectedPropertyId = selectedProperty?.id;

  useEffect(() => {
    const newFilter = {manager: "true"};
    if (selectedPropertyId) newFilter.propertyId = selectedPropertyId;
    setFilter(newFilter);
  }, [selectedPropertyId]);

  // Fetch staff by property ID

  const {data: staffData, isStaffLoading} = useQuery({
    queryKey: ["staff-list", filter],
    queryFn: () => getStaffAccordingToKitchenId(filter),
  });

  const handleAssignClick = (record, e) => {
    e?.stopPropagation();
    setSelectedRecord(record);
    setIsAssignModalVisible(true);
    form.resetFields();
  };

  const handleResolveClick = (record, e) => {
    e?.stopPropagation();
    setSelectedRecord(record);
    setIsResolveModalVisible(true);
    resolveForm.resetFields();
  };

  const handleAssignModalOk = async () => {
    try {
      const values = await form.validateFields();

      // Convert TimePicker value to total minutes
      const timeValue = values.timeNeeded;
      const hours = timeValue.hour();
      const minutes = timeValue.minute();
      const totalMinutes = hours * 60 + minutes;

      await assignStaff({
        maintenanceId: selectedRecord._id,
        staffId: values.staff,
        timeNeeded: totalMinutes,
        propertyId: selectedPropertyId,
      });
      setIsAssignModalVisible(false);
    } catch (error) {
      console.error("Validation failed:", error);
      message.error("Please complete all required fields");
    }
  };

  const handleResolveModalOk = async () => {
    try {
      setIsResolving(true);
      const values = await resolveForm.validateFields();
      const remarks = values.remark || null;

      await markMaintenanceAsResolved(selectedRecord._id, remarks);

      message.success("Maintenance issue resolved successfully");
      setIsResolveModalVisible(false);

      // Invalidate queries to refresh the data
      queryClient.invalidateQueries(["maintenance", selectedPropertyId]);
      queryClient.invalidateQueries(["maintenanceCount", selectedPropertyId]);
    } catch (error) {
      console.error("Error resolving maintenance:", error);
      message.error(error.message || "Failed to resolve maintenance issue");
    } finally {
      setIsResolving(false);
    }
  };

  const handleModalCancel = () => {
    setIsAssignModalVisible(false);
    setIsResolveModalVisible(false);
    form.resetFields();
    resolveForm.resetFields();
  };

  const getColumnsByStatus = (status) => {
    const baseColumns = [
      {
        title: "#",
        key: "serialNo",
        align: "center",
        fixed: "left",
        width: 80,
        render: (_, __, index) => {
          // Calculate serial number based on current page and page size
          return (currentPage - 1) * pageSize + index + 1;
        },
      },
      {
        title: "Issuer Name",
        dataIndex: "userName",
        key: "username",
        align: "left",
      },
      {
        title: "Issue",
        dataIndex: "issue",
        key: "issue",
        align: "center",
      },
      {
        title: "Description",
        dataIndex: "description",
        key: "description",
        align: "center",
        ellipsis: true,
        render: (text) => (
          <Tooltip title={text}>
            <span>{text}</span>
          </Tooltip>
        ),
      },
    ];

    switch (status) {
      case "Pending":
        return [
          ...baseColumns,
          {
            title: "Room No",
            dataIndex: "roomNo",
            key: "roomNo",
            align: "center",
            render: (roomNo, record) => roomNo || "-",
          },
          {
            title: "Raised Date",
            dataIndex: "reportedAt",
            key: "reportedAt",
            align: "center",
            render: formatDate,
          },
          {
            title: "Action",
            key: "action",
            align: "center",
            render: (_, record) => {
              const isDisabled = isAssigning || !selectedPropertyId;

              return (
                <Tooltip title={isDisabled ? "Please select a property" : ""}>
                  <span>
                    <ActionButton
                      onClick={(e) => handleAssignClick(record, e)}
                      disabled={isDisabled}
                      style={{pointerEvents: isDisabled ? "none" : "auto"}}
                    >
                      Assign
                    </ActionButton>
                  </span>
                </Tooltip>
              );
            },
          },
        ];
      case "Ongoing":
        return [
          ...baseColumns,
          {
            title: "Assigned To",
            dataIndex: "staffName",
            key: "staffName",
            align: "center",
          },
          {
            title: "Time Needed",
            dataIndex: "timeNeeded",
            key: "timeNeeded",
            align: "center",
            width: 150,
            render: formatMinutes,
          },
          {
            title: "Time Remaining",
            key: "timeRemaining",
            align: "center",
            render: (_, record) =>
              getTimeRemaining(record.timeNeeded, record.acceptedAt),
          },
          {
            title: "Action",
            width: 150,
            render: (_, record) => (
              <ActionButton
                onClick={(e) => handleResolveClick(record, e)}
                disabled={isAssigning}
              >
                Resolve
              </ActionButton>
            ),
          },
        ];
      case "Resolved":
        return [
          ...baseColumns,
          {
            title: "Resolved By",
            dataIndex: "staffName",
            key: "staffName",
            align: "center",
          },
          {
            title: "Resolved Date",
            dataIndex: "resolvedAt",
            key: "resolvedAt",
            align: "center",
            render: formatDate,
          },
        ];
      default:
        return baseColumns;
    }
  };

  return (
    <>
      <Table
        rowKey={(record) => record._id}
        dataSource={Array.isArray(data) ? data : []}
        columns={getColumnsByStatus(status)}
        pagination={{
          current: currentPage,
          pageSize,
          total,
          onChange: onPageChange,
          showSizeChanger: false,
        }}
        loading={loading || isAssigning}
        scroll={{x: "max-content"}}
        onRow={(record) => ({
          onClick: () => onRowClick?.(record),
          style: {cursor: "pointer"},
        })}
      />

      {/* Assign Staff Modal */}
      <Modal
        title={`Assign Staff - ${
          selectedProperty?.name || "No Property Selected"
        }`}
        open={isAssignModalVisible}
        onOk={handleAssignModalOk}
        onCancel={handleModalCancel}
        okText={isAssigning ? "Assigning..." : "Assign"}
        okButtonProps={{loading: isAssigning}}
        cancelButtonProps={{disabled: isAssigning}}
        centered
        destroyOnClose
        maskClosable={false}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Staff Member"
            name="staff"
            rules={[{required: true, message: "Please select a staff member"}]}
          >
            <Select
              placeholder={isStaffLoading ? "Loading staff..." : "Select staff"}
              options={
                staffData?.staff?.map((staff) => ({
                  label: staff.name,
                  value: staff._id,
                })) || []
              }
              loading={isStaffLoading}
              disabled={isStaffLoading || isAssigning || !selectedPropertyId}
              showSearch
              optionFilterProp="label"
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              notFoundContent={
                !selectedPropertyId
                  ? "Please select a property first"
                  : isStaffLoading
                  ? "Loading staff..."
                  : "No staff available for this property"
              }
            />
          </Form.Item>

          <Form.Item
            label="Estimated Time Needed"
            name="timeNeeded"
            rules={[{required: true, message: "Please select time needed"}]}
          >
            <TimePicker
              format="HH:mm"
              placeholder="Select time (HH:MM)"
              style={{width: "100%"}}
              disabled={isAssigning}
              showNow={false}
              minuteStep={15}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Resolve Issue Modal */}
      <Modal
        title="Resolve Maintenance Issue"
        open={isResolveModalVisible}
        onOk={handleResolveModalOk}
        onCancel={handleModalCancel}
        okText="Resolve"
        okButtonProps={{
          loading: isResolving, // Add this state if needed
        }}
        cancelText="Cancel"
        centered
        destroyOnClose
        maskClosable={false}
      >
        <Form form={resolveForm} layout="vertical">
          <Form.Item label="Resolution Remark (Optional)" name="remark">
            <Input.TextArea
              rows={4}
              placeholder="Add any remarks about the resolution..."
              maxLength={500}
              showCount
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default MaintenanceTable;
