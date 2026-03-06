
import {
  Modal,
  Form,
  Input,
  Select,
  Button,
  message,
  Switch,
  Space,
  Alert,
  InputNumber,
  Row,
  Col,
  TreeSelect,
  Divider,
  Tag,
} from "antd";
import { useState, useEffect, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createChartOfAccount,
  createDefaultPrimaryHeads,
  getAccounts,
} from "../../hooks/accounts/useAccounts";
import { FolderOutlined, FileOutlined, PlusOutlined } from "@ant-design/icons";

const ChartOfAccountsModal = ({ isOpen, onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const [messageApi, contextHolder] = message.useMessage();
  const [isGroup, setIsGroup] = useState(false);
  const [showNoHeadsAlert, setShowNoHeadsAlert] = useState(false);
  const [enableGST, setEnableGST] = useState(false);
  const [selectedParentPath, setSelectedParentPath] = useState([]);

  // 🔹 Fetch ALL group accounts (for hierarchy)
  const {
    data: groupsData,
    isLoading: groupsLoading,
    refetch: refetchGroups,
  } = useQuery({
    queryKey: ["all-groups"],
    queryFn: async () => {
      const response = await getAccounts({
        isGroup: "true", // Get all groups at all levels
      });

      if (response.success && (!response.data || response.data.length === 0)) {
        setShowNoHeadsAlert(true);
      } else {
        setShowNoHeadsAlert(false);
      }

      return response;
    },
    enabled: isOpen,
    refetchOnWindowFocus: false,
  });

  // 🔹 Build hierarchical tree data
  const groupTreeData = useMemo(() => {
    if (!groupsData?.data) return [];

    const buildTree = (parentId = null) => {
      return groupsData.data
        .filter(item => item.parentId === parentId)
        .map(item => ({
          title: (
            <Space>
              <FolderOutlined style={{ color: "#faad14" }} />
              <span>{item.name}</span>
              <Tag color="blue" style={{ fontSize: 10 }}>Group</Tag>
            </Space>
          ),
          value: item._id,
          key: item._id,
          children: buildTree(item._id),
          selectable: true,
          isLeaf: false,
        }));
    };

    return buildTree(null);
  }, [groupsData]);

  // 🔹 Get ancestors of selected node for path display
  const findNodePath = (nodeId, nodes = groupsData?.data || []) => {
    const path = [];
    let currentId = nodeId;
    
    while (currentId) {
      const node = nodes.find(n => n._id === currentId);
      if (node) {
        path.unshift(node.name);
        currentId = node.parentId;
      } else {
        break;
      }
    }
    
    return path;
  };

  // 🔹 Create Default Primary Heads
  const createDefaultHeadsMutation = useMutation({
    mutationFn: createDefaultPrimaryHeads,
    onSuccess: async () => {
      messageApi.success({
        content: "Default heads created successfully!",
      });

      await refetchGroups();
      setShowNoHeadsAlert(false);
    },
    onError: (error) => {
      messageApi.error({
        content: error.message,
      });
    },
  });

  // 🔹 Create Account Mutation
  const createAccountMutation = useMutation({
    mutationFn: createChartOfAccount,
    onSuccess: (data) => {
      messageApi.success({
        content: data.message,
      });

      queryClient.invalidateQueries({ queryKey: ["chartOfAccounts"] });
      queryClient.invalidateQueries({ queryKey: ["all-groups"] });

      onSuccess();
      form.resetFields();
      setIsGroup(false);
      setEnableGST(false);
      setSelectedParentPath([]);
    },
    onError: (error) => {
      messageApi.error({
        content: error.message,
      });
    },
  });

  const handleSubmit = (values) => {
    const accountData = {
      name: values.name,
      parentId: values.parentId || null,
      isGroup: values.isGroup || false,
      gstType: enableGST ? values.gstType : undefined,
      gstRate: enableGST ? values.gstRate : undefined,
    };

    createAccountMutation.mutate(accountData);
  };

  const handleCreateDefaultHeads = () => {
    createDefaultHeadsMutation.mutate();
  };

  const handleParentChange = (value) => {
    form.setFieldValue("parentId", value);
    
    // Update path display
    if (value) {
      const path = findNodePath(value);
      setSelectedParentPath(path);
    } else {
      setSelectedParentPath([]);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      form.resetFields();
      setIsGroup(false);
      setShowNoHeadsAlert(false);
      setEnableGST(false);
      setSelectedParentPath([]);
    }
  }, [isOpen, form]);

  return (
    <>
      {contextHolder}

      <Modal
        title={
          <Space>
            <PlusOutlined />
            <span>Add New {isGroup ? "Group" : "Ledger"} Account</span>
          </Space>
        }
        open={isOpen}
        centered
        maskClosable={false}
        onCancel={onClose}
        onOk={() => form.submit()}
        confirmLoading={createAccountMutation.isPending}
        width={650}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          {/* Alert if no groups exist */}
          {showNoHeadsAlert && (
            <Alert
              style={{ marginBottom: 16 }}
              message="No Chart of Accounts Found"
              description="Create default primary heads to initialize Chart of Accounts."
              type="warning"
              showIcon
              action={
                <Button
                  type="primary"
                  danger
                  size="small"
                  onClick={handleCreateDefaultHeads}
                  loading={createDefaultHeadsMutation.isPending}
                >
                  Create Default Heads
                </Button>
              }
            />
          )}

          {/* Account Name */}
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="name"
                label="Account Name"
                rules={[{ required: true, message: "Please enter account name" }]}
              >
                <Input 
                  placeholder="Enter account name" 
                  prefix={isGroup ? <FolderOutlined /> : <FileOutlined />}
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Parent Account - Tree Select for infinite hierarchy */}
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="parentId"
                label="Parent Account"
                rules={[{ required: true, message: "Please select parent account" }]}
              >
                <TreeSelect
                  style={{ width: '100%' }}
                  placeholder="Select parent account from hierarchy"
                  treeData={groupTreeData}
                  loading={groupsLoading}
                  treeDefaultExpandAll={false}
                  treeLine={true}
                  showSearch
                  treeNodeFilterProp="title"
                  disabled={showNoHeadsAlert}
                  onChange={handleParentChange}
                  dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                  allowClear
                />
              </Form.Item>
              
              {/* Show selected path */}
              {selectedParentPath.length > 0 && (
                <div style={{ marginTop: -12, marginBottom: 12, fontSize: 12, color: '#666' }}>
                  Selected path: {selectedParentPath.join(' → ')}
                </div>
              )}
            </Col>
          </Row>

          {/* Account Type Toggle */}
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item label="Account Type">
                <Space size="large">
                  <Form.Item name="isGroup" valuePropName="checked" noStyle>
                    <Switch 
                      checkedChildren="Group" 
                      unCheckedChildren="Ledger" 
                      onChange={(checked) => setIsGroup(checked)}
                    />
                  </Form.Item>
                  <Tag color={isGroup ? "orange" : "green"}>
                    {isGroup ? "Group Account (can have children)" : "Ledger Account (postable)"}
                  </Tag>
                </Space>
              </Form.Item>
            </Col>
          </Row>

          <Divider style={{ margin: '12px 0' }} />

          {/* GST Section (Only if Ledger - not group) */}
          {!isGroup && (
            <>
              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item label="GST Configuration">
                    <Space>
                      <Switch
                        checked={enableGST}
                        onChange={(checked) => setEnableGST(checked)}
                      />
                      <span style={{ color: "#666" }}>
                        {enableGST ? "GST enabled for this ledger" : "GST not applicable"}
                      </span>
                    </Space>
                  </Form.Item>
                </Col>
              </Row>

              {enableGST && (
                <>
                  <Row gutter={16}>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="gstType"
                        label="GST Type"
                        rules={[{ required: true, message: "Please select GST type" }]}
                      >
                        <Select placeholder="Select GST Type">
                          <Select.OptGroup label="Input GST">
                            <Select.Option value="GST-Input-CGST">
                              CGST (Input)
                            </Select.Option>
                            <Select.Option value="GST-Input-SGST">
                              SGST (Input)
                            </Select.Option>
                            <Select.Option value="GST-Input-IGST">
                              IGST (Input)
                            </Select.Option>
                          </Select.OptGroup>
                          <Select.OptGroup label="Output GST">
                            <Select.Option value="GST-Output-CGST">
                              CGST (Output)
                            </Select.Option>
                            <Select.Option value="GST-Output-SGST">
                              SGST (Output)
                            </Select.Option>
                            <Select.Option value="GST-Output-IGST">
                              IGST (Output)
                            </Select.Option>
                          </Select.OptGroup>
                        </Select>
                      </Form.Item>
                    </Col>

                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="gstRate"
                        label="GST Rate (%)"
                        rules={[{ required: true, message: "Please enter GST rate" }]}
                      >
                        <Select placeholder="Select GST rate">
                          <Select.Option value={0}>0% (Exempted)</Select.Option>
                          <Select.Option value={5}>5%</Select.Option>
                          <Select.Option value={12}>12%</Select.Option>
                          <Select.Option value={18}>18%</Select.Option>
                          <Select.Option value={28}>28%</Select.Option>
                          <Select.Option value="custom">Custom Rate</Select.Option>
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>

                  {/* Custom rate input if "Custom Rate" is selected */}
                  <Form.Item noStyle shouldUpdate>
                    {({ getFieldValue }) => 
                      getFieldValue('gstRate') === 'custom' && (
                        <Row gutter={16}>
                          <Col span={24}>
                            <Form.Item
                              name="customGstRate"
                              label="Custom GST Rate"
                              rules={[{ required: true, message: "Please enter custom rate" }]}
                            >
                              <InputNumber
                                min={0}
                                max={100}
                                style={{ width: "100%" }}
                                placeholder="Enter custom rate"
                                formatter={(value) => `${value}%`}
                                parser={(value) => value.replace("%", "")}
                              />
                            </Form.Item>
                          </Col>
                        </Row>
                      )
                    }
                  </Form.Item>
                </>
              )}
            </>
          )}
        </Form>
      </Modal>
    </>
  );
};

export default ChartOfAccountsModal;