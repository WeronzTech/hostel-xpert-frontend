import {Table, Tag, List, Button, message, Tooltip, Popconfirm} from "antd";
import {useState} from "react";
import {CheckCircleOutlined, QuestionCircleOutlined} from "@ant-design/icons";

const AddonDetailsTable = ({bookings, loading, onStatusUpdate}) => {
  const [loadingId, setLoadingId] = useState(null);

  // Meal type color mapping
  const mealTypeColors = {
    Breakfast: "gold",
    Lunch: "blue",
    Snacks: "purple",
    Dinner: "red",
  };

  const columns = [
    {
      title: "#",
      key: "serial",
      width: 40,
      align: "center",
      fixed: "left",
      render: (_, __, index) => index + 1,
    },
    {
      title: "User",
      dataIndex: "userName",
      key: "userName",
      align: "left",
      width: "150",
    },
    {
      title: "Booking Date",
      dataIndex: "bookingDate",
      key: "bookingDate",
      align: "center",
      width: "150",
      render: (date) => (date ? new Date(date).toLocaleDateString() : "-"),
    },
    {
      title: "Delivered Date",
      dataIndex: "deliveredDate",
      key: "deliveredDate",
      align: "center",
      width: "150",
      render: (deliveredDate) =>
        deliveredDate ? (
          new Date(deliveredDate).toLocaleDateString()
        ) : (
          <span className="text-gray-400 italic">Not delivered yet</span>
        ),
    },
    {
      title: "Addons & Price",
      key: "addonCount",
      align: "center",
      width: "180",
      render: (_, record) => {
        const addonCount = record.addons?.length || 0;
        const totalPrice = record.grandTotalPrice || 0;

        return (
          <div className="flex items-center justify-center gap-2">
            <span className="font-medium">{addonCount} Addons</span>
            <span className="text-green-600 font-semibold">₹{totalPrice}</span>
          </div>
        );
      },
    },
    {
      title: "Meal Types",
      key: "mealType",
      align: "center",
      width: "180",
      render: (_, record) => {
        const mealTypes = [
          ...new Set(record.addons?.map((addon) => addon.mealType) || []),
        ];

        if (mealTypes.length === 0) return "-";

        return (
          <div className="flex flex-wrap gap-1 justify-center">
            {mealTypes.map((type, index) => (
              <Tag
                key={index}
                color={mealTypeColors[type] || "default"}
                className="m-0"
              >
                {type}
              </Tag>
            ))}
          </div>
        );
      },
    },
    {
      title: "Payment Status",
      dataIndex: "paymentStatus",
      key: "paymentStatus",
      align: "center",
      width: "120",
      render: (paymentStatus) => {
        if (!paymentStatus) return "-";

        const statusMap = {
          Paid: {color: "green", text: "Paid"},
          Pending: {color: "orange", text: "Pending"},
          Failed: {color: "red", text: "Failed"},
          Refunded: {color: "blue", text: "Refunded"},
        };

        const status = statusMap[paymentStatus] || {
          color: "default",
          text: paymentStatus,
        };
        return <Tag color={status.color}>{status.text}</Tag>;
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      align: "center",
      width: "120",
      render: (status) => {
        if (!status) return "-";

        const isDelivered = status === "Delivered";
        return <Tag color={isDelivered ? "green" : "orange"}>{status}</Tag>;
      },
    },
    {
      title: "Actions",
      key: "actions",
      align: "center",
      width: "120", // Increased width for Popconfirm
      fixed: "right",
      render: (_, record) => {
        const isDelivered = record.status === "Delivered";

        const handleConfirm = async () => {
          console.log("Popconfirm confirmed for record:", record._id);
          setLoadingId(record._id);

          try {
            if (onStatusUpdate) {
              await onStatusUpdate(record._id, "Delivered");
              message.success("Order marked as delivered successfully!");
            } else {
              console.error("onStatusUpdate prop is not provided!");
              message.warning("Status update callback not provided");
            }
          } catch (error) {
            console.error("Error updating status:", error);
            message.error(`Failed to update status: ${error.message}`);
            throw error; // This will keep the popconfirm open if there's an error
          } finally {
            setLoadingId(null);
          }
        };

        return (
          <div className="flex justify-center space-x-2">
            {!isDelivered ? (
              <Popconfirm
                title="Mark as Delivered"
                description={`Are you sure you want to mark order ${
                  record.orderId || record._id
                } as delivered?`}
                icon={<QuestionCircleOutlined style={{color: "red"}} />}
                onConfirm={handleConfirm}
                okText="Yes"
                cancelText="No"
                okButtonProps={{
                  type: "primary",
                  loading: loadingId === record._id,
                }}
                onCancel={() => console.log("Cancelled")}
                placement="left" // or "top", "bottom", "right"
              >
                <Tooltip title="Mark as Delivered">
                  <Button
                    type="primary"
                    icon={<CheckCircleOutlined />}
                    size="small"
                    shape="circle"
                    loading={loadingId === record._id}
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log("Button clicked for record:", record._id);
                    }}
                  />
                </Tooltip>
              </Popconfirm>
            ) : (
              <Tooltip title="Already Delivered">
                <Button
                  type="default"
                  size="small"
                  shape="circle"
                  icon={<CheckCircleOutlined />}
                  disabled
                />
              </Tooltip>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div>
      <Table
        columns={columns}
        loading={loading}
        dataSource={bookings}
        scroll={{x: "max-content"}}
        pagination={false}
        rowKey="_id"
        expandable={{
          expandedRowRender: (record) => (
            <div className="bg-white rounded-xl p-3 shadow-sm">
              <List
                header={
                  <div className="flex justify-between items-center">
                    <strong>Addons</strong>
                    <span className="text-green-600 font-semibold">
                      Total: ₹{record.grandTotalPrice || 0}
                    </span>
                  </div>
                }
                grid={{
                  gutter: 16,
                  xs: 1,
                  sm: 2,
                  md: 2,
                  lg: 3,
                  xl: 4,
                  xxl: 4,
                }}
                dataSource={record.addons || []}
                renderItem={(addon) => (
                  <List.Item>
                    <div className="border border-gray-200 rounded-lg p-3 flex items-start gap-4 mt-2 bg-gray-100 transition-shadow duration-300">
                      <img
                        src={
                          addon?.addonId?.itemImage ||
                          "https://gingerskillet.com/wp-content/uploads/2023/09/keralachickenfry_F-500x375.jpg"
                        }
                        alt={addon?.addonId?.itemName}
                        className="w-16 h-16 rounded-md object-cover shadow-[1px_-1px_36px_-13px_rgba(69,69,69,0.75)]"
                      />
                      <div className="flex-1">
                        <div className="font-bold text-base">
                          {addon?.addonId?.itemName || "Unknown Item"}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Tag
                            color={mealTypeColors[addon?.mealType] || "default"}
                            size="small"
                          >
                            {addon?.mealType || "-"}
                          </Tag>
                          <span className="text-sm text-gray-600">
                            Qty: {addon?.quantity || 0}
                          </span>
                        </div>
                        <div className="text-sm font-semibold text-green-600 mt-1">
                          ₹{addon?.addonId?.price || 0} × {addon?.quantity || 0}{" "}
                          = ₹
                          {(addon?.addonId?.price || 0) *
                            (addon?.quantity || 0)}
                        </div>
                      </div>
                    </div>
                  </List.Item>
                )}
              />
            </div>
          ),
        }}
      />
    </div>
  );
};

export default AddonDetailsTable;
