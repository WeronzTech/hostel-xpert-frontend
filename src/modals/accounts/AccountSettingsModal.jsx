import {
  Modal,
  Select,
  Form,
  message,
  Tabs,
  Table,
  Tag,
  Space,
  Typography,
  Input,
} from "antd";
import {useState, useEffect} from "react";
import {
  setAccountMapping,
  getAccountMappings,
} from "../../hooks/accounts/useAccounts";
import {useMutation, useQuery} from "@tanstack/react-query";
import {SearchOutlined} from "@ant-design/icons";

const {Text} = Typography;
const {Search} = Input;

const AccountSettingsModal = ({
  open,
  onClose,
  onSuccess,
  systemNames,
  accounts,
  loading,
}) => {
  const [selectedSystem, setSelectedSystem] = useState(null);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [activeTab, setActiveTab] = useState("create");
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState(null);

  const [messageApi, contextHolder] = message.useMessage();

  // Query for fetching existing mappings
  const {
    data: existingMappings,
    isLoading: mappingsLoading,
    refetch,
  } = useQuery({
    queryKey: ["accountMappings"],
    queryFn: getAccountMappings,
    enabled: open, // Fetch when modal opens regardless of tab
  });

  const createAccountSettingsMutation = useMutation({
    mutationFn: setAccountMapping,
    onSuccess: (data) => {
      messageApi.success({
        content: `${data.message}`,
        duration: 3,
      });
      refetch(); // Refresh the mappings list
      onSuccess();
      // Switch to view tab after successful creation
      setActiveTab("view");
    },
    onError: (error) => {
      messageApi.error({
        content: `${error.message}`,
        duration: 3,
      });
    },
  });

  // Format system names
  const formattedSystems = systemNames?.map((item) => ({
    label: item.replace(/_/g, " "),
    value: item,
  }));

  // Format accounts
  const formattedAccounts = accounts?.map((acc) => ({
    label: acc.name,
    value: acc._id,
  }));

  useEffect(() => {
    if (!open) {
      setSelectedSystem(null);
      setSelectedAccount(null);
      setActiveTab("create"); // Reset to create tab when modal closes
      setSearchText(""); // Reset search
      setStatusFilter(null); // Reset filter
    }
  }, [open]);

  // Reset form when switching tabs
  useEffect(() => {
    if (activeTab === "create") {
      setSelectedSystem(null);
      setSelectedAccount(null);
    }
  }, [activeTab]);

  const handleSubmit = () => {
    const payload = {
      systemName: selectedSystem,
      accountId: selectedAccount,
    };

    createAccountSettingsMutation.mutate(payload);
  };

  // Prepare data for the mappings table
  const mappingsData = existingMappings?.data?.map((mapping, index) => ({
    key: mapping._id || index,
    systemName: mapping.systemName,
    formattedSystemName: mapping.systemName?.replace(/_/g, " "),
    accountId: mapping.accountId,
    accountName: mapping.accountId?.name || "-",
    accountType: mapping.accountId?.accountType || "N/A",
    description: mapping.description,
    status: mapping.accountId ? "Mapped" : "Not Mapped",
    isMapped: !!mapping.accountId,
    createdAt: mapping.createdAt,
    updatedAt: mapping.updatedAt,
  }));

  // Filter data based on search text and status filter
  const filteredMappingsData = mappingsData?.filter((item) => {
    const matchesSearch =
      item.formattedSystemName
        .toLowerCase()
        .includes(searchText.toLowerCase()) ||
      item.systemName.toLowerCase().includes(searchText.toLowerCase());

    const matchesStatus = statusFilter ? item.status === statusFilter : true;

    return matchesSearch && matchesStatus;
  });

  // Columns for the mappings table
  const mappingsColumns = [
    {
      title: "System Name",
      dataIndex: "formattedSystemName",
      key: "systemName",
      render: (text, record) => (
        <Space direction="vertical" size={0}>
          <Text strong>{text}</Text>
        </Space>
      ),
    },
    {
      title: "Account Name",
      dataIndex: "accountName",
      key: "accountName",
      align: "center",
      render: (accountName, record) => (
        <Space direction="vertical" size={0}>
          <Text strong={record.isMapped}>{accountName}</Text>
          {record.isMapped && (
            <Text type="secondary" style={{fontSize: "12px"}}>
              {record.accountType}
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      align: "center",
      render: (status, record) => (
        <Tag color={record.isMapped ? "green" : "orange"}>{status}</Tag>
      ),
    },
  ];

  const tabItems = [
    {
      key: "create",
      label: "Create Mapping",
      children: (
        <Form layout="vertical">
          {/* System Name Dropdown */}
          <Form.Item label="System Name" required>
            <Select
              placeholder="Select a system"
              options={formattedSystems}
              value={selectedSystem}
              onChange={setSelectedSystem}
              size="large"
              allowClear
              loading={loading}
            />
          </Form.Item>

          {/* Account Dropdown */}
          <Form.Item label="Account" required>
            <Select
              placeholder="Select an account"
              options={formattedAccounts}
              value={selectedAccount}
              onChange={setSelectedAccount}
              size="large"
              allowClear
            />
          </Form.Item>
        </Form>
      ),
    },
    {
      key: "view",
      label: "View Mappings",
      children: (
        <div>
          {/* Search and Filter Section */}
          <div
            style={{
              marginBottom: 16,
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
            }}
          >
            <Search
              placeholder="Search system names..."
              allowClear
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{width: 250}}
              prefix={<SearchOutlined />}
            />
            <Select
              placeholder="Filter by status"
              allowClear
              value={statusFilter}
              onChange={setStatusFilter}
              style={{width: 150}}
              options={[
                {value: "Mapped", label: "Mapped"},
                {value: "Not Mapped", label: "Not Mapped"},
              ]}
            />
            {(searchText || statusFilter) && (
              <Text type="secondary" style={{alignSelf: "center"}}>
                Showing {filteredMappingsData?.length || 0} of{" "}
                {mappingsData?.length || 0} mappings
              </Text>
            )}
          </div>

          <Table
            columns={mappingsColumns}
            dataSource={filteredMappingsData}
            loading={mappingsLoading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} mappings`,
            }}
            size="middle"
            locale={{emptyText: "No account mappings found"}}
          />
        </div>
      ),
    },
  ];

  // Get mapping statistics
  const mappingStats = {
    total: mappingsData?.length || 0,
    mapped: mappingsData?.filter((m) => m.isMapped).length || 0,
    unmapped: mappingsData?.filter((m) => !m.isMapped).length || 0,
  };

  return (
    <>
      {contextHolder}
      <Modal
        title={
          <Space direction="vertical" size={0}>
            <span>Account Settings</span>
            {activeTab === "view" && (
              <Text
                type="secondary"
                style={{fontSize: "12px", fontWeight: "normal"}}
              >
                {mappingStats.mapped} mapped, {mappingStats.unmapped} unmapped
                of {mappingStats.total} systems
              </Text>
            )}
          </Space>
        }
        open={open}
        onCancel={onClose}
        onOk={activeTab === "create" ? handleSubmit : null}
        okText={
          activeTab === "create"
            ? createAccountSettingsMutation.isLoading
              ? "Saving..."
              : "Save"
            : null
        }
        okButtonProps={{
          loading: createAccountSettingsMutation.isLoading,
          disabled:
            activeTab !== "create" || !selectedSystem || !selectedAccount,
        }}
        footer={
          activeTab === "create"
            ? undefined // Let Modal handle default footer for create tab
            : null // No footer for view tab
        }
        centered
        width={800}
        confirmLoading={createAccountSettingsMutation.isLoading}
      >
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
      </Modal>
    </>
  );
};

export default AccountSettingsModal;
