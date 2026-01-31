import {
  Modal,
  Input,
  Form,
  Button,
  message,
  Select,
  DatePicker,
  Typography,
  Row,
  Col,
  Card,
  Statistic,
} from "antd";
import {useState} from "react";
import dayjs from "dayjs";
import {useMutation} from "@tanstack/react-query";
import {makeRefundPayment} from "../../hooks/accounts/useAccounts";

const {Text} = Typography;

const RefundInitiateModal = ({open, onClose, user, onSuccess}) => {
  const [form] = Form.useForm();
  const [paymentMethod, setPaymentMethod] = useState(null);

  const [messageApi, contextHolder] = message.useMessage();

  // ✅ Mutation using TanStack Query
  const mutation = useMutation({
    mutationFn: (payload) => makeRefundPayment(payload),
    onSuccess: (data) => {
      messageApi.success({
        content: `${data.message}`,
        duration: 3,
      });
      onSuccess(data); // notify parent
      form.resetFields();
      onClose();
    },
    onError: (error) => {
      messageApi.error({
        content: `${error.message}`,
        duration: 3,
      });
      //   message.error(error?.message || "Failed to record refund.");
      console.error("Refund API Error:", error);
    },
  });

  const requiresTransactionId = ["UPI", "Bank Transfer"].includes(
    paymentMethod
  );

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      const payload = {
        userId: user._id,
        amount: values.amount,
        paymentMethod: values.paymentMethod,
        paymentDate: values.paymentDate.format("YYYY-MM-DD"),
        transactionId: requiresTransactionId ? values.transactionId : null,
        remarks: values.remarks || "",
      };

      mutation.mutate(payload);
    } catch (err) {
      console.error(err);
      message.error("Please fill in all required fields.");
    }
  };

  return (
    <>
      {contextHolder}
      <Modal
        title={`Initiate Deposit Refund - ${user?.name || "User"}`}
        open={open}
        onCancel={onClose}
        centered
        width={600}
        footer={[
          <Button key="cancel" onClick={onClose}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={mutation.isLoading}
            onClick={handleSubmit}
          >
            Confirm Refund
          </Button>,
        ]}
      >
        {/* Deposit Display */}
        <div
          style={{marginBottom: 24, display: "flex", justifyContent: "center"}}
        >
          <Card size="small" style={{textAlign: "center", minWidth: 260}}>
            <Statistic
              title="Refundable Deposit Amount"
              value={user?.refundableDeposit || 0}
              precision={2}
              valueStyle={{color: "#3f8600"}}
              prefix="₹"
            />
          </Card>
        </div>

        {/* Refund Form */}
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Refund Amount"
                name="amount"
                rules={[
                  {required: true, message: "Please enter refund amount"},
                ]}
              >
                <Input
                  type="number"
                  min={0}
                  placeholder="Enter refund amount"
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Payment Method"
                name="paymentMethod"
                rules={[
                  {required: true, message: "Please select payment method"},
                ]}
              >
                <Select
                  placeholder="Select payment method"
                  onChange={(value) => setPaymentMethod(value)}
                  options={[
                    {label: "Cash", value: "Cash"},
                    {label: "UPI", value: "UPI"},
                    {label: "Bank Transfer", value: "Bank Transfer"},
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            {requiresTransactionId ? (
              <>
                <Col span={12}>
                  <Form.Item
                    label="Transaction ID"
                    name="transactionId"
                    rules={[
                      {required: true, message: "Please enter transaction ID"},
                    ]}
                  >
                    <Input placeholder="Enter transaction ID" />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    label="Payment Date"
                    name="paymentDate"
                    rules={[
                      {required: true, message: "Please select payment date"},
                    ]}
                  >
                    <DatePicker
                      style={{width: "100%"}}
                      format="YYYY-MM-DD"
                      disabledDate={(current) =>
                        current && current > dayjs().endOf("day")
                      }
                    />
                  </Form.Item>
                </Col>
              </>
            ) : (
              <>
                <Col span={12}>
                  <Form.Item
                    label="Payment Date"
                    name="paymentDate"
                    rules={[
                      {required: true, message: "Please select payment date"},
                    ]}
                  >
                    <DatePicker
                      style={{width: "100%"}}
                      format="YYYY-MM-DD"
                      disabledDate={(current) =>
                        current && current > dayjs().endOf("day")
                      }
                    />
                  </Form.Item>
                </Col>
                <Col span={12}></Col>
              </>
            )}
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item label="Remarks" name="remarks">
                <Input.TextArea rows={3} placeholder="Optional remarks" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </>
  );
};

export default RefundInitiateModal;
