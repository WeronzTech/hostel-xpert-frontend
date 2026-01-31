import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, List, Typography, Select, Input, Row, Col, Tag, Spin, Alert, Button } from "antd";
import { 
  FiArrowUpRight, 
  FiArrowDownLeft, 
  FiSearch, 
  FiRefreshCw,
  FiHome,
  FiShoppingBag,
  FiWifi,
  FiTruck,
  FiCreditCard,
  FiDollarSign
} from "react-icons/fi";
import { useNavigate } from 'react-router-dom';
import { getAllAccountsPayments } from '../../hooks/accounts/useAccounts'; // Adjust import path as needed

const { Title, Text } = Typography;
const { Option } = Select;
const { Search } = Input;

// Get friendly date label
const getFriendlyDate = (dateStr) => {
  const date = new Date(dateStr);
  const now = new Date();
  
  const diffTime = now - date;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0 && date.getDate() === now.getDate()) {
    return `Today, ${date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;
  }
  if (diffDays === 1) {
    return `Yesterday, ${date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;
  }
  if (diffDays <= 7) {
    return `${diffDays} days ago, ${date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;
  }
  
  return date.toLocaleDateString('en-IN', { 
    day: '2-digit', 
    month: 'short',
    year: 'numeric'
  }) + `, ${date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;
};

// Transform API data into unified transactions
const transformApiDataToTransactions = (apiData) => {
  if (!apiData) return [];

  const { payments = [], expenses = [], commissions = [] } = apiData;

  const safeString = (val) =>
    typeof val === "string" ? val : JSON.stringify(val || "");

  const paymentTx = payments.map((p) => {
    const dateObj = new Date(p.date || p.createdAt || new Date());
    return {
      id: p._id || `payment-${Math.random()}`,
      amount: Number(p.amount) || 0,
      date: dateObj.toISOString(),
      desc: safeString(p.name || "Payment"),
      type: 'payment',
      isPayment: true,
      friendlyDate: getFriendlyDate(dateObj),
      originalData: p
    };
  });

  const expenseTx = expenses.map((e) => {
    const dateObj = new Date(e.date || e.createdAt || new Date());
    return {
      id: e._id || `expense-${Math.random()}`,
      amount: -(Number(e.amount) || 0),
      date: dateObj.toISOString(),
      desc: safeString(e.title || e.description || "Expense"),
      type: 'expense',
      isPayment: false,
      friendlyDate: getFriendlyDate(dateObj),
      originalData: e
    };
  });

  const commissionTx = commissions.map((c) => {
    const dateObj = new Date(c.date || c.createdAt || new Date());
    return {
      id: c._id || `commission-${Math.random()}`,
      amount: -(Number(c.amount) || 0),
      date: dateObj.toISOString(),
      desc: safeString(c.agent || c.description || "Commission"),
      type: 'commission',
      isPayment: false,
      friendlyDate: getFriendlyDate(dateObj),
      originalData: c
    };
  });

  const allTransactions = [...paymentTx, ...expenseTx, ...commissionTx];
  
  // Sort by date (newest first)
  return allTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
};

// Function to get transaction icon based on description
const getTransactionIcon = (desc) => {
  const description = desc ? desc.toLowerCase() : '';
  
  if (description.includes('salary') || description.includes('income')) 
    return <FiDollarSign />;
  if (description.includes('rent') || description.includes('house')) 
    return <FiHome />;
  if (description.includes('shopping') || description.includes('store')) 
    return <FiShoppingBag />;
  if (description.includes('bill') || description.includes('wifi') || description.includes('internet')) 
    return <FiWifi />;
  if (description.includes('freelance') || description.includes('client')) 
    return <FiCreditCard />;
  if (description.includes('food') || description.includes('delivery') || description.includes('restaurant')) 
    return <FiTruck />;
  
  // Default icons based on transaction type
  return <FiArrowUpRight />;
};

const AllTransactionsPage = () => {
  const [searchText, setSearchText] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const navigate = useNavigate();

  const propertyId = localStorage.getItem('propertyId');

  const { data: apiData, isLoading, error, isError, refetch } = useQuery({
    queryKey: ['allTransactions', propertyId],
    queryFn: () => getAllAccountsPayments({ propertyId }),
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const transactions = useMemo(() => {
    return transformApiDataToTransactions(apiData);
  }, [apiData]);

  // Extract unique transaction types for filter
  const transactionTypes = useMemo(() => {
    const types = [...new Set(transactions.map(t => t.type))];
    return types.map(type => ({
      value: type,
      label: type.charAt(0).toUpperCase() + type.slice(1),
    }));
  }, [transactions]);

  // Extract categories from descriptions
  const transactionCategories = useMemo(() => {
    const categories = {};
    transactions.forEach(transaction => {
      const desc = transaction.desc.toLowerCase();
      let category = 'other';
      
      if (desc.includes('salary') || desc.includes('income')) category = 'salary';
      else if (desc.includes('rent')) category = 'rent';
      else if (desc.includes('shopping')) category = 'shopping';
      else if (desc.includes('bill') || desc.includes('wifi')) category = 'bills';
      else if (desc.includes('food')) category = 'food';
      else if (desc.includes('commission')) category = 'commission';
      else if (desc.includes('freelance')) category = 'freelance';
      
      categories[category] = true;
    });
    
    return Object.keys(categories).map(cat => ({
      value: cat,
      label: cat.charAt(0).toUpperCase() + cat.slice(1),
    }));
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      const descStr = transaction.desc ? transaction.desc.toLowerCase() : "";
      const matchesSearch = descStr.includes(searchText.toLowerCase());
      const matchesType = typeFilter === 'all' || transaction.type === typeFilter;
      
      // Category filtering based on description
      let category = 'other';
      const desc = transaction.desc.toLowerCase();
      if (desc.includes('salary') || desc.includes('income')) category = 'salary';
      else if (desc.includes('rent')) category = 'rent';
      else if (desc.includes('shopping')) category = 'shopping';
      else if (desc.includes('bill') || desc.includes('wifi')) category = 'bills';
      else if (desc.includes('food')) category = 'food';
      else if (desc.includes('commission')) category = 'commission';
      else if (desc.includes('freelance')) category = 'freelance';
      
      const matchesCategory = categoryFilter === 'all' || category === categoryFilter;
      
      return matchesSearch && matchesType && matchesCategory;
    }).sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });
  }, [transactions, searchText, typeFilter, categoryFilter, sortOrder]);

  const totalIncome = useMemo(() => 
    filteredTransactions
      .filter(t => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0),
    [filteredTransactions]
  );

  const totalExpenses = useMemo(() => 
    filteredTransactions
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0),
    [filteredTransactions]
  );

  const netBalance = useMemo(() => 
    totalIncome - totalExpenses,
    [totalIncome, totalExpenses]
  );

  if (isLoading) {
    return (
      <div style={{ padding: '24px', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (isError) {
    return (
      <div style={{ padding: '24px' }}>
        <Alert
          message="Error Loading Transactions"
          description={error?.message || 'An error occurred while loading transactions'}
          type="error"
          showIcon
          action={
            <Button 
              onClick={() => refetch()}
              type="primary"
              style={{ background: '#1890ff', borderColor: '#1890ff' }}
            >
              Retry
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <Row justify="space-between" align="middle" style={{ marginBottom: '24px' }}>
        <Col>
          <Title level={2} style={{ margin: 0, color: "#1f2937" }}>All Transactions</Title>
          <Text type="secondary">
            {filteredTransactions.length} of {transactions.length} transactions
            <br />
            <small>Last updated: {new Date().toLocaleTimeString()}</small>
          </Text>
        </Col>
        <Col>
       
          <div>
            <Tag color="green" style={{ fontSize: '14px', padding: '4px 8px' }}>
              Income: ₹{totalIncome.toLocaleString('en-IN')}
            </Tag>
            <Tag color="red" style={{ fontSize: '14px', padding: '4px 8px' }}>
              Expenses: ₹{totalExpenses.toLocaleString('en-IN')}
            </Tag>
            <Tag 
              color={netBalance >= 0 ? "blue" : "orange"} 
              style={{ fontSize: '14px', padding: '4px 8px', fontWeight: 'bold' }}
            >
              Net: ₹{Math.abs(netBalance).toLocaleString('en-IN')} {netBalance >= 0 ? '(Surplus)' : '(Deficit)'}
            </Tag>
          </div>
        </Col>
      </Row>

      {/* Filters */}
      <Card 
        style={{ 
          marginBottom: '24px', 
          borderRadius: '8px',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
        }} 
        bodyStyle={{ padding: '16px 24px' }}
      >
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={6}>
            <Search
              placeholder="Search transactions..."
              prefix={<FiSearch />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
              style={{ width: '100%' }}
            />
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Select 
              value={typeFilter} 
              onChange={setTypeFilter} 
              style={{ width: '100%' }}
              placeholder="Type"
            >
              <Option value="all">All Types</Option>
              {transactionTypes.map(t => (
                <Option key={t.value} value={t.value}>{t.label}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Select 
              value={categoryFilter} 
              onChange={setCategoryFilter} 
              style={{ width: '100%' }}
              placeholder="Category"
            >
              <Option value="all">All Categories</Option>
              {transactionCategories.map(cat => (
                <Option key={cat.value} value={cat.value}>{cat.label}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Select 
              value={sortOrder} 
              onChange={setSortOrder} 
              style={{ width: '100%' }}
              placeholder="Sort by"
            >
              <Option value="newest">Newest First</Option>
              <Option value="oldest">Oldest First</Option>
            </Select>
          </Col>
          <Col xs={12} sm={6} md={6}>
            <Text strong style={{ fontSize: '16px' }}>
              Balance: ₹{netBalance.toLocaleString('en-IN')}
            </Text>
          </Col>
        </Row>
      </Card>

      {/* Transaction List */}
      <Card 
        bodyStyle={{ padding: "24px" }} 
        style={{ 
          borderRadius: "8px", 
          boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
          minHeight: '400px'
        }}
      >
        <List
          itemLayout="horizontal"
          dataSource={filteredTransactions}
          renderItem={(item) => (
            <List.Item 
              style={{ 
                padding: "16px 0", 
                borderBottom: "1px solid #f3f4f6",
                transition: 'background-color 0.2s',
              }}
              className="transaction-item"
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
                      width: '48px',
                      height: '48px',
                    }}
                  >
                    {getTransactionIcon(item.desc)}
                  </div>
                }
                title={
                  <Text style={{ fontWeight: 500, fontSize: '16px' }}>
                    {item.desc || "No Description"}
                  </Text>
                }
                description={
                  <div>
                    <Text type="secondary" style={{ fontSize: "14px" }}>
                      {item.friendlyDate}
                    </Text>
                    <div style={{ marginTop: '4px' }}>
                      <Tag 
                        color={item.type === 'payment' ? 'blue' : item.type === 'expense' ? 'red' : 'orange'}
                        style={{ fontSize: '12px' }}
                      >
                        {item.type}
                      </Tag>
                    </div>
                  </div>
                }
              />
              <div style={{ textAlign: "right" }}>
                <Text 
                  strong 
                  style={{ 
                    color: item.amount > 0 ? "#059669" : "#dc2626", 
                    display: "block", 
                    fontSize: '18px',
                    fontWeight: 600
                  }}
                >
                  {item.amount > 0 ? "+" : "-"}₹{Math.abs(item.amount).toLocaleString("en-IN")}
                </Text>
                <Tag 
                  color={item.amount > 0 ? "green" : "red"} 
                  style={{ 
                    marginTop: '4px', 
                    marginRight: 0,
                    fontSize: '12px',
                    fontWeight: 500
                  }}
                >
                  {item.amount > 0 ? "Income" : "Expense"}
                </Tag>
              </div>
            </List.Item>
          )}
          locale={{ 
            emptyText: (
              <div style={{ 
                textAlign: 'center', 
                padding: '40px 0',
                color: '#999'
              }}>
                <FiSearch style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }} />
                <div>No transactions found</div>
                <Text type="secondary">
                  {searchText || typeFilter !== 'all' || categoryFilter !== 'all' 
                    ? 'Try adjusting your filters' 
                    : 'No transactions available'
                  }
                </Text>
              </div>
            ) 
          }}
        />
      </Card>
    </div>
  );
};

export default AllTransactionsPage;