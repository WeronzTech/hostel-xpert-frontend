import {useState, useEffect} from "react";
import {Row, Col, Card, DatePicker, Select, Input} from "antd";
import {useQuery} from "@tanstack/react-query";
import {useSelector} from "react-redux";
import {PageHeader} from "../../components";
import {
  getAccounts,
  getJournalEntries,
  getTransactionDetails,
} from "../../hooks/accounts/useAccounts";
import LedgerTable from "../../components/accounts/LedgerTable";
import AccountSummary from "../../components/accounts/AccountSummary";
import dayjs from "dayjs";
import TransactionDetailModal from "../../modals/accounts/TransactionDetailModal";
import usePersistentState from "../../hooks/usePersistentState";

const {RangePicker} = DatePicker;
const {Option} = Select;
const {Search} = Input;

const GeneralLedger = () => {
  const {selectedProperty} = useSelector((state) => state.properties);

  // Use persistent state for filters
  const [filters, setFilters] = usePersistentState("generalLedgerFilters", {
    dateRange: null,
    accountId: null,
    search: "",
    propertyId: "all",
  });

  const [selectedAccount, setSelectedAccount] = useState(null);
  const [selectedTransactionId, setSelectedTransactionId] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Fetch chart of accounts for filter dropdown
  const {data: accountsData, isLoading: accountsLoading} = useQuery({
    queryKey: ["c-o-accounts", selectedProperty?.id],
    queryFn: () => getAccounts(filters),
    refetchOnWindowFocus: false,
  });

  // Fetch ledger data based on filters
  const {data: ledgerData, isLoading: ledgerLoading} = useQuery({
    queryKey: [
      "journalEntries",
      {
        propertyId: filters.propertyId,
        accountId: filters.accountId,
        dateRange: filters.dateRange,
        search: filters.search,
      },
    ],
    queryFn: () => getJournalEntries(filters),
    refetchOnWindowFocus: false,
  });

  // Update filters when property changes
  useEffect(() => {
    const newPropertyId = selectedProperty?.id || "all";

    // Only update if property has actually changed
    if (filters.propertyId !== newPropertyId) {
      setFilters((prev) => ({
        ...prev,
        propertyId: newPropertyId,
        accountId: null, // Reset account when property changes
      }));
      setSelectedAccount(null);
    }
  }, [selectedProperty]);

  // Update selected account when account filter changes
  useEffect(() => {
    if (
      filters.accountId &&
      filters.accountId !== "all" &&
      accountsData?.data
    ) {
      const account = accountsData.data.find(
        (acc) => acc._id === filters.accountId
      );
      setSelectedAccount(account);
    } else {
      setSelectedAccount(null);
    }
  }, [filters.accountId, accountsData]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({...prev, [key]: value}));
  };

  const {data: transactionDetails, isLoading: detailsLoading} = useQuery({
    queryKey: ["transactionDetails", selectedTransactionId],
    queryFn: () => getTransactionDetails(selectedTransactionId),
    enabled: !!selectedTransactionId, // Only fetch when ID is available
  });

  const handleRowClick = (record) => {
    setSelectedTransactionId(record._id);
    setIsDetailModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsDetailModalOpen(false);
    setSelectedTransactionId(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 pt-4 pb-8 xl:px-12 lg:px-6">
      <PageHeader
        title="General Ledger"
        subtitle="Complete Financial Transaction Records"
      />

      {/* Filters Section */}
      <Card
        style={{
          borderRadius: "8px",
          boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
          marginBottom: "24px",
        }}
      >
        <Row gutter={[16, 16]} align="middle" justify="space-between">
          {/* Left Filters */}
          <Col xs={24} md={18}>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={8} md={8}>
                <Search
                  placeholder="Search description/transaction ID..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  onSearch={(value) => handleFilterChange("search", value)}
                  allowClear
                  onClear={() => handleFilterChange("search", "")}
                />
              </Col>

              <Col xs={24} sm={8} md={8}>
                <Select
                  style={{width: "100%"}}
                  value={filters.accountId}
                  onChange={(value) => handleFilterChange("accountId", value)}
                  loading={accountsLoading}
                  placeholder="All Accounts"
                  allowClear
                  onClear={() => handleFilterChange("accountId", null)}
                >
                  <Option value="all">All Accounts</Option>
                  {accountsData?.data?.map((account) => (
                    <Option key={account._id} value={account._id}>
                      {account.name} ({account.accountType})
                    </Option>
                  ))}
                </Select>
              </Col>
              <Col xs={24} sm={8} md={8}>
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
                />
              </Col>
            </Row>
          </Col>
        </Row>
      </Card>

      {/* Account Summary */}
      {selectedAccount && (
        <div style={{marginBottom: "24px"}}>
          <AccountSummary ledgerData={ledgerData} />
        </div>
      )}

      {/* Ledger Table */}
      <Card
        style={{
          borderRadius: "8px",
          boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
        }}
        bodyStyle={{padding: 0}}
      >
        <LedgerTable
          data={ledgerData?.data}
          loading={ledgerLoading}
          account={selectedAccount}
          onRowClick={handleRowClick}
        />
        <TransactionDetailModal
          open={isDetailModalOpen}
          onClose={handleCloseModal}
          transaction={transactionDetails}
          loading={detailsLoading}
        />
      </Card>
    </div>
  );
};

export default GeneralLedger;
