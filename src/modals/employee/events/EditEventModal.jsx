import { Modal, Form, Input, Select, message } from "antd";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import {
  editEventPermissions,
  getAllRoles,
} from "../../../hooks/employee/useEmployee";

const { Option } = Select;

const EditEventModal = ({ open, onClose, eventPermission }) => {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const [messageApi, contextHolder] = message.useMessage();

  const { data: rolesData, isLoading: rolesLoading } = useQuery({
    queryKey: ["roles"],
    queryFn: () => getAllRoles(),
  });

  useEffect(() => {
    if (eventPermission) {
      form.setFieldsValue({
        eventName: eventPermission.eventName,
        userRoles: eventPermission.userRoles?.map((role) => role._id),
      });
    } else {
      form.resetFields();
    }
  }, [eventPermission, form]);

  const handleEditEvent = useMutation({
    mutationFn: (data) => editEventPermissions(eventPermission?._id, data),
    onSuccess: () => {
      messageApi.success("Event updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["eventPermissions"] });
      onClose();
    },
    onError: (error) => {
      messageApi.error(
        error.response?.data?.message || "Failed to update event."
      );
    },
  });

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      handleEditEvent.mutate(values);
    } catch (info) {
      console.log("Validate Failed:", info);
    }
  };

  return (
    <>
      {contextHolder}
      <Modal
        title="Edit Event"
        open={open}
        onOk={handleOk}
        onCancel={onClose}
        confirmLoading={handleEditEvent.isPending}
        okText="Update Event"
      >
        <Form form={form} layout="vertical" name="editEventForm">
          <Form.Item
            name="eventName"
            label="Event Name"
            rules={[
              { required: true, message: "Please enter the event name." },
            ]}
          >
            <Input placeholder="e.g., new-maintenance" />
          </Form.Item>
          <Form.Item
            name="userRoles"
            label="User Roles"
            rules={[
              { required: true, message: "Please add at least one role." },
            ]}
          >
            <Select
              mode="multiple"
              placeholder="Select roles"
              loading={rolesLoading}
              allowClear
            >
              {rolesData?.map((role) => (
                <Option key={role._id} value={role._id}>
                  {role.roleName}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default EditEventModal;
