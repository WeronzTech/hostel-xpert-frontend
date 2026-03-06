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
import {useQuery} from "@tanstack/react-query";
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
} from "../../hooks/accounts/useAccounts";
import {PageHeader} from "../../components";
import TrialBalanceTab from "../../components/accounts/TrialBalanceTab";
import BalanceSheetTab from "../../components/accounts/BalanceSheetTab";
import ProfitLossTab from "../../components/accounts/ProfitLossTab";

const {RangePicker} = DatePicker;
const {useBreakpoint} = Grid;

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

  // Export handlers
  const handleExport = (format) => {
    message.info(`${format} export coming soon...`);
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
        bodyStyle={{padding: "0 16px"}}
      >
        <Row align="middle" justify="space-between">
          {/* Left Side - Tabs */}
          <Col xs={24} md={12} lg={10}>
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
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
            <Row gutter={[8, 8]} justify="end" align="middle">
              {/* Zero Balance Button (only for Trial Balance) */}
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

              {/* Date Picker/Date Range */}
              <Col
                xs={activeTab === "trial-balance" ? 16 : 18}
                sm={activeTab === "trial-balance" ? 12 : 14}
                md={10}
                lg={8}
              >
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
              <Col xs={6} sm={4} md={4} lg={3}>
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
