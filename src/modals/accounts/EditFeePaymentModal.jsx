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
import {FiEdit, FiDollarSign} from "react-icons/fi";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {updateFeePayment} from "../../hooks/accounts/useAccounts";
import dayjs from "dayjs";

const {Option} = Select;
const {TextArea} = Input;

const EditFeePaymentModal = ({visible, onCancel, payment}) => {
  const [form] = Form.useForm();
  const [paymentMethod, setPaymentMethod] = useState("");
  const queryClient = useQueryClient();
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    if (payment && visible) {
      form.setFieldsValue({
        amount: payment.amount,
        waveOffAmount: payment.waveOffAmount || 0,
        waveOffReason: payment.waveOffReason || "",
        paymentMethod: payment.paymentMethod,
        transactionId: payment.transactionId || "",
        paymentDate: payment.paymentDate ? dayjs(payment.paymentDate) : dayjs(),
        remarks: payment.remarks || "",
        collectedBy: payment.collectedBy || "",
      });
      setPaymentMethod(payment.paymentMethod);
    }
  }, [payment, visible, form]);

  const updateMutation = useMutation({
    mutationFn: (data) => updateFeePayment(payment._id, data),
    onSuccess: (res) => {
      messageApi.success("Fee payment updated successfully");
      queryClient.invalidateQueries(["fees"]);
      queryClient.invalidateQueries(["userTransactionHistory"]);
      queryClient.invalidateQueries(["residents"]);
      onCancel();
    },
    onError: (err) => {
      messageApi.error(err.message || "Failed to update payment");
    },
  });

  const onFinish = (values) => {
    const payload = {
      ...values,
      paymentDate: values.paymentDate ? values.paymentDate.toISOString() : new Date().toISOString(),
    };
    updateMutation.mutate(payload);
  };

  return (
    <>
      {contextHolder}
      <Modal
        title={
          <div style={{display: "flex", alignItems: "center", gap: "8px"}}>
            <FiEdit style={{fontSize: "18px", color: "#059669"}} />
            <span>Edit Fee Payment - {payment?.name}</span>
          </div>
        }
        open={visible}
        onCancel={onCancel}
        footer={null}
        centered
        width={600}
        maskClosable={false}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            waveOffAmount: 0,
            paymentDate: dayjs(),
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="amount"
                label="Amount Paid"
                rules={[
                  {required: true, message: "Please enter paid amount"},
                  {type: "number", min: 0, message: "Amount must be positive"},
                ]}
              >
                <InputNumber
                  style={{width: "100%"}}
                  placeholder="Enter amount"
                  prefix="₹"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="paymentDate"
                label="Payment Date"
                rules={[{required: true, message: "Please select payment date"}]}
              >
                <DatePicker style={{width: "100%"}} format="DD-MM-YYYY" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="waveOffAmount"
                label="Wave Off Amount"
                rules={[{type: "number", min: 0, message: "Amount must be positive"}]}
              >
                <InputNumber
                  style={{width: "100%"}}
                  placeholder="Enter wave off amount"
                  prefix="₹"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                noStyle
                shouldUpdate={(prevValues, currentValues) =>
                  prevValues.waveOffAmount !== currentValues.waveOffAmount
                }
              >
                {({getFieldValue}) => {
                  const waveOff = getFieldValue("waveOffAmount");
                  return (
                    <Form.Item
                      name="waveOffReason"
                      label="Wave Off Reason"
                      rules={[
                        {
                          required: waveOff > 0,
                          message: "Please enter a wave off reason",
                        },
                      ]}
                    >
                      <Input placeholder="Enter reason" disabled={!waveOff || waveOff <= 0} />
                    </Form.Item>
                  );
                }}
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
                  <Option value="Card">Card</Option>
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
                  const isTxnRequired = method === "UPI" || method === "Bank Transfer";
                  return (
                    <Form.Item
                      name="transactionId"
                      label="Transaction ID"
                      rules={[
                        {
                          required: isTxnRequired,
                          message: "Transaction ID is required for digital payments",
                        },
                      ]}
                    >
                      <Input
                        placeholder="Enter transaction reference"
                        disabled={!isTxnRequired}
                      />
                    </Form.Item>
                  );
                }}
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item name="collectedBy" label="Collected By">
                <Input placeholder="Enter collector's name" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="remarks" label="Remarks (Optional)">
            <TextArea placeholder="Enter additional notes" rows={2} />
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
                style={{backgroundColor: "#059669", borderColor: "#059669"}}
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

export default EditFeePaymentModal;
