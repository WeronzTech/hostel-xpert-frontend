// modals/accounts/PettyCashTransactionsModal.jsx
import React, {useState} from "react";
import {
  Modal,
  Table,
  Tag,
  DatePicker,
  Input,
  Select,
  Card,
  Statistic,
  Button,
} from "antd";
import {FiFilter, FiDownload} from "react-icons/fi";
import dayjs from "dayjs";
import {useQuery} from "@tanstack/react-query";
import {getPettyCashTransactionsByManagerId} from "../../hooks/accounts/useAccounts";
import ExportButtons from "../../components/common/ExportButtons";
import {downloadFile} from "../../utils/downloadHelper";

const {RangePicker} = DatePicker;
const {Search} = Input;
const {Option} = Select;

const PettyCashTransactionsModal = ({
  visible,
  onCancel,
  managerId,
  managerName,
}) => {
  const [filters, setFilters] = useState({
    dateRange: null,
    paymentMode: null,
    search: "",
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // TanStack Query for fetching transactions
  const {data, isLoading, error} = useQuery({
    queryKey: ["pettyCashTransactions", managerId],
    queryFn: () => getPettyCashTransactionsByManagerId(managerId),
    enabled: !!managerId && visible,
  });

  // Extract data from response
  const transactionsData = data?.data || {};
  const transactions = transactionsData.transactions || [];
  const currentBalance = transactionsData.currentBalance || {};

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({...prev, [key]: value}));
    setPagination((prev) => ({...prev, current: 1}));
  };

  // Reset filters
  const handleResetFilters = () => {
    setFilters({
      dateRange: null,
      paymentMode: null,
      search: "",
    });
    setPagination({
      current: 1,
      pageSize: 10,
      total: 0,
    });
  };

  // Filter transactions based on filters
  const filteredTransactions = transactions.filter((transaction) => {
    // Date range filter
    if (filters.dateRange) {
      const [start, end] = filters.dateRange;
      const transactionDate = dayjs(transaction.date);
      if (transactionDate.isBefore(start) || transactionDate.isAfter(end)) {
        return false;
      }
    }

    // Payment mode filter
    if (
      filters.paymentMode &&
      transaction.paymentMode !== filters.paymentMode
    ) {
      return false;
    }

    // Search filter (transactionId, notes, amount)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        transaction.transactionId?.toLowerCase().includes(searchLower) ||
        transaction.notes?.toLowerCase().includes(searchLower) ||
        String(transaction.inHandAmount + transaction.inAccountAmount).includes(
          searchLower,
        )
      );
    }

    return true;
  });

  const [isExporting, setIsExporting] = useState(false);
  const handleExport = async (format) => {
    try {
      setIsExporting(true);
      const params = { format };
      await downloadFile(
        `/client/pettycash/transaction/export/${managerId}`,
        params,
        `PettyCash_Txns_${managerName}_${dayjs().format("YYYYMMDD")}.${format}`
      );
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return dayjs(dateString).format("DD MMM YYYY");
  };

  // Format amount
  const formatAmount = (amount) => {
    return `₹${Number(amount).toLocaleString("en-IN")}`;
  };

  // Payment mode tag color
  const getPaymentModeColor = (mode) => {
    switch (mode?.toLowerCase()) {
      case "upi":
        return "blue";
      case "cash":
        return "green";
      case "bank":
        return "purple";
      case "card":
        return "orange";
      default:
        return "default";
    }
  };

  // Table columns with S.No
  const columns = [
    {
      title: "S.No",
      key: "serial",
      width: 70,
      align: "center",
      render: (_, __, index) => {
        // Calculate serial number based on pagination
        const {current, pageSize} = pagination;
        return (current - 1) * pageSize + index + 1;
      },
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      sorter: (a, b) => new Date(a.date) - new Date(b.date),
      render: (date) => formatDate(date),
      width: 120,
      align: "center",
    },
    {
      title: "Transaction ID",
      dataIndex: "transactionId",
      key: "transactionId",
      ellipsis: true,
      width: 150,
      align: "center",
    },
    {
      title: "Amount",
      key: "amount",
      render: (record) => {
        const totalAmount = record.inHandAmount + record.inAccountAmount;
        return (
          <div style={{fontWeight: "bold"}}>
            {formatAmount(totalAmount)}
            <div style={{fontSize: "12px", color: "#666"}}>
              {record.inHandAmount > 0 &&
                `Hand: ${formatAmount(record.inHandAmount)} `}
              {record.inAccountAmount > 0 &&
                `Account: ${formatAmount(record.inAccountAmount)}`}
            </div>
          </div>
        );
      },
      width: 150,
      align: "center",
    },
    {
      title: "Balance After",
      key: "balanceAfter",
      render: (record) => {
        const balance = record.balanceAfter;
        if (!balance) return "-";
        return (
          <div>
            <div>
              Total:{" "}
              {formatAmount(
                (balance.inHandAmount || 0) + (balance.inAccountAmount || 0),
              )}
            </div>
            <div style={{fontSize: "12px", color: "#666"}}>
              {balance.inHandAmount > 0 &&
                `Hand: ${formatAmount(balance.inHandAmount)} `}
              {balance.inAccountAmount > 0 &&
                `Account: ${formatAmount(balance.inAccountAmount)}`}
            </div>
          </div>
        );
      },
      width: 150,
      align: "center",
    },
    {
      title: "Payment Mode",
      dataIndex: "paymentMode",
      key: "paymentMode",
      render: (mode) => (
        <Tag
          color={getPaymentModeColor(mode)}
          style={{textTransform: "uppercase"}}
        >
          {mode || "N/A"}
        </Tag>
      ),
      width: 100,
      align: "center",
    },
    {
      title: "Notes",
      dataIndex: "notes",
      key: "notes",
      ellipsis: true,
      width: 200,
      align: "center",
    },
  ];

  // Handle table change
  const handleTableChange = (newPagination) => {
    setPagination(newPagination);
  };

  // Get unique payment modes for filter dropdown
  const uniquePaymentModes = [
    ...new Set(transactions.map((t) => t.paymentMode).filter(Boolean)),
  ];

  return (
    <Modal
      title={
        <div>
          <div style={{fontSize: "18px", fontWeight: "bold"}}>
            Petty Cash Transactions
          </div>
          <div style={{fontSize: "14px", color: "#666", marginTop: "4px"}}>
            Manager: {managerName} | Total Transactions:{" "}
            {transactionsData.count || 0}
          </div>
        </div>
      }
      open={visible}
      onCancel={onCancel}
      width={1300}
      footer={null}
      bodyStyle={{padding: "16px 0"}}
    >
      {/* Current Balance Card */}
      <Card
        size="small"
        style={{marginBottom: "16px", background: "#f0f5ff"}}
        bodyStyle={{padding: "12px 16px"}}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <div style={{fontSize: "14px", color: "#666"}}>Current Balance</div>
            <div style={{display: "flex", gap: "24px", marginTop: "8px"}}>
              <Statistic
                title="In Hand"
                value={currentBalance.inHandAmount || 0}
                prefix="₹"
                valueStyle={{fontSize: "16px", fontWeight: "bold"}}
              />
              <Statistic
                title="In Account"
                value={currentBalance.inAccountAmount || 0}
                prefix="₹"
                valueStyle={{fontSize: "16px", fontWeight: "bold"}}
              />
              <Statistic
                title="Total"
                value={currentBalance.total || 0}
                prefix="₹"
                valueStyle={{
                  fontSize: "18px",
                  fontWeight: "bold",
                  color: "#1890ff",
                }}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Filters */}
      <Card
        size="small"
        style={{marginBottom: "16px"}}
        bodyStyle={{padding: "12px 16px"}}
      >
        <div
          style={{
            display: "flex",
            gap: "12px",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <div style={{display: "flex", alignItems: "center", gap: "8px"}}>
            <FiFilter />
            <span style={{fontWeight: 500}}>Filters:</span>
          </div>

          <RangePicker
            value={filters.dateRange}
            onChange={(dates) => handleFilterChange("dateRange", dates)}
            style={{width: 250}}
            placeholder={["Start Date", "End Date"]}
          />

          <Select
            placeholder="Payment Mode"
            style={{width: 120}}
            value={filters.paymentMode}
            onChange={(value) => handleFilterChange("paymentMode", value)}
            allowClear
            showSearch
            optionFilterProp="children"
          >
            {uniquePaymentModes.map((mode) => (
              <Option key={mode} value={mode}>
                {mode.toUpperCase()}
              </Option>
            ))}
          </Select>

          <Search
            placeholder="Search by ID, notes, amount..."
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            style={{width: 250}}
            allowClear
          />

          <Button onClick={handleResetFilters} size="small">
            Reset Filters
          </Button>
          <ExportButtons onExport={handleExport} isExporting={isExporting} />
        </div>

        {/* Active filters indicator */}
        {(filters.dateRange || filters.paymentMode || filters.search) && (
          <div style={{marginTop: "8px", fontSize: "12px", color: "#666"}}>
            Active filters:
            {filters.dateRange &&
              ` Date Range: ${dayjs(filters.dateRange[0]).format("DD MMM YYYY")} to ${dayjs(filters.dateRange[1]).format("DD MMM YYYY")}`}
            {filters.paymentMode && ` | Payment Mode: ${filters.paymentMode}`}
            {filters.search && ` | Search: "${filters.search}"`}
          </div>
        )}
      </Card>

      {/* Summary Stats */}
      {filteredTransactions.length > 0 && (
        <Card
          size="small"
          style={{marginBottom: "16px", background: "#f6ffed"}}
          bodyStyle={{padding: "8px 16px"}}
        >
          <div style={{display: "flex", gap: "24px", fontSize: "12px"}}>
            <div>
              <span style={{color: "#666"}}>Total In Hand Amount:</span>{" "}
              <span style={{fontWeight: "bold"}}>
                {formatAmount(
                  filteredTransactions.reduce(
                    (sum, t) => sum + (t.inHandAmount || 0),
                    0,
                  ),
                )}
              </span>
            </div>
            <div>
              <span style={{color: "#666"}}>Total In Account Amount:</span>{" "}
              <span style={{fontWeight: "bold"}}>
                {formatAmount(
                  filteredTransactions.reduce(
                    (sum, t) => sum + (t.inAccountAmount || 0),
                    0,
                  ),
                )}
              </span>
            </div>
            <div>
              <span style={{color: "#666"}}>Showing:</span>{" "}
              <span style={{fontWeight: "bold"}}>
                {filteredTransactions.length} of {transactions.length}{" "}
                transactions
              </span>
            </div>
          </div>
        </Card>
      )}

      {/* Transactions Table */}
      <Table
        columns={columns}
        dataSource={filteredTransactions}
        rowKey="id"
        loading={isLoading}
        pagination={{
          ...pagination,
          total: filteredTransactions.length,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `Showing ${range[0]}-${range[1]} of ${total} transactions`,
          position: ["bottomCenter"],
        }}
        onChange={handleTableChange}
        scroll={{x: 1100}}
        size="small"
        bordered
        locale={{
          emptyText: error ? (
            <div style={{padding: "40px 0", color: "#ff4d4f"}}>
              Error loading transactions: {error.message}
            </div>
          ) : (
            <div style={{padding: "40px 0", color: "#666"}}>
              No transactions found
              {transactions.length > 0 && filteredTransactions.length === 0 && (
                <div style={{fontSize: "12px", marginTop: "8px"}}>
                  Try adjusting your filters
                </div>
              )}
            </div>
          ),
        }}
      />
    </Modal>
  );
};

export default PettyCashTransactionsModal;
