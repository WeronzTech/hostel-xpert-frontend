import {Card, List, Space, Typography, Avatar} from "antd";
import {BookOutlined} from "@ant-design/icons";

const {Text} = Typography;

const RecentJournalEntries = ({entries, loading, handleClick}) => {
  // Function to get color based on referenceType
  const getEntryConfig = (referenceType) => {
    const config = {
      Payments: {
        color: "#f6ffed", // light green
        bgColor: "#52c41a", // green
        type: "credit",
      },
      Deposits: {
        color: "#f6ffed",
        bgColor: "#73d13d", // softer green (distinct)
        type: "credit",
      },
      BusPayments: {
        color: "#e6fffb",
        bgColor: "#13c2c2", // teal (incoming business)
        type: "credit",
      },

      Asset: {
        color: "#e6f7ff",
        bgColor: "#1890ff", // strong blue (long-term value)
        type: "credit",
      },
      Inventory: {
        color: "#f0f5ff",
        bgColor: "#597ef7", // indigo (stock / goods)
        type: "credit",
      },

      Expense: {
        color: "#fff2f0",
        bgColor: "#ff4d4f", // red (cash out)
        type: "debit",
      },
      Commission: {
        color: "#fff7e6",
        bgColor: "#fa8c16", // orange (fees)
        type: "debit",
      },
      Salary: {
        color: "#f9f0ff",
        bgColor: "#722ed1", // purple (payroll)
        type: "debit",
      },
      Rent: {
        color: "#f0f5ff",
        bgColor: "#2f54eb", // deep blue (fixed cost)
        type: "debit",
      },

      default: {
        color: "#fafafa",
        bgColor: "#8c8c8c", // neutral gray
        type: "neutral",
      },
    };

    return config[referenceType] || config.default;
  };

  // Get first letter of reference type
  const getFirstLetter = (referenceType) => {
    if (!referenceType) return "J";
    return referenceType.charAt(0).toUpperCase();
  };

  // Calculate total amount for the entry
  const getEntryAmount = (entry) => {
    const totalDebit =
      entry.transactions?.reduce((sum, t) => sum + (t.debit || 0), 0) || 0;
    const totalCredit =
      entry.transactions?.reduce((sum, t) => sum + (t.credit || 0), 0) || 0;

    const config = getEntryConfig(entry.referenceType);

    if (config.type === "credit") {
      return totalCredit;
    } else {
      return totalDebit;
    }
  };

  // Format date like "2 November"
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getDate()} ${date.toLocaleString("default", {
      month: "long",
    })}`;
  };

  // Handle click on list item
  const handleItemClick = (entry) => {
    if (handleClick) {
      handleClick(entry._id); // Pass the entry ID to parent component
    }
  };

  return (
    <Card
      title={
        <Space>
          <BookOutlined />
          Recent Journal Entries
        </Space>
      }
      style={{
        borderRadius: "8px",
        boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
        height: "100%",
      }}
    >
      <List
        loading={loading}
        dataSource={entries?.slice(0, 4)}
        renderItem={(entry) => {
          const config = getEntryConfig(entry.referenceType);
          const amount = getEntryAmount(entry);
          const isFeePayment =
            entry.referenceType === "Payments" ||
            entry.referenceType === "Deposits";

          return (
            <List.Item>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  width: "100%",
                  cursor: "pointer",
                  padding: "8px",
                  borderRadius: "6px",
                  transition: "all 0.2s ease",
                }}
                onClick={() => handleItemClick(entry)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#f5f5f5";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                {/* Left: Avatar with first letter */}
                <Avatar
                  size={40}
                  style={{
                    backgroundColor: config.bgColor,
                    color: config.color,
                    fontSize: "16px",
                    fontWeight: "bold",
                    marginRight: "12px",
                  }}
                >
                  {getFirstLetter(entry.referenceType)}
                </Avatar>

                {/* Center: Reference Type and Date */}
                <div style={{flex: 1}}>
                  <div style={{fontWeight: "500", fontSize: "14px"}}>
                    {entry.referenceType === "Payments"
                      ? "Fee Payment"
                      : entry.referenceType === "Deposits"
                      ? "Deposit Payment"
                      : entry.referenceType}
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#8c8c8c",
                      marginTop: "2px",
                    }}
                  >
                    {formatDate(entry.date)}
                  </div>
                </div>

                {/* Right: Amount */}
                <div style={{textAlign: "right"}}>
                  <div
                    style={{
                      fontWeight: "600",
                      fontSize: "14px",
                      color: isFeePayment ? "#52c41a" : "#595959",
                    }}
                  >
                    {isFeePayment ? "+ " : ""}₹{amount.toLocaleString("en-IN")}
                  </div>
                  <Text type="secondary" style={{fontSize: "10px"}}>
                    {entry.transactions?.length || 0} entries
                  </Text>
                </div>
              </div>
            </List.Item>
          );
        }}
      />
    </Card>
  );
};

export default RecentJournalEntries;
