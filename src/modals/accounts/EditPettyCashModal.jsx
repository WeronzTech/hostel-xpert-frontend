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
import {updatePettyCashTransaction} from "../../hooks/accounts/useAccounts";
import dayjs from "dayjs";

const {Option} = Select;
const {TextArea} = Input;

const EditPettyCashModal = ({visible, onCancel, transaction, managerId}) => {
  const [form] = Form.useForm();
  const [paymentMode, setPaymentMode] = useState("");
  const queryClient = useQueryClient();
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    if (transaction && visible) {
      form.setFieldsValue({
        inHandAmount: transaction.inHandAmount || 0,
        inAccountAmount: transaction.inAccountAmount || 0,
        paymentMode: transaction.paymentMode || "",
        transactionId: transaction.transactionId || "",
        date: transaction.date ? dayjs(transaction.date) : dayjs(),
        notes: transaction.notes || "",
      });
      setPaymentMode(transaction.paymentMode || "");
    }
  }, [transaction, visible, form]);

  const updateMutation = useMutation({
    mutationFn: (data) => updatePettyCashTransaction(transaction.id || transaction._id, data),
    onSuccess: (res) => {
      messageApi.success("Petty cash transaction updated successfully");
      queryClient.invalidateQueries(["pettyCashTransactions", managerId]);
      queryClient.invalidateQueries(["pettyCash", managerId]);
      onCancel();
    },
    onError: (err) => {
      messageApi.error(err.message || "Failed to update transaction");
    },
  });

  const onFinish = (values) => {
    const payload = {
      updateData: {
        inHandAmount: values.inHandAmount || 0,
        inAccountAmount: values.inAccountAmount || 0,
        paymentMode: values.paymentMode,
        transactionId: values.transactionId,
        date: values.date ? values.date.toISOString() : new Date().toISOString(),
        notes: values.notes,
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
            <FiEdit style={{fontSize: "18px", color: "#1890ff"}} />
            <span>Edit Petty Cash Transaction</span>
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
            inHandAmount: 0,
            inAccountAmount: 0,
            date: dayjs(),
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="inHandAmount"
                label="Cash In Hand"
                rules={[
                  {type: "number", min: 0, message: "Amount must be positive"},
                ]}
              >
                <InputNumber
                  style={{width: "100%"}}
                  placeholder="In Hand amount"
                  prefix="₹"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="inAccountAmount"
                label="Cash In Account"
                rules={[
                  {type: "number", min: 0, message: "Amount must be positive"},
                ]}
              >
                <InputNumber
                  style={{width: "100%"}}
                  placeholder="In Account amount"
                  prefix="₹"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                noStyle
                shouldUpdate={(prevValues, currentValues) =>
                  prevValues.inAccountAmount !== currentValues.inAccountAmount
                }
              >
                {({getFieldValue}) => {
                  const inAccount = getFieldValue("inAccountAmount");
                  const isRequired = inAccount > 0;
                  return (
                    <Form.Item
                      name="paymentMode"
                      label="Payment Mode"
                      rules={[
                        {
                          required: isRequired,
                          message: "Please select payment mode for account addition",
                        },
                      ]}
                    >
                      <Select
                        placeholder="Select mode"
                        onChange={(val) => setPaymentMode(val)}
                        disabled={!isRequired}
                        allowClear
                      >
                        <Option value="upi">UPI</Option>
                        <Option value="bank_transfer">Bank Transfer</Option>
                      </Select>
                    </Form.Item>
                  );
                }}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                noStyle
                shouldUpdate={(prevValues, currentValues) =>
                  prevValues.paymentMode !== currentValues.paymentMode ||
                  prevValues.inAccountAmount !== currentValues.inAccountAmount
                }
              >
                {({getFieldValue}) => {
                  const method = getFieldValue("paymentMode");
                  const inAccount = getFieldValue("inAccountAmount");
                  const isRequired = inAccount > 0 && (method === "upi" || method === "bank_transfer");
                  return (
                    <Form.Item
                      name="transactionId"
                      label="Transaction ID"
                      rules={[
                        {
                          required: isRequired,
                          message: "Transaction ID is required for digital additions",
                        },
                      ]}
                    >
                      <Input
                        placeholder="Enter reference ID"
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
                name="date"
                label="Date of Transaction"
                rules={[{required: true, message: "Please select transaction date"}]}
              >
                <DatePicker style={{width: "100%"}} format="DD-MM-YYYY" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="notes" label="Notes (Optional)">
            <TextArea placeholder="Enter notes" rows={2} />
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

export default EditPettyCashModal;
