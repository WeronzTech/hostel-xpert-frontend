import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Select, Button, message } from "antd";
import { editVendor } from "../../hooks/accounts/useAccounts";

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

const EditVendorModal = ({ visible, onClose, onSuccess, vendor }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && vendor) {
      form.setFieldsValue({
        vendorName: vendor.vendorName,
        mobileNumber: vendor.mobileNumber,
        vendorType: vendor.vendorType,
        status: vendor.status,
      });
    }
  }, [visible, vendor, form]);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      await editVendor({ vendorId: vendor._id, ...values });
      message.success("Vendor updated successfully");
      form.resetFields();
      onSuccess();
      onClose();
    } catch (error) {
      message.error(error.message || "Failed to update vendor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Edit Vendor"
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

        <Form.Item
          name="status"
          label="Status"
          rules={[{ required: true, message: "Please select status" }]}
        >
          <Select>
            <Option value="Active">Active</Option>
            <Option value="Inactive">Inactive</Option>
          </Select>
        </Form.Item>

        <div className="flex justify-end gap-2 mt-4">
          <Button onClick={onClose}>Cancel</Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            Update
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default EditVendorModal;
