import {useState, useEffect} from "react";
import {
  Row,
  Col,
  Card,
  DatePicker,
  Space,
  Typography,
  Table,
  Badge,
  Button,
  Menu,
  Dropdown,
  message,
  Progress,
  Statistic,
  Grid,
} from "antd";
import {useQuery} from "@tanstack/react-query";
import {useSelector} from "react-redux";
import {PageHeader} from "../../components";
import {getProfitAndLoss} from "../../hooks/accounts/useAccounts";
import dayjs from "dayjs";
import usePersistentState from "../../hooks/usePersistentState";
import {
  DownloadOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
  RiseOutlined,
  FallOutlined,
  ReconciliationOutlined,
} from "@ant-design/icons";
import {useParams} from "react-router-dom";

const {RangePicker} = DatePicker;
const {Text, Title} = Typography;
const {useBreakpoint} = Grid;

const ProfitAndLoss = () => {
  const {selectedProperty} = useSelector((state) => state.properties);
  const {selectedKitchen} = useSelector((state) => state.kitchens);
  const {entityType} = useParams();
  const screens = useBreakpoint();

  // Use persistent state for filters
  const [filters, setFilters] = usePersistentState("pnlFilters", {
    dateRange: [
      dayjs().startOf("month").toISOString(),
      dayjs().endOf("day").toISOString(),
    ],
    entityId: null,
    entityType: entityType || "",
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
    };
  };

  // Fetch P&L data
  const {data: pnlResponse, isLoading} = useQuery({
    queryKey: [
      "profitAndLoss",
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
      },
    ],
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

  const pnlData = pnlResponse?.data;
  const income = pnlData?.income || [];
  const expense = pnlData?.expense || [];
  const totals = pnlData?.totals || {};
  const isProfit = pnlData?.isProfit;

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

  // Income Columns
  const incomeColumns = [
    {
      title: "Income Account",
      dataIndex: "accountName",
      key: "accountName",
      render: (text) => (
        <Space>
          <ReconciliationOutlined style={{color: "#52c41a"}} />
          <Text>{text}</Text>
        </Space>
      ),
    },
    {
      title: "Amount (₹)",
      dataIndex: "amount",
      key: "amount",
      align: "right",
      width: 200,
      render: (value) => (
        <Text strong style={{color: "#52c41a"}}>
          ₹ {value.toLocaleString("en-IN", {minimumFractionDigits: 2})}
        </Text>
      ),
    },
  ];

  // Expense Columns
  const expenseColumns = [
    {
      title: "Expense Account",
      dataIndex: "accountName",
      key: "accountName",
      render: (text) => (
        <Space>
          <FallOutlined style={{color: "#f5222d"}} />
          <Text>{text}</Text>
        </Space>
      ),
    },
    {
      title: "Amount (₹)",
      dataIndex: "amount",
      key: "amount",
      align: "right",
      width: 200,
      render: (value) => (
        <Text strong style={{color: "#f5222d"}}>
          ₹ {value.toLocaleString("en-IN", {minimumFractionDigits: 2})}
        </Text>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 px-4 pt-4 pb-8 xl:px-12 lg:px-6">
      <PageHeader
        title="Profit & Loss Statement"
        subtitle="Income and Expense Summary"
      />

      {/* Filters Section */}
      <Card
        style={{
          borderRadius: "12px",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
          marginBottom: "24px",
        }}
      >
        <Row gutter={[16, 16]} align="middle" justify="end">
          <Col xs={24} md={18} lg={12}>
            <Space style={{width: "100%"}} direction="horizontal">
              <RangePicker
                style={{width: "100%"}}
                value={
                  filters.dateRange
                    ? [dayjs(filters.dateRange[0]), dayjs(filters.dateRange[1])]
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

              <Dropdown overlay={downloadMenu} trigger={["hover"]}>
                <Button
                  icon={<DownloadOutlined />}
                  type="primary"
                  style={{
                    backgroundColor: "#059669",
                    borderColor: "#059669",
                    borderRadius: "8px",
                  }}
                >
                  {screens.md && "Download"}
                </Button>
              </Dropdown>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Summary Cards */}
      <Row gutter={[16, 16]} style={{marginBottom: 24}}>
        <Col xs={24} sm={8}>
          <Card
            style={{
              borderRadius: "12px",
              background:
                "linear-gradient(135deg, #52c41a20 0%, #52c41a10 100%)",
              border: "1px solid #52c41a30",
            }}
          >
            <Statistic
              title={<Text type="secondary">Total Income</Text>}
              value={totals.totalIncome}
              precision={2}
              valueStyle={{color: "#52c41a", fontSize: 24}}
              prefix="₹"
              suffix={<RiseOutlined style={{fontSize: 20, marginLeft: 8}} />}
            />
          </Card>
        </Col>

        <Col xs={24} sm={8}>
          <Card
            style={{
              borderRadius: "12px",
              background:
                "linear-gradient(135deg, #f5222d20 0%, #f5222d10 100%)",
              border: "1px solid #f5222d30",
            }}
          >
            <Statistic
              title={<Text type="secondary">Total Expenses</Text>}
              value={totals.totalExpense}
              precision={2}
              valueStyle={{color: "#f5222d", fontSize: 24}}
              prefix="₹"
              suffix={<FallOutlined style={{fontSize: 20, marginLeft: 8}} />}
            />
          </Card>
        </Col>

        <Col xs={24} sm={8}>
          <Card
            style={{
              borderRadius: "12px",
              background: isProfit
                ? "linear-gradient(135deg, #52c41a20 0%, #52c41a10 100%)"
                : "linear-gradient(135deg, #f5222d20 0%, #f5222d10 100%)",
              border: isProfit ? "1px solid #52c41a30" : "1px solid #f5222d30",
            }}
          >
            <Statistic
              title={
                <Text type="secondary">Net {isProfit ? "Profit" : "Loss"}</Text>
              }
              value={Math.abs(totals.netProfit)}
              precision={2}
              valueStyle={{
                color: isProfit ? "#52c41a" : "#f5222d",
                fontSize: 24,
              }}
              prefix="₹"
              suffix={
                isProfit ? (
                  <RiseOutlined style={{fontSize: 20, marginLeft: 8}} />
                ) : (
                  <FallOutlined style={{fontSize: 20, marginLeft: 8}} />
                )
              }
            />
          </Card>
        </Col>
      </Row>

      {/* Main Content */}
      <Row gutter={[16, 16]}>
        {/* Income Section */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <ReconciliationOutlined style={{color: "#52c41a"}} />
                <Text strong>Income</Text>
                <Badge
                  count={income.length}
                  style={{backgroundColor: "#52c41a"}}
                />
              </Space>
            }
            style={{
              borderRadius: "12px",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
              height: "100%",
            }}
          >
            <Table
              columns={incomeColumns}
              dataSource={income}
              rowKey="accountId"
              loading={isLoading}
              pagination={false}
              size="middle"
              bordered
              footer={() => (
                <div style={{textAlign: "right", padding: "8px"}}>
                  <Text strong>Total Income: </Text>
                  <Text strong style={{color: "#52c41a", fontSize: 16}}>
                    ₹{" "}
                    {totals.totalIncome?.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                  </Text>
                </div>
              )}
            />
          </Card>
        </Col>

        {/* Expense Section */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <FallOutlined style={{color: "#f5222d"}} />
                <Text strong>Expenses</Text>
                <Badge
                  count={expense.length}
                  style={{backgroundColor: "#f5222d"}}
                />
              </Space>
            }
            style={{
              borderRadius: "12px",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
              height: "100%",
            }}
          >
            <Table
              columns={expenseColumns}
              dataSource={expense}
              rowKey="accountId"
              loading={isLoading}
              pagination={false}
              size="middle"
              bordered
              footer={() => (
                <div style={{textAlign: "right", padding: "8px"}}>
                  <Text strong>Total Expenses: </Text>
                  <Text strong style={{color: "#f5222d", fontSize: 16}}>
                    ₹{" "}
                    {totals.totalExpense?.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                  </Text>
                </div>
              )}
            />
          </Card>
        </Col>
      </Row>

      {/* Bottom Summary */}
      <Row gutter={16} style={{marginTop: 24}}>
        <Col span={24}>
          <Card
            style={{
              borderRadius: "12px",
              background: isProfit ? "#f6ffed" : "#fff2f0",
              border: isProfit ? "1px solid #b7eb8f" : "1px solid #ffccc7",
            }}
          >
            <Row align="middle" justify="space-between">
              <Col>
                <Space size="middle">
                  {isProfit ? (
                    <RiseOutlined style={{fontSize: 24, color: "#52c41a"}} />
                  ) : (
                    <FallOutlined style={{fontSize: 24, color: "#f5222d"}} />
                  )}
                  <div>
                    <Text type="secondary">
                      Net {isProfit ? "Profit" : "Loss"}
                    </Text>
                    <Title
                      level={3}
                      style={{
                        margin: 0,
                        color: isProfit ? "#52c41a" : "#f5222d",
                      }}
                    >
                      ₹{" "}
                      {Math.abs(totals.netProfit || 0).toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </Title>
                  </div>
                </Space>
              </Col>
              <Col>
                <Progress
                  type="circle"
                  percent={Math.round(
                    (totals.totalIncome / (totals.totalExpense || 1)) * 100,
                  )}
                  width={80}
                  strokeColor={isProfit ? "#52c41a" : "#f5222d"}
                  format={() =>
                    `${(((totals.totalIncome - totals.totalExpense) / (totals.totalIncome || 1)) * 100).toFixed(1)}%`
                  }
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ProfitAndLoss;
