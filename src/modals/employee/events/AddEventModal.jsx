import { Modal, Form, Input, Select, message } from "antd";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addEventPermissions,
  getAllRoles,
} from "../../../hooks/employee/useEmployee";

const { Option } = Select;

const AddEventModal = ({ open, onClose }) => {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const [messageApi, contextHolder] = message.useMessage();

  const { data: rolesData, isLoading: rolesLoading } = useQuery({
    queryKey: ["roles"],
    queryFn: () => getAllRoles(),
  });

  const handleAddEvent = useMutation({
    mutationFn: (data) => addEventPermissions(data),
    onSuccess: () => {
      messageApi.success("Event added successfully!");
      queryClient.invalidateQueries({ queryKey: ["eventPermissions"] });
      onClose();
      form.resetFields();
    },
    onError: (error) => {
      messageApi.error(error.response?.data?.message || "Failed to add event.");
    },
  });

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      handleAddEvent.mutate(values);
    } catch (info) {
      console.log("Validate Failed:", info);
    }
  };

  return (
    <>
      {contextHolder}
      <Modal
        title="Add New Event"
        open={open}
        onOk={handleOk}
        onCancel={onClose}
        confirmLoading={handleAddEvent.isPending}
        okText="Save Event"
      >
        <Form form={form} layout="vertical" name="addRoleForm">
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
              {
                required: true,
                message: "Please add at least one role.",
              },
            ]}
          >
            <Select
              mode="multiple"
              placeholder="Select a role"
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

export default AddEventModal;
