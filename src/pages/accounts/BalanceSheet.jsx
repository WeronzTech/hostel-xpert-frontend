import {useState, useEffect} from "react";
import {
  Row,
  Col,
  Card,
  DatePicker,
  Space,
  Typography,
  Badge,
  Divider,
  Button,
  Menu,
  Dropdown,
  message,
  Tree,
  Grid,
  Tag,
} from "antd";
import {useQuery} from "@tanstack/react-query";
import {useSelector} from "react-redux";
import {PageHeader} from "../../components";
import {getBalanceSheet} from "../../hooks/accounts/useAccounts";
import dayjs from "dayjs";
import usePersistentState from "../../hooks/usePersistentState";
import {
  DownloadOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
  BankOutlined,
  ShoppingOutlined,
  DollarOutlined,
  FileOutlined,
  CloseCircleOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import {useParams} from "react-router-dom";

const {Text} = Typography;
const {useBreakpoint} = Grid;

const BalanceSheet = () => {
  const {selectedProperty} = useSelector((state) => state.properties);
  const {selectedKitchen} = useSelector((state) => state.kitchens);
  const {entityType} = useParams();
  const screens = useBreakpoint();

  // Use persistent state for filters
  const [filters, setFilters] = usePersistentState("balanceSheetFilters", {
    dateRange: [
      dayjs().endOf("day").toISOString(),
      dayjs().endOf("day").toISOString(),
    ],
    entityId: null,
    entityType: entityType || "",
  });

  const [isInitialized, setIsInitialized] = useState(false);
  const [expandedKeys, setExpandedKeys] = useState([]);

  useEffect(() => {
    if (filters) {
      setIsInitialized(true);
    }
  }, [filters]);

  const getQueryParams = () => {
    if (!filters.dateRange?.[0]) {
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

  // Fetch Balance Sheet data
  const {data: bsResponse, isLoading} = useQuery({
    queryKey: [
      "balanceSheet",
      {
        entityType,
        entityId:
          entityType === "PROPERTY"
            ? selectedProperty?.id
            : entityType === "KITCHEN"
              ? selectedKitchen?.id
              : undefined,
        asOnDate: filters.dateRange?.[1]
          ? dayjs(filters.dateRange[1]).format("YYYY-MM-DD")
          : undefined,
      },
    ],
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

  const bsData = bsResponse?.data;
  const assets = bsData?.assets || [];
  const liabilities = bsData?.liabilities || [];
  const equity = bsData?.equity || [];
  const totals = bsData?.totals || {};
  const isBalanced = bsData?.isBalanced;

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

  // Build tree data for hierarchical display
  const buildTreeData = (items, type) => {
    const itemMap = {};
    const roots = [];

    // First pass: create map
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

    // Second pass: build hierarchy
    items.forEach((item) => {
      if (item.parentId && itemMap[item.parentId]) {
        itemMap[item.parentId].children.push(itemMap[item.accountId]);
      } else if (!item.systemGenerated) {
        roots.push(itemMap[item.accountId]);
      }
    });

    // Add system generated items to roots
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
    <div className="min-h-screen bg-gray-50 px-4 pt-4 pb-8 xl:px-12 lg:px-6">
      <PageHeader
        title="Balance Sheet"
        subtitle="Financial Position Statement"
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
              <DatePicker
                style={{width: "100%"}}
                value={
                  filters.dateRange?.[1] ? dayjs(filters.dateRange[1]) : null
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
                  {minimumFractionDigits: 2},
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
            {/* Liabilities */}
            <Space direction="vertical" style={{width: "100%"}} size="large">
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

            {/* Total Liabilities & Equity */}
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
    </div>
  );
};

export default BalanceSheet;
