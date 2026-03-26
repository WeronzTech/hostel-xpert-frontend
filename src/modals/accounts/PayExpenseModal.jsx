import React from "react";
import { Modal, Form, Select, Input, Button, DatePicker } from "antd";
import dayjs from "dayjs";
import { FiHash, FiCreditCard } from "react-icons/fi";

const { Option } = Select;

const PayExpenseModal = ({ visible, onCancel, onConfirm, expense, loading }) => {
  const [form] = Form.useForm();
  const paymentMethod = Form.useWatch("paymentMethod", form);

  const paymentMethods = ["Cash", "UPI", "Bank Transfer", "Card", "Petty Cash"];

  const handleFinish = (values) => {
    onConfirm({
      ...values,
      paymentDate: values.paymentDate?.toISOString(),
    });
  };

  return (
    <Modal
      title="Mark Expense as Paid"
      open={visible}
      onCancel={() => {
        form.resetFields();
        onCancel();
      }}
      footer={null}
      destroyOnClose
      centered
    >
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex justify-between mb-1">
          <span className="text-gray-500">Expense:</span>
          <span className="font-semibold text-gray-800">{expense?.title}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Amount:</span>
          <span className="font-bold text-red-600">₹ {expense?.amount?.toLocaleString()}</span>
        </div>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{
          paymentMethod: "Cash",
          paymentDate: dayjs(),
        }}
      >
        <Form.Item
          name="paymentMethod"
          label="Payment Method"
          rules={[{ required: true, message: "Please select payment method" }]}
        >
          <Select placeholder="Select payment method">
            {paymentMethods.map((method) => (
              <Option key={method} value={method}>
                {method}
              </Option>
            ))}
          </Select>
        </Form.Item>

        {paymentMethod === "Petty Cash" && (
          <Form.Item
            name="pettyCashType"
            label="Petty Cash Type"
            rules={[{ required: true, message: "Please select petty cash type" }]}
          >
            <Select placeholder="Select type">
              <Option value="inHand">In Hand</Option>
              <Option value="inAccount">In Account</Option>
            </Select>
          </Form.Item>
        )}

        {(paymentMethod === "UPI" || paymentMethod === "Bank Transfer") && (
          <Form.Item
            name="transactionId"
            label="Transaction ID"
            rules={[
              { required: true, message: "Please enter transaction ID" },
            ]}
          >
            <Input 
              prefix={<FiHash className="text-gray-400" />} 
              placeholder={`Enter ${paymentMethod} transaction ID`} 
            />
          </Form.Item>
        )}

        <Form.Item
          name="paymentDate"
          label="Payment Date"
          rules={[{ required: true, message: "Please select payment date" }]}
        >
          <DatePicker 
            style={{ width: "100%" }} 
            format="DD MMM YYYY"
            disabledDate={(current) => current && current > dayjs().endOf("day")}
          />
        </Form.Item>

        <div className="flex justify-end gap-2 mt-6">
          <Button onClick={onCancel}>Cancel</Button>
          <Button type="primary" htmlType="submit" loading={loading} icon={<FiCreditCard />}>
            Confirm Payment
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default PayExpenseModal;
