import {
  Modal,
  Form,
  Input,
  DatePicker,
  Select,
  message,
  Card,
  Row,
  Col,
} from "antd";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {
  getAllPettyCashes,
  processPayment,
} from "../../hooks/accounts/useAccounts";
import {useState} from "react";
import {useSelector} from "react-redux";

const PaymentModal = ({visible, payroll, onCancel, onSuccess}) => {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const [messageApi, contextHolder] = message.useMessage();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {selectedProperty} = useSelector((state) => state.properties);
  const {user} = useSelector((state) => state.auth);

  const paymentMethod = Form.useWatch("paymentMethod", form);
  const pettyCashMode = Form.useWatch("pettyCashMode", form);

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const getPendingAmount = () => {
    if (!payroll) return 0;
    if (payroll.pendingAmount !== undefined) return payroll.pendingAmount;
    return payroll.status === "Pending" ? payroll.netSalary : 0;
  };

  const getPaidAmount = () => {
    if (!payroll) return 0;
    return payroll.netSalary - getPendingAmount();
  };

  const getPayrollMonth = (month, year) => {
    if (month === undefined || year === undefined) return "";
    return `${months[month % 12]} ${year}`;
  };

  const {data: pettyCashes = [], isLoading: pettyCashLoading} = useQuery({
    queryKey: ["pettyCashes", selectedProperty?.id, user.userType],
    queryFn: () =>
      getAllPettyCashes({
        propertyId: selectedProperty?.id,
        userType: user.userType,
      }),
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });

  const paymentMutation = useMutation({
    mutationFn: (data) => {
      return processPayment(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["payrolls"]);
      messageApi.success({
        content: `Payment processed successfully`,
        duration: 3,
      });
      setIsSubmitting(false);

      // Small delay to show success message before closing
      setTimeout(() => {
        onSuccess();
        form.resetFields();
      }, 1000);
    },
    onError: (error) => {
      messageApi.error(error.message || "Payment processing failed");
      setIsSubmitting(false);
    },
  });

  const handleSubmit = async (values) => {
    // Prevent multiple submissions
    if (isSubmitting || paymentMutation.isLoading) {
      messageApi.warning("Payment is already being processed");
      return;
    }

    setIsSubmitting(true);

    // Find the selected petty cash to get manager ID
    const selectedPettyCash = pettyCashes.find(
      (pc) => pc._id === values.pettyCashHolder,
    );

    const paymentData = {
      ...values,
      payrollId: payroll._id,
      paymentDate: values.paymentDate.toISOString(),
      // Add manager ID if petty cash is selected
      ...(values.paymentMethod === "Petty Cash" && {
        managerId: selectedPettyCash?.manager,
        pettyCashId: values.pettyCashHolder,
        pettyCashType: values.pettyCashMode,
      }),
    };

    paymentMutation.mutate(paymentData);
  };

  const handleCancel = () => {
    if (isSubmitting || paymentMutation.isLoading) {
      messageApi.warning("Please wait while payment is being processed");
      return;
    }
    form.resetFields();
    onCancel();
  };

  if (!payroll) return null;

  const pendingAmount = getPendingAmount();
  const paidAmount = getPaidAmount();

  return (
    <>
      {contextHolder}
      <Modal
        title={`Process Payment - ${payroll.name}`}
        open={visible}
        onCancel={handleCancel}
        onOk={() => form.submit()}
        confirmLoading={paymentMutation.isLoading || isSubmitting}
        width={650}
        okText="Process Payment"
        cancelButtonProps={{
          disabled: isSubmitting || paymentMutation.isLoading,
        }}
        maskClosable={!isSubmitting && !paymentMutation.isLoading}
        closable={!isSubmitting && !paymentMutation.isLoading}
      >
        {/* Payroll Summary */}
        <Card size="small" style={{marginBottom: 20, background: "#f5f5f5"}}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <div>
              <div style={{fontSize: 12, color: "#666"}}>Period</div>
              <div style={{fontWeight: 500}}>
                {getPayrollMonth(payroll.month, payroll.year)}
              </div>
            </div>
            <div>
              <div style={{fontSize: 12, color: "#666"}}>Net Salary</div>
              <div>₹{payroll.netSalary?.toLocaleString() || 0}</div>
            </div>
            <div>
              <div style={{fontSize: 12, color: "#666"}}>Paid</div>
              <div style={{color: "#389e0d"}}>
                ₹{paidAmount.toLocaleString()}
              </div>
            </div>
            <div>
              <div style={{fontSize: 12, color: "#666"}}>Pending</div>
              <div style={{color: "#fa8c16", fontWeight: 600}}>
                ₹{pendingAmount.toLocaleString()}
              </div>
            </div>
          </div>
        </Card>

        {/* Payment Form */}
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          disabled={isSubmitting || paymentMutation.isLoading}
        >
          <Form.Item
            name="amount"
            label="Payment Amount"
            rules={[
              {required: true, message: "Please enter amount"},
              {
                validator: (_, value) => {
                  if (value > pendingAmount) {
                    return Promise.reject(
                      new Error(
                        `Amount cannot exceed pending amount (₹${pendingAmount.toLocaleString()})`,
                      ),
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input
              prefix="₹"
              type="number"
              min={1}
              max={pendingAmount}
              disabled={isSubmitting || paymentMutation.isLoading}
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="paymentDate"
                label="Payment Date"
                rules={[{required: true, message: "Please select date"}]}
              >
                <DatePicker
                  className="w-full"
                  format="DD-MM-YYYY"
                  disabled={isSubmitting || paymentMutation.isLoading}
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="paymentMethod"
                label="Payment Method"
                rules={[
                  {required: true, message: "Please select payment method"},
                ]}
              >
                <Select
                  placeholder="Select payment method"
                  disabled={isSubmitting || paymentMutation.isLoading}
                >
                  <Select.Option value="UPI">UPI</Select.Option>
                  <Select.Option value="Cash">Cash</Select.Option>
                  <Select.Option value="Bank Transfer">
                    Bank Transfer
                  </Select.Option>
                  <Select.Option value="Petty Cash">Petty Cash</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {paymentMethod === "Petty Cash" && (
            <>
              <Form.Item
                name="pettyCashHolder"
                label="Petty Cash Holder"
                rules={[{required: true, message: "Please select holder"}]}
              >
                <Select
                  placeholder="Select petty cash holder"
                  loading={pettyCashLoading}
                  disabled={isSubmitting || paymentMutation.isLoading}
                  optionLabelProp="label"
                  showSearch
                  filterOption={(input, option) =>
                    option.props.label
                      .toLowerCase()
                      .indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {pettyCashes.map((holder) => (
                    <Select.Option
                      key={holder._id}
                      value={holder._id}
                      label={`${holder.managerName} - ₹${(holder.inHandAmount + holder.inAccountAmount).toLocaleString()}`}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <span>{holder.managerName}</span>
                        <span style={{color: "#666"}}>
                          Total: ₹
                          {(
                            holder.inHandAmount + holder.inAccountAmount
                          ).toLocaleString()}
                        </span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: "11px",
                          color: "#999",
                          marginTop: 2,
                        }}
                      >
                        <span>
                          In Hand: ₹{holder.inHandAmount.toLocaleString()}
                        </span>
                        <span>
                          In Account: ₹{holder.inAccountAmount.toLocaleString()}
                        </span>
                      </div>
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="pettyCashMode"
                label="Petty Cash Type"
                rules={[{required: true, message: "Please select type"}]}
              >
                <Select
                  placeholder="Select type"
                  disabled={isSubmitting || paymentMutation.isLoading}
                  onChange={() => {
                    // Clear transaction ID when switching modes
                    form.setFieldsValue({transactionId: undefined});
                  }}
                >
                  <Select.Option value="inHand">In Hand</Select.Option>
                  <Select.Option value="inAccount">In Account</Select.Option>
                </Select>
              </Form.Item>
            </>
          )}

          {(paymentMethod === "UPI" ||
            paymentMethod === "Bank Transfer" ||
            (paymentMethod === "Petty Cash" &&
              pettyCashMode === "inAccount")) && (
            <Form.Item
              name="transactionId"
              label="Transaction ID"
              rules={[{required: true, message: "Please enter transaction ID"}]}
            >
              <Input
                placeholder="Enter transaction number"
                disabled={isSubmitting || paymentMutation.isLoading}
              />
            </Form.Item>
          )}

          <Form.Item name="remarks" label="Additional Notes">
            <Input.TextArea
              rows={1}
              placeholder="Any additional notes..."
              disabled={isSubmitting || paymentMutation.isLoading}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default PaymentModal;
