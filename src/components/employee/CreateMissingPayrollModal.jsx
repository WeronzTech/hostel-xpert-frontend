import {Modal, Form, message, Space, Alert} from "antd";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {generateMissingPayroll} from "../../hooks/accounts/useAccounts";
import {useState} from "react";
import {ExclamationCircleOutlined} from "@ant-design/icons";

const CreateMissingPayrollModal = ({visible, onCancel, onSuccess}) => {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const [messageApi, contextHolder] = message.useMessage();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const missingPayrollMutation = useMutation({
    mutationFn: () => {
      return generateMissingPayroll();
    },
    onSuccess: (response) => {
      if (response?.success) {
        queryClient.invalidateQueries(["payrolls"]);

        // Show success message with count if available
        const count = response.data?.createdCount || response.data?.count || 0;
        messageApi.success(
          count > 0
            ? `${count} missing payroll${count > 1 ? "s" : ""} created successfully`
            : "Missing payroll check completed",
        );
        setIsSubmitting(false);
        setTimeout(() => {
          onSuccess();
          form.resetFields();
        }, 500);
      } else {
        messageApi.error(
          response?.message || "Failed to generate missing payrolls",
        );
        setIsSubmitting(false);
      }
    },
    onError: (error) => {
      console.error("❌ Missing payroll error:", error);
      messageApi.error(error.message || "Failed to generate missing payrolls");
      setIsSubmitting(false);
    },
  });

  const handleSubmit = async () => {
    // Prevent multiple submissions
    if (isSubmitting || missingPayrollMutation.isLoading) {
      messageApi.warning("Generation is already in progress");
      return;
    }

    setIsSubmitting(true);
    missingPayrollMutation.mutate();
  };

  const handleCancel = () => {
    if (isSubmitting || missingPayrollMutation.isLoading) {
      messageApi.warning("Please wait while processing");
      return;
    }
    form.resetFields();
    onCancel();
  };

  return (
    <>
      {contextHolder}
      <Modal
        title={
          <Space>
            <ExclamationCircleOutlined style={{color: "#fa8c16"}} />
            Generate Missing Payrolls
          </Space>
        }
        open={visible}
        onCancel={handleCancel}
        onOk={handleSubmit}
        confirmLoading={missingPayrollMutation.isLoading || isSubmitting}
        width={550}
        okText="Generate Missing Payrolls"
        cancelButtonProps={{
          disabled: isSubmitting || missingPayrollMutation.isLoading,
        }}
        maskClosable={!isSubmitting && !missingPayrollMutation.isLoading}
        closable={!isSubmitting && !missingPayrollMutation.isLoading}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          {/* Info Alert */}
          <Alert
            message="What does this do?"
            description="This will check for employees who joined in past months but don't have payroll records created yet. It will generate payroll records for those missing months."
            type="info"
            showIcon
            style={{marginBottom: 20}}
          />
        </Form>
      </Modal>
    </>
  );
};

export default CreateMissingPayrollModal;
