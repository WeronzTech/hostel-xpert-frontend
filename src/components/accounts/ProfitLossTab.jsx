import {
  Row,
  Col,
  Card,
  Space,
  Typography,
  Table,
  Badge,
  Progress,
  Statistic,
  Grid,
} from "antd";
import {
  RiseOutlined,
  FallOutlined,
  ReconciliationOutlined,
} from "@ant-design/icons";

const {Text, Title} = Typography;
const {useBreakpoint} = Grid;

const ProfitLossTab = ({data, loading}) => {
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const income = data?.income || [];
  const expense = data?.expense || [];
  const totals = data?.totals || {};
  const isProfit = data?.isProfit;

  // Mobile columns for income
  const mobileIncomeColumns = [
    {
      title: "Income",
      key: "income",
      render: (_, record) => (
        <Space direction="column" size={2} style={{width: "100%"}}>
          <Space>
            <ReconciliationOutlined style={{color: "#52c41a", fontSize: 14}} />
            <Text>{record.accountName}</Text>
          </Space>
          <Text
            strong
            style={{
              color: "#52c41a",
              fontSize: 14,
              textAlign: "right",
              width: "100%",
            }}
          >
            ₹{" "}
            {record.amount.toLocaleString("en-IN", {minimumFractionDigits: 2})}
          </Text>
        </Space>
      ),
    },
  ];

  // Mobile columns for expense
  const mobileExpenseColumns = [
    {
      title: "Expense",
      key: "expense",
      render: (_, record) => (
        <Space direction="column" size={2} style={{width: "100%"}}>
          <Space>
            <FallOutlined style={{color: "#f5222d", fontSize: 14}} />
            <Text>{record.accountName}</Text>
          </Space>
          <Text
            strong
            style={{
              color: "#f5222d",
              fontSize: 14,
              textAlign: "right",
              width: "100%",
            }}
          >
            ₹{" "}
            {record.amount.toLocaleString("en-IN", {minimumFractionDigits: 2})}
          </Text>
        </Space>
      ),
    },
  ];

  // Desktop columns (unchanged)
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
    <>
      {/* Summary Cards - Stack on mobile */}
      <Row gutter={[16, 16]} style={{marginBottom: 24}}>
        <Col xs={24} sm={8}>
          <Card
            style={{
              borderRadius: "12px",
              background:
                "linear-gradient(135deg, #52c41a20 0%, #52c41a10 100%)",
              border: "1px solid #52c41a30",
            }}
            size={isMobile ? "small" : "default"}
          >
            <Statistic
              title={<Text type="secondary">Total Income</Text>}
              value={totals.totalIncome}
              precision={2}
              valueStyle={{color: "#52c41a", fontSize: isMobile ? 20 : 24}}
              prefix="₹"
              suffix={
                <RiseOutlined
                  style={{fontSize: isMobile ? 16 : 20, marginLeft: 8}}
                />
              }
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
            size={isMobile ? "small" : "default"}
          >
            <Statistic
              title={<Text type="secondary">Total Expenses</Text>}
              value={totals.totalExpense}
              precision={2}
              valueStyle={{color: "#f5222d", fontSize: isMobile ? 20 : 24}}
              prefix="₹"
              suffix={
                <FallOutlined
                  style={{fontSize: isMobile ? 16 : 20, marginLeft: 8}}
                />
              }
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
            size={isMobile ? "small" : "default"}
          >
            <Statistic
              title={
                <Text type="secondary">Net {isProfit ? "Profit" : "Loss"}</Text>
              }
              value={Math.abs(totals.netProfit)}
              precision={2}
              valueStyle={{
                color: isProfit ? "#52c41a" : "#f5222d",
                fontSize: isMobile ? 20 : 24,
              }}
              prefix="₹"
              suffix={
                isProfit ? (
                  <RiseOutlined
                    style={{fontSize: isMobile ? 16 : 20, marginLeft: 8}}
                  />
                ) : (
                  <FallOutlined
                    style={{fontSize: isMobile ? 16 : 20, marginLeft: 8}}
                  />
                )
              }
            />
          </Card>
        </Col>
      </Row>

      {/* Main Content */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <ReconciliationOutlined style={{color: "#52c41a"}} />
                <Text strong>Income</Text>
                <Badge
                  count={income.length}
                  style={{backgroundColor: "#52c41a"}}
                  size={isMobile ? "small" : "default"}
                />
              </Space>
            }
            style={{
              borderRadius: "12px",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
              height: "100%",
            }}
            size={isMobile ? "small" : "default"}
            bodyStyle={{padding: isMobile ? "12px" : "24px"}}
          >
            <Table
              columns={isMobile ? mobileIncomeColumns : incomeColumns}
              dataSource={income}
              rowKey="accountId"
              loading={loading}
              pagination={false}
              size={isMobile ? "small" : "middle"}
              bordered={!isMobile}
              showHeader={!isMobile}
              footer={() => (
                <div
                  style={{
                    textAlign: isMobile ? "center" : "right",
                    padding: isMobile ? "4px" : "8px",
                  }}
                >
                  <Text strong>Total Income: </Text>
                  <Text
                    strong
                    style={{color: "#52c41a", fontSize: isMobile ? 14 : 16}}
                  >
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

        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <FallOutlined style={{color: "#f5222d"}} />
                <Text strong>Expenses</Text>
                <Badge
                  count={expense.length}
                  style={{backgroundColor: "#f5222d"}}
                  size={isMobile ? "small" : "default"}
                />
              </Space>
            }
            style={{
              borderRadius: "12px",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
              height: "100%",
            }}
            size={isMobile ? "small" : "default"}
            bodyStyle={{padding: isMobile ? "12px" : "24px"}}
          >
            <Table
              columns={isMobile ? mobileExpenseColumns : expenseColumns}
              dataSource={expense}
              rowKey="accountId"
              loading={loading}
              pagination={false}
              size={isMobile ? "small" : "middle"}
              bordered={!isMobile}
              showHeader={!isMobile}
              footer={() => (
                <div
                  style={{
                    textAlign: isMobile ? "center" : "right",
                    padding: isMobile ? "4px" : "8px",
                  }}
                >
                  <Text strong>Total Expenses: </Text>
                  <Text
                    strong
                    style={{color: "#f5222d", fontSize: isMobile ? 14 : 16}}
                  >
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
            size={isMobile ? "small" : "default"}
            bodyStyle={{padding: isMobile ? "12px" : "24px"}}
          >
            <Row align="middle" justify="space-between" gutter={[16, 16]}>
              <Col xs={24} sm={16}>
                <Space
                  size="middle"
                  direction={isMobile ? "vertical" : "horizontal"}
                  style={{width: "100%"}}
                >
                  {isProfit ? (
                    <RiseOutlined
                      style={{fontSize: isMobile ? 20 : 24, color: "#52c41a"}}
                    />
                  ) : (
                    <FallOutlined
                      style={{fontSize: isMobile ? 20 : 24, color: "#f5222d"}}
                    />
                  )}
                  <div>
                    <Text type="secondary">
                      Net {isProfit ? "Profit" : "Loss"}
                    </Text>
                    <Title
                      level={isMobile ? 4 : 3}
                      style={{
                        margin: 0,
                        color: isProfit ? "#52c41a" : "#f5222d",
                      }}
                    >
                      ₹{" "}
                      {Math.abs(totals.netProfit || 0).toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })}
                    </Title>
                  </div>
                </Space>
              </Col>
              <Col
                xs={24}
                sm={8}
                style={{textAlign: isMobile ? "left" : "right"}}
              >
                <Progress
                  type={isMobile ? "line" : "circle"}
                  percent={Math.round(
                    (totals.totalIncome / (totals.totalExpense || 1)) * 100,
                  )}
                  width={isMobile ? undefined : 80}
                  strokeColor={isProfit ? "#52c41a" : "#f5222d"}
                  format={() =>
                    `${(((totals.totalIncome - totals.totalExpense) / (totals.totalIncome || 1)) * 100).toFixed(1)}%`
                  }
                  style={{marginTop: isMobile ? 8 : 0}}
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default ProfitLossTab;
