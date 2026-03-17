import React, { useState } from "react";
import { Button, Modal, Table, Tag } from "antd";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { getMyPaymentHistory } from "../../hooks/client/useSubscription";
import PayBillModal from "./PayBillModal";

const PaymentHistoryModal = ({ visible, onClose, clientId }) => {
  const [selectedBill, setSelectedBill] = useState(null);

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
      key: "status",
      render: (_, record) => {
        // If it's pending but has a transaction ID, it's awaiting admin approval
        if (record.status === "pending" && record.transactionId) {
          return <Tag color="processing">PROCESSING</Tag>;
        }
        // If it's pending and has NO transaction ID, it's an unpaid auto-generated bill
        if (record.status === "pending" && !record.transactionId) {
          return <Tag color="error">UNPAID</Tag>;
        }
        const color = record.status === "completed" ? "success" : "warning";
        return <Tag color={color}>{record.status.toUpperCase()}</Tag>;
      },
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) =>
        record.status === "pending" && !record.transactionId ? (
          <Button
            size="small"
            type="primary"
            onClick={() => setSelectedBill(record)}
          >
            Pay Now
          </Button>
        ) : (
          <span style={{ color: "#aaa", fontSize: 12 }}>
            {record.transactionId || "N/A"}
          </span>
        ),
    },
  ];

  return (
    <>
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
      <PayBillModal
        visible={!!selectedBill}
        onClose={() => setSelectedBill(null)}
        bill={selectedBill}
      />
    </>
  );
};

export default PaymentHistoryModal;
