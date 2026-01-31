// import {useState, useEffect} from "react";
// import {useParams} from "react-router-dom";
// import {Tabs, message, Card, Row, Col, Select, DatePicker, Input} from "antd";
// import {
//   FiCreditCard,
//   FiMinusCircle,
//   FiPercent,
//   FiTrendingUp,
// } from "react-icons/fi";
// import {PageHeader, StatsGrid} from "../../components";
// import ExpenseTable from "../../components/accounts/ExpenseTable";
// import {useQuery} from "@tanstack/react-query";
// import {
//   getAllExpenses,
//   getExpenseAnalytics,
//   getWaveOffPayments,
//   getVoucherData,
//   getCommissionData,
//   getStaffSalaryData,
// } from "../../hooks/accounts/useAccounts";
// import {useSelector} from "react-redux";
// import ExpenseAnalytics from "../../components/accounts/ExpenseAnalytics";

// const {TabPane} = Tabs;
// const {Option} = Select;
// const {Search} = Input;

// const ExpenseDetailsPage = () => {
//   const {selectedProperty} = useSelector((state) => state.properties);
//   const {category} = useParams();
//   const [activeTab, setActiveTab] = useState(category || "expenses");
//   const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

//   // Unified filter state with tab-specific configurations
//   const [filters, setFilters] = useState({
//     expenses: {
//       type: "",
//       category: "",
//       paymentMethod: "",
//       selectedMonth: null,
//       search: "",
//     },
//     salary: {
//       type: "",
//       paymentMethod: "",
//       selectedMonth: null,
//       search: "",
//     },
//     waiveoffs: {
//       paymentMethod: "",
//       userType: "",
//       search: "",
//       selectedMonth: null,
//     },
//     commissions: {
//       search: "",
//       paymentType: "",
//       selectedMonth: null,
//     },
//     vouchers: {
//       search: "",
//       status: "",
//       selectedMonth: null,
//     },
//   });

//   // Infinite scroll pagination state
//   const [pagination, setPagination] = useState({
//     expenses: {page: 1, limit: 10},
//     salary: {page: 1, limit: 10},
//     waiveoffs: {page: 1, limit: 10},
//     commissions: {page: 1, limit: 10},
//     vouchers: {page: 1, limit: 10},
//   });

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
//   const currentFilters = filters[activeTab] || {};

//   // Filter configurations for each tab
//   const filterConfigs = {
//     expenses: {
//       search: {
//         placeholder: "Search by title or transaction ID",
//         type: "search",
//       },
//       type: {
//         placeholder: "Select Type",
//         options: ["PG", "Mess", "Others"],
//         type: "select",
//       },
//       paymentMethod: {
//         placeholder: "Select Payment Mode",
//         options: ["Cash", "UPI", "Bank Transfer", "Card", "Petty Cash"],
//         type: "select",
//       },
//       category: {
//         placeholder: "Select Category",
//         options: [],
//         type: "select",
//       },
//       selectedMonth: {
//         placeholder: "Select Month",
//         type: "month",
//       },
//     },
//     salary: {
//       search: {
//         placeholder: "Search by employee name",
//         type: "search",
//       },
//       type: {
//         placeholder: "Select Employee Type",
//         options: ["Staff", "Manager"],
//         type: "select",
//       },
//       paymentMethod: {
//         placeholder: "Select Payment Mode",
//         options: ["Cash", "UPI", "Bank Transfer", "Card", "Petty Cash"],
//         type: "select",
//       },
//       selectedMonth: {
//         placeholder: "Select Month",
//         type: "month",
//       },
//     },
//     waiveoffs: {
//       search: {
//         placeholder: "Search by name or transaction ID",
//         type: "search",
//       },
//       userType: {
//         placeholder: "Select User Type",
//         options: ["student", "worker", "dailyRent", "messOnly"],
//         type: "select",
//       },
//       paymentMethod: {
//         placeholder: "Select Payment Mode",
//         options: ["Cash", "UPI", "Bank Transfer", "Card"],
//         type: "select",
//       },
//       selectedMonth: {
//         placeholder: "Select Month",
//         type: "month",
//       },
//     },
//     commissions: {
//       search: {
//         placeholder: "Search by name or transaction ID",
//         type: "search",
//       },
//       paymentType: {
//         placeholder: "Select Payment Mode",
//         options: ["Cash", "UPI", "Bank Transfer", "Card", "Petty Cash"],
//         type: "select",
//       },
//       selectedMonth: {
//         placeholder: "Select Month",
//         type: "month",
//       },
//     },
//     vouchers: {
//       search: {
//         placeholder: "Search by voucher number or description",
//         type: "search",
//       },
//       status: {
//         placeholder: "Select Expense Status",
//         options: ["Pending", "Fully Utilized"],
//         type: "select",
//       },
//       selectedMonth: {
//         placeholder: "Select Month",
//         type: "month",
//       },
//     },
//   };

//   // Generic filter handler
//   const handleFilterChange = (filterKey, value) => {
//     setFilters((prev) => ({
//       ...prev,
//       [activeTab]: {
//         ...prev[activeTab],
//         [filterKey]: value,
//         // Reset dependent filters
//         ...(filterKey === "type" && {category: ""}),
//       },
//     }));
//   };

//   // Generic search handler
//   const handleSearch = (value) => {
//     handleFilterChange("search", value);
//   };

//   // Generic month change handler
//   const handleMonthChange = (date) => {
//     handleFilterChange("selectedMonth", date);
//   };

//   const renderFilters = () => {
//     const config = filterConfigs[activeTab] || {};
//     const entries = Object.entries(config);
//     const count = entries.length;

//     // Calculate dynamic column span for large screens (max 24)
//     const lgSpan = count > 0 ? Math.floor(24 / count) : 24;

//     return entries.map(([key, filterConfig]) => {
//       const {type, placeholder, options = []} = filterConfig;
//       const value = currentFilters[key];

//       switch (type) {
//         case "search":
//           return (
//             <Col key={key} xs={24} sm={12} md={8} lg={lgSpan}>
//               <Search
//                 placeholder={placeholder}
//                 value={value}
//                 onChange={(e) => handleSearch(e.target.value)}
//                 onSearch={handleSearch}
//                 style={{width: "100%"}}
//                 allowClear
//               />
//             </Col>
//           );

//         case "select":
//           return (
//             <Col key={key} xs={24} sm={12} md={8} lg={lgSpan}>
//               <Select
//                 placeholder={placeholder}
//                 value={value || undefined}
//                 onChange={(val) => handleFilterChange(key, val)}
//                 style={{width: "100%"}}
//                 allowClear
//                 showSearch={key === "category"}
//                 optionFilterProp="children"
//               >
//                 {options.map((option) => (
//                   <Option key={option} value={option}>
//                     {option}
//                   </Option>
//                 ))}
//               </Select>
//             </Col>
//           );

//         case "month":
//           return (
//             <Col key={key} xs={24} sm={12} md={8} lg={lgSpan}>
//               <DatePicker
//                 placeholder={placeholder}
//                 value={value}
//                 onChange={(date) => handleMonthChange(date)}
//                 picker="month"
//                 style={{width: "100%"}}
//                 format="MMM YYYY"
//               />
//             </Col>
//           );

//         default:
//           return null;
//       }
//     });
//   };

//   // API calls with proper pagination for infinite scroll
//   const {
//     data: expensesData,
//     isLoading: expensesLoading,
//     error: expensesError,
//   } = useQuery({
//     queryKey: [
//       "expenses",
//       pagination.expenses.page,
//       pagination.expenses.limit,
//       ...Object.values(filters.expenses),
//       selectedProperty?.id,
//     ],
//     queryFn: () => {
//       const params = {
//         page: pagination.expenses.page,
//         limit: pagination.expenses.limit,
//         ...filters.expenses,
//         propertyId: selectedProperty?.id,
//       };

//       if (filters.expenses.selectedMonth) {
//         params.month = filters.expenses.selectedMonth.month() + 1;
//         params.year = filters.expenses.selectedMonth.year();
//         delete params.selectedMonth;
//       }

//       return getAllExpenses(params);
//     },
//   });

//   const {
//     data: salaryData,
//     isLoading: salaryLoading,
//     error: salaryError,
//   } = useQuery({
//     queryKey: [
//       "staff-salary",
//       pagination.salary.page,
//       pagination.salary.limit,
//       ...Object.values(filters.salary),
//       selectedProperty?.id,
//     ],
//     queryFn: () => {
//       const params = {
//         page: pagination.salary.page,
//         limit: pagination.salary.limit,
//         ...filters.salary,
//         propertyId: selectedProperty?.id,
//       };

//       if (filters.salary.selectedMonth) {
//         params.month = filters.salary.selectedMonth.month() + 1;
//         params.year = filters.salary.selectedMonth.year();
//         delete params.selectedMonth;
//       }

//       return getStaffSalaryData(params);
//     },
//   });

//   const {
//     data: waveOffData,
//     isLoading: waveOffLoading,
//     error: waveOffError,
//   } = useQuery({
//     queryKey: [
//       "waveOffPayments",
//       pagination.waiveoffs.page,
//       pagination.waiveoffs.limit,
//       ...Object.values(filters.waiveoffs),
//       selectedProperty?.id,
//     ],
//     queryFn: () => {
//       const params = {
//         page: pagination.waiveoffs.page,
//         limit: pagination.waiveoffs.limit,
//         ...filters.waiveoffs,
//         propertyId: selectedProperty?.id,
//       };

//       if (filters.waiveoffs.selectedMonth) {
//         params.month = filters.waiveoffs.selectedMonth.month() + 1;
//         params.year = filters.waiveoffs.selectedMonth.year();
//         delete params.selectedMonth;
//       }

//       return getWaveOffPayments(params);
//     },
//   });

//   const {
//     data: commissionData,
//     isLoading: commissionLoading,
//     error: commissionError,
//   } = useQuery({
//     queryKey: [
//       "commissions",
//       pagination.commissions.page,
//       pagination.commissions.limit,
//       ...Object.values(filters.commissions),
//       selectedProperty?.id,
//     ],
//     queryFn: () => {
//       const params = {
//         page: pagination.commissions.page,
//         limit: pagination.commissions.limit,
//         ...filters.commissions,
//         propertyId: selectedProperty?.id,
//       };

//       if (filters.commissions.selectedMonth) {
//         params.month = filters.commissions.selectedMonth.month() + 1;
//         params.year = filters.commissions.selectedMonth.year();
//         delete params.selectedMonth;
//       }

//       return getCommissionData(params);
//     },
//   });

//   const {
//     data: voucherData,
//     isLoading: voucherLoading,
//     error: voucherError,
//   } = useQuery({
//     queryKey: [
//       "vouchers",
//       pagination.vouchers.page,
//       pagination.vouchers.limit,
//       ...Object.values(filters.vouchers),
//     ],
//     queryFn: () => {
//       const params = {
//         page: pagination.vouchers.page,
//         limit: pagination.vouchers.limit,
//         ...filters.vouchers,
//       };

//       if (filters.vouchers.selectedMonth) {
//         params.month = filters.vouchers.selectedMonth.month() + 1;
//         params.year = filters.vouchers.selectedMonth.year();
//         delete params.selectedMonth;
//       }

//       return getVoucherData(params);
//     },
//   });

//   const {
//     data: analyticsData,
//     isLoading: analyticsLoading,
//     error: analyticsError,
//   } = useQuery({
//     queryKey: ["expense-analytics", selectedProperty?.id, selectedYear],
//     queryFn: () => getExpenseAnalytics(selectedProperty?.id, selectedYear),
//     enabled: activeTab === "analytics",
//   });

//   const {data: yearsData} = useQuery({
//     queryKey: ["available-years", selectedProperty?.id],
//     queryFn: () =>
//       getAllExpenses({
//         propertyId: selectedProperty?.id,
//         limit: 1,
//         page: 1,
//       }),
//     enabled: true,
//   });

//   const availableYears = yearsData?.availableYears || [
//     new Date().getFullYear(),
//   ];
//   const sortedYears = [...availableYears].sort((a, b) => b - a);

//   useEffect(() => {
//     if (sortedYears.length > 0 && !sortedYears.includes(selectedYear)) {
//       setSelectedYear(sortedYears[0]);
//     }
//   }, [sortedYears, selectedYear]);

//   useEffect(() => {
//     if (sortedYears.length > 0) {
//       setSelectedYear(sortedYears[0]);
//     }
//   }, [selectedProperty?.id]);

//   // Handle errors
//   useEffect(() => {
//     if (expensesError) {
//       message.error(`Failed to load expenses data`);
//     }
//     if (analyticsError) {
//       message.error(`Failed to load analytics data`);
//     }
//     if (waveOffError) {
//       message.error(`Failed to load wave-off payments data`);
//     }
//     if (voucherError) {
//       message.error(`Failed to load voucher data`);
//     }
//     if (commissionError) {
//       message.error(`Failed to load commission data`);
//     }
//     if (salaryError) {
//       message.error("Failed to load salary data");
//     }
//   }, [
//     expensesError,
//     analyticsError,
//     waveOffError,
//     voucherError,
//     commissionError,
//     salaryError,
//   ]);

//   // Calculate stats from actual data
//   const expenseStats = [
//     {
//       title: "Total Expenses",
//       value: `₹ ${expensesData?.totalAmount?.toLocaleString() || 0}`,
//       icon: <FiTrendingUp className="text-xl" />,
//       color: "bg-red-100 text-red-600",
//     },
//     {
//       title: "Total Salary",
//       value: `₹ ${salaryData?.totalPaidAmount?.toLocaleString() || 0}`,
//       icon: <FiCreditCard className="text-xl" />,
//       color: "bg-orange-100 text-orange-600",
//     },
//     {
//       title: "Total Waive-offs",
//       value: `₹ ${waveOffData?.data?.totalWaveOff?.toLocaleString() || 0}`,
//       icon: <FiMinusCircle className="text-xl" />,
//       color: "bg-purple-100 text-purple-600",
//     },
//     {
//       title: "Total Commissions",
//       value: `₹ ${
//         commissionData?.data
//           ?.reduce((sum, item) => sum + (item.amount || 0), 0)
//           ?.toLocaleString() || 0
//       }`,
//       icon: <FiPercent className="text-xl" />,
//       color: "bg-blue-100 text-blue-600",
//     },
//   ];

//   const getTabData = () => {
//     let filteredData = [];

//     switch (activeTab) {
//       case "expenses":
//         filteredData = expensesData?.data || [];
//         break;
//       case "waiveoffs":
//         filteredData = waveOffData?.data?.payments || [];
//         break;
//       case "vouchers":
//         filteredData = voucherData?.data || [];
//         break;
//       case "commissions":
//         filteredData = commissionData?.data || [];
//         break;
//       case "salary":
//         filteredData = salaryData?.data || [];
//         break;
//       default:
//         filteredData = [];
//     }

//     return filteredData;
//   };

//   const getCurrentPagination = () => {
//     return pagination[activeTab] || {page: 1, limit: 10};
//   };

//   const getCurrentTotal = () => {
//     const totalMap = {
//       expenses: expensesData?.pagination?.total || 0,
//       salary: salaryData?.pagination?.total || 0,
//       waiveoffs: waveOffData?.data?.payments?.length || 0,
//       commissions: commissionData?.data?.length || 0,
//       vouchers: voucherData?.data?.length || 0,
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

//   const handleYearChange = (year) => {
//     setSelectedYear(year);
//   };

//   // Handler functions for table actions
//   const handleEdit = (record, type) => {
//     console.log(`Edit ${type}:`, record);
//   };

//   const handleDelete = (record, type) => {
//     console.log(`Delete ${type}:`, record);
//   };

//   const handleView = (record, type) => {
//     console.log(`View ${type}:`, record);
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 px-4 pt-4 pb-8 xl:px-12 lg:px-6">
//       <PageHeader
//         title="Expenses Overview"
//         subtitle="Manage and track all your expenses"
//       />

//       {/* Summary Statistics */}
//       <StatsGrid stats={expenseStats} />

//       {/* Filters Section - Show for all tabs except analytics */}
//       {activeTab !== "analytics" && (
//         <Card size="small" style={{marginBottom: 16}}>
//           <Row gutter={[16, 16]}>{renderFilters()}</Row>
//         </Card>
//       )}

//       {/* Tabs with Data */}
//       <Tabs activeKey={activeTab} onChange={setActiveTab} type="card" centered>
//         <TabPane tab="Expenses" key="expenses">
//           <ExpenseTable
//             data={getTabData()}
//             type="expenses"
//             loading={expensesLoading}
//             pagination={getCurrentPagination()}
//             total={getCurrentTotal()}
//             onPaginationChange={handlePaginationChange}
//             onEdit={(record) => handleEdit(record, "expense")}
//             onDelete={(record) => handleDelete(record, "expense")}
//             onView={(record) => handleView(record, "expense")}
//           />
//         </TabPane>

//         <TabPane tab="Employee Salary" key="salary">
//           <ExpenseTable
//             data={getTabData()}
//             type="salary"
//             loading={salaryLoading}
//             pagination={getCurrentPagination()}
//             total={getCurrentTotal()}
//             onPaginationChange={handlePaginationChange}
//             onEdit={(record) => handleEdit(record, "salary")}
//             onDelete={(record) => handleDelete(record, "salary")}
//             onView={(record) => handleView(record, "salary")}
//           />
//         </TabPane>

//         <TabPane tab="Waive-offs" key="waiveoffs">
//           <ExpenseTable
//             data={getTabData()}
//             type="waiveoffs"
//             loading={waveOffLoading}
//             pagination={getCurrentPagination()}
//             total={getCurrentTotal()}
//             onPaginationChange={handlePaginationChange}
//             onEdit={(record) => handleEdit(record, "waiveoff")}
//             onDelete={(record) => handleDelete(record, "waiveoff")}
//             onView={(record) => handleView(record, "waiveoff")}
//           />
//         </TabPane>

//         <TabPane tab="Commissions" key="commissions">
//           <ExpenseTable
//             data={getTabData()}
//             type="commissions"
//             loading={commissionLoading}
//             pagination={getCurrentPagination()}
//             total={getCurrentTotal()}
//             onPaginationChange={handlePaginationChange}
//             onEdit={(record) => handleEdit(record, "commission")}
//             onDelete={(record) => handleDelete(record, "commission")}
//             onView={(record) => handleView(record, "commission")}
//           />
//         </TabPane>

//         <TabPane tab="Voucher" key="vouchers">
//           <ExpenseTable
//             data={getTabData()}
//             type="vouchers"
//             loading={voucherLoading}
//             pagination={getCurrentPagination()}
//             total={getCurrentTotal()}
//             onPaginationChange={handlePaginationChange}
//             onEdit={(record) => handleEdit(record, "voucher")}
//             onDelete={(record) => handleDelete(record, "voucher")}
//             onView={(record) => handleView(record, "voucher")}
//           />
//         </TabPane>

//         <TabPane tab="Expense Analytics" key="analytics">
//           <ExpenseAnalytics
//             data={analyticsData}
//             loading={analyticsLoading}
//             selectedYear={selectedYear}
//             onYearChange={handleYearChange}
//             availableYears={sortedYears}
//           />
//         </TabPane>
//       </Tabs>
//     </div>
//   );
// };

// export default ExpenseDetailsPage;

// import {useState, useEffect} from "react";
// import {useParams} from "react-router-dom";
// import {Tabs, message, Card, Row, Col, Select, DatePicker, Input} from "antd";
// import {
//   FiCreditCard,
//   FiMinusCircle,
//   FiPercent,
//   FiTrendingUp,
// } from "react-icons/fi";
// import {PageHeader, StatsGrid} from "../../components";
// import ExpenseTable from "../../components/accounts/ExpenseTable";
// import {useQuery} from "@tanstack/react-query";
// import {
//   getAllExpenses,
//   getExpenseAnalytics,
//   getWaveOffPayments,
//   getVoucherData,
//   getCommissionData,
//   getStaffSalaryData,
// } from "../../hooks/accounts/useAccounts";
// import {useSelector} from "react-redux";
// import ExpenseAnalytics from "../../components/accounts/ExpenseAnalytics";
// import dayjs from "dayjs";
// import usePersistentState from "../../hooks/usePersistentState";

// const {TabPane} = Tabs;
// const {Option} = Select;
// const {Search} = Input;

// const ExpenseDetailsPage = () => {
//   const {selectedProperty} = useSelector((state) => state.properties);
//   const {category} = useParams();

//   // Use regular state for activeTab to avoid navigation issues
//   const [activeTab, setActiveTab] = useState(category || "expenses");

//   // Use persistent state for selected year
//   const [selectedYear, setSelectedYear] = usePersistentState(
//     "expenseDetails_selectedYear",
//     new Date().getFullYear()
//   );

//   // Persistent filter states for each tab
//   const [expensesFilters, setExpensesFilters] = usePersistentState(
//     "expenseDetails_expensesFilters",
//     {
//       type: "",
//       category: "",
//       paymentMethod: "",
//       selectedMonth: null,
//       search: "",
//     }
//   );

//   const [salaryFilters, setSalaryFilters] = usePersistentState(
//     "expenseDetails_salaryFilters",
//     {
//       type: "",
//       paymentMethod: "",
//       selectedMonth: null,
//       search: "",
//     }
//   );

//   const [waiveoffsFilters, setWaiveoffsFilters] = usePersistentState(
//     "expenseDetails_waiveoffsFilters",
//     {
//       paymentMethod: "",
//       userType: "",
//       search: "",
//       selectedMonth: null,
//     }
//   );

//   const [commissionsFilters, setCommissionsFilters] = usePersistentState(
//     "expenseDetails_commissionsFilters",
//     {
//       search: "",
//       paymentType: "",
//       selectedMonth: null,
//     }
//   );

//   const [vouchersFilters, setVouchersFilters] = usePersistentState(
//     "expenseDetails_vouchersFilters",
//     {
//       search: "",
//       status: "",
//       selectedMonth: null,
//     }
//   );

//   // Convert stored string dates to Day.js objects for use in components
//   const normalizedExpensesFilters = {
//     ...expensesFilters,
//     selectedMonth: expensesFilters.selectedMonth
//       ? dayjs(expensesFilters.selectedMonth)
//       : null,
//   };

//   const normalizedSalaryFilters = {
//     ...salaryFilters,
//     selectedMonth: salaryFilters.selectedMonth
//       ? dayjs(salaryFilters.selectedMonth)
//       : null,
//   };

//   const normalizedWaiveoffsFilters = {
//     ...waiveoffsFilters,
//     selectedMonth: waiveoffsFilters.selectedMonth
//       ? dayjs(waiveoffsFilters.selectedMonth)
//       : null,
//   };

//   const normalizedCommissionsFilters = {
//     ...commissionsFilters,
//     selectedMonth: commissionsFilters.selectedMonth
//       ? dayjs(commissionsFilters.selectedMonth)
//       : null,
//   };

//   const normalizedVouchersFilters = {
//     ...vouchersFilters,
//     selectedMonth: vouchersFilters.selectedMonth
//       ? dayjs(vouchersFilters.selectedMonth)
//       : null,
//   };

//   // Use regular state for pagination to avoid complex objects in localStorage
//   const [pagination, setPagination] = useState({
//     expenses: {page: 1, limit: 10},
//     salary: {page: 1, limit: 10},
//     waiveoffs: {page: 1, limit: 10},
//     commissions: {page: 1, limit: 10},
//     vouchers: {page: 1, limit: 10},
//   });

//   // Get current tab filters
//   const getCurrentFilters = () => {
//     const filtersMap = {
//       expenses: normalizedExpensesFilters,
//       salary: normalizedSalaryFilters,
//       waiveoffs: normalizedWaiveoffsFilters,
//       commissions: normalizedCommissionsFilters,
//       vouchers: normalizedVouchersFilters,
//     };
//     return filtersMap[activeTab] || {};
//   };

//   // Reset pagination to page 1 when filters change for current tab
//   useEffect(() => {
//     setPagination((prev) => ({
//       ...prev,
//       [activeTab]: {
//         ...prev[activeTab],
//         page: 1,
//       },
//     }));
//   }, [
//     expensesFilters,
//     salaryFilters,
//     waiveoffsFilters,
//     commissionsFilters,
//     vouchersFilters,
//     activeTab,
//     selectedProperty?.id,
//   ]);

//   // Filter configurations for each tab
//   const filterConfigs = {
//     expenses: {
//       search: {
//         placeholder: "Search by title or transaction ID",
//         type: "search",
//       },
//       type: {
//         placeholder: "Select Type",
//         options: ["PG", "Mess", "Others"],
//         type: "select",
//       },
//       category: {
//         placeholder: "Select Category",
//         options: [],
//         type: "select",
//       },
//       paymentMethod: {
//         placeholder: "Select Payment Mode",
//         options: ["Cash", "UPI", "Bank Transfer", "Card", "Petty Cash"],
//         type: "select",
//       },
//       selectedMonth: {
//         placeholder: "Select Month",
//         type: "month",
//       },
//     },
//     salary: {
//       search: {
//         placeholder: "Search by employee name",
//         type: "search",
//       },
//       type: {
//         placeholder: "Select Employee Type",
//         options: ["Staff", "Manager"],
//         type: "select",
//       },
//       paymentMethod: {
//         placeholder: "Select Payment Mode",
//         options: ["Cash", "UPI", "Bank Transfer", "Card", "Petty Cash"],
//         type: "select",
//       },
//       selectedMonth: {
//         placeholder: "Select Month",
//         type: "month",
//       },
//     },
//     waiveoffs: {
//       search: {
//         placeholder: "Search by name or transaction ID",
//         type: "search",
//       },
//       userType: {
//         placeholder: "Select User Type",
//         options: ["student", "worker", "dailyRent", "messOnly"],
//         type: "select",
//       },
//       paymentMethod: {
//         placeholder: "Select Payment Mode",
//         options: ["Cash", "UPI", "Bank Transfer", "Card"],
//         type: "select",
//       },
//       selectedMonth: {
//         placeholder: "Select Month",
//         type: "month",
//       },
//     },
//     commissions: {
//       search: {
//         placeholder: "Search by name or transaction ID",
//         type: "search",
//       },
//       paymentType: {
//         placeholder: "Select Payment Mode",
//         options: ["Cash", "UPI", "Bank Transfer", "Card", "Petty Cash"],
//         type: "select",
//       },
//       selectedMonth: {
//         placeholder: "Select Month",
//         type: "month",
//       },
//     },
//     vouchers: {
//       search: {
//         placeholder: "Search by voucher number or description",
//         type: "search",
//       },
//       status: {
//         placeholder: "Select Expense Status",
//         options: ["Pending", "Fully Utilized"],
//         type: "select",
//       },
//       selectedMonth: {
//         placeholder: "Select Month",
//         type: "month",
//       },
//     },
//   };

//   // Generic filter handler
//   const handleFilterChange = (filterKey, value) => {
//     const setterMap = {
//       expenses: setExpensesFilters,
//       salary: setSalaryFilters,
//       waiveoffs: setWaiveoffsFilters,
//       commissions: setCommissionsFilters,
//       vouchers: setVouchersFilters,
//     };

//     const setter = setterMap[activeTab];
//     if (setter) {
//       setter((prev) => ({
//         ...prev,
//         [filterKey]: value,
//         // Reset dependent filters
//         ...(filterKey === "type" && {category: ""}),
//       }));
//     }
//   };

//   // Generic search handler
//   const handleSearch = (value) => {
//     handleFilterChange("search", value);
//   };

//   // Generic month change handler
//   const handleMonthChange = (date) => {
//     handleFilterChange("selectedMonth", date ? date.toISOString() : null);
//   };

//   const renderFilters = () => {
//     const config = filterConfigs[activeTab] || {};
//     const entries = Object.entries(config);
//     const count = entries.length;

//     if (count === 0) return null;

//     // Calculate dynamic column span for large screens (max 24)
//     const lgSpan = count > 0 ? Math.floor(24 / (count + 1)) : 24; // +1 for clear button

//     return (
//       <>
//         {entries.map(([key, filterConfig]) => {
//           const {type, placeholder, options = []} = filterConfig;
//           const currentFilters = getCurrentFilters();
//           const value = currentFilters[key];

//           switch (type) {
//             case "search":
//               return (
//                 <Col key={key} xs={24} sm={12} md={8} lg={lgSpan}>
//                   <Search
//                     placeholder={placeholder}
//                     value={value}
//                     onChange={(e) => handleSearch(e.target.value)}
//                     onSearch={handleSearch}
//                     style={{width: "100%"}}
//                     allowClear
//                   />
//                 </Col>
//               );

//             case "select":
//               return (
//                 <Col key={key} xs={24} sm={12} md={8} lg={lgSpan}>
//                   <Select
//                     placeholder={placeholder}
//                     value={value || undefined}
//                     onChange={(val) => handleFilterChange(key, val)}
//                     style={{width: "100%"}}
//                     allowClear
//                     showSearch={key === "category"}
//                     optionFilterProp="children"
//                   >
//                     {options.map((option) => (
//                       <Option key={option} value={option}>
//                         {option}
//                       </Option>
//                     ))}
//                   </Select>
//                 </Col>
//               );

//             case "month":
//               return (
//                 <Col key={key} xs={24} sm={12} md={8} lg={lgSpan}>
//                   <DatePicker
//                     placeholder={placeholder}
//                     value={value}
//                     onChange={handleMonthChange}
//                     picker="month"
//                     style={{width: "100%"}}
//                     format="MMM YYYY"
//                   />
//                 </Col>
//               );

//             default:
//               return null;
//           }
//         })}
//       </>
//     );
//   };

//   // API calls with proper pagination for infinite scroll
//   const {
//     data: expensesData,
//     isLoading: expensesLoading,
//     error: expensesError,
//   } = useQuery({
//     queryKey: [
//       "expenses",
//       pagination.expenses.page,
//       pagination.expenses.limit,
//       ...Object.values(expensesFilters),
//       selectedProperty?.id,
//     ],
//     queryFn: () => {
//       const params = {
//         page: pagination.expenses.page,
//         limit: pagination.expenses.limit,
//         ...expensesFilters,
//         propertyId: selectedProperty?.id,
//       };

//       if (expensesFilters.selectedMonth) {
//         const month = dayjs(expensesFilters.selectedMonth);
//         params.month = month.month() + 1;
//         params.year = month.year();
//         delete params.selectedMonth;
//       }

//       return getAllExpenses(params);
//     },
//   });

//   const {
//     data: salaryData,
//     isLoading: salaryLoading,
//     error: salaryError,
//   } = useQuery({
//     queryKey: [
//       "staff-salary",
//       pagination.salary.page,
//       pagination.salary.limit,
//       ...Object.values(salaryFilters),
//       selectedProperty?.id,
//     ],
//     queryFn: () => {
//       const params = {
//         page: pagination.salary.page,
//         limit: pagination.salary.limit,
//         ...salaryFilters,
//         propertyId: selectedProperty?.id,
//       };

//       if (salaryFilters.selectedMonth) {
//         const month = dayjs(salaryFilters.selectedMonth);
//         params.month = month.month() + 1;
//         params.year = month.year();
//         delete params.selectedMonth;
//       }

//       return getStaffSalaryData(params);
//     },
//   });

//   const {
//     data: waveOffData,
//     isLoading: waveOffLoading,
//     error: waveOffError,
//   } = useQuery({
//     queryKey: [
//       "waveOffPayments",
//       pagination.waiveoffs.page,
//       pagination.waiveoffs.limit,
//       ...Object.values(waiveoffsFilters),
//       selectedProperty?.id,
//     ],
//     queryFn: () => {
//       const params = {
//         page: pagination.waiveoffs.page,
//         limit: pagination.waiveoffs.limit,
//         ...waiveoffsFilters,
//         propertyId: selectedProperty?.id,
//       };

//       if (waiveoffsFilters.selectedMonth) {
//         const month = dayjs(waiveoffsFilters.selectedMonth);
//         params.month = month.month() + 1;
//         params.year = month.year();
//         delete params.selectedMonth;
//       }

//       return getWaveOffPayments(params);
//     },
//   });

//   const {
//     data: commissionData,
//     isLoading: commissionLoading,
//     error: commissionError,
//   } = useQuery({
//     queryKey: [
//       "commissions",
//       pagination.commissions.page,
//       pagination.commissions.limit,
//       ...Object.values(commissionsFilters),
//       selectedProperty?.id,
//     ],
//     queryFn: () => {
//       const params = {
//         page: pagination.commissions.page,
//         limit: pagination.commissions.limit,
//         ...commissionsFilters,
//         propertyId: selectedProperty?.id,
//       };

//       if (commissionsFilters.selectedMonth) {
//         const month = dayjs(commissionsFilters.selectedMonth);
//         params.month = month.month() + 1;
//         params.year = month.year();
//         delete params.selectedMonth;
//       }

//       return getCommissionData(params);
//     },
//   });

//   const {
//     data: voucherData,
//     isLoading: voucherLoading,
//     error: voucherError,
//   } = useQuery({
//     queryKey: [
//       "vouchers",
//       pagination.vouchers.page,
//       pagination.vouchers.limit,
//       ...Object.values(vouchersFilters),
//     ],
//     queryFn: () => {
//       const params = {
//         page: pagination.vouchers.page,
//         limit: pagination.vouchers.limit,
//         ...vouchersFilters,
//       };

//       if (vouchersFilters.selectedMonth) {
//         const month = dayjs(vouchersFilters.selectedMonth);
//         params.month = month.month() + 1;
//         params.year = month.year();
//         delete params.selectedMonth;
//       }

//       return getVoucherData(params);
//     },
//   });

//   const {
//     data: analyticsData,
//     isLoading: analyticsLoading,
//     error: analyticsError,
//   } = useQuery({
//     queryKey: ["expense-analytics", selectedProperty?.id, selectedYear],
//     queryFn: () => getExpenseAnalytics(selectedProperty?.id, selectedYear),
//     enabled: activeTab === "analytics",
//   });

//   const {data: yearsData} = useQuery({
//     queryKey: ["available-years", selectedProperty?.id],
//     queryFn: () =>
//       getAllExpenses({
//         propertyId: selectedProperty?.id,
//         limit: 1,
//         page: 1,
//       }),
//     enabled: true,
//   });

//   const availableYears = yearsData?.availableYears || [
//     new Date().getFullYear(),
//   ];
//   const sortedYears = [...availableYears].sort((a, b) => b - a);

//   useEffect(() => {
//     if (sortedYears.length > 0 && !sortedYears.includes(selectedYear)) {
//       setSelectedYear(sortedYears[0]);
//     }
//   }, [sortedYears, selectedYear]);

//   useEffect(() => {
//     if (sortedYears.length > 0) {
//       setSelectedYear(sortedYears[0]);
//     }
//   }, [selectedProperty?.id]);

//   // Handle errors
//   useEffect(() => {
//     if (expensesError) {
//       message.error(`Failed to load expenses data`);
//     }
//     if (analyticsError) {
//       message.error(`Failed to load analytics data`);
//     }
//     if (waveOffError) {
//       message.error(`Failed to load wave-off payments data`);
//     }
//     if (voucherError) {
//       message.error(`Failed to load voucher data`);
//     }
//     if (commissionError) {
//       message.error(`Failed to load commission data`);
//     }
//     if (salaryError) {
//       message.error("Failed to load salary data");
//     }
//   }, [
//     expensesError,
//     analyticsError,
//     waveOffError,
//     voucherError,
//     commissionError,
//     salaryError,
//   ]);

//   // Calculate stats from actual data
//   const expenseStats = [
//     {
//       title: "Total Expenses",
//       value: `₹ ${expensesData?.totalAmount?.toLocaleString() || 0}`,
//       icon: <FiTrendingUp className="text-xl" />,
//       color: "bg-red-100 text-red-600",
//     },
//     {
//       title: "Total Salary",
//       value: `₹ ${salaryData?.totalPaidAmount?.toLocaleString() || 0}`,
//       icon: <FiCreditCard className="text-xl" />,
//       color: "bg-orange-100 text-orange-600",
//     },
//     {
//       title: "Total Waive-offs",
//       value: `₹ ${waveOffData?.data?.totalWaveOff?.toLocaleString() || 0}`,
//       icon: <FiMinusCircle className="text-xl" />,
//       color: "bg-purple-100 text-purple-600",
//     },
//     {
//       title: "Total Commissions",
//       value: `₹ ${
//         commissionData?.data
//           ?.reduce((sum, item) => sum + (item.amount || 0), 0)
//           ?.toLocaleString() || 0
//       }`,
//       icon: <FiPercent className="text-xl" />,
//       color: "bg-blue-100 text-blue-600",
//     },
//   ];

//   const getTabData = () => {
//     let filteredData = [];

//     switch (activeTab) {
//       case "expenses":
//         filteredData = expensesData?.data || [];
//         break;
//       case "waiveoffs":
//         filteredData = waveOffData?.data?.payments || [];
//         break;
//       case "vouchers":
//         filteredData = voucherData?.data || [];
//         break;
//       case "commissions":
//         filteredData = commissionData?.data || [];
//         break;
//       case "salary":
//         filteredData = salaryData?.data || [];
//         break;
//       default:
//         filteredData = [];
//     }

//     return filteredData;
//   };

//   const getCurrentPagination = () => {
//     return pagination[activeTab] || {page: 1, limit: 10};
//   };

//   const getCurrentTotal = () => {
//     const totalMap = {
//       expenses: expensesData?.pagination?.total || 0,
//       salary: salaryData?.pagination?.total || 0,
//       waiveoffs: waveOffData?.data?.payments?.length || 0,
//       commissions: commissionData?.data?.length || 0,
//       vouchers: voucherData?.data?.length || 0,
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

//   const handleYearChange = (year) => {
//     setSelectedYear(year);
//   };

//   // Handler functions for table actions
//   const handleEdit = (record, type) => {
//     console.log(`Edit ${type}:`, record);
//   };

//   const handleDelete = (record, type) => {
//     console.log(`Delete ${type}:`, record);
//   };

//   const handleView = (record, type) => {
//     console.log(`View ${type}:`, record);
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 px-4 pt-4 pb-8 xl:px-12 lg:px-6">
//       <PageHeader
//         title="Expenses Overview"
//         subtitle="Manage and track all your expenses"
//       />

//       {/* Summary Statistics */}
//       <StatsGrid stats={expenseStats} />

//       {/* Filters Section - Show for all tabs except analytics */}
//       {activeTab !== "analytics" && (
//         <Card size="small" style={{marginBottom: 16}}>
//           <Row gutter={[16, 16]}>{renderFilters()}</Row>
//         </Card>
//       )}

//       {/* Tabs with Data */}
//       <Tabs activeKey={activeTab} onChange={setActiveTab} type="card" centered>
//         <TabPane tab="Expenses" key="expenses">
//           <ExpenseTable
//             data={getTabData()}
//             type="expenses"
//             loading={expensesLoading}
//             pagination={getCurrentPagination()}
//             total={getCurrentTotal()}
//             onPaginationChange={handlePaginationChange}
//             onEdit={(record) => handleEdit(record, "expense")}
//             onDelete={(record) => handleDelete(record, "expense")}
//             onView={(record) => handleView(record, "expense")}
//           />
//         </TabPane>

//         <TabPane tab="Employee Salary" key="salary">
//           <ExpenseTable
//             data={getTabData()}
//             type="salary"
//             loading={salaryLoading}
//             pagination={getCurrentPagination()}
//             total={getCurrentTotal()}
//             onPaginationChange={handlePaginationChange}
//             onEdit={(record) => handleEdit(record, "salary")}
//             onDelete={(record) => handleDelete(record, "salary")}
//             onView={(record) => handleView(record, "salary")}
//           />
//         </TabPane>

//         <TabPane tab="Waive-offs" key="waiveoffs">
//           <ExpenseTable
//             data={getTabData()}
//             type="waiveoffs"
//             loading={waveOffLoading}
//             pagination={getCurrentPagination()}
//             total={getCurrentTotal()}
//             onPaginationChange={handlePaginationChange}
//             onEdit={(record) => handleEdit(record, "waiveoff")}
//             onDelete={(record) => handleDelete(record, "waiveoff")}
//             onView={(record) => handleView(record, "waiveoff")}
//           />
//         </TabPane>

//         <TabPane tab="Commissions" key="commissions">
//           <ExpenseTable
//             data={getTabData()}
//             type="commissions"
//             loading={commissionLoading}
//             pagination={getCurrentPagination()}
//             total={getCurrentTotal()}
//             onPaginationChange={handlePaginationChange}
//             onEdit={(record) => handleEdit(record, "commission")}
//             onDelete={(record) => handleDelete(record, "commission")}
//             onView={(record) => handleView(record, "commission")}
//           />
//         </TabPane>

//         <TabPane tab="Voucher" key="vouchers">
//           <ExpenseTable
//             data={getTabData()}
//             type="vouchers"
//             loading={voucherLoading}
//             pagination={getCurrentPagination()}
//             total={getCurrentTotal()}
//             onPaginationChange={handlePaginationChange}
//             onEdit={(record) => handleEdit(record, "voucher")}
//             onDelete={(record) => handleDelete(record, "voucher")}
//             onView={(record) => handleView(record, "voucher")}
//           />
//         </TabPane>

//         <TabPane tab="Expense Analytics" key="analytics">
//           <ExpenseAnalytics
//             data={analyticsData}
//             loading={analyticsLoading}
//             selectedYear={selectedYear}
//             onYearChange={handleYearChange}
//             availableYears={sortedYears}
//           />
//         </TabPane>
//       </Tabs>
//     </div>
//   );
// };

// export default ExpenseDetailsPage;

import {useState, useEffect} from "react";
import {useParams} from "react-router-dom";
import {
  Tabs,
  message,
  Card,
  Row,
  Col,
  Select,
  DatePicker,
  Input,
  Button,
} from "antd";
import {
  FiCreditCard,
  FiMinusCircle,
  FiPercent,
  FiTrendingUp,
} from "react-icons/fi";
import {PageHeader, StatsGrid} from "../../components";
import ExpenseTable from "../../components/accounts/ExpenseTable";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {
  getAllExpenses,
  getExpenseAnalytics,
  getWaveOffPayments,
  getVoucherData,
  getCommissionData,
  getStaffSalaryData,
  getCategoryByMainCategory,
  deleteExpense, // Import the category API
} from "../../hooks/accounts/useAccounts";
import {useSelector} from "react-redux";
import ExpenseAnalytics from "../../components/accounts/ExpenseAnalytics";
import dayjs from "dayjs";
import usePersistentState from "../../hooks/usePersistentState";

const {TabPane} = Tabs;
const {Option} = Select;
const {Search} = Input;

const ExpenseDetailsPage = () => {
  const {selectedProperty} = useSelector((state) => state.properties);
  const {category} = useParams();
  const queryClient = useQueryClient();

  // Use regular state for activeTab to avoid navigation issues
  const [activeTab, setActiveTab] = useState(category || "expenses");

  // Use persistent state for selected year
  const [selectedYear, setSelectedYear] = usePersistentState(
    "expenseDetails_selectedYear",
    new Date().getFullYear()
  );

  // State for categories
  const [categories, setCategories] = useState([]);

  // Persistent filter states for each tab
  const [expensesFilters, setExpensesFilters] = usePersistentState(
    "expenseDetails_expensesFilters",
    {
      type: "",
      category: "",
      paymentMethod: "",
      selectedMonth: null,
      search: "",
    }
  );

  const [salaryFilters, setSalaryFilters] = usePersistentState(
    "expenseDetails_salaryFilters",
    {
      type: "",
      paymentMethod: "",
      selectedMonth: null,
      search: "",
    }
  );

  const [waiveoffsFilters, setWaiveoffsFilters] = usePersistentState(
    "expenseDetails_waiveoffsFilters",
    {
      paymentMethod: "",
      userType: "",
      search: "",
      selectedMonth: null,
    }
  );

  const [commissionsFilters, setCommissionsFilters] = usePersistentState(
    "expenseDetails_commissionsFilters",
    {
      search: "",
      paymentType: "",
      selectedMonth: null,
    }
  );

  const [vouchersFilters, setVouchersFilters] = usePersistentState(
    "expenseDetails_vouchersFilters",
    {
      search: "",
      status: "",
      selectedMonth: null,
    }
  );

  // Convert stored string dates to Day.js objects for use in components
  const normalizedExpensesFilters = {
    ...expensesFilters,
    selectedMonth: expensesFilters.selectedMonth
      ? dayjs(expensesFilters.selectedMonth)
      : null,
  };

  const normalizedSalaryFilters = {
    ...salaryFilters,
    selectedMonth: salaryFilters.selectedMonth
      ? dayjs(salaryFilters.selectedMonth)
      : null,
  };

  const normalizedWaiveoffsFilters = {
    ...waiveoffsFilters,
    selectedMonth: waiveoffsFilters.selectedMonth
      ? dayjs(waiveoffsFilters.selectedMonth)
      : null,
  };

  const normalizedCommissionsFilters = {
    ...commissionsFilters,
    selectedMonth: commissionsFilters.selectedMonth
      ? dayjs(commissionsFilters.selectedMonth)
      : null,
  };

  const normalizedVouchersFilters = {
    ...vouchersFilters,
    selectedMonth: vouchersFilters.selectedMonth
      ? dayjs(vouchersFilters.selectedMonth)
      : null,
  };

  // Use regular state for pagination to avoid complex objects in localStorage
  const [pagination, setPagination] = useState({
    expenses: {page: 1, limit: 10},
    salary: {page: 1, limit: 10},
    waiveoffs: {page: 1, limit: 10},
    commissions: {page: 1, limit: 10},
    vouchers: {page: 1, limit: 10},
  });

  // Query to fetch all categories when no type is selected
  const {data: allCategoriesData} = useQuery({
    queryKey: ["all-categories"],
    queryFn: () => getCategoryByMainCategory({}),
    enabled: activeTab === "expenses" && !expensesFilters.type,
  });
  console.log(allCategoriesData);
  // Query to fetch categories by main category when type is selected
  const {data: filteredCategoriesData} = useQuery({
    queryKey: ["categories-by-type", expensesFilters.type],
    queryFn: () =>
      getCategoryByMainCategory({mainCategory: expensesFilters.type}),
    enabled: activeTab === "expenses" && !!expensesFilters.type,
  });

  // Update categories based on the selected type
  useEffect(() => {
    if (activeTab === "expenses") {
      let categoryData = [];

      if (expensesFilters.type && filteredCategoriesData) {
        categoryData = filteredCategoriesData.data || [];
      } else if (!expensesFilters.type && allCategoriesData) {
        categoryData = allCategoriesData.data || [];
      }

      // Extract subCategory values and create unique options
      const subCategories = categoryData
        .map((item) => item.subCategory) // Extract subCategory
        .filter((subCategory) => subCategory && subCategory.trim() !== "") // Remove empty values
        .filter(
          (subCategory, index, self) => self.indexOf(subCategory) === index
        ) // Remove duplicates
        .sort() // Sort alphabetically
        .map((subCategory) => ({
          value: subCategory, // Use subCategory as value
          label: subCategory, // Use subCategory as display label
        }));

      setCategories(subCategories);
    } else {
      setCategories([]);
    }
  }, [
    activeTab,
    expensesFilters.type,
    allCategoriesData,
    filteredCategoriesData,
  ]);

  // Get current tab filters
  const getCurrentFilters = () => {
    const filtersMap = {
      expenses: normalizedExpensesFilters,
      salary: normalizedSalaryFilters,
      waiveoffs: normalizedWaiveoffsFilters,
      commissions: normalizedCommissionsFilters,
      vouchers: normalizedVouchersFilters,
    };
    return filtersMap[activeTab] || {};
  };

  // Get current raw filters (for API calls)
  const getCurrentRawFilters = () => {
    const filtersMap = {
      expenses: expensesFilters,
      salary: salaryFilters,
      waiveoffs: waiveoffsFilters,
      commissions: commissionsFilters,
      vouchers: vouchersFilters,
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
    expensesFilters,
    salaryFilters,
    waiveoffsFilters,
    commissionsFilters,
    vouchersFilters,
    activeTab,
    selectedProperty?.id,
  ]);

  // Filter configurations for each tab
  const filterConfigs = {
    expenses: {
      search: {
        placeholder: "Search by title or transaction ID",
        type: "search",
      },
      type: {
        placeholder: "Select Type",
        options: ["PG", "Mess", "Others"],
        type: "select",
      },
      category: {
        placeholder: "Select Category",
        options: categories, // Dynamic options from API
        type: "select",
        loading:
          (activeTab === "expenses" &&
            expensesFilters.type &&
            !filteredCategoriesData) ||
          (activeTab === "expenses" &&
            !expensesFilters.type &&
            !allCategoriesData),
      },
      paymentMethod: {
        placeholder: "Select Payment Mode",
        options: ["Cash", "UPI", "Bank Transfer", "Card", "Petty Cash"],
        type: "select",
      },
      selectedMonth: {
        placeholder: "Select Month",
        type: "month",
      },
    },
    salary: {
      search: {
        placeholder: "Search by employee name",
        type: "search",
      },
      type: {
        placeholder: "Select Employee Type",
        options: ["Staff", "Manager"],
        type: "select",
      },
      paymentMethod: {
        placeholder: "Select Payment Mode",
        options: ["Cash", "UPI", "Bank Transfer", "Card", "Petty Cash"],
        type: "select",
      },
      selectedMonth: {
        placeholder: "Select Month",
        type: "month",
      },
    },
    waiveoffs: {
      search: {
        placeholder: "Search by name or transaction ID",
        type: "search",
      },
      userType: {
        placeholder: "Select User Type",
        options: ["student", "worker", "dailyRent", "messOnly"],
        type: "select",
      },
      paymentMethod: {
        placeholder: "Select Payment Mode",
        options: ["Cash", "UPI", "Bank Transfer", "Card"],
        type: "select",
      },
      selectedMonth: {
        placeholder: "Select Month",
        type: "month",
      },
    },
    commissions: {
      search: {
        placeholder: "Search by name or transaction ID",
        type: "search",
      },
      paymentType: {
        placeholder: "Select Payment Mode",
        options: ["Cash", "UPI", "Bank Transfer", "Card", "Petty Cash"],
        type: "select",
      },
      selectedMonth: {
        placeholder: "Select Month",
        type: "month",
      },
    },
    vouchers: {
      search: {
        placeholder: "Search by voucher number or description",
        type: "search",
      },
      status: {
        placeholder: "Select Expense Status",
        options: ["Pending", "Fully Utilized"],
        type: "select",
      },
      selectedMonth: {
        placeholder: "Select Month",
        type: "month",
      },
    },
  };

  // Generic filter handler
  const handleFilterChange = (filterKey, value) => {
    const setterMap = {
      expenses: setExpensesFilters,
      salary: setSalaryFilters,
      waiveoffs: setWaiveoffsFilters,
      commissions: setCommissionsFilters,
      vouchers: setVouchersFilters,
    };

    const setter = setterMap[activeTab];
    if (setter) {
      setter((prev) => ({
        ...prev,
        [filterKey]: value,
        // Reset category when type changes
        ...(filterKey === "type" && {category: ""}),
      }));
    }
  };

  // Generic search handler
  const handleSearch = (value) => {
    handleFilterChange("search", value);
  };

  // Generic month change handler
  const handleMonthChange = (date) => {
    handleFilterChange("selectedMonth", date ? date.toISOString() : null);
  };

  const renderFilters = () => {
    const config = filterConfigs[activeTab] || {};
    const entries = Object.entries(config);
    const count = entries.length;

    if (count === 0) return null;

    // Calculate dynamic column span for large screens (max 24)
    const lgSpan = count > 0 ? Math.floor(24 / (count + 1)) : 24; // +1 for clear button

    return (
      <>
        {entries.map(([key, filterConfig]) => {
          const {
            type,
            placeholder,
            options = [],
            loading = false,
          } = filterConfig;
          const currentFilters = getCurrentFilters();
          const value = currentFilters[key];

          switch (type) {
            case "search":
              return (
                <Col key={key} xs={24} sm={12} md={8} lg={lgSpan}>
                  <Search
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => handleSearch(e.target.value)}
                    onSearch={handleSearch}
                    style={{width: "100%"}}
                    allowClear
                  />
                </Col>
              );

            case "select":
              return (
                <Col key={key} xs={24} sm={12} md={8} lg={lgSpan}>
                  <Select
                    placeholder={placeholder}
                    value={value || undefined}
                    onChange={(val) => handleFilterChange(key, val)}
                    style={{width: "100%"}}
                    allowClear
                    showSearch={key === "category"}
                    optionFilterProp="children"
                    loading={loading}
                    filterOption={(input, option) =>
                      option.children
                        .toLowerCase()
                        .indexOf(input.toLowerCase()) >= 0
                    }
                  >
                    {options.map((option) => {
                      // Handle both string options and object options from API
                      const optionValue =
                        typeof option === "object"
                          ? option.value || option.id
                          : option;
                      const optionLabel =
                        typeof option === "object"
                          ? option.label || option.name
                          : option;

                      return (
                        <Option key={optionValue} value={optionValue}>
                          {optionLabel}
                        </Option>
                      );
                    })}
                  </Select>
                </Col>
              );

            case "month":
              return (
                <Col key={key} xs={24} sm={12} md={8} lg={lgSpan}>
                  <DatePicker
                    placeholder={placeholder}
                    value={value}
                    onChange={handleMonthChange}
                    picker="month"
                    style={{width: "100%"}}
                    format="MMM YYYY"
                  />
                </Col>
              );

            default:
              return null;
          }
        })}
      </>
    );
  };

  // API calls with proper pagination for infinite scroll
  const {
    data: expensesData,
    isLoading: expensesLoading,
    error: expensesError,
  } = useQuery({
    queryKey: [
      "expenses",
      pagination.expenses.page,
      pagination.expenses.limit,
      ...Object.values(expensesFilters),
      selectedProperty?.id,
    ],
    queryFn: () => {
      const params = {
        page: pagination.expenses.page,
        limit: pagination.expenses.limit,
        ...expensesFilters,
        propertyId: selectedProperty?.id,
      };

      if (expensesFilters.selectedMonth) {
        const month = dayjs(expensesFilters.selectedMonth);
        params.month = month.month() + 1;
        params.year = month.year();
        delete params.selectedMonth;
      }

      return getAllExpenses(params);
    },
  });

  const {
    data: salaryData,
    isLoading: salaryLoading,
    error: salaryError,
  } = useQuery({
    queryKey: [
      "staff-salary",
      pagination.salary.page,
      pagination.salary.limit,
      ...Object.values(salaryFilters),
      selectedProperty?.id,
    ],
    queryFn: () => {
      const params = {
        page: pagination.salary.page,
        limit: pagination.salary.limit,
        ...salaryFilters,
        propertyId: selectedProperty?.id,
      };

      if (salaryFilters.selectedMonth) {
        const month = dayjs(salaryFilters.selectedMonth);
        params.month = month.month() + 1;
        params.year = month.year();
        delete params.selectedMonth;
      }

      return getStaffSalaryData(params);
    },
  });

  const {
    data: waveOffData,
    isLoading: waveOffLoading,
    error: waveOffError,
  } = useQuery({
    queryKey: [
      "waveOffPayments",
      pagination.waiveoffs.page,
      pagination.waiveoffs.limit,
      ...Object.values(waiveoffsFilters),
      selectedProperty?.id,
    ],
    queryFn: () => {
      const params = {
        page: pagination.waiveoffs.page,
        limit: pagination.waiveoffs.limit,
        ...waiveoffsFilters,
        propertyId: selectedProperty?.id,
      };

      if (waiveoffsFilters.selectedMonth) {
        const month = dayjs(waiveoffsFilters.selectedMonth);
        params.month = month.month() + 1;
        params.year = month.year();
        delete params.selectedMonth;
      }

      return getWaveOffPayments(params);
    },
  });

  const {
    data: commissionData,
    isLoading: commissionLoading,
    error: commissionError,
  } = useQuery({
    queryKey: [
      "commissions",
      pagination.commissions.page,
      pagination.commissions.limit,
      ...Object.values(commissionsFilters),
      selectedProperty?.id,
    ],
    queryFn: () => {
      const params = {
        page: pagination.commissions.page,
        limit: pagination.commissions.limit,
        ...commissionsFilters,
        propertyId: selectedProperty?.id,
      };

      if (commissionsFilters.selectedMonth) {
        const month = dayjs(commissionsFilters.selectedMonth);
        params.month = month.month() + 1;
        params.year = month.year();
        delete params.selectedMonth;
      }

      return getCommissionData(params);
    },
  });

  const {
    data: voucherData,
    isLoading: voucherLoading,
    error: voucherError,
  } = useQuery({
    queryKey: [
      "vouchers",
      pagination.vouchers.page,
      pagination.vouchers.limit,
      ...Object.values(vouchersFilters),
    ],
    queryFn: () => {
      const params = {
        page: pagination.vouchers.page,
        limit: pagination.vouchers.limit,
        ...vouchersFilters,
      };

      if (vouchersFilters.selectedMonth) {
        const month = dayjs(vouchersFilters.selectedMonth);
        params.month = month.month() + 1;
        params.year = month.year();
        delete params.selectedMonth;
      }

      return getVoucherData(params);
    },
  });

  const {
    data: analyticsData,
    isLoading: analyticsLoading,
    error: analyticsError,
  } = useQuery({
    queryKey: ["expense-analytics", selectedProperty?.id, selectedYear],
    queryFn: () => getExpenseAnalytics(selectedProperty?.id, selectedYear),
    enabled: activeTab === "analytics",
  });

  const {data: yearsData} = useQuery({
    queryKey: ["available-years", selectedProperty?.id],
    queryFn: () =>
      getAllExpenses({
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

  useEffect(() => {
    if (sortedYears.length > 0 && !sortedYears.includes(selectedYear)) {
      setSelectedYear(sortedYears[0]);
    }
  }, [sortedYears, selectedYear]);

  useEffect(() => {
    if (sortedYears.length > 0) {
      setSelectedYear(sortedYears[0]);
    }
  }, [selectedProperty?.id]);

  // Handle errors
  useEffect(() => {
    if (expensesError) {
      message.error(`Failed to load expenses data`);
    }
    if (analyticsError) {
      message.error(`Failed to load analytics data`);
    }
    if (waveOffError) {
      message.error(`Failed to load wave-off payments data`);
    }
    if (voucherError) {
      message.error(`Failed to load voucher data`);
    }
    if (commissionError) {
      message.error(`Failed to load commission data`);
    }
    if (salaryError) {
      message.error("Failed to load salary data");
    }
  }, [
    expensesError,
    analyticsError,
    waveOffError,
    voucherError,
    commissionError,
    salaryError,
  ]);

  // Calculate stats from actual data
  const expenseStats = [
    {
      title: "Total Expenses",
      value: `₹ ${expensesData?.totalAmount?.toLocaleString() || 0}`,
      icon: <FiTrendingUp className="text-xl" />,
      color: "bg-red-100 text-red-600",
    },
    {
      title: "Total Salary",
      value: `₹ ${salaryData?.totalPaidAmount?.toLocaleString() || 0}`,
      icon: <FiCreditCard className="text-xl" />,
      color: "bg-orange-100 text-orange-600",
    },
    {
      title: "Total Waive-offs",
      value: `₹ ${waveOffData?.data?.totalWaveOff?.toLocaleString() || 0}`,
      icon: <FiMinusCircle className="text-xl" />,
      color: "bg-purple-100 text-purple-600",
    },
    {
      title: "Total Commissions",
      value: `₹ ${
        commissionData?.data
          ?.reduce((sum, item) => sum + (item.amount || 0), 0)
          ?.toLocaleString() || 0
      }`,
      icon: <FiPercent className="text-xl" />,
      color: "bg-blue-100 text-blue-600",
    },
  ];

  const getTabData = () => {
    let filteredData = [];

    switch (activeTab) {
      case "expenses":
        filteredData = expensesData?.data || [];
        break;
      case "waiveoffs":
        filteredData = waveOffData?.data?.payments || [];
        break;
      case "vouchers":
        filteredData = voucherData?.data || [];
        break;
      case "commissions":
        filteredData = commissionData?.data || [];
        break;
      case "salary":
        filteredData = salaryData?.data || [];
        break;
      default:
        filteredData = [];
    }

    return filteredData;
  };

  const getCurrentPagination = () => {
    return pagination[activeTab] || {page: 1, limit: 10};
  };

  const getCurrentTotal = () => {
    const totalMap = {
      expenses: expensesData?.pagination?.total || 0,
      salary: salaryData?.pagination?.total || 0,
      waiveoffs: waveOffData?.data?.payments?.length || 0,
      commissions: commissionData?.data?.length || 0,
      vouchers: voucherData?.data?.length || 0,
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

  const handleYearChange = (year) => {
    setSelectedYear(year);
  };

  // Handler functions for table actions
  const handleEdit = (record, type) => {
    console.log(`Edit ${type}:`, record);
  };

  const deleteMutation = useMutation({
    mutationFn: (expenseId) => deleteExpense(expenseId),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ["expenses"]});
    },
    onError: (error) => {
      console.error("Delete failed:", error);
    },
  });

  const handleDelete = (record, type) => {
    deleteMutation.mutate(record._id);
    // console.log(`Delete ${type}:`, record);
  };

  const handleView = (record, type) => {
    console.log(`View ${type}:`, record);
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 pt-4 pb-8 xl:px-12 lg:px-6">
      <PageHeader
        title="Expenses Overview"
        subtitle="Manage and track all your expenses"
      />

      {/* Summary Statistics */}
      <StatsGrid stats={expenseStats} />

      {/* Filters Section - Show for all tabs except analytics */}
      {activeTab !== "analytics" && (
        <Card size="small" style={{marginBottom: 16}}>
          <Row gutter={[16, 16]}>{renderFilters()}</Row>
        </Card>
      )}

      {/* Tabs with Data */}
      <Tabs activeKey={activeTab} onChange={setActiveTab} type="card" centered>
        <TabPane tab="Expenses" key="expenses">
          <ExpenseTable
            data={getTabData()}
            type="expenses"
            loading={expensesLoading}
            pagination={getCurrentPagination()}
            total={getCurrentTotal()}
            onPaginationChange={handlePaginationChange}
            onEdit={(record) => handleEdit(record, "expense")}
            onDelete={(record) => handleDelete(record, "expense")}
            onView={(record) => handleView(record, "expense")}
          />
        </TabPane>

        <TabPane tab="Employee Salary" key="salary">
          <ExpenseTable
            data={getTabData()}
            type="salary"
            loading={salaryLoading}
            pagination={getCurrentPagination()}
            total={getCurrentTotal()}
            onPaginationChange={handlePaginationChange}
            onEdit={(record) => handleEdit(record, "salary")}
            onDelete={(record) => handleDelete(record, "salary")}
            onView={(record) => handleView(record, "salary")}
          />
        </TabPane>

        <TabPane tab="Waive-offs" key="waiveoffs">
          <ExpenseTable
            data={getTabData()}
            type="waiveoffs"
            loading={waveOffLoading}
            pagination={getCurrentPagination()}
            total={getCurrentTotal()}
            onPaginationChange={handlePaginationChange}
            onEdit={(record) => handleEdit(record, "waiveoff")}
            onDelete={(record) => handleDelete(record, "waiveoff")}
            onView={(record) => handleView(record, "waiveoff")}
          />
        </TabPane>

        <TabPane tab="Commissions" key="commissions">
          <ExpenseTable
            data={getTabData()}
            type="commissions"
            loading={commissionLoading}
            pagination={getCurrentPagination()}
            total={getCurrentTotal()}
            onPaginationChange={handlePaginationChange}
            onEdit={(record) => handleEdit(record, "commission")}
            onDelete={(record) => handleDelete(record, "commission")}
            onView={(record) => handleView(record, "commission")}
          />
        </TabPane>

        <TabPane tab="Voucher" key="vouchers">
          <ExpenseTable
            data={getTabData()}
            type="vouchers"
            loading={voucherLoading}
            pagination={getCurrentPagination()}
            total={getCurrentTotal()}
            onPaginationChange={handlePaginationChange}
            onEdit={(record) => handleEdit(record, "voucher")}
            onDelete={(record) => handleDelete(record, "voucher")}
            onView={(record) => handleView(record, "voucher")}
          />
        </TabPane>

        <TabPane tab="Expense Analytics" key="analytics">
          <ExpenseAnalytics
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

export default ExpenseDetailsPage;
