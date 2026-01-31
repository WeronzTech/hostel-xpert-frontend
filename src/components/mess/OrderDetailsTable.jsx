import {Table, Tag} from "antd";
import {useState} from "react";

const OrderDetailsTable = ({data, loading}) => {
  // ✅ Local filter state for built-in filters (like Status)
  const [setFilteredInfo] = useState({});

  // ✅ Handles built-in filters and keeps them in sync
  const handleChange = (filters) => {
    setFilteredInfo(filters);
  };

  const columns = [
    {
      title: "#",
      key: "serial",
      width: 40,
      fixed: "left",
      align: "center",
      render: (_, __, index) => index + 1,
    },
    {
      title: "Name",
      dataIndex: "userName",
      key: "userName",
      align: "left",
      width: 150,
      render: (text, record) => {
        const name =
          !text || text.trim() === "" || text.trim().toLowerCase() === "n/a"
            ? "Manual Booking"
            : text;

        return record.partnerName ? `${record.partnerName}` : name;
      },
      // NEW: Custom search logic
      onFilter: (value, record) => {
        const name =
          !record.userName ||
          record.userName.trim() === "" ||
          record.userName.trim().toLowerCase() === "n/a"
            ? "Manual Booking"
            : record.userName;

        const partner = record.partnerName || "";

        return (
          name.toLowerCase().includes(value.toLowerCase()) ||
          partner.toLowerCase().includes(value.toLowerCase())
        );
      },
    },
    {
      title: "Order ID",
      dataIndex: "orderId",
      key: "orderId",
      align: "center",
      width: 150,
    },
    {
      title: "Meal Type",
      dataIndex: "mealType",
      key: "mealType",
      align: "center",
      width: 150,
      render: (mealType) => {
        const colorMap = {
          Breakfast: "gold",
          Lunch: "blue",
          Snacks: "purple",
          Dinner: "red",
        };

        return <Tag color={colorMap[mealType] || "default"}>{mealType}</Tag>;
      },
    },
    {
      title: "Booking Date",
      dataIndex: "bookingDate",
      key: "bookingDate",
      align: "center",
      width: 150,
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Contact",
      dataIndex: "contact",
      key: "contact",
      align: "center",
      width: 150,
    },
    {
      title: "Room No",
      dataIndex: "roomNumber",
      key: "roomNumber",
      align: "center",
      width: 120,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      align: "center",
      width: 150,
      render: (status) => {
        const color = status === "Pending" ? "orange" : "green";
        return <Tag color={color}>{status}</Tag>;
      },
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={data}
      loading={loading}
      rowKey="orderId"
      scroll={{x: "max-content"}}
      pagination={false}
      onChange={handleChange} // ✅ enables built-in filter handling
    />
  );
};

export default OrderDetailsTable;
