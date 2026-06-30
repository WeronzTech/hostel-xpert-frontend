import {useState, useEffect} from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  Button,
  Space,
  message,
  Row,
  Col,
} from "antd";
import {FiEdit} from "react-icons/fi";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {updateSalaryRecord} from "../../hooks/accounts/useAccounts";
import dayjs from "dayjs";

const {Option} = Select;
const {TextArea} = Input;

const EditSalaryModal = ({visible, onCancel, salaryRecord}) => {
  const [form] = Form.useForm();
  const [paymentMethod, setPaymentMethod] = useState("");
  const queryClient = useQueryClient();
  const [messageApi, contextHolder] = message.useMessage();

  const isAdvance = salaryRecord?.remarkType === "ADVANCE_PAYMENT";

  useEffect(() => {
    if (salaryRecord && visible) {
      form.setFieldsValue({
        salary: salaryRecord.salary || 0,
        paidAmount: salaryRecord.paidAmount || 0,
        paymentMethod: salaryRecord.paymentMethod,
        transactionId: salaryRecord.transactionId || "",
        paymentDate: salaryRecord.date ? dayjs(salaryRecord.date) : dayjs(),
        remarks: salaryRecord.remarks || "",
      });
      setPaymentMethod(salaryRecord.paymentMethod);
    }
  }, [salaryRecord, visible, form]);

  const updateMutation = useMutation({
    mutationFn: (data) => updateSalaryRecord(salaryRecord._id, data),
    onSuccess: (res) => {
      messageApi.success("Salary record updated successfully");
      queryClient.invalidateQueries(["salaries"]);
      queryClient.invalidateQueries(["expenses"]);
      onCancel();
    },
    onError: (err) => {
      messageApi.error(err.message || "Failed to update salary record");
    },
  });

  const onFinish = (values) => {
    const payload = {
      updateData: {
        salary: isAdvance ? 0 : (values.salary || 0),
        paidAmount: values.paidAmount || 0,
        paymentMethod: values.paymentMethod,
        transactionId: values.transactionId,
        paymentDate: values.paymentDate ? values.paymentDate.toISOString() : new Date().toISOString(),
        remarks: values.remarks,
      }
    };
    updateMutation.mutate(payload);
  };

  return (
    <>
      {contextHolder}
      <Modal
        title={
          <div style={{display: "flex", alignItems: "center", gap: "8px"}}>
            <FiEdit style={{fontSize: "18px", color: "#e11d48"}} />
            <span>Edit Salary Record - {salaryRecord?.employeeName}</span>
          </div>
        }
        open={visible}
        onCancel={onCancel}
        footer={null}
        centered
        width={550}
        maskClosable={false}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            salary: 0,
            paidAmount: 0,
            paymentDate: dayjs(),
          }}
        >
          <Row gutter={16}>
            {!isAdvance && (
              <Col span={12}>
                <Form.Item
                  name="salary"
                  label="Total Salary Amount"
                  rules={[
                    {required: true, message: "Please enter total salary"},
                    {type: "number", min: 0, message: "Salary must be positive"},
                  ]}
                >
                  <InputNumber
                    style={{width: "100%"}}
                    placeholder="Enter salary"
                    prefix="₹"
                  />
                </Form.Item>
              </Col>
            )}
            <Col span={isAdvance ? 24 : 12}>
              <Form.Item
                name="paidAmount"
                label={isAdvance ? "Advance Paid Amount" : "Paid Amount"}
                rules={[
                  {required: true, message: "Please enter paid amount"},
                  {type: "number", min: 0, message: "Amount must be positive"},
                ]}
              >
                <InputNumber
                  style={{width: "100%"}}
                  placeholder="Enter paid amount"
                  prefix="₹"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="paymentMethod"
                label="Payment Method"
                rules={[{required: true, message: "Please select payment method"}]}
              >
                <Select onChange={(val) => setPaymentMethod(val)}>
                  <Option value="Cash">Cash</Option>
                  <Option value="UPI">UPI</Option>
                  <Option value="Bank Transfer">Bank Transfer</Option>
                  <Option value="Petty Cash">Petty Cash</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                noStyle
                shouldUpdate={(prevValues, currentValues) =>
                  prevValues.paymentMethod !== currentValues.paymentMethod
                }
              >
                {({getFieldValue}) => {
                  const method = getFieldValue("paymentMethod");
                  const isRequired = method === "UPI" || method === "Bank Transfer";
                  return (
                    <Form.Item
                      name="transactionId"
                      label="Transaction ID"
                      rules={[
                        {
                          required: isRequired,
                          message: "Transaction ID is required for digital payments",
                        },
                      ]}
                    >
                      <Input
                        placeholder="Enter transaction ID"
                        disabled={!isRequired}
                      />
                    </Form.Item>
                  );
                }}
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="paymentDate"
                label="Payment Date"
                rules={[{required: true, message: "Please select payment date"}]}
              >
                <DatePicker style={{width: "100%"}} format="DD-MM-YYYY" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="remarks" label="Remarks (Optional)">
            <TextArea placeholder="Enter remarks" rows={2} />
          </Form.Item>

          <Form.Item style={{marginBottom: 0, textAlign: "right"}}>
            <Space>
              <Button onClick={onCancel} disabled={updateMutation.isLoading}>
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={updateMutation.isLoading}
                style={{backgroundColor: "#e11d48", borderColor: "#e11d48"}}
              >
                Save Changes
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default EditSalaryModal;
