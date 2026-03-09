import {useState} from "react";
import {Row, Col, Card, Button, message, Dropdown, Space} from "antd";
import {
  ReconciliationOutlined,
  PlusCircleOutlined,
  FileAddOutlined,
  SettingOutlined,
  FileTextOutlined,
  DownOutlined,
  HomeOutlined,
  ShopOutlined,
} from "@ant-design/icons";
import {useQuery, useQueryClient} from "@tanstack/react-query";
import ChartOfAccountsModal from "../../modals/accounts/ChartOfAccountsModal";
import JournalEntryModal from "../../modals/accounts/JournalEntryModal";
import AccountsList from "../../components/accounts/AccountsList";
import {PageHeader} from "../../components";
import {
  getAccounts,
  getSystemNames,
  getTransactionDetails,
} from "../../hooks/accounts/useAccounts";
import {useNavigate} from "react-router-dom";
import TransactionDetailModal from "../../modals/accounts/TransactionDetailModal";
import AccountSettingsModal from "../../modals/accounts/AccountSettingsModal";
import AccountsHierarchy from "../../components/accounts/AccountsHierarchy ";

const AccountingDashboard = () => {
  const [showJournalEntryModal, setShowJournalEntryModal] = useState(false);
  const [showChartOfAccountModal, setShowChartOfAccountModal] = useState(false);
  const [showAccountSettingsModal, setShowAccountSettingsModal] =
    useState(false);
  const [selectedTransactionId, setSelectedTransactionId] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch accounts from API
  const {data: accountsData, isLoading: accountsLoading} = useQuery({
    queryKey: ["c-o-accounts"],
    queryFn: () => getAccounts({}),
    refetchOnWindowFocus: false,
  });

  const entityTypes = accountsData?.entityTypes || [];

  const {data: systemNames, isLoading: systemNamesLoading} = useQuery({
    queryKey: ["systemNames"],
    queryFn: () => getSystemNames(),
    refetchOnWindowFocus: false,
  });

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

  const handleCloseModal = () => {
    setIsDetailModalOpen(false);
    setSelectedTransactionId(null);
  };

  const handleGeneralLedgerClick = (entityType) => {
    navigate(`/accounting/generalLedger/${entityType}`);
  };

  const handleFinancialReportsClick = (entityType) => {
    navigate(`/accounting/financial-reports/${entityType}`);
  };

  // Menu items for General Ledger dropdown
  const generalLedgerMenu = {
    items: entityTypes.map((type) => ({
      key: type,
      label: (
        <Space>
          {type === "PROPERTY" ? <HomeOutlined /> : <ShopOutlined />}
          {type.charAt(0) + type.slice(1).toLowerCase()}
        </Space>
      ),
      onClick: () => handleGeneralLedgerClick(type),
    })),
  };

  // Menu items for Trial Balance dropdown
  const financialReportsMenu = {
    items: entityTypes.map((type) => ({
      key: type,
      label: (
        <Space>
          {type === "PROPERTY" ? <HomeOutlined /> : <ShopOutlined />}
          {type.charAt(0) + type.slice(1).toLowerCase()}
        </Space>
      ),
      onClick: () => handleFinancialReportsClick(type),
    })),
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
                  color: "#059669",
                  borderColor: "#059669",
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
                  color: "#059669",
                  borderColor: "#059669",
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
                  color: "#059669",
                  borderColor: "#059669",
                }}
                className="hover-effect-uniform w-full sm:w-auto"
              >
                Account Settings
              </Button>
            </div>

            {/* Right side buttons with dropdowns */}
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 w-full sm:w-auto">
              {/* General Ledger Dropdown */}
              <Dropdown
                menu={generalLedgerMenu}
                trigger={["hover"]}
                placement="bottom"
              >
                <Button
                  icon={<ReconciliationOutlined />}
                  size="large"
                  style={{
                    color: "#059669",
                    borderColor: "#059669",
                  }}
                  className="hover-effect-uniform w-full sm:w-auto"
                >
                  <Space>
                    General Ledger
                    <DownOutlined />
                  </Space>
                </Button>
              </Dropdown>

              {/* Financial Reports Dropdown */}
              <Dropdown
                menu={financialReportsMenu}
                trigger={["hover"]}
                placement="bottom"
              >
                <Button
                  icon={<FileTextOutlined />}
                  size="large"
                  style={{
                    color: "#059669",
                    borderColor: "#059669",
                  }}
                  className="hover-effect-uniform w-full sm:w-auto"
                >
                  <Space>
                    Financial Reports
                    <DownOutlined />
                  </Space>
                </Button>
              </Dropdown>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Two Column Layout */}
      <Row gutter={[16, 16]}>
        {/* Chart of Accounts Section - Left Column */}
        <Col xs={24} lg={14}>
          <Card
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

        {/* Hierarchy View Section - Right Column - Hidden on mobile */}
        <Col xs={0} lg={10}>
          <Card
            style={{
              borderRadius: "8px",
              boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
              height: "100%",
            }}
          >
            <AccountsHierarchy
              accounts={accountsData?.data || []}
              loading={accountsLoading}
            />
          </Card>
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
