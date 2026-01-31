import {Table, Tag} from "antd";
import {useState} from "react";

const AccountsList = ({accounts, loading}) => {
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5,
  });

  const getAccountTypeColor = (type) => {
    const colors = {
      Asset: "blue",
      Liability: "red",
      Equity: "blue",
      Income: "purple",
      Expense: "orange",
    };
    return colors[type] || "default";
  };

  const columns = [
    {
      title: "#",
      key: "serial",
      align: "center",
      fixed: "left",
      width: 60,
      render: (text, record, index) =>
        (pagination.current - 1) * pagination.pageSize + index + 1,
    },
    {
      title: "Account Name",
      dataIndex: "name",
      key: "name",
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: "Type",
      dataIndex: "accountType",
      key: "accountType",
      render: (type) => <Tag color={getAccountTypeColor(type)}>{type}</Tag>,
    },
    {
      title: "Category",
      dataIndex: "categoryId",
      key: "categoryId",
      render: (category) => category?.name || "Uncategorized",
    },
    {
      title: "Balance",
      dataIndex: "balance",
      key: "balance",
      render: (balance) => (
        <span
          style={{
            fontWeight: "bold",
            color: balance >= 0 ? "#1890ff" : "#ff4d4f",
          }}
        >
          ₹{balance?.toLocaleString("en-IN")}
        </span>
      ),
      align: "right",
    },
  ];

  return (
    <div style={{width: "100%", overflowX: "auto"}}>
      <Table
        columns={columns}
        dataSource={accounts}
        loading={loading}
        rowKey="_id"
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: accounts?.length || 0,
          onChange: (page, pageSize) => {
            setPagination({current: page, pageSize});
          },
        }}
        size="middle"
        scroll={{x: 600}} // enables horizontal scroll on mobile
      />
    </div>
  );
};

export default AccountsList;
