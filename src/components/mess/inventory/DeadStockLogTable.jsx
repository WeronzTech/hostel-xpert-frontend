import { Table, Tag } from "antd";
import moment from "moment";

const DeadStockLogTable = ({
  logs,
  loading,
  total,
  currentPage,
  limit,
  onPageChange,
}) => {
  const columns = [
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      align: "center",
      width: 150,
      render: (text) => moment(text).format("DD-MM-YYYY hh:mm A"),
    },
    {
      title: "Product Name",
      dataIndex: ["inventoryId", "productName"],
      key: "productName",
      align: "center",
      width: 200,
    },
    {
      title: "Kitchen",
      dataIndex: ["kitchenId", "name"],
      key: "kitchen",
      align: "center",
      width: 150,
    },
    {
      title: "Quantity Removed",
      dataIndex: "quantityChanged",
      key: "quantityChanged",
      align: "center",
      width: 150,
      render: (quantity, record) => (
        <Tag color="red">
          {Math.abs(quantity)} {record.inventoryId?.quantityType}
        </Tag>
      ),
    },
    {
      title: "Reason",
      dataIndex: "notes",
      key: "notes",
      align: "left",
      width: 300,
      render: (notes) => notes.replace(/^Dead Stock: /, ""),
    },
    {
      title: "Logged By",
      dataIndex: ["performedBy", "name"],
      key: "performedBy",
      align: "center",
      width: 150,
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={logs}
      loading={loading}
      rowKey="_id"
      bordered
      scroll={{ x: 1100 }}
      pagination={{
        current: currentPage,
        pageSize: limit,
        total: total,
        onChange: onPageChange,
        showSizeChanger: false,
      }}
    />
  );
};

export default DeadStockLogTable;
