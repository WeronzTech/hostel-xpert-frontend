import {Card, List, Row, Col, Button, Typography, Spin, Alert} from "antd";
import {
  FiArrowUpRight,
  FiShoppingBag,
  FiHome,
  FiWifi,
  FiTruck,
  FiCreditCard,
  FiDollarSign,
  FiArrowDownLeft,
} from "react-icons/fi";
import {Link} from "react-router-dom";
import {useQuery} from "@tanstack/react-query";
import {getAllAccountsPayments} from "../../hooks/accounts/useAccounts"; // Adjust import path as needed
import {useMemo} from "react";

const {Title, Text} = Typography;

// Helper function to get friendly date
const getFriendlyDate = (dateStr) => {
  const date = new Date(dateStr);
  const now = new Date();

  const diffTime = now - date;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0 && date.getDate() === now.getDate())
    return `Today, ${date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  if (diffDays <= 1)
    return `Yesterday, ${date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    })}`;

  return (
    date.toLocaleDateString("en-IN", {day: "2-digit", month: "short"}) +
    `, ${date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    })}`
  );
};

// Transform API data into unified transactions (same as in AllTransactionsPage)
const transformApiDataToTransactions = (apiData) => {
  const {payments = [], expenses = [], commissions = []} = apiData;

  const safeString = (val) =>
    typeof val === "string" ? val : JSON.stringify(val || "");

  const paymentTx = payments.map((p) => {
    const dateObj = new Date(p.paymentDate || p.createdAt);
    return {
      id: p._id,
      amount: Number(p.amount) || 0,
      date: dateObj.toISOString(),
      desc: safeString(p.name || "Payment"),
      isPayment: true,
      friendlyDate: getFriendlyDate(dateObj),
    };
  });

  const expenseTx = expenses.map((e) => {
    const dateObj = new Date(e.date || e.createdAt);
    return {
      id: e._id,
      amount: -(Number(e.amount) || 0),
      date: dateObj.toISOString(),
      desc: safeString(e.title || "Expense"),
      isPayment: false,
      friendlyDate: getFriendlyDate(dateObj),
    };
  });

  const commissionTx = commissions.map((c) => {
    const dateObj = new Date(c.date || c.createdAt);
    return {
      id: c._id,
      amount: -(Number(c.amount) || 0),
      date: dateObj.toISOString(),
      desc: safeString(c.agent || c.description || "Commission"),
      isPayment: false,
      friendlyDate: getFriendlyDate(dateObj),
    };
  });

  return [...paymentTx, ...expenseTx, ...commissionTx].sort(
    (a, b) => new Date(b.date) - new Date(a.date),
  );
};

const RecentTransactions = () => {
  const propertyId = localStorage.getItem("propertyId");

  // API call using React Query
  const {
    data: apiData,
    isLoading,
    error,
    isError,
  } = useQuery({
    queryKey: ["recentTransactions", propertyId],
    queryFn: () => getAllAccountsPayments({propertyId}),
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Function to get transaction icon based on type
  const getTransactionIcon = (item) => {
    // Use your existing icon config for specific types
    const desc = item.desc ? item.desc.toLowerCase() : "";

    if (desc.includes("salary")) return <FiDollarSign />;
    if (desc.includes("rent")) return <FiHome />;
    if (desc.includes("shopping")) return <FiShoppingBag />;
    if (desc.includes("bill") || desc.includes("wifi")) return <FiWifi />;
    if (desc.includes("freelance")) return <FiCreditCard />;
    if (desc.includes("food")) return <FiTruck />;

    // Default based on amount type
    return item.amount > 0 ? <FiArrowDownLeft /> : <FiArrowUpRight />;
  };

  // Get only the 5 most recent transactions
  const recentTransactions = useMemo(() => {
    if (!apiData) return [];
    const allTransactions = transformApiDataToTransactions(apiData);
    return allTransactions.slice(0, 5); // Take first 5 after sorting by date
  }, [apiData]);

  if (isLoading) {
    return (
      <Card bodyStyle={{padding: "24px"}}>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "200px",
          }}
        >
          <Spin size="large" />
        </div>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card bodyStyle={{padding: "24px"}}>
        <Alert
          message="Error Loading Recent Transactions"
          description={error.message}
          type="error"
          showIcon
        />
      </Card>
    );
  }

  return (
    <Card
      bodyStyle={{padding: "24px"}}
      style={{
        borderRadius: "8px",
        boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
      }}
    >
      <Row
        justify="space-between"
        align="middle"
        style={{marginBottom: "24px"}}
      >
        <Col>
          <Title level={4} style={{margin: 0, color: "#1f2937"}}>
            Recent Transactions
          </Title>
        </Col>
        <Col>
          <Link to="/accounts/recent-transactions">
            {" "}
            {/* Adjust path as needed */}
            <Button
              type="link"
              style={{color: "#059669", fontWeight: 500, padding: 0}}
            >
              View All
            </Button>
          </Link>
        </Col>
      </Row>

      <List
        itemLayout="horizontal"
        dataSource={recentTransactions}
        renderItem={(item) => (
          <List.Item
            style={{
              padding: "16px 0",
              borderBottom: "1px solid #f3f4f6",
            }}
          >
            <List.Item.Meta
              avatar={
                <div
                  style={{
                    padding: "12px",
                    borderRadius: "50%",
                    backgroundColor: item.amount > 0 ? "#ecfdf5" : "#fef2f2",
                    color: item.amount > 0 ? "#059669" : "#dc2626",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {getTransactionIcon(item)}
                </div>
              }
              title={
                <Text style={{fontWeight: 500}}>
                  {item.desc || "No Description"}
                </Text>
              }
              description={
                <Text type="secondary" style={{fontSize: "14px"}}>
                  {item.friendlyDate}
                </Text>
              }
            />
            <div style={{textAlign: "right"}}>
              <Text
                strong
                style={{
                  color: item.amount > 0 ? "#059669" : "#dc2626",
                  display: "block",
                }}
              >
                {item.amount > 0 ? "+" : "-"}₹
                {Math.abs(item.amount).toLocaleString("en-IN")}
              </Text>
            </div>
          </List.Item>
        )}
        locale={{emptyText: "No recent transactions"}}
      />
    </Card>
  );
};

export default RecentTransactions;
