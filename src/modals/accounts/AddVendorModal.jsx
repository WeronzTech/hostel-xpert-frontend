import React, { useState } from "react";
import { Modal, Form, Input, Select, Button, message } from "antd";
import { addVendor } from "../../hooks/accounts/useAccounts";

const { Option } = Select;

const VENDOR_TYPES = [
  "GENERAL",
  "MAINTENANCE",
  "ELECTRICAL",
  "PLUMBING",
  "CARPENTRY",
  "PAINTING",
  "HOUSEKEEPING",
  "FOOD",
  "LAUNDRY",
  "SECURITY",
  "INTERNET",
  "UTILITY",
  "FURNITURE",
  "APPLIANCE REPAIR",
  "PEST CONTROL",
  "CONSTRUCTION",
  "ELEVATOR MAINTENANCE",
  "FIRE SAFETY",
  "REAL ESTATE AGENT",
  "LEGAL",
  "ACCOUNTING",
  "INTERIOR DESIGN",
  "BANK",
  "OTHERS",
];

const AddVendorModal = ({ visible, onClose, onSuccess, clientId }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      await addVendor({ ...values, clientId });
      message.success("Vendor added successfully");
      form.resetFields();
      onSuccess();
      onClose();
    } catch (error) {
      message.error(error.message || "Failed to add vendor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Add New Vendor"
      open={visible}
      onCancel={onClose}
      footer={null}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          name="vendorName"
          label="Vendor Name"
          rules={[{ required: true, message: "Please enter vendor name" }]}
        >
          <Input placeholder="Enter vendor name" />
        </Form.Item>

        <Form.Item
          name="mobileNumber"
          label="Mobile Number"
          rules={[{ required: true, message: "Please enter mobile number" }]}
        >
          <Input placeholder="Enter mobile number" />
        </Form.Item>

        <Form.Item
          name="vendorType"
          label="Vendor Type"
          rules={[{ required: true, message: "Please select vendor type" }]}
        >
          <Select placeholder="Select vendor type" showSearch>
            {VENDOR_TYPES.map((type) => (
              <Option key={type} value={type}>
                {type}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <div className="flex justify-end gap-2 mt-4">
          <Button onClick={onClose}>Cancel</Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            Save
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default AddVendorModal;
