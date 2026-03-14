import {useState, useEffect} from "react";
import {useQuery} from "@tanstack/react-query";
import {Table, Button, Space, Tag, Card, Tooltip} from "antd";
import {WalletOutlined} from "@ant-design/icons";
import dayjs from "dayjs";
import {getPayrolls} from "../../hooks/accounts/useAccounts";
import PayrollFilters from "./PayrollFilters";
import PaymentModal from "./PaymentModal";
import AdvancePaymentModal from "./AdvancePaymentModal";
import {useSelector} from "react-redux";
import {useParams} from "react-router-dom";
import UpdateLeaveModal from "./UpdateLeaveModal";
import PageHeader from "../common/PageHeader";
import CreateMissingPayrollModal from "./CreateMissingPayrollModal";
import TransactionHistoryModal from "./TransactionHistoryModal";

const PayrollPage = () => {
  const {type} = useParams();

  // Determine if we're in property or kitchen context
  const isProperty = type?.toUpperCase() === "PROPERTY";
  const isKitchen = type?.toUpperCase() === "KITCHEN";

  // Calculate previous month (February 2026 since today is March 3, 2026)
  const currentDate = dayjs(); // March 3, 2026
  const previousMonth = currentDate.subtract(1, "month");

  const [filters, setFilters] = useState({
    search: "",
    month: previousMonth.month(), // Returns 1 for February (0-indexed)
    year: previousMonth.year(), // Returns 2026
    status: "all",
    propertyId: "all",
    kitchenId: "all",
    clientId: null,
    type: type?.toUpperCase() || "", // Set initial type from URL params
  });

  // Update filters when type changes (e.g., when navigating between PROPERTY and KITCHEN routes)
  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      type: type?.toUpperCase() || "",
    }));
  }, [type]);

  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
  const [isAdvanceModalVisible, setIsAdvanceModalVisible] = useState(false);
  const [isUpdateLeaveVisible, setIsUpdateLeaveModalVisible] = useState(false);
  const [isTransactionModalVisible, setIsTransactionModalVisible] =
    useState(false);

  const [selectedPayroll, setSelectedPayroll] = useState(null);

  const {selectedProperty} = useSelector((state) => state.properties);
  const {selectedKitchen} = useSelector((state) => state.kitchens);

  // Update filters when selected property/kitchen changes
  useEffect(() => {
    if (isProperty) {
      setFilters((prev) => ({
        ...prev,
        propertyId: selectedProperty?.id || "all", // Use "all" if no property selected
        kitchenId: "all",
        type: "PROPERTY", // Ensure type is set
      }));
    } else if (isKitchen) {
      setFilters((prev) => ({
        ...prev,
        kitchenId: selectedKitchen?.id || "all", // Use "all" if no kitchen selected
        propertyId: "all",
        type: "KITCHEN", // Ensure type is set
      }));
    }
  }, [isProperty, isKitchen, selectedProperty, selectedKitchen]);

  // Fetch payrolls with TanStack Query
  const {
    data: payrollResponse,
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: [
      "payrolls",
      filters,
      type,
      selectedProperty?.id,
      selectedKitchen?.id,
    ],
    queryFn: () => {
      // Prepare query params based on type
      const queryParams = {
        search: filters.search,
        month: filters.month,
        year: filters.year,
        clientId: filters.clientId,
        type: filters.type, // This will now be set correctly
      };

      // Only add status if it's not "all"
      if (filters.status && filters.status !== "all") {
        queryParams.status = filters.status;
      }

      // Conditionally add propertyId or kitchenId based on type
      if (isProperty) {
        // Pass propertyId (could be "all" or actual ID)
        queryParams.propertyId = filters.propertyId;
      } else if (isKitchen) {
        // Pass kitchenId (could be "all" or actual ID)
        queryParams.kitchenId = filters.kitchenId;
      }

      // Remove undefined values
      Object.keys(queryParams).forEach((key) => {
        if (
          queryParams[key] === undefined ||
          queryParams[key] === null ||
          queryParams[key] === ""
        ) {
          delete queryParams[key];
        }
      });

      console.log("Sending query params:", queryParams);
      return getPayrolls(queryParams);
    },
    keepPreviousData: true,
    // Always enabled since we now use "all" as default
    enabled: true,
  });

  // Extract data from nested response
  const payrolls = payrollResponse?.data?.data || [];

  // Table columns
  const columns = [
    {
      title: "#",
      key: "serial",
      render: (_, __, index) => index + 1,
      width: 60,
      align: "center",
      fixed: "left",
    },
    {
      title: "Employee",
      key: "employee",
      render: (_, record) => (
        <div>
          <div className="font-medium">
            {record.name}
            <span className="text-xs text-gray-500">{record.jobTitle}</span>
          </div>
        </div>
      ),
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "Salary",
      dataIndex: "salary",
      key: "salary",
      render: (value) => `₹${value?.toLocaleString()}`,
      sorter: (a, b) => a.salary - b.salary,
    },
    {
      title: "Leave Days",
      dataIndex: "leaveDays",
      key: "leaveDays",
      render: (value) => value || 0,
    },
    {
      title: "Leave Deduction",
      dataIndex: "leaveDeduction",
      key: "leaveDeduction",
      render: (value) => `₹${value?.toLocaleString() || 0}`,
    },
    {
      title: "Advance Adjusted",
      dataIndex: "advanceAdjusted",
      key: "advanceAdjusted",
      render: (value) => `₹${value?.toLocaleString() || 0}`,
    },
    {
      title: "Net Salary",
      dataIndex: "netSalary",
      key: "netSalary",
      render: (value) => (
        <span className="font-semibold text-green-600">
          ₹{value?.toLocaleString()}
        </span>
      ),
      sorter: (a, b) => a.netSalary - b.netSalary,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status, record) => {
        const colors = {
          Pending: "orange",
          Paid: "green",
          Processing: "blue",
          Cancelled: "red",
        };

        const displayText =
          status === "Pending" ? `${status} - ${record.pendingAmount}` : status;

        return <Tag color={colors[status] || "default"}>{displayText}</Tag>;
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          {record.status !== "Paid" && (
            <Tooltip title="Make Payment">
              <Button
                type="primary"
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePayment(record);
                }}
              >
                Pay
              </Button>
            </Tooltip>
          )}

          {record.status === "Paid" && (
            <Tooltip title="Make Advance Payment">
              <Button
                type="default"
                size="small"
                icon={<WalletOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  handleAdvancePayment(record);
                }}
              >
                Advance
              </Button>
            </Tooltip>
          )}

          {record.status === "Pending" && (
            <Tooltip title="Leave Reduction">
              <Button
                type="dashed"
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleLeaveReduction(record);
                }}
              >
                Leave
              </Button>
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  // Add context column based on type - only show if we have actual property/kitchen data
  if (isProperty && filters.propertyId !== "all") {
    columns.splice(1, 0, {
      title: "Property",
      key: "property",
      render: (_, record) =>
        record.propertyName || selectedProperty?.name || "N/A",
    });
  } else if (isKitchen && filters.kitchenId !== "all") {
    columns.splice(1, 0, {
      title: "Kitchen",
      key: "kitchen",
      render: (_, record) =>
        record.kitchenName || selectedKitchen?.name || "N/A",
    });
  }

  // Handlers
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({...prev, [key]: value}));
  };

  const handleSearch = (value) => {
    setFilters((prev) => ({...prev, search: value}));
  };

  const handlePayment = (record) => {
    setSelectedPayroll(record);
    setIsPaymentModalVisible(true);
  };

  const handleAdvancePayment = (record) => {
    setSelectedPayroll(record);
    setIsAdvanceModalVisible(true);
  };

  const handleLeaveReduction = (record) => {
    setSelectedPayroll(record);
    setIsUpdateLeaveModalVisible(true);
  };

  const handleCreateMissing = () => {
    setIsCreateModalVisible(true);
  };

  const handleRowClick = (record) => {
    setSelectedPayroll(record);
    setIsTransactionModalVisible(true);
  };

  return (
    <div className="payroll-page">
      <PageHeader
        title="Payroll Management"
        subtitle="Manage employee monthly payroll and history"
      />
      {/* Header Section */}
      <div className="mb-6">
        {/* Filters Section */}
        <PayrollFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onSearch={handleSearch}
          onCreateMissing={handleCreateMissing}
          selectedProperty={selectedProperty}
          selectedKitchen={selectedKitchen}
          contextType={type}
        />
      </div>
      {/* Table Section */}
      <Card>
        <Table
          columns={columns}
          dataSource={payrolls}
          loading={isLoading || isFetching}
          rowKey="_id"
          pagination={false}
          scroll={{x: 1200}}
          className="payroll-table"
          locale={{
            emptyText: isLoading ? "Loading..." : "No payroll data found",
          }}
          onRow={(record) => ({
            onClick: () => handleRowClick(record),
            style: {cursor: "pointer"},
          })}
        />
      </Card>

      <TransactionHistoryModal
        visible={isTransactionModalVisible}
        payroll={selectedPayroll}
        onCancel={() => {
          setIsTransactionModalVisible(false);
          setSelectedPayroll(null);
        }}
      />

      <PaymentModal
        visible={isPaymentModalVisible}
        payroll={selectedPayroll}
        onCancel={() => {
          setIsPaymentModalVisible(false);
          setSelectedPayroll(null);
        }}
        onSuccess={() => {
          setIsPaymentModalVisible(false);
          setSelectedPayroll(null);
          refetch();
        }}
      />

      <AdvancePaymentModal
        visible={isAdvanceModalVisible}
        payroll={selectedPayroll}
        onCancel={() => {
          setIsAdvanceModalVisible(false);
          setSelectedPayroll(null);
        }}
        onSuccess={() => {
          setIsAdvanceModalVisible(false);
          setSelectedPayroll(null);
          refetch();
        }}
      />

      <UpdateLeaveModal
        visible={isUpdateLeaveVisible}
        payroll={selectedPayroll}
        onCancel={() => {
          setIsUpdateLeaveModalVisible(false);
          setSelectedPayroll(null);
        }}
        onSuccess={() => {
          setIsUpdateLeaveModalVisible(false);
          setSelectedPayroll(null);
          refetch();
        }}
      />

      <CreateMissingPayrollModal
        visible={isCreateModalVisible}
        onCancel={() => setIsCreateModalVisible(false)}
        onSuccess={() => {
          setIsCreateModalVisible(false);
          refetch();
        }}
      />
    </div>
  );
};

export default PayrollPage;
