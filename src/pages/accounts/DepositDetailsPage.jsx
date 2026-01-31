// import {useEffect, useState} from "react";
// import {Card, Tabs, DatePicker, Row, Col, Select, message} from "antd";
// import {
//   FiCheckCircle,
//   FiClock,
//   FiRefreshCw,
//   FiTrendingUp,
// } from "react-icons/fi";
// import {PageHeader, StatsGrid} from "../../components";
// import DepositTransactionsTable from "../../components/accounts/DepositTransactionTable";
// import {useSelector} from "react-redux";
// import {useQuery, useQueryClient} from "@tanstack/react-query";
// import {
//   getAllDepositPayments,
//   getPendingDeposits,
// } from "../../hooks/accounts/useAccounts";
// import Search from "antd/es/input/Search";

// const {RangePicker} = DatePicker;
// const {TabPane} = Tabs;
// const {Option} = Select;

// const DepositDetailsPage = () => {
//   const {selectedProperty} = useSelector((state) => state.properties);
//   const [activeTab, setActiveTab] = useState("received");
//   const queryClient = useQueryClient();

//   // Separate filters for each tab
//   const [filters, setFilters] = useState({
//     received: {
//       userType: "",
//       paymentMethod: "",
//       selectedMonth: null,
//       search: "",
//       isRefund: false, // Explicitly false for received
//     },
//     pending: {
//       userType: "",
//       search: "",
//     },
//     refunded: {
//       userType: "",
//       paymentMethod: "",
//       selectedMonth: null,
//       search: "",
//       isRefund: true, // Explicitly true for refunded
//     },
//   });

//   // Infinite scroll pagination state
//   const [pagination, setPagination] = useState({
//     received: {page: 1, limit: 10},
//     pending: {page: 1, limit: 10},
//     refunded: {page: 1, limit: 10},
//   });

//   // Refetch data when tab changes
//   useEffect(() => {
//     if (activeTab === "received") {
//       refetchDeposits();
//     } else if (activeTab === "pending") {
//       refetchPendingDeposits();
//     } else if (activeTab === "refunded") {
//       refundedDepositsRefetch();
//     }
//   }, [activeTab]);

//   // Reset pagination to page 1 when filters change for current tab
//   useEffect(() => {
//     setPagination((prev) => ({
//       ...prev,
//       [activeTab]: {
//         ...prev[activeTab],
//         page: 1,
//       },
//     }));
//   }, [filters[activeTab], activeTab]);

//   // Get current tab filters
//   const getCurrentFilters = () => filters[activeTab];

//   // Received Deposits Query (isRefund: false)
//   const {
//     data: depositData,
//     isLoading: depositLoading,
//     error: depositError,
//     refetch: refetchDeposits,
//   } = useQuery({
//     queryKey: [
//       "deposits",
//       "received",
//       pagination.received.page,
//       pagination.received.limit,
//       filters.received.paymentMethod,
//       filters.received.userType,
//       filters.received.selectedMonth,
//       filters.received.search,
//       selectedProperty?.id,
//     ],
//     queryFn: () => {
//       const params = {
//         page: pagination.received.page,
//         limit: pagination.received.limit,
//         userType: filters.received.userType,
//         paymentMethod: filters.received.paymentMethod,
//         search: filters.received.search,
//         propertyId: selectedProperty?.id,
//         isRefund: false, // Explicitly false for received
//       };

//       if (filters.received.selectedMonth) {
//         params.paymentMonth = filters.received.selectedMonth.month() + 1;
//         params.paymentYear = filters.received.selectedMonth.year();
//       }
//       return getAllDepositPayments(params);
//     },
//     enabled: activeTab === "received",
//   });

//   // Refunded Deposits Query (isRefund: true)
//   const {
//     data: refundedDepositsData,
//     isLoading: refundedDepositsLoading,
//     error: refundedDepositsError,
//     refetch: refundedDepositsRefetch,
//   } = useQuery({
//     queryKey: [
//       "deposits",
//       "refunded",
//       pagination.refunded.page,
//       pagination.refunded.limit,
//       filters.refunded.paymentMethod,
//       filters.refunded.userType,
//       filters.refunded.selectedMonth,
//       filters.refunded.search,
//       selectedProperty?.id,
//     ],
//     queryFn: () => {
//       const params = {
//         page: pagination.refunded.page,
//         limit: pagination.refunded.limit,
//         userType: filters.refunded.userType,
//         paymentMethod: filters.refunded.paymentMethod,
//         search: filters.refunded.search,
//         propertyId: selectedProperty?.id,
//         isRefund: true, // Explicitly true for refunded
//       };

//       if (filters.refunded.selectedMonth) {
//         params.paymentMonth = filters.refunded.selectedMonth.month() + 1;
//         params.paymentYear = filters.refunded.selectedMonth.year();
//       }
//       return getAllDepositPayments(params);
//     },
//     enabled: activeTab === "refunded",
//   });

//   // Pending Deposits Query
//   const {
//     data: pendingDepositsData,
//     isLoading: pendingDepositsLoading,
//     error: pendingDepositsError,
//     refetch: refetchPendingDeposits,
//   } = useQuery({
//     queryKey: [
//       "pendingDeposits",
//       pagination.pending.page,
//       pagination.pending.limit,
//       filters.pending.userType,
//       filters.pending.search,
//       selectedProperty?.id,
//     ],
//     queryFn: () => {
//       const params = {
//         page: pagination.pending.page,
//         limit: pagination.pending.limit,
//         userType: filters.pending.userType,
//         search: filters.pending.search,
//         propertyId: selectedProperty?.id,
//       };
//       return getPendingDeposits(params);
//     },
//     enabled: activeTab === "pending",
//   });

//   // Handle errors
//   useEffect(() => {
//     if (depositError) {
//       message.error(`Failed to load deposits data`);
//     }
//     if (pendingDepositsError) {
//       message.error(`Failed to load pending deposits data`);
//     }
//     if (refundedDepositsError) {
//       message.error(`Failed to load refunded deposits data`);
//     }
//   }, [depositError, pendingDepositsError, refundedDepositsError]);

//   // Filter handlers that update specific tab filters
//   const handleUserTypeChange = (value) => {
//     setFilters((prev) => ({
//       ...prev,
//       [activeTab]: {
//         ...prev[activeTab],
//         userType: value,
//       },
//     }));
//   };

//   const handlePaymentMethodChange = (value) => {
//     setFilters((prev) => ({
//       ...prev,
//       [activeTab]: {
//         ...prev[activeTab],
//         paymentMethod: value,
//       },
//     }));
//   };

//   const handleMonthChange = (date) => {
//     setFilters((prev) => ({
//       ...prev,
//       [activeTab]: {
//         ...prev[activeTab],
//         selectedMonth: date,
//       },
//     }));
//   };

//   const handleSearch = (value) => {
//     setFilters((prev) => ({
//       ...prev,
//       [activeTab]: {
//         ...prev[activeTab],
//         search: value,
//       },
//     }));
//   };

//   const getTabData = () => {
//     const dataMap = {
//       received: depositData?.data || [],
//       pending: pendingDepositsData?.data || [],
//       refunded: refundedDepositsData?.data || [],
//     };
//     return dataMap[activeTab] || [];
//   };

//   const getCurrentPagination = () => {
//     return pagination[activeTab];
//   };

//   const getCurrentTotal = () => {
//     const totalMap = {
//       received: depositData?.pagination?.total || 0,
//       pending: pendingDepositsData?.pagination?.total || 0,
//       refunded: refundedDepositsData?.pagination?.total || 0,
//     };
//     return totalMap[activeTab] || 0;
//   };

//   // Handle infinite scroll pagination change
//   const handlePaginationChange = (newPagination) => {
//     setPagination((prev) => ({
//       ...prev,
//       [activeTab]: {
//         ...prev[activeTab],
//         page: newPagination.page,
//         limit: newPagination.limit,
//       },
//     }));
//   };

//   // Stats using global unfiltered data
//   const depositStats = [
//     {
//       title: "Total Non-refundable",
//       value: `₹${
//         pendingDepositsData?.totalNonRefundable?.toLocaleString() || 0
//       }`,
//       icon: <FiTrendingUp className="text-xl" />,
//       color: "bg-blue-100 text-blue-600",
//     },
//     {
//       title: "Total Refundable",
//       value: `₹${pendingDepositsData?.totalRefundable?.toLocaleString() || 0}`,
//       icon: <FiTrendingUp className="text-xl" />,
//       color: "bg-orange-100 text-orange-600",
//     },
//     {
//       title: "Received Amount",
//       value: `₹${depositData?.totalReceivedAmount?.toLocaleString() || 0}`,
//       icon: <FiCheckCircle className="text-xl" />,
//       color: "bg-green-100 text-green-600",
//     },
//     {
//       title: "Pending Deposits",
//       value: `₹${
//         pendingDepositsData?.totalPendingAmount?.toLocaleString() || 0
//       }`,
//       icon: <FiClock className="text-xl" />,
//       color: "bg-red-100 text-red-500",
//     },
//     {
//       title: "Refunded Amount",
//       value: `₹${
//         refundedDepositsData?.totalRefundedAmount?.toLocaleString() || 0
//       }`,
//       icon: <FiRefreshCw className="text-xl" />,
//       color: "bg-green-100 text-green-500",
//     },
//   ];

//   // Render appropriate filters based on active tab
//   const renderFilters = () => {
//     const currentFilters = getCurrentFilters();

//     if (activeTab === "received" || activeTab === "refunded") {
//       return (
//         <>
//           {/* Search Input */}
//           <Col xs={24} sm={12} md={8} lg={5}>
//             <Search
//               placeholder={
//                 activeTab === "received"
//                   ? "Search by title or transaction ID"
//                   : "Search refunded transactions"
//               }
//               value={currentFilters.search}
//               onChange={(e) => handleSearch(e.target.value)}
//               onSearch={handleSearch}
//               style={{width: "100%"}}
//               allowClear
//             />
//           </Col>

//           {/* User Type Select */}
//           <Col xs={24} sm={12} md={8} lg={4}>
//             <Select
//               placeholder="Select User Type"
//               value={currentFilters.userType || undefined}
//               onChange={handleUserTypeChange}
//               style={{width: "100%"}}
//               allowClear
//             >
//               <Option value="student">Student</Option>
//               <Option value="worker">Worker</Option>
//             </Select>
//           </Col>

//           {/* Payment Method Select */}
//           <Col xs={24} sm={12} md={8} lg={4}>
//             <Select
//               placeholder="Select Payment Mode"
//               value={currentFilters.paymentMethod || undefined}
//               onChange={handlePaymentMethodChange}
//               style={{width: "100%"}}
//               allowClear
//             >
//               <Option value="Cash">Cash</Option>
//               <Option value="UPI">UPI</Option>
//               <Option value="Bank Transfer">Bank Transfer</Option>
//               <Option value="Card">Card</Option>
//             </Select>
//           </Col>

//           {/* Month Picker */}
//           <Col xs={24} sm={12} md={8} lg={5}>
//             <DatePicker
//               placeholder="Select Month"
//               value={currentFilters.selectedMonth}
//               onChange={handleMonthChange}
//               picker="month"
//               style={{width: "100%"}}
//               format="MMM YYYY"
//             />
//           </Col>
//         </>
//       );
//     }

//     if (activeTab === "pending") {
//       return (
//         <>
//           {/* Search Input */}
//           <Col xs={24} sm={12} md={8} lg={6}>
//             <Search
//               placeholder="Search by name or contact"
//               value={currentFilters.search}
//               onChange={(e) => handleSearch(e.target.value)}
//               onSearch={handleSearch}
//               style={{width: "100%"}}
//               allowClear
//             />
//           </Col>

//           {/* User Type Select */}
//           <Col xs={24} sm={12} md={8} lg={4}>
//             <Select
//               placeholder="Select User Type"
//               value={currentFilters.userType || undefined}
//               onChange={handleUserTypeChange}
//               style={{width: "100%"}}
//               allowClear
//             >
//               <Option value="student">Student</Option>
//               <Option value="worker">Worker</Option>
//             </Select>
//           </Col>
//         </>
//       );
//     }

//     return null;
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 px-4 pt-4 pb-8 xl:px-12 lg:px-6">
//       {/* Header */}
//       <PageHeader
//         title="Deposit Overview"
//         subtitle="Security deposit management and tracking"
//       />

//       <StatsGrid stats={depositStats} />

//       {/* Filters Section */}
//       <Card size="small" style={{marginBottom: 16}}>
//         <Row gutter={[16, 16]}>{renderFilters()}</Row>
//       </Card>

//       {/* Tabs Section */}
//       <Tabs activeKey={activeTab} onChange={setActiveTab} type="card" centered>
//         <TabPane tab="Deposit Received" key="received">
//           <DepositTransactionsTable
//             data={getTabData()}
//             loading={depositLoading}
//             pagination={getCurrentPagination()}
//             total={getCurrentTotal()}
//             onPaginationChange={handlePaginationChange}
//           />
//         </TabPane>

//         <TabPane tab="Pending Deposits" key="pending">
//           <DepositTransactionsTable
//             data={getTabData()}
//             loading={pendingDepositsLoading}
//             pagination={getCurrentPagination()}
//             total={getCurrentTotal()}
//             onPaginationChange={handlePaginationChange}
//             type="pending"
//           />
//         </TabPane>

//         <TabPane tab="Refunded Deposits" key="refunded">
//           <DepositTransactionsTable
//             data={getTabData()}
//             loading={refundedDepositsLoading}
//             pagination={getCurrentPagination()}
//             total={getCurrentTotal()}
//             onPaginationChange={handlePaginationChange}
//             type="refunded"
//           />
//         </TabPane>
//       </Tabs>
//     </div>
//   );
// };

// export default DepositDetailsPage;
import {useEffect, useState} from "react";
import {Card, Tabs, DatePicker, Row, Col, Select, message, Input} from "antd";
import {
  FiCheckCircle,
  FiClock,
  FiRefreshCw,
  FiTrendingUp,
} from "react-icons/fi";
import {PageHeader, StatsGrid} from "../../components";
import DepositTransactionsTable from "../../components/accounts/DepositTransactionTable";
import {useSelector} from "react-redux";
import {useQuery} from "@tanstack/react-query";
import {
  getAllDepositPayments,
  getPendingDeposits,
} from "../../hooks/accounts/useAccounts";
import dayjs from "dayjs";
import usePersistentState from "../../hooks/usePersistentState";

const {RangePicker} = DatePicker;
const {TabPane} = Tabs;
const {Option} = Select;
const {Search} = Input;

const DepositDetailsPage = () => {
  const {selectedProperty} = useSelector((state) => state.properties);

  // Use regular state for activeTab to avoid navigation issues
  const [activeTab, setActiveTab] = useState("received");

  // Persistent filter states for each tab
  const [receivedFilters, setReceivedFilters] = usePersistentState(
    "depositDetails_receivedFilters",
    {
      userType: "",
      paymentMethod: "",
      selectedMonth: null,
      search: "",
      isRefund: false,
    }
  );

  const [pendingFilters, setPendingFilters] = usePersistentState(
    "depositDetails_pendingFilters",
    {
      userType: "",
      search: "",
    }
  );

  const [refundedFilters, setRefundedFilters] = usePersistentState(
    "depositDetails_refundedFilters",
    {
      userType: "",
      paymentMethod: "",
      selectedMonth: null,
      search: "",
      isRefund: true,
    }
  );

  // Convert stored string dates to Day.js objects for use in components
  const normalizedReceivedFilters = {
    ...receivedFilters,
    selectedMonth: receivedFilters.selectedMonth
      ? dayjs(receivedFilters.selectedMonth)
      : null,
  };

  const normalizedRefundedFilters = {
    ...refundedFilters,
    selectedMonth: refundedFilters.selectedMonth
      ? dayjs(refundedFilters.selectedMonth)
      : null,
  };

  // Use regular state for pagination to avoid complex objects in localStorage
  const [pagination, setPagination] = useState({
    received: {page: 1, limit: 10},
    pending: {page: 1, limit: 10},
    refunded: {page: 1, limit: 10},
  });

  // Refetch data when tab changes
  useEffect(() => {
    if (activeTab === "received") {
      refetchDeposits();
    } else if (activeTab === "pending") {
      refetchPendingDeposits();
    } else if (activeTab === "refunded") {
      refundedDepositsRefetch();
    }
  }, [activeTab]);

  // Get current tab filters
  const getCurrentFilters = () => {
    const filtersMap = {
      received: normalizedReceivedFilters,
      pending: pendingFilters,
      refunded: normalizedRefundedFilters,
    };
    return filtersMap[activeTab] || {};
  };

  // Reset pagination to page 1 when filters change for current tab
  useEffect(() => {
    setPagination((prev) => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        page: 1,
      },
    }));
  }, [
    receivedFilters,
    pendingFilters,
    refundedFilters,
    activeTab,
    selectedProperty?.id,
  ]);

  // Received Deposits Query (isRefund: false)
  const {
    data: depositData,
    isLoading: depositLoading,
    error: depositError,
    refetch: refetchDeposits,
  } = useQuery({
    queryKey: [
      "deposits",
      "received",
      pagination.received.page,
      pagination.received.limit,
      receivedFilters.paymentMethod,
      receivedFilters.userType,
      receivedFilters.selectedMonth,
      receivedFilters.search,
      selectedProperty?.id,
    ],
    queryFn: () => {
      const params = {
        page: pagination.received.page,
        limit: pagination.received.limit,
        userType: receivedFilters.userType,
        paymentMethod: receivedFilters.paymentMethod,
        search: receivedFilters.search,
        propertyId: selectedProperty?.id,
        isRefund: false,
      };

      if (receivedFilters.selectedMonth) {
        const month = dayjs(receivedFilters.selectedMonth);
        params.paymentMonth = month.month() + 1;
        params.paymentYear = month.year();
      }
      return getAllDepositPayments(params);
    },
    enabled: activeTab === "received",
  });

  // Refunded Deposits Query (isRefund: true)
  const {
    data: refundedDepositsData,
    isLoading: refundedDepositsLoading,
    error: refundedDepositsError,
    refetch: refundedDepositsRefetch,
  } = useQuery({
    queryKey: [
      "deposits",
      "refunded",
      pagination.refunded.page,
      pagination.refunded.limit,
      refundedFilters.paymentMethod,
      refundedFilters.userType,
      refundedFilters.selectedMonth,
      refundedFilters.search,
      selectedProperty?.id,
    ],
    queryFn: () => {
      const params = {
        page: pagination.refunded.page,
        limit: pagination.refunded.limit,
        userType: refundedFilters.userType,
        paymentMethod: refundedFilters.paymentMethod,
        search: refundedFilters.search,
        propertyId: selectedProperty?.id,
        isRefund: true,
      };

      if (refundedFilters.selectedMonth) {
        const month = dayjs(refundedFilters.selectedMonth);
        params.paymentMonth = month.month() + 1;
        params.paymentYear = month.year();
      }
      return getAllDepositPayments(params);
    },
    enabled: activeTab === "refunded",
  });

  // Pending Deposits Query
  const {
    data: pendingDepositsData,
    isLoading: pendingDepositsLoading,
    error: pendingDepositsError,
    refetch: refetchPendingDeposits,
  } = useQuery({
    queryKey: [
      "pendingDeposits",
      pagination.pending.page,
      pagination.pending.limit,
      pendingFilters.userType,
      pendingFilters.search,
      selectedProperty?.id,
    ],
    queryFn: () => {
      const params = {
        page: pagination.pending.page,
        limit: pagination.pending.limit,
        userType: pendingFilters.userType,
        search: pendingFilters.search,
        propertyId: selectedProperty?.id,
      };
      return getPendingDeposits(params);
    },
    enabled: activeTab === "pending",
  });

  // Handle errors
  useEffect(() => {
    if (depositError) {
      message.error(`Failed to load deposits data`);
    }
    if (pendingDepositsError) {
      message.error(`Failed to load pending deposits data`);
    }
    if (refundedDepositsError) {
      message.error(`Failed to load refunded deposits data`);
    }
  }, [depositError, pendingDepositsError, refundedDepositsError]);

  // Filter handlers
  const handleUserTypeChange = (value) => {
    const setterMap = {
      received: setReceivedFilters,
      pending: setPendingFilters,
      refunded: setRefundedFilters,
    };

    const setter = setterMap[activeTab];
    if (setter) {
      setter((prev) => ({
        ...prev,
        userType: value,
      }));
    }
  };

  const handlePaymentMethodChange = (value) => {
    const setterMap = {
      received: setReceivedFilters,
      refunded: setRefundedFilters,
    };

    const setter = setterMap[activeTab];
    if (setter) {
      setter((prev) => ({
        ...prev,
        paymentMethod: value,
      }));
    }
  };

  const handleMonthChange = (date) => {
    const setterMap = {
      received: setReceivedFilters,
      refunded: setRefundedFilters,
    };

    const setter = setterMap[activeTab];
    if (setter) {
      setter((prev) => ({
        ...prev,
        selectedMonth: date ? date.toISOString() : null,
      }));
    }
  };

  const handleSearch = (value) => {
    const setterMap = {
      received: setReceivedFilters,
      pending: setPendingFilters,
      refunded: setRefundedFilters,
    };

    const setter = setterMap[activeTab];
    if (setter) {
      setter((prev) => ({
        ...prev,
        search: value,
      }));
    }
  };

  const getTabData = () => {
    const dataMap = {
      received: depositData?.data || [],
      pending: pendingDepositsData?.data || [],
      refunded: refundedDepositsData?.data || [],
    };
    return dataMap[activeTab] || [];
  };

  const getCurrentPagination = () => {
    return pagination[activeTab] || {page: 1, limit: 10};
  };

  const getCurrentTotal = () => {
    const totalMap = {
      received: depositData?.pagination?.total || 0,
      pending: pendingDepositsData?.pagination?.total || 0,
      refunded: refundedDepositsData?.pagination?.total || 0,
    };
    return totalMap[activeTab] || 0;
  };

  // Handle infinite scroll pagination change
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

  // Stats using global unfiltered data
  const depositStats = [
    {
      title: "Total Non-refundable",
      value: `₹${
        pendingDepositsData?.totalNonRefundable?.toLocaleString() || 0
      }`,
      icon: <FiTrendingUp className="text-xl" />,
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Total Refundable",
      value: `₹${pendingDepositsData?.totalRefundable?.toLocaleString() || 0}`,
      icon: <FiTrendingUp className="text-xl" />,
      color: "bg-orange-100 text-orange-600",
    },
    {
      title: "Received Amount",
      value: `₹${depositData?.totalReceivedAmount?.toLocaleString() || 0}`,
      icon: <FiCheckCircle className="text-xl" />,
      color: "bg-green-100 text-green-600",
    },
    {
      title: "Pending Deposits",
      value: `₹${
        pendingDepositsData?.totalPendingAmount?.toLocaleString() || 0
      }`,
      icon: <FiClock className="text-xl" />,
      color: "bg-red-100 text-red-500",
    },
    {
      title: "Refunded Amount",
      value: `₹${
        refundedDepositsData?.totalRefundedAmount?.toLocaleString() || 0
      }`,
      icon: <FiRefreshCw className="text-xl" />,
      color: "bg-green-100 text-green-500",
    },
  ];

  // Render appropriate filters based on active tab
  const renderFilters = () => {
    const currentFilters = getCurrentFilters();

    if (activeTab === "received" || activeTab === "refunded") {
      return (
        <>
          {/* Search Input */}
          <Col xs={24} sm={12} md={8} lg={4}>
            <Search
              placeholder={
                activeTab === "received"
                  ? "Search by title or transaction ID"
                  : "Search refunded transactions"
              }
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
            </Select>
          </Col>

          {/* Month Picker */}
          <Col xs={24} sm={12} md={8} lg={4}>
            <DatePicker
              placeholder="Select Month"
              value={currentFilters.selectedMonth}
              onChange={handleMonthChange}
              picker="month"
              style={{width: "100%"}}
              format="MMM YYYY"
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
            <Search
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

  return (
    <div className="min-h-screen bg-gray-50 px-4 pt-4 pb-8 xl:px-12 lg:px-6">
      {/* Header */}
      <PageHeader
        title="Deposit Overview"
        subtitle="Security deposit management and tracking"
      />

      <StatsGrid stats={depositStats} />

      {/* Filters Section */}
      <Card size="small" style={{marginBottom: 16}}>
        <Row gutter={[16, 16]}>{renderFilters()}</Row>
      </Card>

      {/* Tabs Section */}
      <Tabs activeKey={activeTab} onChange={setActiveTab} type="card" centered>
        <TabPane tab="Deposit Received" key="received">
          <DepositTransactionsTable
            data={getTabData()}
            loading={depositLoading}
            pagination={getCurrentPagination()}
            total={getCurrentTotal()}
            onPaginationChange={handlePaginationChange}
          />
        </TabPane>

        <TabPane tab="Pending Deposits" key="pending">
          <DepositTransactionsTable
            data={getTabData()}
            loading={pendingDepositsLoading}
            pagination={getCurrentPagination()}
            total={getCurrentTotal()}
            onPaginationChange={handlePaginationChange}
            type="pending"
          />
        </TabPane>

        <TabPane tab="Refunded Deposits" key="refunded">
          <DepositTransactionsTable
            data={getTabData()}
            loading={refundedDepositsLoading}
            pagination={getCurrentPagination()}
            total={getCurrentTotal()}
            onPaginationChange={handlePaginationChange}
            type="refunded"
          />
        </TabPane>
      </Tabs>
    </div>
  );
};

export default DepositDetailsPage;
