import React from "react";
import { Modal, Table, Tag, Typography, Spin, Alert } from "antd";
import { useQuery } from "@tanstack/react-query";
import { getPettyCashPaymentsByManager } from "../../hooks/accounts/useAccounts";
import { useEffect} from "react";


const { Text, Title } = Typography;

const PettyCashUsageModal = ({ visible, onCancel, managerId, managerName }) => {
    const { data, isLoading, isError, error, refetch } = useQuery({
      queryKey: ["pettyCashPayments", managerId],
      queryFn: () => getPettyCashPaymentsByManager(managerId),
      enabled: !!managerId, // only need managerId, not visible
    });
  
    // Refetch whenever modal opens
    useEffect(() => {
      if (visible && managerId) {
        refetch();
      }
    }, [visible, managerId, refetch]);
  
    const pettyCashData = data?.data || [];
  
    return (
      <Modal
        title={
          <>
            <Title level={4} style={{ margin: 0 }}>Petty Cash Payments</Title>
            <Text type="secondary">Managed by {managerName}</Text>
          </>
        }
        open={visible}
        onCancel={onCancel}
        footer={null}
        width={900}
      >
        {isLoading && <Spin size="large" style={{ display: "block", margin: "20px auto" }} />}
        {isError && <Alert message="Error loading data" description={error.message} type="error" showIcon style={{ marginBottom: 16 }} />}
        {!isLoading && !isError && (
          <Table
            dataSource={pettyCashData}
            columns={[
              { title: "Date", dataIndex: "date", key: "date", render: (d) => new Date(d).toLocaleDateString("en-IN") },
              { title: "Title", dataIndex: "title", key: "title" },
              { title: "Category", dataIndex: "category", key: "category", render: (c) => <Tag color="blue">{c}</Tag> },
              { title: "Description", dataIndex: "description", key: "description" },
              { title: "Amount", dataIndex: "amount", key: "amount", render: (a) => <Text strong type="danger">₹{a?.toLocaleString("en-IN")}</Text> },
              { title: "Petty Cash Type", dataIndex: "pettyCashType", key: "pettyCashType", render: (t) => <Tag color={t === "inHand" ? "green" : "orange"}>{t}</Tag> },
              { title: "Property", dataIndex: ["property", "name"], key: "property", render: (p) => p || "N/A" },
            ]}
            rowKey="_id"
            pagination={{ pageSize: 5 }}
            scroll={{ x: 800 }}
          />
        )}
      </Modal>
    );
  };

export default PettyCashUsageModal;
