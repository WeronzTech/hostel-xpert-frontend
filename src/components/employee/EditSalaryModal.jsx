import {useMutation, useQueryClient} from "@tanstack/react-query";
import {Card, Input, message, Modal, Space, Form} from "antd"; // Fixed: Import Form from antd
import {useEffect} from "react"; // Added missing useEffect import
import {editPayrollSalary} from "../../hooks/accounts/useAccounts";
import {EditOutlined} from "@ant-design/icons";
import dayjs from "dayjs"; // Added missing dayjs import

const EditSalaryModal = ({visible, payroll, onCancel, onSuccess}) => {
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const queryClient = useQueryClient();

  // Reset form when modal opens
  useEffect(() => {
    if (visible && payroll) {
      form.setFieldsValue({
        salary: payroll.salary,
      });
    }
  }, [visible, payroll, form]);

  const editSalaryMutation = useMutation({
    mutationFn: (data) => {
      console.log("🚀 Updating salary:", data);
      return editPayrollSalary(data);
    },
    onSuccess: (response) => {
      console.log("✅ Salary updated successfully:", response);
      messageApi.success("Salary updated successfully");
      queryClient.invalidateQueries(["payrolls"]);

      setTimeout(() => {
        onSuccess();
        form.resetFields();
      }, 500);
    },
    onError: (error) => {
      console.error("❌ Salary update error:", error);
      messageApi.error(error.message || "Failed to update salary");
    },
  });

  const handleSubmit = async (values) => {
    if (!payroll) return;

    const updateData = {
      payrollId: payroll._id,
      salary: values.salary,
      employeeId: payroll.employeeId,
      month: payroll.month,
      year: payroll.year,
    };

    editSalaryMutation.mutate(updateData);
  };

  if (!payroll) return null;

  return (
    <>
      {contextHolder}
      <Modal
        title={
          <Space>
            <EditOutlined style={{color: "#1890ff"}} />
            Edit Salary - {payroll.name}
          </Space>
        }
        open={visible}
        onCancel={() => {
          if (!editSalaryMutation.isLoading) {
            form.resetFields();
            onCancel();
          }
        }}
        onOk={() => form.submit()}
        confirmLoading={editSalaryMutation.isLoading}
        okText="Update Salary"
        cancelButtonProps={{disabled: editSalaryMutation.isLoading}}
        maskClosable={!editSalaryMutation.isLoading}
        closable={!editSalaryMutation.isLoading}
        width={500}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          disabled={editSalaryMutation.isLoading}
        >
          <Form.Item
            name="salary"
            label="New Salary Amount (₹)"
            rules={[
              {required: true, message: "Please enter salary amount"},
              {
                validator: (_, value) => {
                  if (value <= 0) {
                    return Promise.reject(
                      new Error("Salary must be greater than 0"),
                    );
                  }
                  if (value > 10000000) {
                    return Promise.reject(
                      new Error("Salary amount seems too high"),
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input
              type="number"
              min={1}
              max={10000000}
              prefix="₹"
              placeholder="Enter new salary"
              size="large"
              autoFocus
            />
          </Form.Item>

          {/* Info Card */}
          <Card size="small" style={{background: "#f5f5f5", marginTop: 8}}>
            <Space direction="vertical" size={4} style={{width: "100%"}}>
              <div style={{display: "flex", justifyContent: "space-between"}}>
                <span style={{color: "#666"}}>Current Salary:</span>
                <span style={{fontWeight: 500}}>
                  ₹{payroll.salary?.toLocaleString()}
                </span>
              </div>

              <div style={{display: "flex", justifyContent: "space-between"}}>
                <span style={{color: "#666"}}>Month:</span>
                <span style={{fontWeight: 500}}>
                  {dayjs().month(payroll.month).format("MMMM")} {payroll.year}
                </span>
              </div>
            </Space>
          </Card>

          <div style={{marginTop: 16, color: "#fa8c16", fontSize: 13}}>
            <span>
              ⚠️ Note: Updating salary will affect future calculations and
              pending amounts.
            </span>
          </div>
        </Form>
      </Modal>
    </>
  );
};

export default EditSalaryModal;
