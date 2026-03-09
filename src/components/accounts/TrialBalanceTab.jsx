import {
  Card,
  Space,
  Typography,
  Tag,
  Table,
  Divider,
  Row,
  Col,
  Grid,
} from "antd";
import {
  CloseCircleOutlined,
  BankOutlined,
  ShoppingOutlined,
  ReconciliationOutlined,
  DollarOutlined,
} from "@ant-design/icons";

const {Text} = Typography;
const {useBreakpoint} = Grid;

const TrialBalanceTab = ({data, loading}) => {
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const trialBalance = data?.trialBalance || [];
  const totals = data?.totals || {};
  const isBalanced = data?.isBalanced;

  // Mobile-optimized columns
  const mobileColumns = [
    {
      title: "Account",
      key: "account",
      render: (_, record) => (
        <Space direction="vertical" size={2} style={{width: "100%"}}>
          <Space align="center" wrap>
            {record.accountType === "Asset" && (
              <BankOutlined style={{color: "#1890ff", fontSize: 14}} />
            )}
            {record.accountType === "Liability" && (
              <ShoppingOutlined style={{color: "#fa8c16", fontSize: 14}} />
            )}
            {record.accountType === "Equity" && (
              <DollarOutlined style={{color: "#722ed1", fontSize: 14}} />
            )}
            {record.accountType === "Income" && (
              <ReconciliationOutlined
                style={{color: "#52c41a", fontSize: 14}}
              />
            )}
            {record.accountType === "Expense" && (
              <CloseCircleOutlined style={{color: "#f5222d", fontSize: 14}} />
            )}
            <Text strong style={{fontSize: 14}}>
              {record.accountName}
            </Text>
          </Space>
          <div style={{marginLeft: 22}}>
            <Tag color="default" style={{fontSize: 10, padding: "0 4px"}}>
              {record.accountType}
            </Tag>
          </div>
        </Space>
      ),
    },
    {
      title: "Opening",
      key: "opening",
      align: "right",
      render: (_, record) => (
        <Space direction="vertical" size={2} style={{width: "100%"}}>
          {record.openingDebit > 0 && (
            <Text style={{color: "#f5222d", fontSize: 12}}>
              Dr: ₹{" "}
              {record.openingDebit.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
              })}
            </Text>
          )}
          {record.openingCredit > 0 && (
            <Text style={{color: "#52c41a", fontSize: 12}}>
              Cr: ₹{" "}
              {record.openingCredit.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
              })}
            </Text>
          )}
          {record.openingDebit === 0 && record.openingCredit === 0 && (
            <Text type="secondary" style={{fontSize: 12}}>
              -
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: "Period",
      key: "period",
      align: "right",
      render: (_, record) => (
        <Space direction="vertical" size={2} style={{width: "100%"}}>
          {record.periodDebit > 0 && (
            <Text style={{color: "#f5222d", fontSize: 12}}>
              Dr: ₹{" "}
              {record.periodDebit.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
              })}
            </Text>
          )}
          {record.periodCredit > 0 && (
            <Text style={{color: "#52c41a", fontSize: 12}}>
              Cr: ₹{" "}
              {record.periodCredit.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
              })}
            </Text>
          )}
          {record.periodDebit === 0 && record.periodCredit === 0 && (
            <Text type="secondary" style={{fontSize: 12}}>
              -
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: "Closing",
      key: "closing",
      align: "right",
      render: (_, record) => (
        <Space direction="vertical" size={2} style={{width: "100%"}}>
          {record.closingDebit > 0 && (
            <Text strong style={{color: "#f5222d", fontSize: 12}}>
              Dr: ₹{" "}
              {record.closingDebit.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
              })}
            </Text>
          )}
          {record.closingCredit > 0 && (
            <Text strong style={{color: "#52c41a", fontSize: 12}}>
              Cr: ₹{" "}
              {record.closingCredit.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
              })}
            </Text>
          )}
          {record.closingDebit === 0 && record.closingCredit === 0 && (
            <Text type="secondary" style={{fontSize: 12}}>
              -
            </Text>
          )}
        </Space>
      ),
    },
  ];

  // Desktop columns (unchanged)
  const desktopColumns = [
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

  // Mobile footer
  const mobileFooter = () => (
    <div style={{padding: "8px 12px", background: "#fafafa"}}>
      <Space direction="vertical" size="small" style={{width: "100%"}}>
        <Row justify="space-between">
          <Text strong>Opening:</Text>
          <Space size="small">
            <Text strong style={{color: "#f5222d"}}>
              Dr: ₹{" "}
              {totals.openingDebit?.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
              })}
            </Text>
            <Text strong style={{color: "#52c41a"}}>
              Cr: ₹{" "}
              {totals.openingCredit?.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
              })}
            </Text>
          </Space>
        </Row>
        <Row justify="space-between">
          <Text strong>Period:</Text>
          <Space size="small">
            <Text strong style={{color: "#f5222d"}}>
              Dr: ₹{" "}
              {totals.periodDebit?.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
              })}
            </Text>
            <Text strong style={{color: "#52c41a"}}>
              Cr: ₹{" "}
              {totals.periodCredit?.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
              })}
            </Text>
          </Space>
        </Row>
        <Row justify="space-between">
          <Text strong>Closing:</Text>
          <Space size="small">
            <Text strong style={{color: "#f5222d"}}>
              Dr: ₹{" "}
              {totals.closingDebit?.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
              })}
            </Text>
            <Text strong style={{color: "#52c41a"}}>
              Cr: ₹{" "}
              {totals.closingCredit?.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
              })}
            </Text>
          </Space>
        </Row>
        <Divider style={{margin: "8px 0"}} />
        <Row justify="space-between" align="middle">
          <Text
            strong
            style={{
              color: isBalanced ? "#52c41a" : "#f5222d",
              fontSize: 14,
            }}
          >
            {isBalanced ? "✓ Balanced" : "✗ Not Balanced"}
          </Text>
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
            Diff: ₹{" "}
            {Math.abs(
              (totals.closingDebit || 0) - (totals.closingCredit || 0),
            ).toLocaleString("en-IN", {minimumFractionDigits: 2})}
          </Text>
        </Row>
      </Space>
    </div>
  );

  // Desktop footer (unchanged)
  const desktopFooter = () => (
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
      <Row justify="space-between" align="middle">
        <Col>
          <Text
            strong
            style={{
              color: isBalanced ? "#52c41a" : "#f5222d",
              fontSize: 14,
            }}
          >
            {isBalanced ? "✓" : "✗"} {isBalanced ? "Balanced" : "Not Balanced"}
          </Text>
        </Col>
        <Col>
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
        </Col>
      </Row>
    </div>
  );

  return (
    <>
      {/* Trial Balance Table */}
      <Card
        style={{
          borderRadius: "12px",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
        }}
        bodyStyle={{padding: isMobile ? "8px" : 0}}
      >
        <Table
          columns={isMobile ? mobileColumns : desktopColumns}
          dataSource={trialBalance}
          loading={loading}
          rowKey="accountId"
          bordered={!isMobile}
          size={isMobile ? "small" : "middle"}
          scroll={{x: isMobile ? "100%" : 1200}}
          pagination={false}
          footer={isMobile ? mobileFooter : desktopFooter}
        />
      </Card>
    </>
  );
};

export default TrialBalanceTab;
