import {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import {Tabs, DatePicker, Card, Row, Col, Select, message, Input} from "antd";
import {FiCheckCircle, FiClock} from "react-icons/fi";
import TransactionsTable from "../../components/accounts/TransactionsTable";
import {PageHeader, StatsGrid} from "../../components";
import {
  getAllFeePayments,
  getPaymentAnalytics,
  getPendingFees,
} from "../../hooks/accounts/useAccounts";
import {useQuery} from "@tanstack/react-query";
import {useSelector} from "react-redux";
import PaymentAnalytics from "../../components/accounts/PaymentAnalytics";
import dayjs from "dayjs";
import usePersistentState from "../../hooks/usePersistentState";

const {Option} = Select;
const {TabPane} = Tabs;

const FinancialDetailsPage = () => {
  const {type} = useParams();
  const {selectedProperty} = useSelector((state) => state.properties);

  // Use regular state for activeTab to avoid navigation issues
  const [activeTab, setActiveTab] = useState("received");

  // Use persistent state for selected year (simple value)
  const [selectedYear, setSelectedYear] = usePersistentState(
    "financialDetails_selectedYear",
    new Date().getFullYear()
  );

  const handleYearChange = (year) => {
    setSelectedYear(year);
  };

  // Separate query for available years
  const {data: yearsData} = useQuery({
    queryKey: ["available-years", selectedProperty?.id],
    queryFn: () =>
      getAllFeePayments({
        propertyId: selectedProperty?.id,
        limit: 1,
        page: 1,
      }),
    enabled: true,
  });

  const availableYears = yearsData?.availableYears || [
    new Date().getFullYear(),
  ];
  const sortedYears = [...availableYears].sort((a, b) => b - a);

  // Ensure selectedYear is always valid
  useEffect(() => {
    if (sortedYears.length > 0 && !sortedYears.includes(selectedYear)) {
      setSelectedYear(sortedYears[0]);
    }
  }, [sortedYears, selectedYear]);

  // Reset selectedYear when property changes
  useEffect(() => {
    if (sortedYears.length > 0) {
      setSelectedYear(sortedYears[0]);
    }
  }, [selectedProperty?.id]);

  // Store only string dates in persistent state
  const [receivedFilters, setReceivedFilters] = usePersistentState(
    "financialDetails_receivedFilters",
    {
      userType: "",
      paymentMethod: "",
      selectedMonth: null, // Store as ISO string
      search: "",
      paymentDate: null, // Store as ISO string
    }
  );

  const [pendingFilters, setPendingFilters] = usePersistentState(
    "financialDetails_pendingFilters",
    {
      userType: "",
      search: "",
    }
  );

  // Convert stored string dates to Day.js objects for use in components
  const normalizedReceivedFilters = {
    ...receivedFilters,
    selectedMonth: receivedFilters.selectedMonth
      ? dayjs(receivedFilters.selectedMonth)
      : null,
    paymentDate: receivedFilters.paymentDate
      ? dayjs(receivedFilters.paymentDate)
      : null,
  };

  // Use regular state for pagination to avoid complex objects in localStorage
  const [pagination, setPagination] = useState({
    received: {page: 1, limit: 10},
    pending: {page: 1, limit: 10},
  });

  // Refetch data when tab changes
  useEffect(() => {
    if (activeTab === "received") {
      refetchFees();
    } else if (activeTab === "pending") {
      refetchPendingFees();
    }
  }, [activeTab]);

  // Get current tab filters
  const getCurrentFilters = () => {
    return activeTab === "received"
      ? normalizedReceivedFilters
      : pendingFilters;
  };

  // Received Fees Query
  const {
    data: feeData,
    isLoading: feeLoading,
    error: feeError,
    refetch: refetchFees,
  } = useQuery({
    queryKey: [
      "fees",
      "received",
      pagination.received.page,
      pagination.received.limit,
      receivedFilters.paymentMethod,
      receivedFilters.userType,
      receivedFilters.selectedMonth, // Use the stored string
      receivedFilters.search,
      selectedProperty?.id,
      type,
      receivedFilters.paymentDate, // Use the stored string
    ],
    queryFn: () => {
      const params = {
        page: pagination.received.page,
        limit: pagination.received.limit,
        userType: receivedFilters.userType,
        paymentMethod: receivedFilters.paymentMethod,
        search: receivedFilters.search,
        propertyId: selectedProperty?.id,
        rentType: type,
        paymentDate: receivedFilters.paymentDate || undefined,
      };

      if (receivedFilters.selectedMonth) {
        const month = dayjs(receivedFilters.selectedMonth);
        params.paymentMonth = month.month() + 1;
        params.paymentYear = month.year();
      }
      return getAllFeePayments(params);
    },
  });

  // Pending Deposits Query
  const {
    data: pendingFeesData,
    isLoading: pendingFeesLoading,
    error: pendingFeesError,
    refetch: refetchPendingFees,
  } = useQuery({
    queryKey: [
      "pendingFees",
      pagination.pending.page,
      pagination.pending.limit,
      pendingFilters.userType,
      pendingFilters.search,
      selectedProperty?.id,
      type,
    ],
    queryFn: () => {
      const params = {
        page: pagination.pending.page,
        limit: pagination.pending.limit,
        userType: pendingFilters.userType,
        search: pendingFilters.search,
        propertyId: selectedProperty?.id,
        rentType: type,
      };
      return getPendingFees(params);
    },
  });

  // Analytics data query
  const {
    data: analyticsData,
    isLoading: analyticsLoading,
    error: analyticsError,
  } = useQuery({
    queryKey: ["payment-analytics", selectedProperty?.id, type, selectedYear],
    queryFn: () =>
      getPaymentAnalytics(selectedProperty?.id, type, selectedYear),
    enabled: activeTab === "analytics",
  });

  // Handle errors
  useEffect(() => {
    if (feeError) {
      message.error(`Failed to load fees data`);
    }
    if (pendingFeesError) {
      message.error(`Failed to load pending fees data`);
    }
    if (analyticsError) {
      message.error(`Failed to load analytics data`);
    }
  }, [feeError, pendingFeesError, analyticsError]);

  // Reset pagination to page 1 when filters change for current tab
  useEffect(() => {
    setPagination((prev) => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        page: 1,
      },
    }));
  }, [receivedFilters, pendingFilters, activeTab, selectedProperty?.id]);

  // Filter handlers that store dates as ISO strings
  const handleUserTypeChange = (value) => {
    if (activeTab === "received") {
      setReceivedFilters((prev) => ({
        ...prev,
        userType: value,
      }));
    } else if (activeTab === "pending") {
      setPendingFilters((prev) => ({
        ...prev,
        userType: value,
      }));
    }
  };

  const handlePaymentDateChange = (date) => {
    setReceivedFilters((prev) => ({
      ...prev,
      paymentDate: date ? date.format("YYYY-MM-DD") : null,
    }));
  };

  const handlePaymentMethodChange = (value) => {
    setReceivedFilters((prev) => ({
      ...prev,
      paymentMethod: value,
    }));
  };

  const handleMonthChange = (date) => {
    setReceivedFilters((prev) => ({
      ...prev,
      selectedMonth: date ? date.toISOString() : null,
    }));
  };

  const handleSearch = (value) => {
    if (activeTab === "received") {
      setReceivedFilters((prev) => ({
        ...prev,
        search: value,
      }));
    } else if (activeTab === "pending") {
      setPendingFilters((prev) => ({
        ...prev,
        search: value,
      }));
    }
  };

  const getTabData = () => {
    const dataMap = {
      received: feeData?.data || [],
      pending: pendingFeesData?.data || [],
    };
    return dataMap[activeTab] || [];
  };

  // Safe pagination getter with fallback
  const getCurrentPagination = () => {
    return pagination[activeTab] || {page: 1, limit: 10};
  };

  // Handle pagination change
  const handlePaginationChange = (newPagination) => {
    setPagination((prev) => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        page: newPagination.page,
        limit: newPagination.limit,
      },
    }));
  };

  // Stats
  const feeStats = [
    {
      title: "Payment Received",
      value: `₹${feeData?.totalReceived?.toLocaleString() || 0}`,
      icon: <FiCheckCircle className="text-xl" />,
      color: "bg-green-100 text-green-500",
    },
    {
      title: "Payment Pending",
      value: `₹${pendingFeesData?.totalPending?.toLocaleString() || 0}`,
      icon: <FiClock className="text-xl" />,
      color: "bg-red-100 text-red-500",
    },
  ];

  // Render appropriate filters based on active tab
  const renderFilters = () => {
    const currentFilters = getCurrentFilters();

    if (activeTab === "received") {
      return (
        <>
          {/* Search Input */}
          <Col xs={24} sm={12} md={8} lg={5}>
            <Input.Search
              placeholder="Search by Name or transaction ID"
              value={currentFilters.search}
              onChange={(e) => handleSearch(e.target.value)}
              onSearch={handleSearch}
              style={{width: "100%"}}
              allowClear
            />
          </Col>

          {/* User Type Select */}
          <Col xs={24} sm={12} md={8} lg={4}>
            <Select
              placeholder="Select User Type"
              value={currentFilters.userType || undefined}
              onChange={handleUserTypeChange}
              style={{width: "100%"}}
              allowClear
            >
              <Option value="student">Student</Option>
              <Option value="worker">Worker</Option>
            </Select>
          </Col>

          {/* Payment Method Select */}
          <Col xs={24} sm={12} md={8} lg={4}>
            <Select
              placeholder="Select Payment Mode"
              value={currentFilters.paymentMethod || undefined}
              onChange={handlePaymentMethodChange}
              style={{width: "100%"}}
              allowClear
            >
              <Option value="Cash">Cash</Option>
              <Option value="UPI">UPI</Option>
              <Option value="Bank Transfer">Bank Transfer</Option>
              <Option value="Card">Card</Option>
              <Option value="Razorpay">Razorpay</Option>
            </Select>
          </Col>

          {/* Month Picker */}
          <Col xs={24} sm={12} md={8} lg={5}>
            <DatePicker
              placeholder="Select Month"
              value={currentFilters.selectedMonth}
              onChange={handleMonthChange}
              picker="month"
              style={{width: "100%"}}
              format="MMM YYYY"
            />
          </Col>

          {/* Payment Date Picker */}
          <Col xs={24} sm={12} md={8} lg={5}>
            <DatePicker
              placeholder="Select Payment Date"
              value={currentFilters.paymentDate}
              onChange={handlePaymentDateChange}
              style={{width: "100%"}}
              format="YYYY-MM-DD"
              allowClear
            />
          </Col>
        </>
      );
    }

    if (activeTab === "pending") {
      return (
        <>
          {/* Search Input */}
          <Col xs={24} sm={12} md={8} lg={6}>
            <Input.Search
              placeholder="Search by name or contact"
              value={currentFilters.search}
              onChange={(e) => handleSearch(e.target.value)}
              onSearch={handleSearch}
              style={{width: "100%"}}
              allowClear
            />
          </Col>

          {/* User Type Select */}
          <Col xs={24} sm={12} md={8} lg={4}>
            <Select
              placeholder="Select User Type"
              value={currentFilters.userType || undefined}
              onChange={handleUserTypeChange}
              style={{width: "100%"}}
              allowClear
            >
              <Option value="student">Student</Option>
              <Option value="worker">Worker</Option>
            </Select>
          </Col>
        </>
      );
    }

    return null;
  };

  const getPageTitle = () => {
    const titles = {
      monthly: "Monthly Rent Transactions",
      daily: "Daily Rent Transactions",
      mess: "Mess Charges Transactions",
    };
    return titles[type] || "Transactions";
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 pt-4 pb-8 xl:px-12 lg:px-6">
      {/* Header */}
      <PageHeader title={getPageTitle()} subtitle="transaction overview" />

      {/* Summary Statistics */}
      <StatsGrid stats={feeStats} />

      {/* Filters Section */}
      {activeTab !== "analytics" && (
        <Card size="small" style={{marginBottom: 16}}>
          <Row gutter={[16, 16]}>{renderFilters()}</Row>
        </Card>
      )}

      <Tabs activeKey={activeTab} onChange={setActiveTab} type="card" centered>
        <TabPane tab="Payment Received" key="received">
          <TransactionsTable
            data={getTabData()}
            loading={feeLoading}
            pagination={getCurrentPagination()}
            total={feeData?.pagination?.total || 0}
            onPaginationChange={handlePaginationChange}
            transactionType={type}
          />
        </TabPane>

        <TabPane tab="Pending Payments" key="pending">
          <TransactionsTable
            data={getTabData()}
            loading={pendingFeesLoading}
            pagination={getCurrentPagination()}
            total={pendingFeesData?.pagination?.total || 0}
            onPaginationChange={handlePaginationChange}
            type="pending"
            transactionType={type}
          />
        </TabPane>

        <TabPane tab="Payment Analytics" key="analytics">
          <PaymentAnalytics
            data={analyticsData}
            loading={analyticsLoading}
            selectedYear={selectedYear}
            onYearChange={handleYearChange}
            availableYears={sortedYears}
          />
        </TabPane>
      </Tabs>
    </div>
  );
};

export default FinancialDetailsPage;
