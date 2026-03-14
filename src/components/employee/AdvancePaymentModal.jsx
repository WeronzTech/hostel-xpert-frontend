import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {
  processAdvancePayment,
  getEmployeeAdvanceForMonth,
} from "../../hooks/accounts/useAccounts";
import {useState, useEffect} from "react";
import dayjs from "dayjs";
import {WalletOutlined, InfoCircleOutlined} from "@ant-design/icons";
import {
  Card,
  Col,
  DatePicker,
  Form,
  Input,
  message,
  Modal,
  Row,
  Select,
  Space,
  Tag,
  Divider,
  Grid,
  Spin,
} from "antd";

const {Option} = Select;
const {TextArea} = Input;
const {useBreakpoint} = Grid;

// Mock managers data - replace with actual API call
const mockManagers = [
  {id: "1", name: "John Doe"},
  {id: "2", name: "Jane Smith"},
  {id: "3", name: "Mike Johnson"},
  {id: "4", name: "Sarah Williams"},
];

const AdvancePaymentModal = ({visible, payroll, onCancel, onSuccess}) => {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const [messageApi, contextHolder] = message.useMessage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [selectedPettyCashType, setSelectedPettyCashType] = useState(null);
  const [selectedManager, setSelectedManager] = useState(null);

  const screens = useBreakpoint();
  const isMobile = !screens.md;

  // Get current date info
  const now = dayjs();

  // Calculate available months for advance (current and next 6 months)
  const getAvailableMonths = () => {
    const months = [];
    for (let i = 0; i <= 6; i++) {
      const date = now.add(i, "month");
      months.push({
        value: date.format("YYYY-MM"),
        month: date.month(),
        year: date.year(),
        label: date.format("MMMM YYYY"),
      });
    }
    return months;
  };

  const availableMonths = getAvailableMonths();

  // Check if transaction ID is required based on payment method and petty cash type
  const requiresTransactionId = (method, pettyCashType) => {
    if (method === "UPI" || method === "Bank Transfer") {
      return true;
    }
    if (method === "Petty Cash" && pettyCashType === "In Account") {
      return true;
    }
    return false;
  };

  // Fetch advance summary for selected month
  const {data: advanceSummary, isLoading: summaryLoading} = useQuery({
    queryKey: ["advanceSummary", payroll?.employeeId, selectedMonth],
    queryFn: () => {
      if (!payroll || !selectedMonth) return null;

      const [year, month] = selectedMonth.split("-").map(Number);
      const filters = {
        month: month - 1, // Convert to 0-indexed month
        year: year,
      };

      return getEmployeeAdvanceForMonth(payroll.employeeId, filters);
    },
    enabled: visible && !!payroll?.employeeId && !!selectedMonth,
  });

  // Reset form when modal opens
  useEffect(() => {
    if (visible && payroll) {
      form.resetFields();
      form.setFieldsValue({
        paymentDate: dayjs(),
      });
      setSelectedMonth(availableMonths[0]?.value);
      setSelectedPaymentMethod(null);
      setSelectedPettyCashType(null);
      setSelectedManager(null);
      setIsSubmitting(false);
    }
  }, [visible, payroll, form]);

  // Watch for payment method changes
  const handlePaymentMethodChange = (value) => {
    setSelectedPaymentMethod(value);
    setSelectedPettyCashType(null);
    setSelectedManager(null);
    // Clear related fields
    form.setFieldsValue({
      transactionId: undefined,
      pettyCashType: undefined,
      managerId: undefined,
    });

    // Validate transaction ID field if it becomes required
    if (requiresTransactionId(value, null)) {
      form.validateFields(["transactionId"]);
    } else {
      form.setFields([{name: "transactionId", errors: []}]);
    }
  };

  // Handle petty cash type change
  const handlePettyCashTypeChange = (value) => {
    setSelectedPettyCashType(value);
    form.setFieldsValue({transactionId: undefined});

    if (value === "In Account") {
      form.validateFields(["transactionId"]);
    } else {
      form.setFields([{name: "transactionId", errors: []}]);
    }
  };

  const advanceMutation = useMutation({
    mutationFn: (data) => {
      console.log("🚀 Creating advance payment:", data);
      return processAdvancePayment(data);
    },
    onSuccess: (response) => {
      console.log("✅ Advance payment success:", response);
      queryClient.invalidateQueries(["payrolls"]);
      queryClient.invalidateQueries(["advanceSummary", payroll?.employeeId]);
      messageApi.success("Advance payment recorded successfully");
      setIsSubmitting(false);

      setTimeout(() => {
        onSuccess();
        form.resetFields();
      }, 500);
    },
    onError: (error) => {
      console.error("❌ Advance payment error:", error);
      messageApi.error(error.message || "Failed to record advance payment");
      setIsSubmitting(false);
    },
  });

  const handleSubmit = async (values) => {
    // Prevent multiple submissions
    if (isSubmitting || advanceMutation.isLoading) {
      messageApi.warning("Submission is already being processed");
      return;
    }

    setIsSubmitting(true);

    // Parse selected month
    const [year, month] = selectedMonth.split("-").map(Number);

    // Build advance data with all fields
    const advanceData = {
      employeeId: payroll.employeeId,
      employeeType: payroll.employeeType,
      employeeName: payroll.name,
      amount: values.amount,
      paymentMethod: values.paymentMethod,
      transactionId: values.transactionId,
      remarks: values.reason || values.remarks || "",
      targetMonth: month - 1,
      targetYear: year,
      paymentDate: values.paymentDate.toISOString(),
      salary: payroll.salary,
      propertyId: payroll.propertyId,
      kitchenId: payroll.kitchenId,
      clientId: payroll.clientId,
    };

    // Add petty cash specific fields
    if (values.paymentMethod === "Petty Cash") {
      advanceData.pettyCashHolder = values.managerId;
      advanceData.pettyCashType = values.pettyCashType;

      // Find manager name for display purposes
      const selectedManager = mockManagers.find(
        (m) => m.id === values.managerId,
      );
      if (selectedManager) {
        advanceData.pettyCashHolderName = selectedManager.name;
      }
    }

    // console.log("Submitting advance:", advanceData);
    advanceMutation.mutate(advanceData);
  };

  const handleCancel = () => {
    if (isSubmitting || advanceMutation.isLoading) {
      messageApi.warning("Please wait while processing");
      return;
    }
    form.resetFields();
    onCancel();
  };

  if (!payroll) return null;

  // Calculate max advance amount
  const maxAdvanceAmount = Math.round(payroll.salary);

  // Get advance summary data
  const totalAdvanceGiven = advanceSummary?.data?.totalAdvance || 0;
  const totalTransactions = advanceSummary?.data?.totalTransactions || 0;

  // Determine if transaction ID should be shown
  const showTransactionId =
    selectedPaymentMethod === "UPI" ||
    selectedPaymentMethod === "Bank Transfer" ||
    (selectedPaymentMethod === "Petty Cash" &&
      selectedPettyCashType === "In Account");

  return (
    <>
      {contextHolder}
      <Modal
        title={
          <Space>
            <WalletOutlined style={{color: "#1890ff"}} />
            Create Advance Payment - {payroll.name}
          </Space>
        }
        open={visible}
        onCancel={handleCancel}
        onOk={() => form.submit()}
        confirmLoading={advanceMutation.isLoading || isSubmitting}
        width={650}
        okText="Create Advance"
        cancelButtonProps={{
          disabled: isSubmitting || advanceMutation.isLoading,
        }}
        maskClosable={!isSubmitting && !advanceMutation.isLoading}
        closable={!isSubmitting && !advanceMutation.isLoading}
      >
        {/* Advance Summary Section */}
        {selectedMonth && (
          <Card
            size="small"
            style={{
              marginBottom: 20,
              background: "#f0f5ff",
              border: "1px solid #91caff",
            }}
            bodyStyle={{
              padding: isMobile ? 12 : 16,
            }}
          >
            <Row gutter={[12, 12]} align="middle">
              <Col xs={24} sm={24} md={8}>
                <div
                  style={{
                    display: "flex",
                    flexDirection: isMobile ? "row" : "column",
                    alignItems: isMobile ? "center" : "flex-start",
                    justifyContent: isMobile ? "space-between" : "flex-start",
                    width: "100%",
                  }}
                >
                  <Space size={4} style={{marginBottom: isMobile ? 0 : 4}}>
                    <InfoCircleOutlined style={{color: "#1890ff"}} />
                    <span style={{fontSize: isMobile ? 13 : 14, color: "#666"}}>
                      Selected Month
                    </span>
                  </Space>
                  <span
                    style={{
                      fontSize: isMobile ? 15 : 16,
                      fontWeight: 500,
                      color: "#1890ff",
                    }}
                  >
                    {dayjs(selectedMonth).format("MMMM YYYY")}
                  </span>
                </div>
              </Col>

              <Col xs={24} sm={12} md={8}>
                <div
                  style={{
                    display: "flex",
                    flexDirection: isMobile ? "row" : "column",
                    alignItems: isMobile ? "center" : "flex-start",
                    justifyContent: isMobile ? "space-between" : "flex-start",
                    width: "100%",
                  }}
                >
                  <span
                    style={{
                      color: "#666",
                    }}
                  >
                    Total Advance
                  </span>
                  {summaryLoading ? (
                    <Spin size="small" />
                  ) : (
                    <span
                      style={{
                        color: totalAdvanceGiven > 0 ? "#fa8c16" : "#389e0d",
                        fontSize: isMobile ? 16 : 18,
                        fontWeight: 600,
                      }}
                    >
                      ₹{totalAdvanceGiven?.toLocaleString() || 0}
                    </span>
                  )}
                </div>
              </Col>

              <Col xs={24} sm={12} md={8}>
                <div
                  style={{
                    display: "flex",
                    flexDirection: isMobile ? "row" : "column",
                    alignItems: isMobile ? "center" : "flex-start",
                    justifyContent: isMobile ? "space-between" : "flex-start",
                    width: "100%",
                  }}
                >
                  <span
                    style={{
                      color: "#666",
                    }}
                  >
                    Transactions
                  </span>
                  {summaryLoading ? (
                    <Spin size="small" />
                  ) : (
                    <span
                      style={{
                        fontSize: isMobile ? 16 : 18,
                        fontWeight: 500,
                      }}
                    >
                      {totalTransactions}
                    </span>
                  )}
                </div>
              </Col>
            </Row>

            <Divider style={{margin: isMobile ? "8px 0" : "16px 0"}} />

            <Row gutter={[8, 8]}>
              <Col span={24}>
                <Space wrap size={[8, 8]} style={{width: "100%"}}>
                  <Tag
                    color="blue"
                    style={{
                      margin: 0,
                      fontSize: isMobile ? 12 : 14,
                      padding: isMobile ? "2px 8px" : "4px 12px",
                    }}
                  >
                    Salary: ₹{payroll.salary?.toLocaleString()}
                  </Tag>
                  <Tag
                    color="orange"
                    style={{
                      margin: 0,
                      fontSize: isMobile ? 12 : 14,
                      padding: isMobile ? "2px 8px" : "4px 12px",
                    }}
                  >
                    Remaining: ₹
                    {(payroll.salary - totalAdvanceGiven)?.toLocaleString()}
                  </Tag>
                </Space>
              </Col>
            </Row>
          </Card>
        )}

        {/* Advance Form */}
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          disabled={isSubmitting || advanceMutation.isLoading}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="amount"
                label="Advance Amount (₹)"
                rules={[
                  {required: true, message: "Please enter amount"},
                  {
                    validator: (_, value) => {
                      if (value <= 0) {
                        return Promise.reject(
                          new Error("Amount must be greater than 0"),
                        );
                      }
                      if (value > maxAdvanceAmount) {
                        return Promise.reject(
                          new Error(
                            `Amount cannot exceed ₹${maxAdvanceAmount.toLocaleString()}`,
                          ),
                        );
                      }
                      const remainingLimit = payroll.salary - totalAdvanceGiven;
                      if (value > remainingLimit) {
                        return Promise.reject(
                          new Error(
                            `With existing advances, you can only give up to ₹${remainingLimit.toLocaleString()}`,
                          ),
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
                  max={maxAdvanceAmount}
                  prefix="₹"
                  placeholder="Enter amount"
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="paymentMethod"
                label="Payment Method"
                rules={[{required: true, message: "Please select method"}]}
              >
                <Select
                  placeholder="Select payment method"
                  onChange={handlePaymentMethodChange}
                >
                  <Option value="Cash">Cash</Option>
                  <Option value="UPI">UPI</Option>
                  <Option value="Bank Transfer">Bank Transfer</Option>
                  <Option value="Petty Cash">Petty Cash</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {/* Petty Cash specific fields */}
          {selectedPaymentMethod === "Petty Cash" && (
            <>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="managerId"
                    label={
                      <Space>
                        <span>Petty Cash Holder</span>
                      </Space>
                    }
                    rules={[
                      {
                        required: true,
                        message: "Please select petty cash holder",
                      },
                    ]}
                  >
                    <Select
                      placeholder="Select manager"
                      onChange={setSelectedManager}
                      showSearch
                      optionFilterProp="children"
                    >
                      {mockManagers.map((manager) => (
                        <Option key={manager.id} value={manager.id}>
                          {manager.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    name="pettyCashType"
                    label={
                      <Space>
                        <span>Petty Cash Type</span>
                      </Space>
                    }
                    rules={[
                      {
                        required: true,
                        message: "Please select petty cash type",
                      },
                    ]}
                  >
                    <Select
                      placeholder="Select type"
                      onChange={handlePettyCashTypeChange}
                    >
                      <Option value="In Hand">In Hand</Option>
                      <Option value="In Account">In Account</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            </>
          )}

          {/* Conditional Transaction ID Field */}
          {showTransactionId && (
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="transactionId"
                  label="Transaction ID"
                  rules={[
                    {required: true, message: `Please enter transaction ID`},
                    {
                      min: 4,
                      message: "Transaction ID must be at least 4 characters",
                    },
                    {
                      max: 50,
                      message: "Transaction ID cannot exceed 50 characters",
                    },
                  ]}
                >
                  <Input
                    placeholder={`Enter transaction ID`}
                    prefix={<InfoCircleOutlined style={{color: "#bfbfbf"}} />}
                  />
                </Form.Item>
              </Col>
            </Row>
          )}

          {/* Month Selection for Adjustment */}
          <Form.Item
            label="Adjust in Month"
            required
            tooltip="Select the month when this advance will be deducted from salary"
          >
            <Select
              value={selectedMonth}
              onChange={setSelectedMonth}
              placeholder="Select month for adjustment"
            >
              {availableMonths.map((month) => (
                <Option key={month.value} value={month.value}>
                  {month.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="paymentDate"
                label="Payment Date"
                rules={[{required: true, message: "Please select date"}]}
              >
                <DatePicker className="w-full" format="DD-MM-YYYY" />
              </Form.Item>
            </Col>

            <Col span={12}>
              {/* Show selected adjustment month summary */}
              {selectedMonth && (
                <div
                  style={{
                    background: "#f6ffed",
                    padding: "8px 12px",
                    borderRadius: 6,
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div style={{fontSize: 12, color: "#666"}}>
                      Will be adjusted in
                    </div>
                    <Tag color="green" style={{marginTop: 2}}>
                      {dayjs(selectedMonth).format("MMMM YYYY")} payroll
                    </Tag>
                  </div>
                </div>
              )}
            </Col>
          </Row>

          <Form.Item name="remarks" label="Additional Notes">
            <TextArea
              rows={1}
              placeholder="Any additional notes..."
              showCount
              maxLength={100}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default AdvancePaymentModal;
