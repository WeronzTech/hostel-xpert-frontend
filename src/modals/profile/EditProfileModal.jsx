import React, { useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Button,
  message,
  Alert,
  Divider,
  Row,
  Col,
} from "antd";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateClientProfile } from "../../hooks/client/useClient";
import { useDispatch } from "react-redux";
import { setCredentials } from "../../redux/authSlice"; // Adjust based on your Redux setup

const EditProfileModal = ({ visible, onClose, user }) => {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  useEffect(() => {
    if (visible && user) {
      form.setFieldsValue({
        name: user.name,
        email: user.email,
        contact: user.contact,
        companyName: user.companyName,
        address: {
          street: user.address?.street,
          city: user.address?.city,
          state: user.address?.state,
          country: user.address?.country,
          zipCode: user.address?.zipCode,
        },
      });
    }
  }, [visible, user, form]);

  const updateMutation = useMutation({
    mutationFn: updateClientProfile,
    onSuccess: (data) => {
      message.success(data.message || "Profile updated successfully");

      // Update Redux state with new user data
      if (data.data) {
        dispatch(setCredentials({ user: data.data }));
      }

      form.resetFields(["password"]); // Clear password field
      queryClient.invalidateQueries(["client-details"]); // Refresh user profile data
      onClose();
    },
    onError: (error) => {
      message.error(error.message || "Failed to update profile");
    },
  });

  const handleFinish = (values) => {
    updateMutation.mutate(values);
  };

  return (
    <Modal
      title="Edit Profile"
      open={visible}
      onCancel={onClose}
      footer={null}
      destroyOnClose
      width={600}
    >
      <Alert
        message="Notice"
        description="If you change your email address, you will need to re-verify it via the link sent to your new email."
        type="info"
        showIcon
        style={{ marginBottom: 20 }}
      />
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Form.Item name="name" label="Full Name" rules={[{ required: true }]}>
          <Input placeholder="Enter full name" />
        </Form.Item>

        <Form.Item
          name="email"
          label="Email Address"
          rules={[{ required: true, type: "email" }]}
        >
          <Input placeholder="Enter email address" />
        </Form.Item>

        <Form.Item
          name="contact"
          label="Contact Number"
          rules={[{ required: true }]}
        >
          <Input placeholder="Enter contact number" />
        </Form.Item>

        {user?.companyName && (
          <Form.Item name="companyName" label="Company / Organization Name">
            <Input placeholder="Enter organization name" />
          </Form.Item>
        )}

        <Divider orientation="left" style={{ margin: "12px 0" }}>
          Address Details
        </Divider>

        <Form.Item name={["address", "street"]} label="Street Address">
          <Input placeholder="Enter street address" />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name={["address", "city"]} label="City">
              <Input placeholder="City" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name={["address", "state"]} label="State / Province">
              <Input placeholder="State" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name={["address", "country"]} label="Country">
              <Input placeholder="Country" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name={["address", "zipCode"]} label="Zip / Postal Code">
              <Input placeholder="Zip Code" />
            </Form.Item>
          </Col>
        </Row>

        <Divider style={{ margin: "12px 0" }} />

        <Form.Item
          name="password"
          label="New Password"
          tooltip="Leave blank if you don't want to change your password"
        >
          <Input.Password placeholder="Enter new password (optional)" />
        </Form.Item>

        <div style={{ textAlign: "right", marginTop: 24 }}>
          <Button onClick={onClose} style={{ marginRight: 8 }}>
            Cancel
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={updateMutation.isLoading}
          >
            Save Changes
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default EditProfileModal;
