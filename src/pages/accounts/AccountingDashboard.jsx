import {useState} from "react";
import {Row, Col, Card, Button, Select, Space, message} from "antd";
import {
  ReconciliationOutlined,
  PlusCircleOutlined,
  FileAddOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import {useQuery, useQueryClient} from "@tanstack/react-query";
import {useSelector} from "react-redux";
import ChartOfAccountsModal from "../../modals/accounts/ChartOfAccountsModal";
import JournalEntryModal from "../../modals/accounts/JournalEntryModal";
import RecentJournalEntries from "../../components/accounts/RecentJournalEntries";
import AccountsList from "../../components/accounts/AccountsList";
import {PageHeader} from "../../components";
import {
  getAccounts,
  getJournalEntries,
  getSystemNames,
  getTransactionDetails,
} from "../../hooks/accounts/useAccounts";
import {useNavigate} from "react-router-dom";
import TransactionDetailModal from "../../modals/accounts/TransactionDetailModal";
import AccountSettingsModal from "../../modals/accounts/AccountSettingsModal";

const {Option} = Select;

const AccountingDashboard = () => {
  const {selectedProperty} = useSelector((state) => state.properties);
  const [showJournalEntryModal, setShowJournalEntryModal] = useState(false);
  const [showChartOfAccountModal, setShowChartOfAccountModal] = useState(false);
  const [showAccountSettingsModal, setShowAccountSettingsModal] =
    useState(false);
  const [selectedAccountType, setSelectedAccountType] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedTransactionId, setSelectedTransactionId] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch accounts from API
  const {data: accountsData, isLoading: accountsLoading} = useQuery({
    queryKey: [
      "c-o-accounts",
      selectedProperty?.id,
      selectedAccountType,
      selectedCategory,
    ],
    queryFn: () =>
      getAccounts({
        propertyId: selectedProperty?.id,
        accountType:
          selectedAccountType !== "all" ? selectedAccountType : undefined,
        categoryId: selectedCategory !== "all" ? selectedCategory : undefined,
      }),
    refetchOnWindowFocus: false,
  });

  const uniqueCategories =
    accountsData?.data
      ?.filter((acc) => acc.categoryId)
      ?.reduce((acc, current) => {
        const exists = acc.find((c) => c._id === current.categoryId._id);
        if (!exists) acc.push(current.categoryId);
        return acc;
      }, []) || [];

  // Fetch recent journal entries
  const {data: journalEntriesData, isLoading: journalEntriesLoading} = useQuery(
    {
      queryKey: ["journalEntries", selectedProperty?.id],
      queryFn: () => getJournalEntries({propertyId: selectedProperty?.id}),
      refetchOnWindowFocus: false,
    }
  );

  const {data: systemNames, isLoading: systemNamesLoading} = useQuery({
    queryKey: ["systemNames"],
    queryFn: () => getSystemNames(),
    refetchOnWindowFocus: false,
  });

  const accountTypes = ["Asset", "Liability", "Equity", "Income", "Expense"];

  const handleJournalEntrySuccess = () => {
    setShowJournalEntryModal(false);
    message.success("Journal entry created successfully");
    queryClient.invalidateQueries(["recentJournalEntries"]);
    queryClient.invalidateQueries(["chartOfAccounts"]);
  };

  const handleChartOfAccountSuccess = () => {
    setShowChartOfAccountModal(false);
    message.success("Account created successfully");
    queryClient.invalidateQueries(["chartOfAccounts"]);
  };

  const handleAccountSettingsSuccess = () => {
    setShowAccountSettingsModal(false);
  };

  const {data: transactionDetails, isLoading: detailsLoading} = useQuery({
    queryKey: ["transactionDetails", selectedTransactionId],
    queryFn: () => getTransactionDetails(selectedTransactionId),
    enabled: !!selectedTransactionId, // Only fetch when ID is available
  });

  const handleListClick = (id) => {
    setSelectedTransactionId(id);
    setIsDetailModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsDetailModalOpen(false);
    setSelectedTransactionId(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 pt-4 pb-8 xl:px-12 lg:px-6">
      <div>
        <PageHeader
          title="Accountant Dashboard"
          subtitle="Manage and Track All Financial Entries"
        />

        {/* Quick Actions Bar */}
        <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
          <div className="flex flex-wrap justify-between items-center gap-4 sm:gap-0">
            {/* Left side buttons */}
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 w-full sm:w-auto">
              <Button
                icon={<FileAddOutlined />}
                size="large"
                onClick={() => setShowJournalEntryModal(true)}
                style={{
                  color: "#4d44b5",
                  borderColor: "#4d44b5",
                }}
                className="hover-effect-uniform w-full sm:w-auto"
              >
                New Journal Entry
              </Button>

              <Button
                icon={<PlusCircleOutlined />}
                size="large"
                onClick={() => setShowChartOfAccountModal(true)}
                style={{
                  color: "#4d44b5",
                  borderColor: "#4d44b5",
                }}
                className="hover-effect-uniform w-full sm:w-auto"
              >
                Add New Account
              </Button>
              <Button
                icon={<SettingOutlined />}
                size="large"
                onClick={() => setShowAccountSettingsModal(true)}
                style={{
                  color: "#4d44b5",
                  borderColor: "#4d44b5",
                }}
                className="hover-effect-uniform w-full sm:w-auto"
              >
                Account Settings
              </Button>
            </div>

            {/* Right side button */}
            <div className="w-full sm:w-auto  sm:mt-0">
              <Button
                icon={<ReconciliationOutlined />}
                size="large"
                style={{
                  color: "#4d44b5",
                  borderColor: "#4d44b5",
                }}
                className="hover-effect-uniform w-full sm:w-auto"
                onClick={() => navigate("/accounting/generalLedger")}
              >
                View General Ledger
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <Row gutter={[16, 16]}>
        {/* Chart of Accounts Section */}
        <Col xs={24} lg={16}>
          <Card
            title={
              window.innerWidth > 768 ? (
                "Chart of Accounts"
              ) : (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: 8,
                    width: "100%",
                  }}
                >
                  <Select
                    value={selectedAccountType}
                    onChange={setSelectedAccountType}
                    style={{width: 120}}
                    size="small"
                  >
                    <Option value="all">All Types</Option>
                    {accountTypes.map((type) => (
                      <Option key={type} value={type}>
                        {type}
                      </Option>
                    ))}
                  </Select>
                  <Select
                    value={selectedCategory}
                    onChange={setSelectedCategory}
                    style={{width: 140}}
                    size="small"
                    loading={accountsLoading}
                  >
                    <Option value="all">All Categories</Option>
                    {uniqueCategories?.map((category) => (
                      <Option key={category._id} value={category._id}>
                        {category.name}
                      </Option>
                    ))}
                  </Select>
                </div>
              )
            }
            extra={
              window.innerWidth > 768 && (
                <Space>
                  <Select
                    value={selectedAccountType}
                    onChange={setSelectedAccountType}
                    style={{width: 120}}
                    size="small"
                  >
                    <Option value="all">All Types</Option>
                    {accountTypes.map((type) => (
                      <Option key={type} value={type}>
                        {type}
                      </Option>
                    ))}
                  </Select>
                  <Select
                    value={selectedCategory}
                    onChange={setSelectedCategory}
                    style={{width: 140}}
                    size="small"
                    loading={accountsLoading}
                  >
                    <Option value="all">All Categories</Option>
                    {uniqueCategories.map((category) => (
                      <Option key={category._id} value={category._id}>
                        {category.name}
                      </Option>
                    ))}
                  </Select>
                </Space>
              )
            }
            style={{
              borderRadius: "8px",
              boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
            }}
          >
            <AccountsList
              accounts={accountsData?.data || []}
              loading={accountsLoading}
            />
          </Card>
        </Col>

        {/* Recent Journal Entries */}
        <Col xs={24} lg={8}>
          <RecentJournalEntries
            entries={journalEntriesData?.data}
            loading={journalEntriesLoading}
            handleClick={handleListClick}
          />
        </Col>
      </Row>

      {/* Modals */}
      <JournalEntryModal
        isOpen={showJournalEntryModal}
        onClose={() => setShowJournalEntryModal(false)}
        onSuccess={handleJournalEntrySuccess}
        accounts={accountsData?.data}
      />

      <ChartOfAccountsModal
        isOpen={showChartOfAccountModal}
        onClose={() => setShowChartOfAccountModal(false)}
        onSuccess={handleChartOfAccountSuccess}
        // categories={categoriesData}
      />

      <TransactionDetailModal
        open={isDetailModalOpen}
        onClose={handleCloseModal}
        transaction={transactionDetails}
        loading={detailsLoading}
      />

      <AccountSettingsModal
        open={showAccountSettingsModal}
        onClose={() => setShowAccountSettingsModal(false)}
        onSuccess={handleAccountSettingsSuccess}
        systemNames={systemNames?.data}
        accounts={accountsData?.data}
        loading={systemNamesLoading}
      />
    </div>
  );
};

export default AccountingDashboard;
