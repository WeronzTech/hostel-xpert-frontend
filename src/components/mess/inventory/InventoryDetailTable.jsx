import { Table, Tag } from "antd";
import { AiOutlineEdit } from "../../../icons/index.js";
import ActionButton from "../../common/ActionButton.jsx";
import {
  greenButton,
  redButton,
  yellowButton,
} from "../../../data/common/color.js";

const InventoryDetailTable = ({
  inventoryItems,
  loading,
  total,
  currentPage,
  onPageChange,
  onEdit,
  onDailyUsage,
  onUpdateStock,
  onDeadStock,
}) => {
  const getStatus = (item) => {
    if (item.stockQuantity === 0) return "Out of Stock";
    if (item.stockQuantity <= item.lowStockQuantity) return "Low Stock";
    return "Available";
  };

  const inventoryTableColumns = [
    {
      title: "Product Name",
      dataIndex: "productName",
      key: "productName",
      align: "center",
      fixed: "left",
      width: 200,
      // ...getColumnSearchProps("productName"),
    },
    {
      title: "Category",
      dataIndex: ["categoryId", "name"],
      key: "categoryId",
      align: "center",
      width: 150,
      filters: Array.from(
        new Set(inventoryItems?.data?.map((item) => item.categoryId?.name))
      ).map((name) => ({ text: name, value: name })),
      onFilter: (value, record) => record.categoryId?.name === value,
      render: (_, record) => record.categoryId?.name,
      // ...getColumnSearchProps("categoryId.name"),
    },
    {
      title: "Status",
      key: "status",
      align: "center",
      width: 120,
      filters: [
        { text: "Available", value: "Available" },
        { text: "Out of Stock", value: "Out of Stock" },
        { text: "Low Stock", value: "Low Stock" },
      ],
      onFilter: (value, record) => getStatus(record) === value,
      render: (_, record) => {
        const status = getStatus(record);
        const color =
          status === "Out of Stock"
            ? "red"
            : status === "Low Stock"
            ? "orange"
            : "green";
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: "Available Qty",
      dataIndex: "stockQuantity",
      key: "stockQuantity",
      align: "center",
      width: 130,
      render: (stockQuantity, record) => {
        return `${stockQuantity} ${record.quantityType}`;
      },
    },
    {
      title: "Low Stock Qty",
      dataIndex: "lowStockQuantity",
      key: "lowStockQuantity",
      align: "center",
      width: 130,
      render: (lowStockQuantity, record) => {
        return `${lowStockQuantity} ${record.quantityType}`;
      },
    },
    {
      title: "Action",
      key: "action",
      align: "center",
      width: 100,
      render: (_, record) => (
        <ActionButton
          icon={<AiOutlineEdit />} // FIX: Using the icon from Ant Design
          onClick={() => onEdit(record)}
        />
      ),
    },
    {
      title: "Updates",
      key: "updates",
      align: "center",
      width: 300, // Adjusted width for two buttons
      render: (_, record) => (
        <div className="flex gap-1 justify-center">
          <ActionButton
            customTheme={greenButton}
            type="primary"
            onClick={() => onDailyUsage(record)}
          >
            Daily usage
          </ActionButton>
          <ActionButton
            customTheme={redButton}
            type="primary"
            onClick={() => onUpdateStock(record)}
          >
            Update stock
          </ActionButton>
          <ActionButton
            customTheme={yellowButton}
            type="primary"
            onClick={() => onDeadStock(record)}
          >
            Dead stock
          </ActionButton>
        </div>
      ),
    },
  ];

  return (
    <Table
      loading={loading}
      columns={inventoryTableColumns}
      dataSource={inventoryItems}
      scroll={{ x: 1000 }}
      rowKey="_id"
      pagination={{
        pageSize: 10,
        total: total,
        current: currentPage,
        onChange: onPageChange,
        showSizeChanger: false,
      }}
      bordered
    />
  );
};

export default InventoryDetailTable;
