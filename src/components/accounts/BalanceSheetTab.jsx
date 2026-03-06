import {useState} from "react";
import {
  Row,
  Col,
  Card,
  Space,
  Typography,
  Badge,
  Divider,
  Tree,
  Tag,
} from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  BankOutlined,
  ShoppingOutlined,
  DollarOutlined,
  FileOutlined,
} from "@ant-design/icons";

const {Text} = Typography;

const BalanceSheetTab = ({data, loading}) => {
  const [expandedKeys, setExpandedKeys] = useState([]);

  const assets = data?.assets || [];
  const liabilities = data?.liabilities || [];
  const equity = data?.equity || [];
  const totals = data?.totals || {};
  const isBalanced = data?.isBalanced;

  const buildTreeData = (items, type) => {
    const itemMap = {};
    const roots = [];

    items.forEach((item) => {
      itemMap[item.accountId] = {
        ...item,
        key: item.accountId,
        title: (
          <Space>
            {item.systemGenerated ? (
              <DollarOutlined style={{color: "#722ed1"}} />
            ) : (
              <FileOutlined
                style={{color: type === "asset" ? "#1890ff" : "#fa8c16"}}
              />
            )}
            <Text strong={!item.parentId}>{item.accountName}</Text>
            <Text type="secondary" style={{marginLeft: 8}}>
              ₹{" "}
              {item.amount?.toLocaleString("en-IN", {minimumFractionDigits: 2})}
            </Text>
          </Space>
        ),
        children: [],
      };
    });

    items.forEach((item) => {
      if (item.parentId && itemMap[item.parentId]) {
        itemMap[item.parentId].children.push(itemMap[item.accountId]);
      } else if (!item.systemGenerated) {
        roots.push(itemMap[item.accountId]);
      }
    });

    items.forEach((item) => {
      if (item.systemGenerated && !item.parentId) {
        roots.push(itemMap[item.accountId]);
      }
    });

    return roots;
  };

  const assetTreeData = buildTreeData(assets, "asset");
  const liabilityTreeData = buildTreeData(liabilities, "liability");
  const equityTreeData = buildTreeData(equity, "equity");

  const onExpand = (expandedKeysValue) => {
    setExpandedKeys(expandedKeysValue);
  };

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
                Total Assets: ₹{" "}
                {totals.totalAssets?.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                })}{" "}
                | Total Liabilities & Equity: ₹{" "}
                {(totals.totalLiabilities + totals.totalEquity)?.toLocaleString(
                  "en-IN",
                  {
                    minimumFractionDigits: 2,
                  },
                )}
              </Text>
            </Space>
          </Col>
          <Col>
            <Tag
              color={isBalanced ? "success" : "error"}
              style={{padding: "4px 12px"}}
            >
              {isBalanced ? "Balanced" : "Not Balanced"}
            </Tag>
          </Col>
        </Row>
      </Card>

      {/* Main Content */}
      <Row gutter={[16, 16]}>
        {/* Assets Section */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <BankOutlined style={{color: "#1890ff"}} />
                <Text strong>Assets</Text>
                <Badge
                  count={assets.length}
                  style={{backgroundColor: "#1890ff"}}
                />
              </Space>
            }
            style={{
              borderRadius: "12px",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
              height: "100%",
            }}
          >
            {assetTreeData.length > 0 ? (
              <Tree
                showLine
                expandedKeys={expandedKeys}
                onExpand={onExpand}
                treeData={assetTreeData}
                defaultExpandAll
                style={{background: "transparent"}}
              />
            ) : (
              <div style={{textAlign: "center", padding: "24px"}}>
                <Text type="secondary">No assets found</Text>
              </div>
            )}
            <Divider />
            <Row justify="space-between">
              <Text strong>Total Assets</Text>
              <Text strong style={{color: "#1890ff", fontSize: 16}}>
                ₹{" "}
                {totals.totalAssets?.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                })}
              </Text>
            </Row>
          </Card>
        </Col>

        {/* Liabilities & Equity Section */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <DollarOutlined style={{color: "#722ed1"}} />
                <Text strong>Liabilities & Equity</Text>
              </Space>
            }
            style={{
              borderRadius: "12px",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
              height: "100%",
            }}
          >
            <Space direction="vertical" style={{width: "100%"}} size="large">
              {/* Liabilities */}
              <div>
                <Space>
                  <ShoppingOutlined style={{color: "#fa8c16"}} />
                  <Text strong>Liabilities</Text>
                  <Badge
                    count={liabilities.length}
                    style={{backgroundColor: "#fa8c16"}}
                  />
                </Space>
                {liabilityTreeData.length > 0 ? (
                  <Tree
                    showLine
                    expandedKeys={expandedKeys}
                    onExpand={onExpand}
                    treeData={liabilityTreeData}
                    defaultExpandAll
                    style={{background: "transparent", marginTop: 8}}
                  />
                ) : (
                  <div style={{textAlign: "center", padding: "12px"}}>
                    <Text type="secondary">No liabilities found</Text>
                  </div>
                )}
                <Row justify="space-between" style={{marginTop: 8}}>
                  <Text>Total Liabilities</Text>
                  <Text strong style={{color: "#fa8c16"}}>
                    ₹{" "}
                    {totals.totalLiabilities?.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                  </Text>
                </Row>
              </div>

              <Divider />

              {/* Equity */}
              <div>
                <Space>
                  <DollarOutlined style={{color: "#722ed1"}} />
                  <Text strong>Equity</Text>
                  <Badge
                    count={equity.length}
                    style={{backgroundColor: "#722ed1"}}
                  />
                </Space>
                {equityTreeData.length > 0 ? (
                  <Tree
                    showLine
                    expandedKeys={expandedKeys}
                    onExpand={onExpand}
                    treeData={equityTreeData}
                    defaultExpandAll
                    style={{background: "transparent", marginTop: 8}}
                  />
                ) : (
                  <div style={{textAlign: "center", padding: "12px"}}>
                    <Text type="secondary">No equity found</Text>
                  </div>
                )}
                <Row justify="space-between" style={{marginTop: 8}}>
                  <Text>Total Equity</Text>
                  <Text strong style={{color: "#722ed1"}}>
                    ₹{" "}
                    {totals.totalEquity?.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                  </Text>
                </Row>
              </div>
            </Space>

            <Divider />

            <Row justify="space-between">
              <Text strong style={{fontSize: 16}}>
                Total Liabilities & Equity
              </Text>
              <Text strong style={{color: "#722ed1", fontSize: 16}}>
                ₹{" "}
                {(totals.totalLiabilities + totals.totalEquity)?.toLocaleString(
                  "en-IN",
                  {
                    minimumFractionDigits: 2,
                  },
                )}
              </Text>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Accounting Equation */}
      <Row gutter={16} style={{marginTop: 24}}>
        <Col span={24}>
          <Card
            style={{
              borderRadius: "12px",
              background: "#fafafa",
              textAlign: "center",
            }}
          >
            <Space size="large" wrap>
              <Text strong style={{fontSize: 16}}>
                Assets = Liabilities + Equity
              </Text>
              <Text strong style={{color: "#1890ff", fontSize: 16}}>
                ₹{" "}
                {totals.totalAssets?.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                })}
              </Text>
              <Text strong>=</Text>
              <Text strong style={{color: "#fa8c16", fontSize: 16}}>
                ₹{" "}
                {totals.totalLiabilities?.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                })}
              </Text>
              <Text strong>+</Text>
              <Text strong style={{color: "#722ed1", fontSize: 16}}>
                ₹{" "}
                {totals.totalEquity?.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                })}
              </Text>
            </Space>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default BalanceSheetTab;
