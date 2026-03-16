import React from "react";
import { Modal, Table, Tag } from "antd";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { getMyPaymentHistory } from "../../hooks/client/useSubscription";

const PaymentHistoryModal = ({ visible, onClose, clientId }) => {
  const { data: historyData, isLoading } = useQuery({
    queryKey: ["paymentHistory", clientId],
    queryFn: () => getMyPaymentHistory(clientId),
    enabled: visible && !!clientId,
  });

  const columns = [
    {
      title: "Date",
      dataIndex: "paymentDate",
      render: (date) => dayjs(date).format("DD MMM YYYY, hh:mm A"),
    },
    {
      title: "Plan",
      dataIndex: ["subscriptionId", "name"],
      render: (text) => text || "Unknown Plan",
    },
    {
      title: "Amount",
      dataIndex: "amount",
      render: (amt) => `₹${amt}`,
    },
    {
      title: "Method",
      dataIndex: "paymentMethod",
      render: (text) => text.toUpperCase(),
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (status) => {
        const color =
          status === "completed"
            ? "success"
            : status === "pending"
              ? "warning"
              : "error";
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      },
    },
  ];

  return (
    <Modal
      title="Subscription Payment History"
      open={visible}
      onCancel={onClose}
      footer={null}
      width={800}
    >
      <Table
        dataSource={historyData || []}
        columns={columns}
        rowKey="_id"
        loading={isLoading}
        pagination={{ pageSize: 5 }}
        size="small"
      />
    </Modal>
  );
};

export default PaymentHistoryModal;
