import {Table, Tag, Space, Typography, Badge} from "antd";
import {useState, useEffect} from "react";
import dayjs from "dayjs";

const {Text} = Typography;

const LedgerTable = ({data, loading, ledgerInfo, onRowClick, pagination}) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Handle resize for responsive
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getBalanceTypeColor = (type) => {
    return type === "Dr" ? "#ff4d4f" : "#52c41a";
  };

  const columns = [
    {
      title: "#",
      key: "serial",
      align: "center",
      width: 60,
      render: (text, record, index) => {
        // Use pagination from props if available
        const current = pagination?.current || 1;
        const pageSize = pagination?.pageSize || 15;
        return (current - 1) * pageSize + index + 1;
      },
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      width: 100,
      sorter: (a, b) => dayjs(a.date).unix() - dayjs(b.date).unix(),
      sortDirections: ["ascend", "descend"],
      render: (date) => <Text strong>{dayjs(date).format("DD/MM/YYYY")}</Text>,
    },
    {
      title: "Transaction Type",
      dataIndex: "voucherType",
      key: "voucherType",
      width: 140,
      render: (type) => <Tag color="purple">{type}</Tag>,
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (text) => (
        <div>
          <Text>{text}</Text>
        </div>
      ),
    },
    {
      title: "Debit",
      dataIndex: "debit",
      key: "debit",
      align: "right",
      width: 120,
      sorter: (a, b) => a.debit - b.debit,
      render: (amount) =>
        amount > 0 ? (
          <Text strong style={{color: "#ff4d4f"}}>
            ₹ {amount.toLocaleString("en-IN", {minimumFractionDigits: 2})}
          </Text>
        ) : (
          <Text type="secondary">—</Text>
        ),
    },
    {
      title: "Credit",
      dataIndex: "credit",
      key: "credit",
      align: "right",
      width: 120,
      sorter: (a, b) => a.credit - b.credit,
      render: (amount) =>
        amount > 0 ? (
          <Text strong style={{color: "#52c41a"}}>
            ₹ {amount.toLocaleString("en-IN", {minimumFractionDigits: 2})}
          </Text>
        ) : (
          <Text type="secondary">—</Text>
        ),
    },
    {
      title: "Balance",
      key: "balance",
      align: "right",
      width: 150,
      sorter: (a, b) => a.runningBalance?.amount - b.runningBalance?.amount,
      render: (_, record) => (
        <Badge
          color={getBalanceTypeColor(record.runningBalance?.type)}
          text={
            <Text strong>
              ₹{" "}
              {record.runningBalance?.amount?.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
              })}
              <Text type="secondary" style={{marginLeft: 4}}>
                {record.runningBalance?.type}
              </Text>
            </Text>
          }
        />
      ),
    },
  ];

  // Professional compact mobile columns
  const mobileColumns = [
    {
      title: "Transaction",
      key: "transaction",
      render: (_, record, index) => {
        const current = pagination?.current || 1;
        const pageSize = pagination?.pageSize || 15;
        const serialNo = (current - 1) * pageSize + index + 1;

        return (
          <div style={{padding: "12px 0"}}>
            {/* Header Row with Serial Number */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <Space size={8} align="center">
                <Badge
                  count={serialNo}
                  style={{
                    backgroundColor: "#1890ff",
                    color: "white",
                    fontSize: 11,
                  }}
                />
                <div
                  style={{
                    background: "#f0f5ff",
                    padding: "4px 8px",
                    borderRadius: 4,
                    borderLeft: "3px solid #1890ff",
                  }}
                >
                  <Text strong style={{fontSize: 14}}>
                    {dayjs(record.date).format("DD/MM/YYYY")}
                  </Text>
                </div>
              </Space>

              <Tag color="geekblue" style={{borderRadius: 12}}>
                {record.voucherType}
              </Tag>
            </div>

            {/* Description */}
            <Text
              style={{
                fontSize: 15,
                fontWeight: 500,
                display: "block",
                marginBottom: 8,
                color: "#1f1f1f",
              }}
            >
              {record.description}
            </Text>

            {/* Amount Row */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "#fafafa",
                padding: "8px 12px",
                borderRadius: 6,
                marginBottom: 8,
              }}
            >
              <div style={{flex: 1}}>
                {record.debit > 0 && (
                  <div>
                    <Text type="secondary" style={{fontSize: 11}}>
                      DEBIT
                    </Text>
                    <div
                      style={{color: "#cf1322", fontWeight: 600, fontSize: 16}}
                    >
                      ₹ {record.debit.toLocaleString("en-IN")}
                    </div>
                  </div>
                )}
                {record.credit > 0 && (
                  <div>
                    <Text type="secondary" style={{fontSize: 11}}>
                      CREDIT
                    </Text>
                    <div
                      style={{color: "#389e0d", fontWeight: 600, fontSize: 16}}
                    >
                      ₹ {record.credit.toLocaleString("en-IN")}
                    </div>
                  </div>
                )}
              </div>

              <div style={{textAlign: "right"}}>
                <Text type="secondary" style={{fontSize: 11}}>
                  BALANCE
                </Text>
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: 15,
                    color:
                      record.runningBalance?.type === "Dr"
                        ? "#cf1322"
                        : "#389e0d",
                  }}
                >
                  {record.runningBalance?.type}{" "}
                  {record.runningBalance?.amount?.toLocaleString("en-IN")}
                </div>
              </div>
            </div>
          </div>
        );
      },
    },
  ];

  return (
    <div>
      {/* Header Summary */}
      {ledgerInfo && (
        <>
          {/* Desktop View */}
          <div
            className="desktop-summary"
            style={{
              padding: "8px 12px",
              background: "#f8f9fa",
              borderBottom: "1px solid #f0f0f0",
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 16,
            }}
          >
            {/* Opening Balance - Left */}
            <div style={{minWidth: 120}}>
              <Text type="secondary" style={{fontSize: 12}}>
                OPENING BALANCE
              </Text>
              <div>
                <Text
                  strong
                  style={{
                    color: getBalanceTypeColor(ledgerInfo.openingBalance?.type),
                    fontSize: 16,
                  }}
                >
                  ₹ {ledgerInfo.openingBalance?.amount?.toLocaleString("en-IN")}{" "}
                  {ledgerInfo.openingBalance?.type}
                </Text>
              </div>
            </div>

            {/* Center section - Debits and Credits */}
            <div
              style={{
                display: "flex",
                gap: 24,
                flexWrap: "wrap",
                justifyContent: "center",
                flex: 1,
              }}
            >
              <div>
                <Text type="secondary" style={{fontSize: 12}}>
                  TOTAL DEBITS
                </Text>
                <div>
                  <Text strong style={{color: "#ff4d4f", fontSize: 16}}>
                    ₹ {ledgerInfo.totals?.totalDebit?.toLocaleString("en-IN")}
                  </Text>
                </div>
              </div>
              <div>
                <Text type="secondary" style={{fontSize: 12}}>
                  TOTAL CREDITS
                </Text>
                <div>
                  <Text strong style={{color: "#52c41a", fontSize: 16}}>
                    ₹ {ledgerInfo.totals?.totalCredit?.toLocaleString("en-IN")}
                  </Text>
                </div>
              </div>
            </div>

            {/* Closing Balance - Right */}
            <div style={{minWidth: 120, textAlign: "right"}}>
              <Text type="secondary" style={{fontSize: 12}}>
                CLOSING BALANCE
              </Text>
              <div>
                <Text
                  strong
                  style={{
                    color: getBalanceTypeColor(ledgerInfo.closingBalance?.type),
                    fontSize: 16,
                  }}
                >
                  ₹ {ledgerInfo.closingBalance?.amount?.toLocaleString("en-IN")}{" "}
                  {ledgerInfo.closingBalance?.type}
                </Text>
              </div>
            </div>
          </div>

          {/* Mobile View */}
          <div
            className="mobile-summary"
            style={{
              padding: "16px",
              background: "#f8f9fa",
              borderBottom: "1px solid #f0f0f0",
              display: "none", // Hidden by default, shown via media query
            }}
          >
            {/* Opening & Closing Balance Row */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 16,
                paddingBottom: 12,
                borderBottom: "1px dashed #d9d9d9",
              }}
            >
              <div>
                <Text type="secondary" style={{fontSize: 11}}>
                  OPENING BALANCE
                </Text>
                <div>
                  <Text
                    strong
                    style={{
                      color: getBalanceTypeColor(
                        ledgerInfo.openingBalance?.type,
                      ),
                      fontSize: 15,
                    }}
                  >
                    ₹{" "}
                    {ledgerInfo.openingBalance?.amount?.toLocaleString("en-IN")}
                  </Text>
                  <Text
                    style={{
                      marginLeft: 4,
                      fontSize: 12,
                      color: getBalanceTypeColor(
                        ledgerInfo.openingBalance?.type,
                      ),
                    }}
                  >
                    {ledgerInfo.openingBalance?.type}
                  </Text>
                </div>
              </div>
              <div style={{textAlign: "right"}}>
                <Text type="secondary" style={{fontSize: 11}}>
                  CLOSING BALANCE
                </Text>
                <div>
                  <Text
                    strong
                    style={{
                      color: getBalanceTypeColor(
                        ledgerInfo.closingBalance?.type,
                      ),
                      fontSize: 15,
                    }}
                  >
                    ₹{" "}
                    {ledgerInfo.closingBalance?.amount?.toLocaleString("en-IN")}
                  </Text>
                  <Text
                    style={{
                      marginLeft: 4,
                      fontSize: 12,
                      color: getBalanceTypeColor(
                        ledgerInfo.closingBalance?.type,
                      ),
                    }}
                  >
                    {ledgerInfo.closingBalance?.type}
                  </Text>
                </div>
              </div>
            </div>

            {/* Debits & Credits Row */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-around",
              }}
            >
              <div style={{textAlign: "center"}}>
                <Text type="secondary" style={{fontSize: 11}}>
                  TOTAL DEBITS
                </Text>
                <div>
                  <Text strong style={{color: "#ff4d4f", fontSize: 15}}>
                    ₹ {ledgerInfo.totals?.totalDebit?.toLocaleString("en-IN")}
                  </Text>
                </div>
              </div>
              <div style={{textAlign: "center"}}>
                <Text type="secondary" style={{fontSize: 11}}>
                  TOTAL CREDITS
                </Text>
                <div>
                  <Text strong style={{color: "#52c41a", fontSize: 15}}>
                    ₹ {ledgerInfo.totals?.totalCredit?.toLocaleString("en-IN")}
                  </Text>
                </div>
              </div>
            </div>
          </div>

          {/* Media Query for Mobile */}
          <style>{`
            @media (max-width: 768px) {
              .desktop-summary {
                display: none !important;
              }
              .mobile-summary {
                display: block !important;
              }
            }
          `}</style>
        </>
      )}

      {/* Table */}
      <Table
        columns={isMobile ? mobileColumns : columns}
        dataSource={data}
        loading={loading}
        rowKey="journalEntryId"
        pagination={
          pagination
            ? {
                ...pagination,
                showSizeChanger: !isMobile,
                showQuickJumper: !isMobile,
                size: isMobile ? "small" : "default",
              }
            : false
        }
        size={isMobile ? "small" : "middle"}
        scroll={{x: isMobile ? "100%" : 1200}}
        onRow={(record) => ({
          onClick: () => onRowClick(record),
          style: {cursor: "pointer"},
        })}
      />
    </div>
  );
};

export default LedgerTable;
