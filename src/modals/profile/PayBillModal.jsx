import React from "react";
import { Modal, Form, Input, Select, Button, message, Typography } from "antd";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { paySubscriptionBill } from "../../hooks/client/useSubscription";

const { Text } = Typography;
const { Option } = Select;

const PayBillModal = ({ visible, onClose, bill }) => {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const payMutation = useMutation({
    mutationFn: (values) => paySubscriptionBill(bill._id, values),
    onSuccess: () => {
      message.success("Payment details submitted for approval.");
      queryClient.invalidateQueries(["paymentHistory"]);
      form.resetFields();
      onClose();
    },
    onError: (error) => {
      message.error(error.message || "Failed to submit payment");
    },
  });

  const handleFinish = (values) => {
    payMutation.mutate(values);
  };

  return (
    <Modal
      title="Pay Subscription Bill"
      open={visible}
      onCancel={onClose}
      footer={null}
      destroyOnClose
    >
      {bill && (
        <div
          style={{
            marginBottom: 20,
            padding: 16,
            backgroundColor: "#f0fdf4",
            borderRadius: 8,
            border: "1px solid #bbf7d0",
          }}
        >
          <Text strong>Amount Due: </Text>{" "}
          <Text type="success" style={{ fontSize: 18 }}>
            ₹{bill.amount}
          </Text>
          <br />
          <Text type="secondary">
            Billing Period:{" "}
            {new Date(bill.billingPeriodStart).toLocaleDateString()} -{" "}
            {new Date(bill.billingPeriodEnd).toLocaleDateString()}
          </Text>
        </div>
      )}

      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Form.Item
          name="paymentMethod"
          label="Payment Method"
          rules={[{ required: true }]}
        >
          <Select placeholder="Select method">
            <Option value="upi">UPI / Bank Transfer</Option>
            <Option value="credit_card">Credit Card</Option>
            <Option value="cash">Cash</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="transactionId"
          label="Transaction ID / UTR Number"
          rules={[{ required: true }]}
        >
          <Input placeholder="Enter transaction reference" />
        </Form.Item>

        <Form.Item name="remarks" label="Remarks (Optional)">
          <Input.TextArea
            rows={2}
            placeholder="Any notes about this payment..."
          />
        </Form.Item>

        <div style={{ textAlign: "right" }}>
          <Button onClick={onClose} style={{ marginRight: 8 }}>
            Cancel
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={payMutation.isLoading}
          >
            Submit Payment
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default PayBillModal;
