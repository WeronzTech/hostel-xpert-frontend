import {useState, useMemo, useEffect} from "react";
import {
  Space,
  Typography,
  Tree,
  Input,
  Badge,
  Empty,
  Card,
  Drawer,
  Flex,
  Tag,
  Button,
} from "antd";
import {
  FolderOutlined,
  FileOutlined,
  ExpandAltOutlined,
  CompressOutlined,
  InfoCircleOutlined,
  ApartmentOutlined,
} from "@ant-design/icons";
import {useQuery} from "@tanstack/react-query";
import {getAccounts} from "../../hooks/accounts/useAccounts";

const {Text, Title} = Typography;
const {Search} = Input;

const AccountsHierarchy = ({accounts}) => {
  const [expandedKeys, setExpandedKeys] = useState([]);
  const [autoExpandParent, setAutoExpandParent] = useState(true);
  const [searchValue, setSearchValue] = useState("");
  const [selectedNode, setSelectedNode] = useState(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Handle resize for responsive
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch all groups for hierarchy
  const {data: groupsData} = useQuery({
    queryKey: ["all-groups-hierarchy"],
    queryFn: () => getAccounts({isGroup: "true"}),
    enabled: true,
  });

  // Combine accounts and groups for hierarchy
  const allAccounts = useMemo(() => {
    const groups = groupsData?.data || [];
    const ledgers = accounts?.filter((acc) => !acc.isGroup) || [];
    return [...groups, ...ledgers];
  }, [groupsData, accounts]);

  // Build hierarchical tree data
  const buildTreeData = (parentId = null) => {
    return allAccounts
      .filter((item) => item.parentId === parentId)
      .map((item) => {
        const isGroup = item.isGroup;
        const children = buildTreeData(item._id);
        const hasChildren = children.length > 0;

        // Highlight if matches search
        const titleStr = item.name.toLowerCase();
        const searchLower = searchValue.toLowerCase();
        const isMatched = searchValue ? titleStr.includes(searchLower) : false;

        return {
          title: (
            <Space
              size={4}
              style={{
                width: "100%",
                backgroundColor: isMatched ? "#fffbe6" : "transparent",
                padding: isMatched ? "2px 4px" : 0,
                borderRadius: 4,
              }}
            >
              {isGroup ? (
                <FolderOutlined
                  style={{color: "#faad14", fontSize: isMobile ? 14 : 16}}
                />
              ) : (
                <FileOutlined
                  style={{color: "#52c41a", fontSize: isMobile ? 14 : 16}}
                />
              )}
              <Text strong={isGroup} style={{fontSize: isMobile ? 13 : 14}}>
                {item.name.length > (isMobile ? 20 : 30)
                  ? `${item.name.substring(0, isMobile ? 20 : 30)}...`
                  : item.name}
              </Text>
              {item.code && !isMobile && (
                <Tag color="default" style={{fontSize: 11, marginLeft: 4}}>
                  {item.code}
                </Tag>
              )}
              {!isGroup && item.gstType && !isMobile && (
                <Tag color="gold" style={{fontSize: 11}}>
                  GST
                </Tag>
              )}
              {hasChildren && !isMobile && (
                <Badge
                  count={children.length}
                  size="small"
                  style={{backgroundColor: "#1890ff", marginLeft: 8}}
                />
              )}
            </Space>
          ),
          key: item._id,
          isGroup,
          item,
          children: hasChildren ? children : undefined,
          selectable: true,
        };
      });
  };

  const treeData = useMemo(
    () => buildTreeData(),
    [allAccounts, searchValue, isMobile],
  );

  // Get stats
  const groupsCount = groupsData?.data?.length || 0;
  const ledgersCount = accounts?.filter((acc) => !acc.isGroup)?.length || 0;

  // Custom tree node renderer
  const renderTreeNode = (nodeData) => {
    return (
      <div
        style={{
          padding: "4px 8px",
          borderRadius: 4,
          backgroundColor: "transparent",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
        }}
        onClick={() => {
          setSelectedNode(nodeData.key);
          if (isMobile && !nodeData.isGroup) {
            setSelectedAccount(nodeData.item);
            setDrawerVisible(true);
          }
        }}
      >
        <Space wrap={isMobile}>
          {nodeData.isGroup ? (
            <FolderOutlined style={{color: "#faad14", fontSize: 16}} />
          ) : (
            <FileOutlined style={{color: "#52c41a", fontSize: 16}} />
          )}
          <Text strong={nodeData.isGroup} style={{fontSize: 14}}>
            {nodeData.item.name.length > 40
              ? `${nodeData.item.name.substring(0, 40)}...`
              : nodeData.item.name}
          </Text>
          {!nodeData.isGroup && nodeData.item.gstType && !isMobile && (
            <Tag color="gold" size="small" style={{fontSize: 11}}>
              GST
            </Tag>
          )}
        </Space>
        {isMobile && !nodeData.isGroup && (
          <InfoCircleOutlined style={{color: "#1890ff", marginLeft: 8}} />
        )}
      </div>
    );
  };

  const onExpand = (expandedKeysValue) => {
    setExpandedKeys(expandedKeysValue);
    setAutoExpandParent(false);
  };

  const handleSearch = (value) => {
    setSearchValue(value);

    if (value) {
      const matchedKeys = [];
      const searchInTree = (nodes) => {
        nodes.forEach((node) => {
          if (node.item.name.toLowerCase().includes(value.toLowerCase())) {
            matchedKeys.push(node.key);
            let parent = node.item.parentId;
            while (parent) {
              matchedKeys.push(parent);
              const parentNode = allAccounts.find((a) => a._id === parent);
              parent = parentNode?.parentId;
            }
          }
          if (node.children) searchInTree(node.children);
        });
      };
      searchInTree(treeData);
      setExpandedKeys([...new Set(matchedKeys)]);
      setAutoExpandParent(true);
    } else {
      setExpandedKeys([]);
    }
  };

  const expandAll = () => {
    const allKeys = [];
    const collectKeys = (nodes) => {
      nodes.forEach((node) => {
        allKeys.push(node.key);
        if (node.children) collectKeys(node.children);
      });
    };
    collectKeys(treeData);
    setExpandedKeys(allKeys);
  };

  const collapseAll = () => {
    setExpandedKeys([]);
  };

  return (
    <div style={{width: "100%"}}>
      {/* Title */}
      <Flex justify="space-between" align="center" style={{marginBottom: 16}}>
        <Title level={4} style={{margin: 0, color: "#1f2937"}}>
          <ApartmentOutlined style={{marginRight: 8}} />
          Accounts Hierarchy
        </Title>
      </Flex>

      {/* Stats */}
      <Flex
        justify="space-between"
        align="center"
        wrap="wrap"
        gap="middle"
        style={{marginBottom: 16}}
      ></Flex>

      {/* Search and Controls */}
      <div style={{marginBottom: 16}}>
        {isMobile ? (
          <div style={{width: "100%"}}>
            <Search
              placeholder="Search accounts"
              onSearch={handleSearch}
              onChange={(e) => handleSearch(e.target.value)}
              style={{width: "100%", marginBottom: 8}}
              size="middle"
              allowClear
            />
            <Flex gap="small">
              <Button icon={<ExpandAltOutlined />} onClick={expandAll} block>
                Expand All
              </Button>
              <Button icon={<CompressOutlined />} onClick={collapseAll} block>
                Collapse All
              </Button>
            </Flex>
          </div>
        ) : (
          <Flex gap="middle" align="center">
            <Button
              icon={<ExpandAltOutlined />}
              onClick={expandAll}
              size="middle"
            >
              Expand All
            </Button>
            <Button
              icon={<CompressOutlined />}
              onClick={collapseAll}
              size="middle"
            >
              Collapse All
            </Button>
            <Search
              placeholder="Search accounts"
              onSearch={handleSearch}
              onChange={(e) => handleSearch(e.target.value)}
              style={{width: 250, marginLeft: "auto"}}
              size="middle"
              allowClear
            />
          </Flex>
        )}
      </div>

      {/* Tree View */}
      <div
        bordered={false}
        style={{
          background: "#fff",
          borderRadius: 8,
        }}
        bodyStyle={{padding: isMobile ? 8 : 16}}
      >
        {treeData.length > 0 ? (
          <Tree
            showLine
            showIcon={!isMobile}
            expandedKeys={expandedKeys}
            autoExpandParent={autoExpandParent}
            onExpand={onExpand}
            treeData={treeData}
            titleRender={renderTreeNode}
            selectedKeys={[selectedNode]}
            onSelect={(keys) => setSelectedNode(keys[0])}
            style={{background: "transparent"}}
          />
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="No accounts found"
          />
        )}
      </div>

      {/* Mobile Drawer for Account Details */}
      <Drawer
        title="Account Details"
        placement="bottom"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        height="auto"
        style={{maxHeight: "80vh"}}
      >
        {selectedAccount && (
          <Space direction="vertical" size="middle" style={{width: "100%"}}>
            <div>
              <Text type="secondary">Account Name</Text>
              <div>
                <Text strong>{selectedAccount.name}</Text>
              </div>
            </div>

            <div>
              <Text type="secondary">Account Type</Text>
              <div>
                <Tag
                  color={
                    selectedAccount.accountType === "Asset"
                      ? "blue"
                      : selectedAccount.accountType === "Liability"
                        ? "red"
                        : selectedAccount.accountType === "Equity"
                          ? "purple"
                          : selectedAccount.accountType === "Income"
                            ? "green"
                            : "orange"
                  }
                >
                  {selectedAccount.accountType}
                </Tag>
              </div>
            </div>

            {selectedAccount.code && (
              <div>
                <Text type="secondary">Account Code</Text>
                <div>
                  <Text>{selectedAccount.code}</Text>
                </div>
              </div>
            )}

            {selectedAccount.parentId && (
              <div>
                <Text type="secondary">Hierarchy Path</Text>
                <div style={{fontSize: 13}}>
                  {(() => {
                    const path = [];
                    let currentId = selectedAccount.parentId;
                    const findPath = (id) => {
                      const group = groupsData?.data?.find((g) => g._id === id);
                      if (group) {
                        path.unshift(group.name);
                        if (group.parentId) findPath(group.parentId);
                      }
                    };
                    if (selectedAccount.parentId)
                      findPath(selectedAccount.parentId);
                    return path.join(" → ");
                  })()}
                </div>
              </div>
            )}

            {selectedAccount.gstType && (
              <div>
                <Text type="secondary">GST Details</Text>
                <div>
                  <Tag color="gold">
                    {selectedAccount.gstType} @ {selectedAccount.gstRate}%
                  </Tag>
                </div>
              </div>
            )}

            {selectedAccount.description && (
              <div>
                <Text type="secondary">Description</Text>
                <div>
                  <Text>{selectedAccount.description}</Text>
                </div>
              </div>
            )}
          </Space>
        )}
      </Drawer>
    </div>
  );
};

export default AccountsHierarchy;
