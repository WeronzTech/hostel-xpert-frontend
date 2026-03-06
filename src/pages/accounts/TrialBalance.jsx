// import {useState, useEffect} from "react";
// import {
//   Row,
//   Col,
//   Card,
//   DatePicker,
//   Space,
//   Typography,
//   Tag,
//   Table,
//   Badge,
//   Divider,
//   Button,
//   Menu,
//   Dropdown,
//   message,
//   Grid,
//   Tabs,
// } from "antd";
// import {useQuery} from "@tanstack/react-query";
// import {useSelector} from "react-redux";
// import {PageHeader} from "../../components";
// import {getTrialBalance} from "../../hooks/accounts/useAccounts";
// import dayjs from "dayjs";
// import usePersistentState from "../../hooks/usePersistentState";
// import {
//   DownloadOutlined,
//   FileExcelOutlined,
//   FilePdfOutlined,
//   CheckCircleOutlined,
//   CloseCircleOutlined,
//   BankOutlined,
//   ShoppingOutlined,
//   ReconciliationOutlined,
//   DollarOutlined,
//   TableOutlined,
//   BarChartOutlined,
//   PieChartOutlined,
// } from "@ant-design/icons";
// import {useNavigate, useParams} from "react-router-dom";

// const {RangePicker} = DatePicker;
// const {Text} = Typography;

// const TrialBalance = () => {
//   const {selectedProperty} = useSelector((state) => state.properties);
//   const {selectedKitchen} = useSelector((state) => state.kitchens);
//   const [activeTab, setActiveTab] = useState("trial-balance");

//   const {entityType} = useParams();
//   const {useBreakpoint} = Grid;
//   const screens = useBreakpoint();
//   const navigate = useNavigate();

//   // Use persistent state for filters
//   const [filters, setFilters] = usePersistentState("trialBalanceFilters", {
//     dateRange: [
//       dayjs().startOf("month").toISOString(),
//       dayjs().endOf("day").toISOString(),
//     ],
//     entityId: null,
//     entityType: "", // Initialize with URL param
//     includeZero: false,
//   });

//   const [isInitialized, setIsInitialized] = useState(false);

//   useEffect(() => {
//     if (filters) {
//       setIsInitialized(true);
//     }
//   }, [filters]);

//   const getQueryParams = () => {
//     // Check if dateRange exists and has both values
//     if (!filters.dateRange?.[0] || !filters.dateRange?.[1]) {
//       return null;
//     }

//     return {
//       fromDate: dayjs(filters.dateRange[0]).format("YYYY-MM-DD"),
//       toDate: dayjs(filters.dateRange[1]).format("YYYY-MM-DD"),
//       entityType,
//       entityId:
//         entityType === "PROPERTY"
//           ? selectedProperty?.id
//           : entityType === "KITCHEN"
//             ? selectedKitchen?.id
//             : undefined,
//       includeZero: filters.includeZero,
//     };
//   };

//   // Fetch trial balance data
//   const {data: trialBalanceResponse, isLoading} = useQuery({
//     queryKey: [
//       "trialBalance",
//       {
//         entityType,
//         entityId:
//           entityType === "PROPERTY"
//             ? selectedProperty?.id
//             : entityType === "KITCHEN"
//               ? selectedKitchen?.id
//               : undefined,
//         fromDate: filters.dateRange?.[0]
//           ? dayjs(filters.dateRange[0]).format("YYYY-MM-DD")
//           : undefined,
//         toDate: filters.dateRange?.[1]
//           ? dayjs(filters.dateRange[1]).format("YYYY-MM-DD")
//           : undefined,
//         includeZero: filters.includeZero,
//       },
//     ],
//     queryFn: () => {
//       const params = getQueryParams();
//       console.log("Fetching with params:", params); // Debug log
//       if (!params) return Promise.resolve(null);
//       return getTrialBalance(params);
//     },
//     enabled:
//       isInitialized &&
//       !!filters.dateRange?.[0] &&
//       !!filters.dateRange?.[1] &&
//       !!(selectedProperty?.id || selectedKitchen?.id),
//     refetchOnWindowFocus: false,
//   });

//   const trialBalanceData = trialBalanceResponse?.data;
//   const trialBalance = trialBalanceData?.trialBalance || [];
//   const totals = trialBalanceData?.totals || {};
//   const isBalanced = trialBalanceData?.isBalanced;

//   const handleFilterChange = (key, value) => {
//     setFilters((prev) => ({...prev, [key]: value}));
//   };

//   // Temporary export handler
//   const handleExport = (format) => {
//     message.info(`${format} export coming soon...`);
//   };

//   const handleProfitAndLossClick = (entityType) => {
//     navigate(`/accounting/profit-loss/${entityType}`);
//   };

//   const handleBalanceSheetClick = (entityType) => {
//     navigate(`/accounting/balance-sheet/${entityType}`);
//   };

//   const downloadMenu = (
//     <Menu>
//       <Menu.Item
//         key="excel"
//         icon={<FileExcelOutlined style={{color: "#52c41a"}} />}
//         onClick={() => handleExport("excel")}
//       >
//         Export as Excel
//       </Menu.Item>
//       <Menu.Item
//         key="pdf"
//         icon={<FilePdfOutlined style={{color: "#ff4d4f"}} />}
//         onClick={() => handleExport("pdf")}
//       >
//         Export as PDF
//       </Menu.Item>
//     </Menu>
//   );

//   // Columns with simplified number handling
//   const columns = [
//     {
//       title: "Account Name",
//       dataIndex: "accountName",
//       key: "accountName",
//       fixed: "left",
//       width: 280,
//       render: (text, record) => (
//         <Space direction="vertical" size={0} style={{width: "100%"}}>
//           <Space align="center">
//             {record.accountType === "Asset" && (
//               <BankOutlined style={{color: "#1890ff"}} />
//             )}
//             {record.accountType === "Liability" && (
//               <ShoppingOutlined style={{color: "#fa8c16"}} />
//             )}
//             {record.accountType === "Equity" && (
//               <DollarOutlined style={{color: "#722ed1"}} />
//             )}
//             {record.accountType === "Income" && (
//               <ReconciliationOutlined style={{color: "#52c41a"}} />
//             )}
//             {record.accountType === "Expense" && (
//               <CloseCircleOutlined style={{color: "#f5222d"}} />
//             )}
//             <Text strong>{text}</Text>
//           </Space>
//           <Tag color="default" style={{marginLeft: 22, fontSize: 11}}>
//             {record.accountType}
//           </Tag>
//         </Space>
//       ),
//     },
//     {
//       title: "Opening Debit",
//       dataIndex: "openingDebit",
//       key: "openingDebit",
//       width: 130,
//       align: "right",
//       render: (value) => (
//         <Text
//           style={{
//             color: value > 0 ? "#f5222d" : "#8c8c8c",
//             fontWeight: value > 0 ? 500 : 400,
//           }}
//         >
//           {value > 0
//             ? `₹ ${value.toLocaleString("en-IN", {
//                 minimumFractionDigits: 2,
//                 maximumFractionDigits: 2,
//               })}`
//             : "-"}
//         </Text>
//       ),
//     },
//     {
//       title: "Opening Credit",
//       dataIndex: "openingCredit",
//       key: "openingCredit",
//       width: 130,
//       align: "right",
//       render: (value) => (
//         <Text
//           style={{
//             color: value > 0 ? "#52c41a" : "#8c8c8c",
//             fontWeight: value > 0 ? 500 : 400,
//           }}
//         >
//           {value > 0
//             ? `₹ ${value.toLocaleString("en-IN", {
//                 minimumFractionDigits: 2,
//                 maximumFractionDigits: 2,
//               })}`
//             : "-"}
//         </Text>
//       ),
//     },
//     {
//       title: "Period Debit",
//       dataIndex: "periodDebit",
//       key: "periodDebit",
//       width: 130,
//       align: "right",
//       render: (value) => (
//         <Text
//           style={{
//             color: value > 0 ? "#f5222d" : "#8c8c8c",
//             fontWeight: value > 0 ? 500 : 400,
//           }}
//         >
//           {value > 0
//             ? `₹ ${value.toLocaleString("en-IN", {
//                 minimumFractionDigits: 2,
//                 maximumFractionDigits: 2,
//               })}`
//             : "-"}
//         </Text>
//       ),
//     },
//     {
//       title: "Period Credit",
//       dataIndex: "periodCredit",
//       key: "periodCredit",
//       width: 130,
//       align: "right",
//       render: (value) => (
//         <Text
//           style={{
//             color: value > 0 ? "#52c41a" : "#8c8c8c",
//             fontWeight: value > 0 ? 500 : 400,
//           }}
//         >
//           {value > 0
//             ? `₹ ${value.toLocaleString("en-IN", {
//                 minimumFractionDigits: 2,
//                 maximumFractionDigits: 2,
//               })}`
//             : "-"}
//         </Text>
//       ),
//     },
//     {
//       title: "Closing Debit",
//       dataIndex: "closingDebit",
//       key: "closingDebit",
//       width: 130,
//       align: "right",
//       render: (value) => (
//         <Text
//           strong
//           style={{
//             color: value > 0 ? "#f5222d" : "#8c8c8c",
//           }}
//         >
//           {value > 0
//             ? `₹ ${value.toLocaleString("en-IN", {
//                 minimumFractionDigits: 2,
//                 maximumFractionDigits: 2,
//               })}`
//             : "-"}
//         </Text>
//       ),
//     },
//     {
//       title: "Closing Credit",
//       dataIndex: "closingCredit",
//       key: "closingCredit",
//       width: 130,
//       align: "right",
//       render: (value) => (
//         <Text
//           strong
//           style={{
//             color: value > 0 ? "#52c41a" : "#8c8c8c",
//           }}
//         >
//           {value > 0
//             ? `₹ ${value.toLocaleString("en-IN", {
//                 minimumFractionDigits: 2,
//                 maximumFractionDigits: 2,
//               })}`
//             : "-"}
//         </Text>
//       ),
//     },
//   ];

//   return (
//     <div className="min-h-screen bg-gray-50 px-4 pt-4 pb-8 xl:px-12 lg:px-6">
//       <PageHeader
//         title="Trial Balance"
//         subtitle="Verify Debits Equal Credits"
//       />
//       <Card
//         style={{
//           borderRadius: "12px",
//           boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
//           marginBottom: "24px",
//         }}
//         bodyStyle={{padding: "12px 16px"}}
//       >
//         <Row gutter={[16, 16]} align="middle" justify="space-between">
//           {/* Left Side - Navigation Tabs */}
//           <Col xs={24} md={12} lg={10}>
//             <Tabs
//               activeKey="trial-balance"
//               onChange={(key) => {
//                 setActiveTab(key);
//                 if (key === "profit-loss") handleProfitAndLossClick();
//                 if (key === "balance-sheet") handleBalanceSheetClick();
//               }}
//               items={[
//                 {
//                   key: "trial-balance",
//                   label: (
//                     <Space>
//                       <TableOutlined />
//                       <span>Trial Balance</span>
//                     </Space>
//                   ),
//                 },
//                 {
//                   key: "profit-loss",
//                   label: (
//                     <Space>
//                       <BarChartOutlined />
//                       <span>Profit & Loss</span>
//                     </Space>
//                   ),
//                 },
//                 {
//                   key: "balance-sheet",
//                   label: (
//                     <Space>
//                       <PieChartOutlined />
//                       <span>Balance Sheet</span>
//                     </Space>
//                   ),
//                 },
//               ]}
//               tabBarStyle={{
//                 marginBottom: 0,
//                 background: "transparent",
//               }}
//               size="middle"
//             />
//           </Col>

//           {/* Right Side - Filters */}
//           <Col xs={24} md={12} lg={14}>
//             <Row gutter={[8, 8]} justify="end">
//               {/* Zero Balance Button - Only for Trial Balance */}
//               {activeTab === "trial-balance" && (
//                 <Col xs={24} sm={8} md={7} lg={6}>
//                   <Button
//                     type={filters.includeZero ? "primary" : "default"}
//                     icon={<DollarOutlined />}
//                     onClick={() =>
//                       handleFilterChange("includeZero", !filters.includeZero)
//                     }
//                     style={{
//                       backgroundColor: filters.includeZero
//                         ? "#059669"
//                         : undefined,
//                       borderColor: filters.includeZero ? "#059669" : undefined,
//                       color: filters.includeZero ? "white" : undefined,
//                       width: "100%",
//                     }}
//                     size="middle"
//                   >
//                     {screens.md &&
//                       (filters.includeZero ? "Hide Zero" : "Show Zero")}
//                   </Button>
//                 </Col>
//               )}

//               {/* Date Picker - Shows RangePicker for TB/P&L, DatePicker for Balance Sheet */}
//               <Col xs={16} sm={12} md={10} lg={8}>
//                 {activeTab === "balance-sheet" ? (
//                   <DatePicker
//                     style={{width: "100%"}}
//                     value={
//                       filters.dateRange?.[1]
//                         ? dayjs(filters.dateRange[1])
//                         : null
//                     }
//                     onChange={(date) => {
//                       if (date) {
//                         handleFilterChange("dateRange", [
//                           date.startOf("day").toISOString(),
//                           date.endOf("day").toISOString(),
//                         ]);
//                       } else {
//                         handleFilterChange("dateRange", null);
//                       }
//                     }}
//                     placeholder="As on Date"
//                     allowClear
//                     size="middle"
//                     format="DD/MM/YYYY"
//                   />
//                 ) : (
//                   <RangePicker
//                     style={{width: "100%"}}
//                     value={
//                       filters.dateRange
//                         ? [
//                             dayjs(filters.dateRange[0]),
//                             dayjs(filters.dateRange[1]),
//                           ]
//                         : null
//                     }
//                     onChange={(dates) => {
//                       if (dates && dates.length === 2) {
//                         const [start, end] = dates;
//                         handleFilterChange("dateRange", [
//                           start.startOf("day").toISOString(),
//                           end.endOf("day").toISOString(),
//                         ]);
//                       } else {
//                         handleFilterChange("dateRange", null);
//                       }
//                     }}
//                     allowClear
//                     size="middle"
//                     format="DD/MM/YYYY"
//                   />
//                 )}
//               </Col>

//               {/* Download Button */}
//               <Col xs={8} sm={4} md={4} lg={3}>
//                 <Dropdown overlay={downloadMenu} trigger={["hover"]}>
//                   <Button
//                     icon={<DownloadOutlined />}
//                     type="primary"
//                     style={{
//                       backgroundColor: "#059669",
//                       borderColor: "#059669",
//                       borderRadius: "8px",
//                       width: "100%",
//                     }}
//                     size="middle"
//                   >
//                     {screens.md && "Export"}
//                   </Button>
//                 </Dropdown>
//               </Col>
//             </Row>
//           </Col>
//         </Row>
//       </Card>

//       {/* Status Banner */}
//       <Card
//         style={{
//           borderRadius: "12px",
//           marginBottom: "24px",
//           background: isBalanced ? "#f6ffed" : "#fff2f0",
//           border: isBalanced ? "1px solid #b7eb8f" : "1px solid #ffccc7",
//         }}
//       >
//         <Row align="middle" justify="space-between">
//           <Col>
//             <Space size="middle">
//               {isBalanced ? (
//                 <CheckCircleOutlined style={{fontSize: 20, color: "#52c41a"}} />
//               ) : (
//                 <CloseCircleOutlined style={{fontSize: 20, color: "#f5222d"}} />
//               )}
//               <Text type="secondary">
//                 Total Debits: ₹{" "}
//                 {totals.closingDebit?.toLocaleString("en-IN", {
//                   minimumFractionDigits: 2,
//                   maximumFractionDigits: 2,
//                 })}{" "}
//                 | Total Credits: ₹{" "}
//                 {totals.closingCredit?.toLocaleString("en-IN", {
//                   minimumFractionDigits: 2,
//                   maximumFractionDigits: 2,
//                 })}
//               </Text>
//             </Space>
//           </Col>
//           <Col>
//             <Text
//               strong
//               style={{
//                 color: isBalanced ? "#389e0d" : "#cf1322",
//                 fontSize: 16,
//               }}
//             >
//               {isBalanced ? "✓" : "✗"} Trial Balance is{" "}
//               {isBalanced ? "Balanced" : "Not Balanced"}
//             </Text>
//           </Col>
//         </Row>
//       </Card>

//       {/* Trial Balance Table */}
//       <Card
//         style={{
//           borderRadius: "12px",
//           boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
//         }}
//         bodyStyle={{padding: 0}}
//       >
//         <Table
//           columns={columns}
//           dataSource={trialBalance}
//           loading={isLoading}
//           rowKey="accountId"
//           bordered
//           size="middle"
//           scroll={{x: 1200}}
//           pagination={false}
//           footer={() => (
//             <div style={{padding: "12px 16px", background: "#fafafa"}}>
//               <Row justify="space-between" align="middle">
//                 <Col>
//                   <Text strong style={{fontSize: 14}}>
//                     GRAND TOTAL
//                   </Text>
//                 </Col>
//                 <Col>
//                   <Space size="large" wrap>
//                     <Text>
//                       Opening Dr:{" "}
//                       <Text strong style={{color: "#f5222d"}}>
//                         ₹{" "}
//                         {totals.openingDebit?.toLocaleString("en-IN", {
//                           minimumFractionDigits: 2,
//                         })}
//                       </Text>
//                     </Text>
//                     <Text>
//                       Opening Cr:{" "}
//                       <Text strong style={{color: "#52c41a"}}>
//                         ₹{" "}
//                         {totals.openingCredit?.toLocaleString("en-IN", {
//                           minimumFractionDigits: 2,
//                         })}
//                       </Text>
//                     </Text>
//                     <Divider type="vertical" />
//                     <Text>
//                       Period Dr:{" "}
//                       <Text strong style={{color: "#f5222d"}}>
//                         ₹{" "}
//                         {totals.periodDebit?.toLocaleString("en-IN", {
//                           minimumFractionDigits: 2,
//                         })}
//                       </Text>
//                     </Text>
//                     <Text>
//                       Period Cr:{" "}
//                       <Text strong style={{color: "#52c41a"}}>
//                         ₹{" "}
//                         {totals.periodCredit?.toLocaleString("en-IN", {
//                           minimumFractionDigits: 2,
//                         })}
//                       </Text>
//                     </Text>
//                     <Divider type="vertical" />
//                     <Text>
//                       Closing Dr:{" "}
//                       <Text strong style={{color: "#f5222d"}}>
//                         ₹{" "}
//                         {totals.closingDebit?.toLocaleString("en-IN", {
//                           minimumFractionDigits: 2,
//                         })}
//                       </Text>
//                     </Text>
//                     <Text>
//                       Closing Cr:{" "}
//                       <Text strong style={{color: "#52c41a"}}>
//                         ₹{" "}
//                         {totals.closingCredit?.toLocaleString("en-IN", {
//                           minimumFractionDigits: 2,
//                         })}
//                       </Text>
//                     </Text>
//                   </Space>
//                 </Col>
//               </Row>
//               <Divider style={{margin: "12px 0 8px 0"}} />
//               <Row justify="center">
//                 <Text
//                   strong
//                   style={{
//                     color:
//                       totals.closingDebit === totals.closingCredit
//                         ? "#52c41a"
//                         : "#f5222d",
//                     fontSize: 14,
//                   }}
//                 >
//                   Difference: ₹{" "}
//                   {Math.abs(
//                     (totals.closingDebit || 0) - (totals.closingCredit || 0),
//                   ).toLocaleString("en-IN", {
//                     minimumFractionDigits: 2,
//                     maximumFractionDigits: 2,
//                   })}
//                 </Text>
//               </Row>
//             </div>
//           )}
//         />
//       </Card>

//       {/* Additional Info */}
//       <Row gutter={16} style={{marginTop: 24}}>
//         <Col span={24}>
//           <Card size="small" style={{background: "#fafafa"}}>
//             <Space wrap size="large">
//               <Text type="secondary">
//                 <Badge status="processing" /> Opening balances include all
//                 transactions before the selected period
//               </Text>
//               <Text type="secondary">
//                 <Badge status="success" /> Period movements include all
//                 transactions within the selected date range
//               </Text>
//               <Text type="secondary">
//                 <Badge status="warning" /> Closing balances are calculated as
//                 Opening + Period Movement
//               </Text>
//             </Space>
//           </Card>
//         </Col>
//       </Row>
//     </div>
//   );
// };

// export default TrialBalance;
import {useState, useEffect} from "react";
import {
  Row,
  Col,
  Card,
  DatePicker,
  Space,
  Typography,
  Tag,
  Table,
  Badge,
  Divider,
  Button,
  Menu,
  Dropdown,
  message,
  Grid,
  Tabs,
} from "antd";
import {useQuery} from "@tanstack/react-query";
import {useSelector} from "react-redux";
import {PageHeader} from "../../components";
import {getTrialBalance} from "../../hooks/accounts/useAccounts";
import dayjs from "dayjs";
import usePersistentState from "../../hooks/usePersistentState";
import {
  DownloadOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  BankOutlined,
  ShoppingOutlined,
  ReconciliationOutlined,
  DollarOutlined,
  TableOutlined,
  BarChartOutlined,
  PieChartOutlined,
} from "@ant-design/icons";
import {useNavigate, useParams, useLocation} from "react-router-dom";

const {RangePicker} = DatePicker;
const {Text} = Typography;

const TrialBalance = () => {
  const {selectedProperty} = useSelector((state) => state.properties);
  const {selectedKitchen} = useSelector((state) => state.kitchens);

  const {entityType} = useParams();
  const location = useLocation();
  const {useBreakpoint} = Grid;
  const screens = useBreakpoint();
  const navigate = useNavigate();

  // Determine active tab based on current path
  const getActiveTabFromPath = () => {
    const path = location.pathname;
    if (path.includes("profit-loss")) return "profit-loss";
    if (path.includes("balance-sheet")) return "balance-sheet";
    return "trial-balance";
  };

  const [activeTab, setActiveTab] = useState(getActiveTabFromPath());

  // Update active tab when path changes
  useEffect(() => {
    setActiveTab(getActiveTabFromPath());
  }, [location.pathname]);

  // Use persistent state for filters
  const [filters, setFilters] = usePersistentState("trialBalanceFilters", {
    dateRange: [
      dayjs().startOf("month").toISOString(),
      dayjs().endOf("day").toISOString(),
    ],
    entityId: null,
    entityType: "", // Initialize with URL param
    includeZero: false,
  });

  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (filters) {
      setIsInitialized(true);
    }
  }, [filters]);

  const getQueryParams = () => {
    // Check if dateRange exists and has both values
    if (!filters.dateRange?.[0] || !filters.dateRange?.[1]) {
      return null;
    }

    return {
      fromDate: dayjs(filters.dateRange[0]).format("YYYY-MM-DD"),
      toDate: dayjs(filters.dateRange[1]).format("YYYY-MM-DD"),
      entityType,
      entityId:
        entityType === "PROPERTY"
          ? selectedProperty?.id
          : entityType === "KITCHEN"
            ? selectedKitchen?.id
            : undefined,
      includeZero: filters.includeZero,
    };
  };

  // Fetch trial balance data
  const {data: trialBalanceResponse, isLoading} = useQuery({
    queryKey: [
      "trialBalance",
      {
        entityType,
        entityId:
          entityType === "PROPERTY"
            ? selectedProperty?.id
            : entityType === "KITCHEN"
              ? selectedKitchen?.id
              : undefined,
        fromDate: filters.dateRange?.[0]
          ? dayjs(filters.dateRange[0]).format("YYYY-MM-DD")
          : undefined,
        toDate: filters.dateRange?.[1]
          ? dayjs(filters.dateRange[1]).format("YYYY-MM-DD")
          : undefined,
        includeZero: filters.includeZero,
      },
    ],
    queryFn: () => {
      const params = getQueryParams();
      console.log("Fetching with params:", params); // Debug log
      if (!params) return Promise.resolve(null);
      return getTrialBalance(params);
    },
    enabled:
      isInitialized &&
      !!filters.dateRange?.[0] &&
      !!filters.dateRange?.[1] &&
      !!(selectedProperty?.id || selectedKitchen?.id),
    refetchOnWindowFocus: false,
  });

  const trialBalanceData = trialBalanceResponse?.data;
  const trialBalance = trialBalanceData?.trialBalance || [];
  const totals = trialBalanceData?.totals || {};
  const isBalanced = trialBalanceData?.isBalanced;

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({...prev, [key]: value}));
  };

  // Temporary export handler
  const handleExport = (format) => {
    message.info(`${format} export coming soon...`);
  };

  const handleProfitAndLossClick = () => {
    navigate(`/accounting/profit-loss/${entityType}`);
  };

  const handleBalanceSheetClick = () => {
    navigate(`/accounting/balance-sheet/${entityType}`);
  };

  const downloadMenu = (
    <Menu>
      <Menu.Item
        key="excel"
        icon={<FileExcelOutlined style={{color: "#52c41a"}} />}
        onClick={() => handleExport("excel")}
      >
        Export as Excel
      </Menu.Item>
      <Menu.Item
        key="pdf"
        icon={<FilePdfOutlined style={{color: "#ff4d4f"}} />}
        onClick={() => handleExport("pdf")}
      >
        Export as PDF
      </Menu.Item>
    </Menu>
  );

  // Columns with simplified number handling
  const columns = [
    {
      title: "Account Name",
      dataIndex: "accountName",
      key: "accountName",
      fixed: "left",
      width: 280,
      render: (text, record) => (
        <Space direction="vertical" size={0} style={{width: "100%"}}>
          <Space align="center">
            {record.accountType === "Asset" && (
              <BankOutlined style={{color: "#1890ff"}} />
            )}
            {record.accountType === "Liability" && (
              <ShoppingOutlined style={{color: "#fa8c16"}} />
            )}
            {record.accountType === "Equity" && (
              <DollarOutlined style={{color: "#722ed1"}} />
            )}
            {record.accountType === "Income" && (
              <ReconciliationOutlined style={{color: "#52c41a"}} />
            )}
            {record.accountType === "Expense" && (
              <CloseCircleOutlined style={{color: "#f5222d"}} />
            )}
            <Text strong>{text}</Text>
          </Space>
          <Tag color="default" style={{marginLeft: 22, fontSize: 11}}>
            {record.accountType}
          </Tag>
        </Space>
      ),
    },
    {
      title: "Opening Debit",
      dataIndex: "openingDebit",
      key: "openingDebit",
      width: 130,
      align: "right",
      render: (value) => (
        <Text
          style={{
            color: value > 0 ? "#f5222d" : "#8c8c8c",
            fontWeight: value > 0 ? 500 : 400,
          }}
        >
          {value > 0
            ? `₹ ${value.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`
            : "-"}
        </Text>
      ),
    },
    {
      title: "Opening Credit",
      dataIndex: "openingCredit",
      key: "openingCredit",
      width: 130,
      align: "right",
      render: (value) => (
        <Text
          style={{
            color: value > 0 ? "#52c41a" : "#8c8c8c",
            fontWeight: value > 0 ? 500 : 400,
          }}
        >
          {value > 0
            ? `₹ ${value.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`
            : "-"}
        </Text>
      ),
    },
    {
      title: "Period Debit",
      dataIndex: "periodDebit",
      key: "periodDebit",
      width: 130,
      align: "right",
      render: (value) => (
        <Text
          style={{
            color: value > 0 ? "#f5222d" : "#8c8c8c",
            fontWeight: value > 0 ? 500 : 400,
          }}
        >
          {value > 0
            ? `₹ ${value.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`
            : "-"}
        </Text>
      ),
    },
    {
      title: "Period Credit",
      dataIndex: "periodCredit",
      key: "periodCredit",
      width: 130,
      align: "right",
      render: (value) => (
        <Text
          style={{
            color: value > 0 ? "#52c41a" : "#8c8c8c",
            fontWeight: value > 0 ? 500 : 400,
          }}
        >
          {value > 0
            ? `₹ ${value.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`
            : "-"}
        </Text>
      ),
    },
    {
      title: "Closing Debit",
      dataIndex: "closingDebit",
      key: "closingDebit",
      width: 130,
      align: "right",
      render: (value) => (
        <Text
          strong
          style={{
            color: value > 0 ? "#f5222d" : "#8c8c8c",
          }}
        >
          {value > 0
            ? `₹ ${value.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`
            : "-"}
        </Text>
      ),
    },
    {
      title: "Closing Credit",
      dataIndex: "closingCredit",
      key: "closingCredit",
      width: 130,
      align: "right",
      render: (value) => (
        <Text
          strong
          style={{
            color: value > 0 ? "#52c41a" : "#8c8c8c",
          }}
        >
          {value > 0
            ? `₹ ${value.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`
            : "-"}
        </Text>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 px-4 pt-4 pb-8 xl:px-12 lg:px-6">
      <PageHeader
        title="Trial Balance"
        subtitle="Verify Debits Equal Credits"
      />
      <Card
        style={{
          borderRadius: "12px",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
          marginBottom: "24px",
        }}
        bodyStyle={{padding: "12px 16px"}}
      >
        <Row gutter={[16, 16]} align="middle" justify="space-between">
          {/* Left Side - Navigation Tabs */}
          <Col xs={24} md={12} lg={10}>
            <Tabs
              activeKey={activeTab}
              onChange={(key) => {
                setActiveTab(key);
                if (key === "profit-loss") handleProfitAndLossClick();
                if (key === "balance-sheet") handleBalanceSheetClick();
              }}
              items={[
                {
                  key: "trial-balance",
                  label: (
                    <Space>
                      <TableOutlined />
                      <span>Trial Balance</span>
                    </Space>
                  ),
                },
                {
                  key: "profit-loss",
                  label: (
                    <Space>
                      <BarChartOutlined />
                      <span>Profit & Loss</span>
                    </Space>
                  ),
                },
                {
                  key: "balance-sheet",
                  label: (
                    <Space>
                      <PieChartOutlined />
                      <span>Balance Sheet</span>
                    </Space>
                  ),
                },
              ]}
              tabBarStyle={{
                marginBottom: 0,
                background: "transparent",
              }}
              size="middle"
            />
          </Col>

          {/* Right Side - Filters */}
          <Col xs={24} md={12} lg={14}>
            <Row gutter={[8, 8]} justify="end">
              {/* Zero Balance Button - Only for Trial Balance */}
              {activeTab === "trial-balance" && (
                <Col xs={24} sm={8} md={7} lg={6}>
                  <Button
                    type={filters.includeZero ? "primary" : "default"}
                    icon={<DollarOutlined />}
                    onClick={() =>
                      handleFilterChange("includeZero", !filters.includeZero)
                    }
                    style={{
                      backgroundColor: filters.includeZero
                        ? "#059669"
                        : undefined,
                      borderColor: filters.includeZero ? "#059669" : undefined,
                      color: filters.includeZero ? "white" : undefined,
                      width: "100%",
                    }}
                    size="middle"
                  >
                    {screens.md &&
                      (filters.includeZero ? "Hide Zero" : "Show Zero")}
                  </Button>
                </Col>
              )}

              {/* Date Picker - Shows RangePicker for TB/P&L, DatePicker for Balance Sheet */}
              <Col xs={16} sm={12} md={10} lg={8}>
                {activeTab === "balance-sheet" ? (
                  <DatePicker
                    style={{width: "100%"}}
                    value={
                      filters.dateRange?.[1]
                        ? dayjs(filters.dateRange[1])
                        : null
                    }
                    onChange={(date) => {
                      if (date) {
                        handleFilterChange("dateRange", [
                          date.startOf("day").toISOString(),
                          date.endOf("day").toISOString(),
                        ]);
                      } else {
                        handleFilterChange("dateRange", null);
                      }
                    }}
                    placeholder="As on Date"
                    allowClear
                    size="middle"
                    format="DD/MM/YYYY"
                  />
                ) : (
                  <RangePicker
                    style={{width: "100%"}}
                    value={
                      filters.dateRange
                        ? [
                            dayjs(filters.dateRange[0]),
                            dayjs(filters.dateRange[1]),
                          ]
                        : null
                    }
                    onChange={(dates) => {
                      if (dates && dates.length === 2) {
                        const [start, end] = dates;
                        handleFilterChange("dateRange", [
                          start.startOf("day").toISOString(),
                          end.endOf("day").toISOString(),
                        ]);
                      } else {
                        handleFilterChange("dateRange", null);
                      }
                    }}
                    allowClear
                    size="middle"
                    format="DD/MM/YYYY"
                  />
                )}
              </Col>

              {/* Download Button */}
              <Col xs={8} sm={4} md={4} lg={3}>
                <Dropdown overlay={downloadMenu} trigger={["hover"]}>
                  <Button
                    icon={<DownloadOutlined />}
                    type="primary"
                    style={{
                      backgroundColor: "#059669",
                      borderColor: "#059669",
                      borderRadius: "8px",
                      width: "100%",
                    }}
                    size="middle"
                  >
                    {screens.md && "Export"}
                  </Button>
                </Dropdown>
              </Col>
            </Row>
          </Col>
        </Row>
      </Card>

      {/* Status Banner */}
      <Card
        style={{
          borderRadius: "12px",
          marginBottom: "24px",
          background: isBalanced ? "#f6ffed" : "#fff2f0",
          border: isBalanced ? "1px solid #b7eb8f" : "1px solid #ffccc7",
        }}
      >
        <Row align="middle" justify="space-between">
          <Col>
            <Space size="middle">
              {isBalanced ? (
                <CheckCircleOutlined style={{fontSize: 20, color: "#52c41a"}} />
              ) : (
                <CloseCircleOutlined style={{fontSize: 20, color: "#f5222d"}} />
              )}
              <Text type="secondary">
                Total Debits: ₹{" "}
                {totals.closingDebit?.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{" "}
                | Total Credits: ₹{" "}
                {totals.closingCredit?.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </Text>
            </Space>
          </Col>
          <Col>
            <Text
              strong
              style={{
                color: isBalanced ? "#389e0d" : "#cf1322",
                fontSize: 16,
              }}
            >
              {isBalanced ? "✓" : "✗"} Trial Balance is{" "}
              {isBalanced ? "Balanced" : "Not Balanced"}
            </Text>
          </Col>
        </Row>
      </Card>

      {/* Trial Balance Table */}
      <Card
        style={{
          borderRadius: "12px",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
        }}
        bodyStyle={{padding: 0}}
      >
        <Table
          columns={columns}
          dataSource={trialBalance}
          loading={isLoading}
          rowKey="accountId"
          bordered
          size="middle"
          scroll={{x: 1200}}
          pagination={false}
          footer={() => (
            <div style={{padding: "12px 16px", background: "#fafafa"}}>
              <Row justify="space-between" align="middle">
                <Col>
                  <Text strong style={{fontSize: 14}}>
                    GRAND TOTAL
                  </Text>
                </Col>
                <Col>
                  <Space size="large" wrap>
                    <Text>
                      Opening Dr:{" "}
                      <Text strong style={{color: "#f5222d"}}>
                        ₹{" "}
                        {totals.openingDebit?.toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                        })}
                      </Text>
                    </Text>
                    <Text>
                      Opening Cr:{" "}
                      <Text strong style={{color: "#52c41a"}}>
                        ₹{" "}
                        {totals.openingCredit?.toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                        })}
                      </Text>
                    </Text>
                    <Divider type="vertical" />
                    <Text>
                      Period Dr:{" "}
                      <Text strong style={{color: "#f5222d"}}>
                        ₹{" "}
                        {totals.periodDebit?.toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                        })}
                      </Text>
                    </Text>
                    <Text>
                      Period Cr:{" "}
                      <Text strong style={{color: "#52c41a"}}>
                        ₹{" "}
                        {totals.periodCredit?.toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                        })}
                      </Text>
                    </Text>
                    <Divider type="vertical" />
                    <Text>
                      Closing Dr:{" "}
                      <Text strong style={{color: "#f5222d"}}>
                        ₹{" "}
                        {totals.closingDebit?.toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                        })}
                      </Text>
                    </Text>
                    <Text>
                      Closing Cr:{" "}
                      <Text strong style={{color: "#52c41a"}}>
                        ₹{" "}
                        {totals.closingCredit?.toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                        })}
                      </Text>
                    </Text>
                  </Space>
                </Col>
              </Row>
              <Divider style={{margin: "12px 0 8px 0"}} />
              <Row justify="center">
                <Text
                  strong
                  style={{
                    color:
                      totals.closingDebit === totals.closingCredit
                        ? "#52c41a"
                        : "#f5222d",
                    fontSize: 14,
                  }}
                >
                  Difference: ₹{" "}
                  {Math.abs(
                    (totals.closingDebit || 0) - (totals.closingCredit || 0),
                  ).toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </Text>
              </Row>
            </div>
          )}
        />
      </Card>

      {/* Additional Info */}
      <Row gutter={16} style={{marginTop: 24}}>
        <Col span={24}>
          <Card size="small" style={{background: "#fafafa"}}>
            <Space wrap size="large">
              <Text type="secondary">
                <Badge status="processing" /> Opening balances include all
                transactions before the selected period
              </Text>
              <Text type="secondary">
                <Badge status="success" /> Period movements include all
                transactions within the selected date range
              </Text>
              <Text type="secondary">
                <Badge status="warning" /> Closing balances are calculated as
                Opening + Period Movement
              </Text>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default TrialBalance;
