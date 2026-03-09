// import {useState, useEffect} from "react";
// import {
//   Row,
//   Col,
//   Card,
//   DatePicker,
//   Space,
//   Button,
//   Menu,
//   Dropdown,
//   message,
//   Grid,
//   Tabs,
// } from "antd";
// import {useQuery} from "@tanstack/react-query";
// import {useSelector} from "react-redux";
// import dayjs from "dayjs";
// import {
//   DownloadOutlined,
//   FileExcelOutlined,
//   FilePdfOutlined,
//   DollarOutlined,
//   TableOutlined,
//   BarChartOutlined,
//   PieChartOutlined,
// } from "@ant-design/icons";
// import {useParams} from "react-router-dom";
// import usePersistentState from "../../hooks/usePersistentState";
// import {
//   getBalanceSheet,
//   getProfitAndLoss,
//   getTrialBalance,
// } from "../../hooks/accounts/useAccounts";
// import {PageHeader} from "../../components";
// import TrialBalanceTab from "../../components/accounts/TrialBalanceTab";
// import BalanceSheetTab from "../../components/accounts/BalanceSheetTab";
// import ProfitLossTab from "../../components/accounts/ProfitLossTab";

// const {RangePicker} = DatePicker;
// const {useBreakpoint} = Grid;

// // Disable future dates function
// const disabledFutureDate = (current) => {
//   return current && current > dayjs().endOf("day");
// };

// const FinancialReports = () => {
//   const {selectedProperty} = useSelector((state) => state.properties);
//   const {selectedKitchen} = useSelector((state) => state.kitchens);
//   const {entityType} = useParams();
//   const screens = useBreakpoint();

//   // State for active tab
//   const [activeTab, setActiveTab] = useState("trial-balance");

//   // Use persistent state for filters (shared across all tabs)
//   const [filters, setFilters] = usePersistentState("financialReportsFilters", {
//     dateRange: [
//       dayjs().startOf("month").toISOString(),
//       dayjs().endOf("day").toISOString(),
//     ],
//     entityId: null,
//     entityType: entityType || "",
//     includeZero: false,
//   });

//   const [isInitialized, setIsInitialized] = useState(false);

//   useEffect(() => {
//     if (filters) {
//       setIsInitialized(true);
//     }
//   }, [filters]);

//   const getQueryParams = () => {
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

//   // Fetch all data in parent
//   const {data: trialBalanceResponse, isLoading: tbLoading} = useQuery({
//     queryKey: [
//       "trialBalance",
//       {...getQueryParams(), includeZero: filters.includeZero},
//     ],
//     queryFn: () => {
//       const params = getQueryParams();
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

//   const {data: pnlResponse, isLoading: pnlLoading} = useQuery({
//     queryKey: ["profitAndLoss", getQueryParams()],
//     queryFn: () => {
//       const params = getQueryParams();
//       if (!params) return Promise.resolve(null);
//       return getProfitAndLoss(params);
//     },
//     enabled:
//       isInitialized &&
//       !!filters.dateRange?.[0] &&
//       !!filters.dateRange?.[1] &&
//       !!(selectedProperty?.id || selectedKitchen?.id),
//     refetchOnWindowFocus: false,
//   });

//   const {data: bsResponse, isLoading: bsLoading} = useQuery({
//     queryKey: ["balanceSheet", getQueryParams()],
//     queryFn: () => {
//       const params = getQueryParams();
//       if (!params) return Promise.resolve(null);
//       return getBalanceSheet(params);
//     },
//     enabled:
//       isInitialized &&
//       !!filters.dateRange?.[0] &&
//       !!(selectedProperty?.id || selectedKitchen?.id),
//     refetchOnWindowFocus: false,
//   });

//   const handleFilterChange = (key, value) => {
//     setFilters((prev) => ({...prev, [key]: value}));
//   };

//   // Export handlers
//   const handleExport = (format) => {
//     message.info(`${format} export coming soon...`);
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

//   // Responsive column adjustments
//   const isMobile = !screens.md;

//   return (
//     <div className="min-h-screen bg-gray-50 px-4 pt-4 pb-8 xl:px-12 lg:px-6">
//       <PageHeader
//         title="Financial Reports"
//         subtitle="Trial Balance, Profit & Loss, and Balance Sheet"
//       />

//       {/* Single Card with Tabs and Filters */}
//       <Card
//         style={{
//           borderRadius: "12px",
//           boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
//           marginBottom: "24px",
//         }}
//         bodyStyle={{padding: isMobile ? "12px" : "0 16px"}}
//       >
//         <Row
//           gutter={[16, 16]}
//           align={isMobile ? "stretch" : "middle"}
//           justify="space-between"
//           style={{flexDirection: isMobile ? "column" : "row"}}
//         >
//           {/* Left Side - Tabs - Full width on mobile */}
//           <Col
//             xs={24}
//             md={12}
//             lg={10}
//             style={{width: isMobile ? "100%" : "auto"}}
//           >
//             <Tabs
//               activeKey={activeTab}
//               onChange={setActiveTab}
//               items={[
//                 {
//                   key: "trial-balance",
//                   label: (
//                     <Space>
//                       <TableOutlined />
//                       <span>{isMobile ? "TB" : "Trial Balance"}</span>
//                     </Space>
//                   ),
//                 },
//                 {
//                   key: "profit-loss",
//                   label: (
//                     <Space>
//                       <BarChartOutlined />
//                       <span>{isMobile ? "P&L" : "Profit & Loss"}</span>
//                     </Space>
//                   ),
//                 },
//                 {
//                   key: "balance-sheet",
//                   label: (
//                     <Space>
//                       <PieChartOutlined />
//                       <span>{isMobile ? "BS" : "Balance Sheet"}</span>
//                     </Space>
//                   ),
//                 },
//               ]}
//               tabBarStyle={{
//                 marginBottom: 0,
//                 background: "transparent",
//               }}
//               size={isMobile ? "small" : "middle"}
//               centered={isMobile}
//             />
//           </Col>

//           {/* Right Side - Filters - Stack vertically on mobile */}
//           <Col
//             xs={24}
//             md={12}
//             lg={14}
//             style={{width: isMobile ? "100%" : "auto"}}
//           >
//             <Row
//               gutter={[8, 8]}
//               justify={isMobile ? "start" : "end"}
//               align="middle"
//               style={{flexDirection: isMobile ? "column" : "row"}}
//             >
//               {/* Zero Balance Button (only for Trial Balance) */}
//               {activeTab === "trial-balance" && (
//                 <Col
//                   xs={24}
//                   sm={8}
//                   md={7}
//                   lg={6}
//                   style={{width: isMobile ? "100%" : "auto"}}
//                 >
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
//                     size={isMobile ? "middle" : "middle"}
//                     block={isMobile}
//                   >
//                     {isMobile
//                       ? filters.includeZero
//                         ? "Hide Zero"
//                         : "Show Zero"
//                       : filters.includeZero
//                         ? "Hide Zero"
//                         : "Show Zero"}
//                   </Button>
//                 </Col>
//               )}

//               {/* Date Picker/Date Range - Full width on mobile */}
//               <Col
//                 xs={24}
//                 sm={activeTab === "trial-balance" ? 12 : 14}
//                 md={10}
//                 lg={8}
//                 style={{width: isMobile ? "100%" : "auto"}}
//               >
//                 <RangePicker
//                   style={{width: "100%"}}
//                   value={
//                     filters.dateRange
//                       ? [
//                           dayjs(filters.dateRange[0]),
//                           dayjs(filters.dateRange[1]),
//                         ]
//                       : null
//                   }
//                   onChange={(dates) => {
//                     if (dates && dates.length === 2) {
//                       const [start, end] = dates;
//                       handleFilterChange("dateRange", [
//                         start.startOf("day").toISOString(),
//                         end.endOf("day").toISOString(),
//                       ]);
//                     } else {
//                       handleFilterChange("dateRange", null);
//                     }
//                   }}
//                   disabledDate={disabledFutureDate}
//                   allowClear
//                   size={isMobile ? "middle" : "middle"}
//                   format="DD/MM/YYYY"
//                   placeholder={isMobile ? ["From", "To"] : ["From", "To"]}
//                   separator={isMobile ? "-" : "~"}
//                 />
//               </Col>

//               {/* Download Button - Full width on mobile */}
//               <Col
//                 xs={24}
//                 sm={4}
//                 md={4}
//                 lg={3}
//                 style={{width: isMobile ? "100%" : "auto"}}
//               >
//                 <Dropdown
//                   overlay={downloadMenu}
//                   trigger={["hover"]}
//                   placement={isMobile ? "bottomCenter" : "bottomRight"}
//                 >
//                   <Button
//                     icon={<DownloadOutlined />}
//                     type="primary"
//                     style={{
//                       backgroundColor: "#059669",
//                       borderColor: "#059669",
//                       borderRadius: "8px",
//                       width: "100%",
//                     }}
//                     size={isMobile ? "middle" : "middle"}
//                     block={isMobile}
//                   >
//                     {!isMobile && "Export"}
//                   </Button>
//                 </Dropdown>
//               </Col>
//             </Row>
//           </Col>
//         </Row>
//       </Card>

//       {/* Tab Content - Pass data and loading states to child components */}
//       {activeTab === "trial-balance" && (
//         <TrialBalanceTab
//           data={trialBalanceResponse?.data}
//           loading={tbLoading}
//         />
//       )}

//       {activeTab === "profit-loss" && (
//         <ProfitLossTab data={pnlResponse?.data} loading={pnlLoading} />
//       )}

//       {activeTab === "balance-sheet" && (
//         <BalanceSheetTab data={bsResponse?.data} loading={bsLoading} />
//       )}
//     </div>
//   );
// };

// export default FinancialReports;
import {useState, useEffect} from "react";
import {
  Row,
  Col,
  Card,
  DatePicker,
  Space,
  Button,
  Menu,
  Dropdown,
  message,
  Grid,
  Tabs,
} from "antd";
import {useQuery, useMutation} from "@tanstack/react-query"; // Add useMutation
import {useSelector} from "react-redux";
import dayjs from "dayjs";
import {
  DownloadOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
  DollarOutlined,
  TableOutlined,
  BarChartOutlined,
  PieChartOutlined,
} from "@ant-design/icons";
import {useParams} from "react-router-dom";
import usePersistentState from "../../hooks/usePersistentState";
import {
  getBalanceSheet,
  getProfitAndLoss,
  getTrialBalance,
  exportTrialBalance,
  exportProfitAndLoss,
  exportBalanceSheet,
} from "../../hooks/accounts/useAccounts";
import {PageHeader} from "../../components";
import TrialBalanceTab from "../../components/accounts/TrialBalanceTab";
import BalanceSheetTab from "../../components/accounts/BalanceSheetTab";
import ProfitLossTab from "../../components/accounts/ProfitLossTab";

const {RangePicker} = DatePicker;
const {useBreakpoint} = Grid;

// Disable future dates function
const disabledFutureDate = (current) => {
  return current && current > dayjs().endOf("day");
};

const FinancialReports = () => {
  const {selectedProperty} = useSelector((state) => state.properties);
  const {selectedKitchen} = useSelector((state) => state.kitchens);
  const {entityType} = useParams();
  const screens = useBreakpoint();

  // State for active tab
  const [activeTab, setActiveTab] = useState("trial-balance");

  // Use persistent state for filters (shared across all tabs)
  const [filters, setFilters] = usePersistentState("financialReportsFilters", {
    dateRange: [
      dayjs().startOf("month").toISOString(),
      dayjs().endOf("day").toISOString(),
    ],
    entityId: null,
    entityType: entityType || "",
    includeZero: false,
  });

  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (filters) {
      setIsInitialized(true);
    }
  }, [filters]);

  const getQueryParams = () => {
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

  // Fetch all data in parent
  const {data: trialBalanceResponse, isLoading: tbLoading} = useQuery({
    queryKey: [
      "trialBalance",
      {...getQueryParams(), includeZero: filters.includeZero},
    ],
    queryFn: () => {
      const params = getQueryParams();
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

  const {data: pnlResponse, isLoading: pnlLoading} = useQuery({
    queryKey: ["profitAndLoss", getQueryParams()],
    queryFn: () => {
      const params = getQueryParams();
      if (!params) return Promise.resolve(null);
      return getProfitAndLoss(params);
    },
    enabled:
      isInitialized &&
      !!filters.dateRange?.[0] &&
      !!filters.dateRange?.[1] &&
      !!(selectedProperty?.id || selectedKitchen?.id),
    refetchOnWindowFocus: false,
  });

  const {data: bsResponse, isLoading: bsLoading} = useQuery({
    queryKey: ["balanceSheet", getQueryParams()],
    queryFn: () => {
      const params = getQueryParams();
      if (!params) return Promise.resolve(null);
      return getBalanceSheet(params);
    },
    enabled:
      isInitialized &&
      !!filters.dateRange?.[0] &&
      !!(selectedProperty?.id || selectedKitchen?.id),
    refetchOnWindowFocus: false,
  });

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({...prev, [key]: value}));
  };

  // ========== EXPORT MUTATIONS ==========
  const downloadFile = (response, format, reportName) => {
    const blob = new Blob([response.data], {
      type: response.headers["content-type"],
    });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;

    const contentDisposition = response.headers["content-disposition"];
    let filename = `${reportName}-${dayjs().format("YYYYMMDD-HHmmss")}.${format}`;

    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(
        /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/,
      );
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1].replace(/['"]/g, "");
      }
    }

    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  // Trial Balance Export
  const exportTrialBalanceMutation = useMutation({
    mutationFn: ({format, params}) => exportTrialBalance(format, params),
    onMutate: () => {
      message.loading({
        content: "Preparing trial balance export...",
        key: "export",
        duration: 0,
      });
    },
    onSuccess: (response, {format}) => {
      downloadFile(response, format, "trial-balance");
      message.success({
        content: "Trial Balance exported successfully!",
        key: "export",
        duration: 3,
      });
    },
    onError: (error) => {
      console.error("Export error:", error);
      message.error({
        content: error.message || "Failed to export. Please try again.",
        key: "export",
        duration: 3,
      });
    },
  });

  // Profit & Loss Export
  const exportPnLMutation = useMutation({
    mutationFn: ({format, params}) => exportProfitAndLoss(format, params),
    onMutate: () => {
      message.loading({
        content: "Preparing profit & loss export...",
        key: "export",
        duration: 0,
      });
    },
    onSuccess: (response, {format}) => {
      downloadFile(response, format, "profit-loss");
      message.success({
        content: "Profit & Loss exported successfully!",
        key: "export",
        duration: 3,
      });
    },
    onError: (error) => {
      console.error("Export error:", error);
      message.error({
        content: error.message || "Failed to export. Please try again.",
        key: "export",
        duration: 3,
      });
    },
  });

  // Balance Sheet Export
  const exportBalanceSheetMutation = useMutation({
    mutationFn: ({format, params}) => exportBalanceSheet(format, params),
    onMutate: () => {
      message.loading({
        content: "Preparing balance sheet export...",
        key: "export",
        duration: 0,
      });
    },
    onSuccess: (response, {format}) => {
      downloadFile(response, format, "balance-sheet");
      message.success({
        content: "Balance Sheet exported successfully!",
        key: "export",
        duration: 3,
      });
    },
    onError: (error) => {
      console.error("Export error:", error);
      message.error({
        content: error.message || "Failed to export. Please try again.",
        key: "export",
        duration: 3,
      });
    },
  });

  // Main export handler
  const handleExport = (format) => {
    const params = getQueryParams();
    if (!params) {
      message.warning("Please select a date range");
      return;
    }

    // Check if data exists for the current tab
    if (activeTab === "trial-balance") {
      if (!trialBalanceResponse?.data?.trialBalance?.length) {
        message.warning("No trial balance data to export");
        return;
      }
      exportTrialBalanceMutation.mutate({format, params});
    } else if (activeTab === "profit-loss") {
      if (
        !pnlResponse?.data?.income?.length &&
        !pnlResponse?.data?.expense?.length
      ) {
        message.warning("No profit & loss data to export");
        return;
      }
      exportPnLMutation.mutate({format, params});
    } else if (activeTab === "balance-sheet") {
      if (
        !bsResponse?.data?.assets?.length &&
        !bsResponse?.data?.liabilities?.length &&
        !bsResponse?.data?.equity?.length
      ) {
        message.warning("No balance sheet data to export");
        return;
      }
      exportBalanceSheetMutation.mutate({format, params});
    }
  };

  // Dynamic download menu based on active tab
  const getDownloadMenu = () => {
    const getLoadingState = () => {
      if (activeTab === "trial-balance")
        return exportTrialBalanceMutation.isLoading;
      if (activeTab === "profit-loss") return exportPnLMutation.isLoading;
      return exportBalanceSheetMutation.isLoading;
    };

    return (
      <Menu>
        <Menu.Item
          key="excel"
          icon={<FileExcelOutlined style={{color: "#52c41a"}} />}
          onClick={() => handleExport("excel")}
          disabled={getLoadingState()}
        >
          Export as Excel
        </Menu.Item>
        <Menu.Item
          key="pdf"
          icon={<FilePdfOutlined style={{color: "#ff4d4f"}} />}
          onClick={() => handleExport("pdf")}
          disabled={getLoadingState()}
        >
          Export as PDF
        </Menu.Item>
      </Menu>
    );
  };

  // Responsive column adjustments
  const isMobile = !screens.md;

  return (
    <div className="min-h-screen bg-gray-50 px-4 pt-4 pb-8 xl:px-12 lg:px-6">
      <PageHeader
        title="Financial Reports"
        subtitle="Trial Balance, Profit & Loss, and Balance Sheet"
      />

      {/* Single Card with Tabs and Filters */}
      <Card
        style={{
          borderRadius: "12px",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
          marginBottom: "24px",
        }}
        bodyStyle={{padding: isMobile ? "12px" : "0 16px"}}
      >
        <Row
          gutter={[16, 16]}
          align={isMobile ? "stretch" : "middle"}
          justify="space-between"
          style={{flexDirection: isMobile ? "column" : "row"}}
        >
          {/* Left Side - Tabs - Full width on mobile */}
          <Col
            xs={24}
            md={12}
            lg={10}
            style={{width: isMobile ? "100%" : "auto"}}
          >
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              items={[
                {
                  key: "trial-balance",
                  label: (
                    <Space>
                      <TableOutlined />
                      <span>{isMobile ? "TB" : "Trial Balance"}</span>
                    </Space>
                  ),
                },
                {
                  key: "profit-loss",
                  label: (
                    <Space>
                      <BarChartOutlined />
                      <span>{isMobile ? "P&L" : "Profit & Loss"}</span>
                    </Space>
                  ),
                },
                {
                  key: "balance-sheet",
                  label: (
                    <Space>
                      <PieChartOutlined />
                      <span>{isMobile ? "BS" : "Balance Sheet"}</span>
                    </Space>
                  ),
                },
              ]}
              tabBarStyle={{
                marginBottom: 0,
                background: "transparent",
              }}
              size={isMobile ? "small" : "middle"}
              centered={isMobile}
            />
          </Col>

          {/* Right Side - Filters - Stack vertically on mobile */}
          <Col
            xs={24}
            md={12}
            lg={14}
            style={{width: isMobile ? "100%" : "auto"}}
          >
            <Row
              gutter={[8, 8]}
              justify={isMobile ? "start" : "end"}
              align="middle"
              style={{flexDirection: isMobile ? "column" : "row"}}
            >
              {/* Zero Balance Button (only for Trial Balance) */}
              {activeTab === "trial-balance" && (
                <Col
                  xs={24}
                  sm={8}
                  md={7}
                  lg={6}
                  style={{width: isMobile ? "100%" : "auto"}}
                >
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
                    size={isMobile ? "middle" : "middle"}
                    block={isMobile}
                  >
                    {isMobile
                      ? filters.includeZero
                        ? "Hide Zero"
                        : "Show Zero"
                      : filters.includeZero
                        ? "Hide Zero"
                        : "Show Zero"}
                  </Button>
                </Col>
              )}

              {/* Date Picker/Date Range - Full width on mobile */}
              <Col
                xs={24}
                sm={activeTab === "trial-balance" ? 12 : 14}
                md={10}
                lg={8}
                style={{width: isMobile ? "100%" : "auto"}}
              >
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
                  disabledDate={disabledFutureDate}
                  allowClear
                  size={isMobile ? "middle" : "middle"}
                  format="DD/MM/YYYY"
                  placeholder={isMobile ? ["From", "To"] : ["From", "To"]}
                  separator={isMobile ? "-" : "~"}
                />
              </Col>

              {/* Download Button - Full width on mobile */}
              <Col
                xs={24}
                sm={4}
                md={4}
                lg={3}
                style={{width: isMobile ? "100%" : "auto"}}
              >
                <Dropdown
                  overlay={getDownloadMenu()}
                  trigger={["hover"]}
                  placement={isMobile ? "bottomCenter" : "bottomRight"}
                >
                  <Button
                    icon={<DownloadOutlined />}
                    type="primary"
                    style={{
                      backgroundColor: "#059669",
                      borderColor: "#059669",
                      borderRadius: "8px",
                      width: "100%",
                    }}
                    size={isMobile ? "middle" : "middle"}
                    block={isMobile}
                    loading={
                      (activeTab === "trial-balance" &&
                        exportTrialBalanceMutation.isLoading) ||
                      (activeTab === "profit-loss" &&
                        exportPnLMutation.isLoading) ||
                      (activeTab === "balance-sheet" &&
                        exportBalanceSheetMutation.isLoading)
                    }
                  >
                    {!isMobile && "Export"}
                  </Button>
                </Dropdown>
              </Col>
            </Row>
          </Col>
        </Row>
      </Card>

      {/* Tab Content - Pass data and loading states to child components */}
      {activeTab === "trial-balance" && (
        <TrialBalanceTab
          data={trialBalanceResponse?.data}
          loading={tbLoading}
        />
      )}

      {activeTab === "profit-loss" && (
        <ProfitLossTab data={pnlResponse?.data} loading={pnlLoading} />
      )}

      {activeTab === "balance-sheet" && (
        <BalanceSheetTab data={bsResponse?.data} loading={bsLoading} />
      )}
    </div>
  );
};

export default FinancialReports;
