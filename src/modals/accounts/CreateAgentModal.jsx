import {Modal, Form, Input, Button, message, Space, Radio} from "antd";
import {QueryClient, useMutation, useQueryClient} from "@tanstack/react-query";
import {addAgency} from "../../hooks/accounts/useAccounts";
import {useState} from "react";

const CreateAgentModal = ({visible, onCancel, onSuccess}) => {
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const queryClient = useQueryClient();

  // initially, no selection made
  const [hasAgency, setHasAgency] = useState(null);

  const addAgencyMutation = useMutation({
    mutationFn: addAgency,
    onSuccess: (data) => {
      messageApi.success({
        content: `${data.message}`,
        duration: 3,
      });

      queryClient.invalidateQueries({queryKey: ["agents"]});

      form.resetFields();
      setHasAgency(null); // reset selection
      onSuccess?.();
      onCancel();
    },
    onError: (error) => {
      messageApi.error({
        content: `${error.message}`,
        duration: 3,
      });
    },
  });

  const handleSubmit = async (values) => {
    const requestData = {
      agentName: values.agentName,
      hasAgency,
      ...(hasAgency
        ? {agencyName: values.agencyName}
        : {contactNumber: values.contactNumber}),
    };

    console.log("Agent creation data:", requestData);
    addAgencyMutation.mutate(requestData);
  };

  const handleCancel = () => {
    form.resetFields();
    setHasAgency(null);
    onCancel();
  };

  return (
    <>
      {contextHolder}
      <Modal
        title="Create New Agent"
        open={visible}
        onCancel={handleCancel}
        footer={null}
        width={400}
        centered
        maskClosable={false}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
        >
          {/* Agent Name */}
          <Form.Item
            label="Agent Name"
            name="agentName"
            rules={[{required: true, message: "Please enter agent name"}]}
          >
            <Input placeholder="Enter agent full name" />
          </Form.Item>

          {/* Radio Group - Has Agency */}
          <Form.Item label="Does this agent have an agency?" name="hasAgency">
            <Radio.Group
              onChange={(e) => setHasAgency(e.target.value)}
              value={hasAgency}
            >
              <Radio value={true}>Yes</Radio>
              <Radio value={false}>No</Radio>
            </Radio.Group>
          </Form.Item>

          {/* Conditionally render only after a choice is made */}
          {hasAgency === true && (
            <Form.Item
              label="Agency Name"
              name="agencyName"
              rules={[{required: true, message: "Please enter agency name"}]}
            >
              <Input placeholder="Enter agency name" />
            </Form.Item>
          )}

          {hasAgency === false && (
            <Form.Item
              label="Contact Number"
              name="contactNumber"
              rules={[
                {required: true, message: "Please enter contact number"},
                {
                  pattern: /^[0-9]{10}$/,
                  message: "Please enter a valid 10-digit number",
                },
              ]}
            >
              <Input placeholder="Enter contact number" maxLength={10} />
            </Form.Item>
          )}

          {/* Buttons */}
          <Form.Item style={{marginBottom: 0, textAlign: "right"}}>
            <Space>
              <Button
                onClick={handleCancel}
                disabled={addAgencyMutation.isLoading}
              >
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={addAgencyMutation.isLoading}
              >
                Create Agent
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default CreateAgentModal;
