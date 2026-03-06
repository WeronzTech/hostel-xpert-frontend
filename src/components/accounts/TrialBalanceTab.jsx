import {Card, Space, Typography, Tag, Table, Divider, Row, Col} from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  BankOutlined,
  ShoppingOutlined,
  ReconciliationOutlined,
  DollarOutlined,
} from "@ant-design/icons";

const {Text} = Typography;

const TrialBalanceTab = ({data, loading}) => {
  const trialBalance = data?.trialBalance || [];
  const totals = data?.totals || {};
  const isBalanced = data?.isBalanced;

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
            ? `₹ ${value.toLocaleString("en-IN", {minimumFractionDigits: 2})}`
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
            ? `₹ ${value.toLocaleString("en-IN", {minimumFractionDigits: 2})}`
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
            ? `₹ ${value.toLocaleString("en-IN", {minimumFractionDigits: 2})}`
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
            ? `₹ ${value.toLocaleString("en-IN", {minimumFractionDigits: 2})}`
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
        <Text strong style={{color: value > 0 ? "#f5222d" : "#8c8c8c"}}>
          {value > 0
            ? `₹ ${value.toLocaleString("en-IN", {minimumFractionDigits: 2})}`
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
        <Text strong style={{color: value > 0 ? "#52c41a" : "#8c8c8c"}}>
          {value > 0
            ? `₹ ${value.toLocaleString("en-IN", {minimumFractionDigits: 2})}`
            : "-"}
        </Text>
      ),
    },
  ];

  return (
    <>
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
                })}{" "}
                | Total Credits: ₹{" "}
                {totals.closingCredit?.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
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
          loading={loading}
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
                  ).toLocaleString("en-IN", {minimumFractionDigits: 2})}
                </Text>
              </Row>
            </div>
          )}
        />
      </Card>
    </>
  );
};

export default TrialBalanceTab;
