import {useState, useEffect} from "react";
import {
  Row,
  Col,
  Card,
  DatePicker,
  Select,
  Input,
  Space,
  Typography,
  Tag,
  Menu,
  Dropdown,
  Button,
  message,
} from "antd";
import {useQuery, useMutation} from "@tanstack/react-query"; // Add useMutation
import {useSelector} from "react-redux";
import {PageHeader} from "../../components";
import {
  getAccounts,
  getJournalEntries,
  getTransactionDetails,
  exportLedger, // Import the export function
} from "../../hooks/accounts/useAccounts";
import LedgerTable from "../../components/accounts/LedgerTable";
import dayjs from "dayjs";
import TransactionDetailModal from "../../modals/accounts/TransactionDetailModal";
import usePersistentState from "../../hooks/usePersistentState";
import {
  DownloadOutlined,
  FileExcelOutlined,
  FileOutlined,
  FilePdfOutlined,
} from "@ant-design/icons";
import {useParams} from "react-router-dom";

const {RangePicker} = DatePicker;
const {Option} = Select;
const {Search} = Input;
const {Text, Title} = Typography;

const GeneralLedger = () => {
  const {selectedProperty} = useSelector((state) => state.properties);
  const {selectedKitchen} = useSelector((state) => state.kitchens);
  const {entityType} = useParams();

  // Use persistent state for filters AND pagination
  const [filters, setFilters] = usePersistentState("generalLedgerFilters", {
    dateRange: [
      dayjs().startOf("month").toISOString(),
      dayjs().endOf("day").toISOString(),
    ],
    accountId: null,
    search: "",
    entityId: null,
    entityType: "",
    type: "",
    // Add pagination to persistent state with default values
    pagination: {
      current: 1,
      pageSize: 10, // Default to 10
    },
  });

  const [selectedAccount, setSelectedAccount] = useState(null);
  const [selectedTransactionId, setSelectedTransactionId] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Track if filters have been loaded from persistent storage
  useEffect(() => {
    // This runs after filters are loaded from persistent storage
    if (filters) {
      setIsInitialized(true);
    }
  }, [filters]);

  // Fetch chart of accounts for filter dropdown - FILTER TO ONLY LEDGER ACCOUNTS
  const {data: accounts, isLoading: accountsLoading} = useQuery({
    queryKey: ["c-o-accounts"],
    queryFn: () => getAccounts(),
    refetchOnWindowFocus: false,
  });

  const accountsData = accounts?.data?.filter((acc) => !acc.isGroup) || [];

  // Prepare query parameters with proper date formatting
  const getQueryParams = () => {
    // Check if dateRange exists and has both values
    if (!filters.dateRange?.[0] || !filters.dateRange?.[1]) {
      return null;
    }

    return {
      accountId: filters.accountId,
      fromDate: dayjs(filters.dateRange[0]).format("YYYY-MM-DD"),
      toDate: dayjs(filters.dateRange[1]).format("YYYY-MM-DD"),
      entityType,
      entityId:
        entityType === "PROPERTY"
          ? selectedProperty?.id
          : entityType === "KITCHEN"
            ? selectedKitchen?.id
            : undefined,
      search: filters.search,
      type: filters.type,
      // Add pagination parameters to API call
      page: filters.pagination?.current || 1,
      limit: filters.pagination?.pageSize || 10,
    };
  };

  // Fetch ledger data based on filters
  const {data: ledgerResponse, isLoading: ledgerLoading} = useQuery({
    queryKey: [
      "ledger",
      {
        entityType,
        entityId:
          entityType === "PROPERTY"
            ? selectedProperty?.id
            : entityType === "KITCHEN"
              ? selectedKitchen?.id
              : undefined,
        accountId: filters.accountId,
        search: filters.search,
        type: filters.type,
        fromDate: filters.dateRange?.[0]
          ? dayjs(filters.dateRange[0]).format("YYYY-MM-DD")
          : undefined,
        toDate: filters.dateRange?.[1]
          ? dayjs(filters.dateRange[1]).format("YYYY-MM-DD")
          : undefined,
        page: filters.pagination?.current,
        pageSize: filters.pagination?.pageSize,
      },
    ],
    queryFn: () => {
      const params = getQueryParams();
      console.log("Fetching with params:", params); // Debug log
      if (!params) return Promise.resolve(null);
      return getJournalEntries(params);
    },
    enabled:
      isInitialized && // Wait for filters to load from persistence
      !!filters.accountId &&
      !!filters.dateRange?.[0] &&
      !!filters.dateRange?.[1] &&
      !!(selectedProperty?.id || selectedKitchen?.id),
    refetchOnWindowFocus: false,
  });

  const ledgerData = ledgerResponse?.data;

  // Update filters when property changes
  useEffect(() => {
    const newPropertyId = selectedProperty?.id || "all";

    // Only update if property has actually changed
    if (filters.propertyId !== newPropertyId) {
      setFilters((prev) => ({
        ...prev,
        propertyId: newPropertyId,
        // Reset pagination when property changes
        pagination: {
          ...prev.pagination,
          current: 1,
        },
      }));
      setSelectedAccount(null);
    }
  }, [selectedProperty, filters.propertyId, setFilters]);

  // Reset pagination when account filter changes
  useEffect(() => {
    if (filters.accountId) {
      setFilters((prev) => ({
        ...prev,
        pagination: {
          ...prev.pagination,
          current: 1,
          // Preserve the pageSize
          pageSize: prev.pagination?.pageSize || 10,
        },
      }));
    }
  }, [filters.accountId, setFilters]);

  // Update selected account when account filter changes
  useEffect(() => {
    if (filters.accountId && filters.accountId !== "all" && accountsData) {
      const account = accountsData.find((acc) => acc._id === filters.accountId);
      setSelectedAccount(account);
    } else {
      setSelectedAccount(null);
    }
  }, [filters.accountId, accountsData]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({...prev, [key]: value}));
  };

  // Handle pagination change
  const handlePaginationChange = (page, pageSize) => {
    console.log("Pagination changed:", page, pageSize); // Debug log
    setFilters((prev) => ({
      ...prev,
      pagination: {
        current: page,
        pageSize: pageSize, // Use the new pageSize
      },
    }));
  };

  const {data: transactionDetails, isLoading: detailsLoading} = useQuery({
    queryKey: ["transactionDetails", selectedTransactionId],
    queryFn: () => getTransactionDetails(selectedTransactionId),
    enabled: !!selectedTransactionId,
  });

  const handleRowClick = (record) => {
    setSelectedTransactionId(record.journalEntryId);
    setIsDetailModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsDetailModalOpen(false);
    setSelectedTransactionId(null);
  };

  // Debug: Log current pagination state
  useEffect(() => {
    console.log("Current pagination state:", filters.pagination);
  }, [filters.pagination]);

  // ========== EXPORT MUTATION ==========
  const downloadFile = (response, format) => {
    // Get the blob from response
    const blob = new Blob([response.data], {
      type: response.headers["content-type"],
    });

    // Create download link
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;

    // Get filename from Content-Disposition header
    const contentDisposition = response.headers["content-disposition"];
    let filename = `general-ledger-${dayjs().format("YYYYMMDD-HHmmss")}.${format}`;

    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(
        /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/,
      );
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1].replace(/['"]/g, "");
      }
    }

    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const exportMutation = useMutation({
    mutationFn: ({format, params}) => exportLedger(format, params),
    onMutate: () => {
      message.loading({
        content: "Preparing export...",
        key: "export",
        duration: 0,
      });
    },
    onSuccess: (response, {format}) => {
      downloadFile(response, format);
      message.success({
        content: `${format.toUpperCase()} exported successfully!`,
        key: "export",
        duration: 3,
      });
    },
    onError: (error) => {
      console.error("Export error:", error);
      message.error({
        content: error.message || "Failed to export. Please try again.",
        key: "export",
        duration: 3,
      });
    },
  });

  const handleDownload = (format) => {
    if (!filters.accountId) {
      message.warning("Please select an account to export");
      return;
    }

    if (!filters.dateRange?.[0] || !filters.dateRange?.[1]) {
      message.warning("Please select a date range");
      return;
    }

    const params = {
      accountId: filters.accountId,
      fromDate: dayjs(filters.dateRange[0]).format("YYYY-MM-DD"),
      toDate: dayjs(filters.dateRange[1]).format("YYYY-MM-DD"),
      entityType,
      entityId:
        entityType === "PROPERTY"
          ? selectedProperty?.id
          : entityType === "KITCHEN"
            ? selectedKitchen?.id
            : undefined,
      search: filters.search,
      type: filters.type,
    };

    // Direct mutation call
    exportMutation.mutate({format, params});
  };

  const downloadMenu = (
    <Menu>
      <Menu.Item
        key="excel"
        icon={<FileExcelOutlined style={{color: "#52c41a"}} />}
        onClick={() => handleDownload("excel")}
        disabled={exportMutation.isLoading}
      >
        Export as Excel
      </Menu.Item>
      <Menu.Item
        key="pdf"
        icon={<FilePdfOutlined style={{color: "#ff4d4f"}} />}
        onClick={() => handleDownload("pdf")}
        disabled={exportMutation.isLoading}
      >
        Export as PDF
      </Menu.Item>
    </Menu>
  );

  return (
    <div className="min-h-screen bg-gray-50 px-4 pt-4 pb-8 xl:px-12 lg:px-6">
      <PageHeader
        title="General Ledger"
        subtitle="Complete Financial Transaction Records"
      />
      {/* Filters Section */}
      <Card
        style={{
          borderRadius: "12px",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
          marginBottom: "24px",
        }}
      >
        <Row gutter={[16, 16]} align="middle">
          {/* Left Side - Search */}
          <Col xs={24} md={8} lg={6}>
            <Search
              placeholder="Search description/amount ..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              allowClear
              size="middle"
            />
          </Col>

          {/* Right Side - Filters */}
          <Col xs={24} md={16} lg={18}>
            <Row gutter={[16, 16]} justify="end">
              <Col xs={24} sm={8} md={8} lg={6}>
                <Select
                  style={{width: "100%"}}
                  value={filters.accountId}
                  onChange={(value) => handleFilterChange("accountId", value)}
                  loading={accountsLoading}
                  placeholder="Select ledger account"
                  allowClear
                  size="middle"
                  showSearch
                  optionFilterProp="children"
                >
                  {accountsData?.map((account) => (
                    <Option key={account._id} value={account._id}>
                      <Space>
                        <FileOutlined style={{color: "#52c41a"}} />
                        {account.name}
                        <Tag color="blue" style={{marginLeft: 8}}>
                          {account.accountType}
                        </Tag>
                      </Space>
                    </Option>
                  ))}
                </Select>
              </Col>

              <Col xs={24} sm={8} md={8} lg={6}>
                <Select
                  style={{width: "100%"}}
                  value={filters.type}
                  onChange={(value) => handleFilterChange("type", value)}
                  placeholder="Select Transaction Type"
                  allowClear
                  size="middle"
                  showSearch
                  options={accounts?.referenceTypes?.map((type) => ({
                    label: type,
                    value: type,
                  }))}
                />
              </Col>

              <Col xs={24} sm={8} md={8} lg={8}>
                <Space style={{width: "100%"}}>
                  <RangePicker
                    style={{width: "100%"}}
                    value={
                      filters.dateRange
                        ? [
                            dayjs(filters.dateRange[0]),
                            dayjs(filters.dateRange[1]),
                          ]
                        : null
                    }
                    onChange={(dates) => {
                      if (dates && dates.length === 2) {
                        const [start, end] = dates;
                        handleFilterChange("dateRange", [
                          start.startOf("day").toISOString(),
                          end.endOf("day").toISOString(),
                        ]);
                      } else {
                        handleFilterChange("dateRange", null);
                      }
                    }}
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
                      loading={exportMutation.isLoading}
                    ></Button>
                  </Dropdown>
                </Space>
              </Col>
            </Row>
          </Col>
        </Row>
      </Card>

      {/* Ledger Table */}
      <Card
        style={{
          borderRadius: "12px",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
        }}
        bodyStyle={{padding: 0}}
      >
        {!filters.accountId ? (
          <div
            style={{
              padding: "48px 24px",
              textAlign: "center",
              background: "#fafafa",
              borderRadius: "12px",
            }}
          >
            <FileOutlined
              style={{fontSize: 48, color: "#bfbfbf", marginBottom: 16}}
            />
            <Title level={4} style={{color: "#595959", marginBottom: 8}}>
              Select an Account
            </Title>
            <Text type="secondary">
              Please select a ledger account from the filter above to view
              transactions
            </Text>
          </div>
        ) : (
          <LedgerTable
            data={ledgerData?.transactions || []}
            loading={ledgerLoading}
            account={selectedAccount}
            ledgerInfo={ledgerData}
            onRowClick={handleRowClick}
            pagination={{
              current: filters.pagination?.current || 1,
              pageSize: filters.pagination?.pageSize || 10,
              total: ledgerData?.pagination?.total || 0,
              showSizeChanger: true,
              pageSizeOptions: ["10", "20", "50", "100"],
              onChange: handlePaginationChange,
              // Add this to force update when pageSize changes
              key: `pagination-${filters.pagination?.pageSize}`,
            }}
          />
        )}
      </Card>

      <TransactionDetailModal
        open={isDetailModalOpen}
        onClose={handleCloseModal}
        transaction={transactionDetails}
        loading={detailsLoading}
      />
    </div>
  );
};

export default GeneralLedger;
