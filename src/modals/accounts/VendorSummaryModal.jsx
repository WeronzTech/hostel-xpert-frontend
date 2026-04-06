import React, { useEffect } from "react";
import { Modal, Table, Spin, Typography, message, Tag } from "antd";
import { useQuery } from "@tanstack/react-query";
import { getVendorSummary } from "../../hooks/accounts/useAccounts";
import dayjs from "dayjs";

const { Title, Text } = Typography;

const VendorSummaryModal = ({ visible, onClose, vendor }) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["vendorSummary", vendor?._id],
    queryFn: () => getVendorSummary(vendor?._id),
    enabled: !!vendor?._id && visible,
  });

  useEffect(() => {
    if (error) {
      message.error(
        "Failed to fetch vendor summary: " + (error.message || "Unknown error"),
      );
    }
  }, [error]);

  const expenses = data?.data?.expenses || [];
  const totalPaid = data?.data?.totalPaid || 0;
  const totalPending = data?.data?.totalPending || 0;

  const columns = [
    {
      title: "Date",
      dataIndex: "date",
      render: (date) => dayjs(date).format("DD MMM YYYY"),
    },
    {
      title: "Expense Title",
      dataIndex: "title",
    },
    {
      title: "Amount",
      dataIndex: "amount",
      render: (amount) => `₹ ${amount?.toLocaleString()}`,
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (status) => (
        <Tag color={status === "paid" ? "green" : "orange"}>
          {status?.toUpperCase() || "PAID"}
        </Tag>
      ),
    },
  ];

  return (
    <Modal
      title={`${vendor?.vendorName || "Vendor"} - Summary`}
      open={visible}
      onCancel={onClose}
      footer={null}
      width={700}
      destroyOnClose
    >
      <div className="flex flex-col gap-4">
        <div className="flex gap-8 p-4 bg-gray-50 rounded-lg">
          <div>
            <Text type="secondary">Total Paid</Text>
            <Title level={4} style={{ margin: 0, color: "#52c41a" }}>
              ₹ {totalPaid.toLocaleString()}
            </Title>
          </div>
          <div>
            <Text type="secondary">Total Pending</Text>
            <Title level={4} style={{ margin: 0, color: "#faad14" }}>
              ₹ {totalPending.toLocaleString()}
            </Title>
          </div>
        </div>

        <Table
          dataSource={expenses}
          columns={columns}
          rowKey="_id"
          loading={isLoading}
          pagination={{ pageSize: 5 }}
          size="small"
        />
      </div>
    </Modal>
  );
};

export default VendorSummaryModal;
