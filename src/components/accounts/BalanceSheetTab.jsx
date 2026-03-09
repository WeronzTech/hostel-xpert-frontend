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
  Grid,
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
const {useBreakpoint} = Grid;

const BalanceSheetTab = ({data, loading}) => {
  const screens = useBreakpoint();
  const isMobile = !screens.md;

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
          <Space size={isMobile ? "small" : "middle"} wrap>
            {item.systemGenerated ? (
              <DollarOutlined
                style={{color: "#722ed1", fontSize: isMobile ? 14 : 16}}
              />
            ) : (
              <FileOutlined
                style={{
                  color: type === "asset" ? "#1890ff" : "#fa8c16",
                  fontSize: isMobile ? 14 : 16,
                }}
              />
            )}
            <Text
              strong={!item.parentId}
              style={{fontSize: isMobile ? 13 : 14}}
            >
              {item.accountName}
            </Text>
            <Text
              type="secondary"
              style={{
                marginLeft: isMobile ? 4 : 8,
                fontSize: isMobile ? 12 : 14,
              }}
            >
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
      {/* Main Content */}
      <Row gutter={[16, 16]}>
        {/* Assets Section */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space size={isMobile ? "small" : "middle"}>
                <BankOutlined
                  style={{color: "#1890ff", fontSize: isMobile ? 16 : 18}}
                />
                <Text strong style={{fontSize: isMobile ? 14 : 16}}>
                  Assets
                </Text>
                <Badge
                  count={assets.length}
                  style={{backgroundColor: "#1890ff"}}
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
            {assetTreeData.length > 0 ? (
              <Tree
                showLine
                expandedKeys={expandedKeys}
                onExpand={onExpand}
                treeData={assetTreeData}
                defaultExpandAll
                style={{background: "transparent"}}
                fontSize={isMobile ? 12 : 14}
              />
            ) : (
              <div
                style={{
                  textAlign: "center",
                  padding: isMobile ? "12px" : "24px",
                }}
              >
                <Text type="secondary">No assets found</Text>
              </div>
            )}
            <Divider style={{margin: isMobile ? "12px 0" : "16px 0"}} />
            <Row justify="space-between" align="middle">
              <Text strong style={{fontSize: isMobile ? 13 : 14}}>
                Total Assets
              </Text>
              <Text
                strong
                style={{color: "#1890ff", fontSize: isMobile ? 14 : 16}}
              >
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
              <Space size={isMobile ? "small" : "middle"}>
                <DollarOutlined
                  style={{color: "#722ed1", fontSize: isMobile ? 16 : 18}}
                />
                <Text strong style={{fontSize: isMobile ? 14 : 16}}>
                  Liabilities & Equity
                </Text>
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
            <Space
              direction="vertical"
              style={{width: "100%"}}
              size={isMobile ? "small" : "large"}
            >
              {/* Liabilities */}
              <div>
                <Space size={isMobile ? "small" : "middle"}>
                  <ShoppingOutlined
                    style={{color: "#fa8c16", fontSize: isMobile ? 14 : 16}}
                  />
                  <Text strong style={{fontSize: isMobile ? 13 : 14}}>
                    Liabilities
                  </Text>
                  <Badge
                    count={liabilities.length}
                    style={{backgroundColor: "#fa8c16"}}
                    size={isMobile ? "small" : "default"}
                  />
                </Space>
                {liabilityTreeData.length > 0 ? (
                  <Tree
                    showLine
                    expandedKeys={expandedKeys}
                    onExpand={onExpand}
                    treeData={liabilityTreeData}
                    defaultExpandAll
                    style={{
                      background: "transparent",
                      marginTop: isMobile ? 4 : 8,
                    }}
                  />
                ) : (
                  <div
                    style={{
                      textAlign: "center",
                      padding: isMobile ? "8px" : "12px",
                    }}
                  >
                    <Text type="secondary">No liabilities found</Text>
                  </div>
                )}
                <Row
                  justify="space-between"
                  style={{marginTop: isMobile ? 4 : 8}}
                >
                  <Text style={{fontSize: isMobile ? 12 : 14}}>
                    Total Liabilities
                  </Text>
                  <Text
                    strong
                    style={{color: "#fa8c16", fontSize: isMobile ? 13 : 14}}
                  >
                    ₹{" "}
                    {totals.totalLiabilities?.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                  </Text>
                </Row>
              </div>

              <Divider style={{margin: isMobile ? "8px 0" : "12px 0"}} />

              {/* Equity */}
              <div>
                <Space size={isMobile ? "small" : "middle"}>
                  <DollarOutlined
                    style={{color: "#722ed1", fontSize: isMobile ? 14 : 16}}
                  />
                  <Text strong style={{fontSize: isMobile ? 13 : 14}}>
                    Equity
                  </Text>
                  <Badge
                    count={equity.length}
                    style={{backgroundColor: "#722ed1"}}
                    size={isMobile ? "small" : "default"}
                  />
                </Space>
                {equityTreeData.length > 0 ? (
                  <Tree
                    showLine
                    expandedKeys={expandedKeys}
                    onExpand={onExpand}
                    treeData={equityTreeData}
                    defaultExpandAll
                    style={{
                      background: "transparent",
                      marginTop: isMobile ? 4 : 8,
                    }}
                  />
                ) : (
                  <div
                    style={{
                      textAlign: "center",
                      padding: isMobile ? "8px" : "12px",
                    }}
                  >
                    <Text type="secondary">No equity found</Text>
                  </div>
                )}
                <Row
                  justify="space-between"
                  style={{marginTop: isMobile ? 4 : 8}}
                >
                  <Text style={{fontSize: isMobile ? 12 : 14}}>
                    Total Equity
                  </Text>
                  <Text
                    strong
                    style={{color: "#722ed1", fontSize: isMobile ? 13 : 14}}
                  >
                    ₹{" "}
                    {totals.totalEquity?.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                  </Text>
                </Row>
              </div>
            </Space>

            <Divider style={{margin: isMobile ? "12px 0" : "16px 0"}} />

            <Row justify="space-between" align="middle">
              <Text strong style={{fontSize: isMobile ? 13 : 16}}>
                Total Liabilities & Equity
              </Text>
              <Text
                strong
                style={{color: "#722ed1", fontSize: isMobile ? 14 : 16}}
              >
                ₹{" "}
                {(totals.totalLiabilities + totals.totalEquity)?.toLocaleString(
                  "en-IN",
                  {minimumFractionDigits: 2},
                )}
              </Text>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Bottom Status Bar */}
      <Row gutter={16} style={{marginTop: 24}}>
        <Col span={24}>
          <Card
            style={{
              borderRadius: "12px",
              background: "#fafafa",
            }}
            bodyStyle={{padding: isMobile ? "12px" : "12px 16px"}}
            size={isMobile ? "small" : "default"}
          >
            <Row align="middle" justify="space-between" gutter={[16, 16]}>
              {/* Left Side - Balance Status */}
              <Col xs={24} sm={12}>
                <Space
                  size="middle"
                  direction={isMobile ? "vertical" : "horizontal"}
                  style={{width: "100%"}}
                >
                  <Text
                    strong
                    style={{
                      color: isBalanced ? "#52c41a" : "#f5222d",
                      fontSize: isMobile ? 13 : 16,
                    }}
                  >
                    {isBalanced ? "✓ Balanced" : "✗ Not Balanced"}
                  </Text>
                </Space>
              </Col>

              {/* Right Side - Accounting Equation */}
              <Col xs={24} sm={12}>
                <Space
                  size={isMobile ? "small" : "large"}
                  wrap
                  style={{
                    justifyContent: isMobile ? "flex-start" : "flex-end",
                    width: "100%",
                  }}
                >
                  <Text
                    strong
                    style={{color: "#1890ff", fontSize: isMobile ? 12 : 14}}
                  >
                    Assets:{" "}
                    {totals.totalAssets?.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                  </Text>
                  <Text strong style={{fontSize: isMobile ? 12 : 14}}>
                    =
                  </Text>
                  <Text
                    strong
                    style={{color: "#fa8c16", fontSize: isMobile ? 12 : 14}}
                  >
                    Liabilities:{" "}
                    {totals.totalLiabilities?.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                  </Text>
                  <Text strong style={{fontSize: isMobile ? 12 : 14}}>
                    +
                  </Text>
                  <Text
                    strong
                    style={{color: "#722ed1", fontSize: isMobile ? 12 : 14}}
                  >
                    Equity:{" "}
                    {totals.totalEquity?.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                  </Text>
                </Space>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default BalanceSheetTab;
