import {
  Modal,
  Table,
  Tag,
  Space,
  Card,
  Descriptions,
  Spin,
  Empty,
  Input,
  Select,
  Grid,
  Tooltip,
  Switch,
  Row,
  Col,
} from "antd";
import {useQuery} from "@tanstack/react-query";
import {
  getEmployeeTransactionHistory,
  getEmployeeAdvanceForMonth,
} from "../../hooks/accounts/useAccounts";
import {CalendarOutlined, SearchOutlined} from "@ant-design/icons";
import dayjs from "dayjs";
import {useState, useMemo, useEffect, useRef} from "react";

const {Option} = Select;
const {useBreakpoint} = Grid;

const TransactionHistoryModal = ({visible, payroll, onCancel}) => {
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const [searchText, setSearchText] = useState("");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("all");
  const [tableScrollY, setTableScrollY] = useState(400);
  const [showAdvance, setShowAdvance] = useState(false);
  const [advanceMonth, setAdvanceMonth] = useState(null);
  const [advanceYear, setAdvanceYear] = useState(dayjs().year());

  const contentRef = useRef(null);
  const headerRef = useRef(null);

  // Regular transactions query
  const {
    data: transactionsResponse,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: [
      "transactions",
      payroll?.employeeId,
      payroll?.month,
      payroll?.year,
    ],
    queryFn: () => {
      if (!payroll) return null;

      const filters = {
        month: payroll.month,
        year: payroll.year,
      };

      return getEmployeeTransactionHistory(payroll.employeeId, filters);
    },
    enabled: visible && !!payroll?.employeeId && !showAdvance,
  });

  // Advance transactions query
  const {
    data: advanceResponse,
    isLoading: advanceLoading,
    isFetching: advanceFetching,
  } = useQuery({
    queryKey: [
      "advanceTransactions",
      payroll?.employeeId,
      advanceMonth,
      advanceYear,
    ],
    queryFn: () => {
      if (!payroll) return null;

      const filters = {
        month: advanceMonth,
        year: advanceYear,
      };

      return getEmployeeAdvanceForMonth(payroll.employeeId, filters);
    },
    enabled: visible && !!payroll?.employeeId && showAdvance && !!advanceMonth,
  });

  // Generate month options
  const monthOptions = useMemo(() => {
    return Array.from({length: 12}, (_, i) => ({
      value: i,
      label: dayjs().month(i).format("MMMM"),
    }));
  }, []);

  // Generate year options (current year and previous 2 years)
  const yearOptions = useMemo(() => {
    const currentYear = dayjs().year();
    return [currentYear, currentYear - 1, currentYear - 2];
  }, []);

  // Reset filters when switching modes
  useEffect(() => {
    setSearchText("");
    setPaymentMethodFilter("all");
  }, [showAdvance]);

  // Set default month when switching to advance mode
  useEffect(() => {
    if (showAdvance && !advanceMonth) {
      setAdvanceMonth(payroll?.month || dayjs().month());
    }
  }, [showAdvance, payroll]);

  // dynamic table height
  useEffect(() => {
    if (visible && contentRef.current) {
      const calculateTableHeight = () => {
        const headerHeight = headerRef.current?.offsetHeight || 300;
        const availableHeight = window.innerHeight * 0.7;
        const tableHeight = Math.max(250, availableHeight - headerHeight - 50);
        setTableScrollY(tableHeight);
      };

      calculateTableHeight();
      window.addEventListener("resize", calculateTableHeight);
      return () => window.removeEventListener("resize", calculateTableHeight);
    }
  }, [visible]);

  // Get current data based on mode
  const currentData = showAdvance ? advanceResponse : transactionsResponse;
  const currentLoading = showAdvance ? advanceLoading : isLoading;
  const currentFetching = showAdvance ? advanceFetching : isFetching;

  const transactions = currentData?.data?.transactions || [];

  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const matchesSearch =
        searchText === "" ||
        transaction?.transactionId
          ?.toLowerCase()
          .includes(searchText.toLowerCase()) ||
        transaction?.remarks
          ?.toLowerCase()
          .includes(searchText.toLowerCase()) ||
        transaction?.paidAmount?.toString().includes(searchText);

      const matchesPaymentMethod =
        paymentMethodFilter === "all" ||
        transaction.paymentMethod === paymentMethodFilter;

      return matchesSearch && matchesPaymentMethod;
    });
  }, [transactions, searchText, paymentMethodFilter]);

  const filteredSummary = useMemo(() => {
    const filteredTotal = filteredTransactions.reduce(
      (sum, t) => sum + (t.paidAmount || 0),
      0,
    );

    return {
      totalTransactions: filteredTransactions.length,
      totalPaidAmount: filteredTotal,
    };
  }, [filteredTransactions]);

  const paymentMethods = useMemo(() => {
    const methods = new Set(transactions.map((t) => t.paymentMethod));
    return Array.from(methods);
  }, [transactions]);

  const columns = [
    {
      title: "#",
      key: "serial",
      render: (_, __, index) => index + 1,
      width: 60,
      align: "center",
    },
    {
      title: "Date",
      key: "date",
      render: (_, record) => dayjs(record.paymentDate).format("DD-MM-YYYY"),
      width: 120,
      sorter: (a, b) =>
        dayjs(a.paymentDate).unix() - dayjs(b.paymentDate).unix(),
      defaultSortOrder: "descend",
    },
    {
      title: "Amount",
      key: "amount",
      render: (_, record) => (
        <span
          style={{
            fontWeight: 500,
            color: "#fa8c16",
          }}
        >
          ₹{record.paidAmount?.toLocaleString() || 0}
        </span>
      ),
      width: 120,
      sorter: (a, b) => a.paidAmount - b.paidAmount,
    },
    {
      title: "Payment Method",
      key: "paymentMethod",
      render: (_, record) => <Tag color="blue">{record.paymentMethod}</Tag>,
      width: 160,
    },
    {
      title: "Transaction ID",
      key: "transactionId",
      render: (_, record) => record.transactionId || "-",
      width: 150,
    },
    {
      title: "Remarks",
      key: "remarks",
      render: (_, record) => {
        const remarks = record.remarks || "-";
        const limit = 8;

        const isLong = remarks.length > limit;
        const displayText = isLong ? `${remarks.slice(0, limit)}..` : remarks;

        return (
          <Tooltip title={isLong ? remarks : null} placement="topLeft">
            <span>{displayText}</span>
          </Tooltip>
        );
      },
    },
  ];

  if (!payroll) return null;

  return (
    <Modal
      title={
        <Space>
          <CalendarOutlined style={{color: "#1890ff"}} />
          {showAdvance ? "Advance Transactions" : "Transaction History"} -{" "}
          {payroll.name}
        </Space>
      }
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={isMobile ? "100%" : 800}
      destroyOnClose
      maskClosable={false}
      style={{
        top: isMobile ? 0 : 20,
      }}
      bodyStyle={{
        padding: isMobile ? 16 : 24,
        height: isMobile ? "100vh" : "calc(90vh - 55px)",
        overflow: "hidden",
      }}
    >
      <div
        ref={contentRef}
        style={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div ref={headerRef}>
          {/* Payroll Info */}
          <Card size="small" style={{marginBottom: 20, background: "#f5f5f5"}}>
            <Descriptions
              size="small"
              layout="horizontal"
              column={{
                xs: 1,
                sm: 2,
                md: 2,
                lg: 3,
                xl: 4,
              }}
            >
              <Descriptions.Item label="Month">
                <Tag color="blue">
                  {dayjs().month(payroll.month).format("MMMM")} {payroll.year}
                </Tag>
              </Descriptions.Item>

              <Descriptions.Item label="Net Salary">
                <span style={{fontWeight: 600, color: "#389e0d"}}>
                  ₹{payroll.netSalary?.toLocaleString()}
                </span>
              </Descriptions.Item>

              <Descriptions.Item label="Paid">
                ₹
                {(
                  payroll.netSalary - (payroll.pendingAmount || 0)
                )?.toLocaleString()}
              </Descriptions.Item>

              <Descriptions.Item label="Pending">
                <span style={{color: "#fa8c16", fontWeight: 600}}>
                  ₹{payroll.pendingAmount?.toLocaleString() || 0}
                </span>
              </Descriptions.Item>

              <Descriptions.Item label="Filtered Amount">
                <span style={{color: "#1890ff", fontWeight: 600}}>
                  ₹{filteredSummary.totalPaidAmount?.toLocaleString() || 0}
                </span>
              </Descriptions.Item>

              {showAdvance && currentData?.data?.totalAdvance && (
                <Descriptions.Item label="Total Advance">
                  <span style={{color: "#fa8c16", fontWeight: 600}}>
                    ₹{currentData.data.totalAdvance?.toLocaleString() || 0}
                  </span>
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>

          {/* Filters Section */}
          <div style={{marginBottom: 16}}>
            {/* First Row - Search, Payment Method Filter, and Toggle */}
            <Row gutter={[12, 12]} align="middle">
              <Col xs={24} sm={24} md={8} lg={8}>
                <Input
                  placeholder="Search transaction ID/Amount or Remarks..."
                  prefix={<SearchOutlined />}
                  value={searchText}
                  allowClear
                  onChange={(e) => setSearchText(e.target.value)}
                  style={{width: "100%"}}
                />
              </Col>

              <Col xs={24} sm={24} md={8} lg={6}>
                <Select
                  value={paymentMethodFilter}
                  onChange={setPaymentMethodFilter}
                  style={{width: "50%"}}
                >
                  <Option value="all">All</Option>
                  {paymentMethods.map((method) => (
                    <Option key={method} value={method}>
                      {method}
                    </Option>
                  ))}
                </Select>
              </Col>

              <Col
                xs={24}
                sm={24}
                md={8}
                lg={10}
                style={{textAlign: isMobile ? "left" : "right"}}
              >
                <Space>
                  <span style={{color: "#666"}}>Regular</span>
                  <Switch
                    checked={showAdvance}
                    onChange={setShowAdvance}
                    checkedChildren="Advance"
                    unCheckedChildren="Regular"
                  />
                  <span style={{color: "#666"}}>Advance</span>
                </Space>
              </Col>
            </Row>

            {/* Second Row - Month/Year Filters (only visible in advance mode) */}
            {showAdvance && (
              <Row gutter={[12, 12]} style={{marginTop: 12}}>
                <Col xs={24} sm={12} md={8} lg={6}>
                  <Select
                    value={advanceMonth}
                    onChange={setAdvanceMonth}
                    style={{width: "100%"}}
                    placeholder="Select month"
                  >
                    {monthOptions.map((month) => (
                      <Option key={month.value} value={month.value}>
                        {month.label}
                      </Option>
                    ))}
                  </Select>
                </Col>

                <Col xs={24} sm={12} md={8} lg={6}>
                  <Select
                    value={advanceYear}
                    onChange={setAdvanceYear}
                    style={{width: "100%"}}
                    placeholder="Select year"
                  >
                    {yearOptions.map((year) => (
                      <Option key={year} value={year}>
                        {year}
                      </Option>
                    ))}
                  </Select>
                </Col>

                <Col xs={24} sm={24} md={8} lg={12}>
                  {advanceMonth && advanceYear && (
                    <Tag color="orange" style={{padding: "4px 12px"}}>
                      Showing advances for{" "}
                      {
                        monthOptions.find((m) => m.value === advanceMonth)
                          ?.label
                      }{" "}
                      {advanceYear}
                    </Tag>
                  )}
                </Col>
              </Row>
            )}
          </div>
        </div>

        {/* Table */}
        <div style={{flex: 1, minHeight: 0}}>
          <Table
            columns={columns}
            dataSource={filteredTransactions}
            loading={currentLoading || currentFetching}
            rowKey="_id"
            pagination={false}
            size="small"
            scroll={{
              y: tableScrollY,
              x: isMobile ? 700 : "max-content",
            }}
            locale={{
              emptyText: currentLoading ? (
                <Spin size="small" />
              ) : (
                <Empty
                  description={
                    showAdvance && !advanceMonth
                      ? "Please select a month to view advance transactions"
                      : "No transactions found"
                  }
                />
              ),
            }}
          />
        </div>
      </div>
    </Modal>
  );
};

export default TransactionHistoryModal;
