import {
  Modal,
  Form,
  Input,
  Select,
  message,
  Tabs,
  Card,
  Descriptions,
  Spin,
  Divider,
  Alert,
} from "antd";
import {useEffect, useState} from "react";
import {useSelector} from "react-redux";
import {useQuery, useMutation, useQueryClient} from "@tanstack/react-query";
import {
  UserOutlined,
  DollarOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import {getStaffSalaryData} from "../../../hooks/accounts/useAccounts";
import {staffManualPayment} from "../../../hooks/accounts/useAccounts";

const {Option} = Select;
const {TabPane} = Tabs;

const PaymentModal = ({
  open,
  onCancel,
  staff,
  onSubmit,
  employeeList = [],
  propertyList = [],
}) => {
  const [form] = Form.useForm();
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [activeTab, setActiveTab] = useState("employee");
  const [salaryRecords, setSalaryRecords] = useState([]);
  const [pendingAmount, setPendingAmount] = useState(0);
  const [employeeType, setEmployeeType] = useState("");
  const [showTransactionId, setShowTransactionId] = useState(false);
  const queryClient = useQueryClient();

  // Get current user from Redux store
  const currentUser = useSelector((state) => state.auth.user); // Adjust based on your Redux store structure

  // TanStack Query for fetching staff salary data
  const {
    data: salaryData,
    isLoading: salaryLoading,
    refetch: refetchSalary,
  } = useQuery({
    queryKey: ["staffSalary", staff?._id],
    queryFn: () => getStaffSalaryData(null, staff._id),
    enabled: false, // We'll trigger this manually
  });

  // TanStack Mutation for payment processing
  const paymentMutation = useMutation({
    mutationFn: staffManualPayment,
    onSuccess: (result, variables) => {
      if (result.success) {
        message.success(
          `Payment of ₹${variables.paidAmount} processed for ${variables.employeeName}`
        );

        // Invalidate related queries to refresh data
        queryClient.invalidateQueries({queryKey: ["staffSalary"]});
        queryClient.invalidateQueries({
          queryKey: ["availableCash"],
        });

        if (onSubmit) {
          onSubmit(variables, staff || selectedEmployee);
        }

        // Reset form and close modal
        handleModalClose();
      } else {
        message.error(result.message || "Payment failed");
      }
    },
    onError: (error) => {
      message.error(error.message || "Payment processing failed");
    },
  });

  // Fetch staff salary data when modal opens
  useEffect(() => {
    if (open) {
      form.resetFields();
      setSelectedEmployee(null);
      setActiveTab("employee");
      setSalaryRecords([]);
      setPendingAmount(0);
      setEmployeeType("");
      setShowTransactionId(false);

      // Set current date as default
      form.setFieldsValue({
        date: new Date().toISOString().split("T")[0],
      });

      // If staff prop is provided, fetch salary data
      if (staff) {
        refetchSalary()
          .then(({data}) => {
            if (data) {
              updateSalaryData(data, staff);
            }
          })
          .catch(() => {
            // Fallback to staff data if API fails
            useFallbackSalaryData(staff);
          });
      }
    }
  }, [open, form, staff]);

  // Update salary data helper function
  const updateSalaryData = (salaryData, employee) => {
    setSalaryRecords(salaryData);
    const pending = calculatePendingAmount(salaryData, employee);
    setPendingAmount(pending);
    setEmployeeType(employee.employeeType || "Staff");

    form.setFieldsValue({
      salaryAmount: pending,
      amount: pending,
      propertyId: employee.propertyId,
      employeeType: employee.employeeType || "Staff",
      date: new Date().toISOString().split("T")[0],
    });
  };

  // Fallback salary data
  const useFallbackSalaryData = (employee) => {
    const fallbackPending = employee.pendingSalary || employee.salary || 0;
    setPendingAmount(fallbackPending);
    setEmployeeType(employee.employeeType || "Staff");
    form.setFieldsValue({
      salaryAmount: fallbackPending,
      amount: fallbackPending,
      propertyId: employee.propertyId,
      employeeType: employee.employeeType || "Staff",
      date: new Date().toISOString().split("T")[0],
    });
  };

  // Handle payment method change
  const handlePaymentMethodChange = (method) => {
    setShowTransactionId(method === "upi" || method === "Bank_transfer");
  };

  // Handle employee selection
  const handleEmployeeSelect = async (employeeId) => {
    if (!employeeId) {
      setSelectedEmployee(null);
      form.setFieldsValue({
        salaryAmount: undefined,
        amount: undefined,
        propertyId: undefined,
        employeeType: undefined,
      });
      setSalaryRecords([]);
      setPendingAmount(0);
      setEmployeeType("");
      setShowTransactionId(false);
      return;
    }

    const employee = employeeList.find((emp) => emp._id === employeeId);
    if (employee) {
      setSelectedEmployee(employee);

      try {
        const salaryData = await getStaffSalaryData(null, employeeId);
        updateSalaryData(salaryData, employee);
        setActiveTab("payment");
      } catch (error) {
        message.error("Failed to fetch employee details and salary records");
        useFallbackSalaryData(employee);
        setActiveTab("payment");
      }
    }
  };

  // Calculate pending amount from salary records
  const calculatePendingAmount = (salaryData, employee) => {
    if (!salaryData || salaryData.length === 0) {
      return employee.pendingSalary || employee.salary || 0;
    }

    // Filter pending salary records
    const pendingRecords = salaryData.filter(
      (record) =>
        record.status === "pending" || record.paymentStatus === "pending"
    );

    // Sum up pending amounts
    const totalPending = pendingRecords.reduce((sum, record) => {
      return sum + (record.pendingAmount || record.amount || 0);
    }, 0);

    return totalPending > 0
      ? totalPending
      : employee.pendingSalary || employee.salary || 0;
  };

  // Handle modal close
  const handleModalClose = () => {
    form.resetFields();
    setSelectedEmployee(null);
    setSalaryRecords([]);
    setPendingAmount(0);
    setEmployeeType("");
    setShowTransactionId(false);
    onCancel();
  };

  // Handle payment submission
  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const employeeInfo = staff || selectedEmployee;

      if (!employeeInfo) {
        message.error("No employee selected");
        return;
      }

      // Validate transaction ID for UPI and Card payments
      if (
        (values.paymentMethod === "upi" || values.paymentMethod === "card") &&
        !values.transactionId
      ) {
        message.error("Transaction ID is required for UPI and Card payments");
        return;
      }

      // Prepare payment data according to backend structure
      const paymentData = {
        employeeId: employeeInfo._id,
        employeeName: employeeInfo.name,
        employeeType: employeeInfo.employeeType || "Staff",
        propertyId: employeeInfo.propertyId,
        date: values.date, // Changed from paymentDate to date
        paidBy: currentUser?._id || "current_user_id", // Get from Redux
        paymentMethod: values.paymentMethod,
        transactionId: values.transactionId || undefined, // Add transaction ID
        remarks: values.remarks,
        // Salary fields according to the model
        salary: parseFloat(values.amount), // Main salary amount
        paidAmount: parseFloat(values.amount), // Amount being paid now
        // Calculate advance salary if payment amount > pending amount
        advanceSalary:
          values.amount > pendingAmount ? values.amount - pendingAmount : 0,
        // Set status based on payment amount
        status:
          parseFloat(values.amount) >= parseFloat(pendingAmount)
            ? "paid"
            : "pending",
        remarkType:
          values.amount > pendingAmount ? "ADVANCE_PAYMENT" : "MANUAL_ADDITION",
        // Additional fields from the model
        salaryCut: 0,
        salaryIncrement: 0,
        salaryPending: Math.max(0, pendingAmount - values.amount), // Remaining pending after this payment
      };

      // Use mutation for payment processing
      paymentMutation.mutate(paymentData);
    } catch (errorInfo) {
      if (errorInfo.errorFields) {
        console.log("Validation failed:", errorInfo);
        message.error("Please fill all required fields correctly");
      } else {
        console.error("Payment failed:", errorInfo);
        message.error(errorInfo.message || "Payment processing failed");
      }
    }
  };

  const employeeInfo = staff || selectedEmployee;
  const loading = paymentMutation.isPending;

  return (
    <Modal
      title={
        <div>
          <DollarOutlined style={{marginRight: 8}} />
          Process Salary Payment
          {employeeInfo?.name && ` for ${employeeInfo.name}`}
        </div>
      }
      open={open}
      onCancel={onCancel}
      onOk={activeTab === "payment" ? handleOk : null}
      okText="Process Payment"
      cancelText="Cancel"
      width={700}
      centered
      okButtonProps={{
        disabled: loading || salaryLoading || !employeeInfo,
        style: activeTab !== "payment" ? {display: "none"} : {},
      }}
      cancelButtonProps={{
        style: activeTab !== "payment" ? {display: "none"} : {},
      }}
      confirmLoading={loading}
    >
      <Spin spinning={loading || salaryLoading}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          style={{marginTop: -16}}
        >
          {/* Employee Selection Tab */}
          <TabPane
            tab={
              <span>
                <UserOutlined />
                Select Employee
              </span>
            }
            key="employee"
          >
            <Form form={form} layout="vertical">
              {/* Employee Selection */}
              {!staff && (
                <Form.Item
                  name="employeeId"
                  label="Select Employee"
                  rules={[
                    {required: true, message: "Please select an employee"},
                  ]}
                >
                  <Select
                    showSearch
                    placeholder="Search and select employee"
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      option?.children
                        ?.toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    onChange={handleEmployeeSelect}
                    allowClear
                    loading={salaryLoading}
                  >
                    {employeeList.map((emp) => (
                      <Option key={emp._id} value={emp._id}>
                        {emp.name} ({emp.staffId}) - {emp.designation}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              )}

              {/* Employee Information Card */}
              {employeeInfo && (
                <Card
                  size="small"
                  style={{marginBottom: 16}}
                  title={
                    <span>
                      <UserOutlined style={{marginRight: 8}} />
                      Employee Information
                    </span>
                  }
                >
                  <Descriptions size="small" column={2}>
                    <Descriptions.Item label="Name">
                      {employeeInfo.name}
                    </Descriptions.Item>
                    <Descriptions.Item label="Staff ID">
                      {employeeInfo.staffId}
                    </Descriptions.Item>
                    <Descriptions.Item label="Employee Type">
                      {employeeInfo.jobTitle || "Staff"}
                    </Descriptions.Item>
                    {employeeInfo.salary && (
                      <Descriptions.Item label="Monthly Salary" span={2}>
                        <strong>₹{employeeInfo.salary.toLocaleString()}</strong>
                      </Descriptions.Item>
                    )}
                    {pendingAmount > 0 && (
                      <Descriptions.Item label="Pending Amount" span={2}>
                        <strong style={{color: "#fa8c16"}}>
                          ₹{pendingAmount.toLocaleString()}
                        </strong>
                      </Descriptions.Item>
                    )}
                  </Descriptions>

                  <div style={{textAlign: "center", marginTop: 16}}>
                    <button
                      type="button"
                      onClick={() => setActiveTab("payment")}
                      style={{
                        padding: "8px 16px",
                        backgroundColor: "#1890ff",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                    >
                      Continue to Payment Details
                    </button>
                  </div>
                </Card>
              )}
            </Form>
          </TabPane>

          {/* Payment Details Tab */}
          <TabPane
            tab={
              <span>
                <DollarOutlined />
                Payment Details
              </span>
            }
            key="payment"
            disabled={!employeeInfo}
          >
            <Form form={form} layout="vertical">
              {/* Employee Information Summary */}
              {employeeInfo && (
                <Card
                  size="small"
                  style={{marginBottom: 16}}
                  title="Employee Summary"
                >
                  <Descriptions size="small" column={2}>
                    <Descriptions.Item label="Name">
                      {employeeInfo.name}
                    </Descriptions.Item>
                    <Descriptions.Item label="Staff ID">
                      {employeeInfo.staffId}
                    </Descriptions.Item>
                    <Descriptions.Item label="Designation">
                      {employeeInfo.designation}
                    </Descriptions.Item>
                    <Descriptions.Item label="Employee Type">
                      {employeeType}
                    </Descriptions.Item>
                    {employeeInfo.salary && (
                      <Descriptions.Item label="Monthly Salary">
                        <strong>₹{employeeInfo.salary.toLocaleString()}</strong>
                      </Descriptions.Item>
                    )}
                    {pendingAmount > 0 && (
                      <Descriptions.Item label="Pending Amount">
                        <strong style={{color: "#fa8c16"}}>
                          ₹{pendingAmount.toLocaleString()}
                        </strong>
                      </Descriptions.Item>
                    )}
                  </Descriptions>
                </Card>
              )}

              {/* Payment Alert */}
              {pendingAmount > 0 && (
                <Alert
                  message="Pending Salary Detected"
                  description={`This employee has ₹${pendingAmount.toLocaleString()} in pending salary payments. Paying more than this amount will be treated as advance salary.`}
                  type="warning"
                  showIcon
                  icon={<ExclamationCircleOutlined />}
                  style={{marginBottom: 16}}
                />
              )}

              <Divider />

              {/* Hidden fields for backend */}
              <Form.Item name="propertyId" hidden>
                <Input />
              </Form.Item>
              <Form.Item name="employeeType" hidden>
                <Input />
              </Form.Item>

              {/* Payment Amount Section */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 16,
                }}
              >
                {/* Pending Amount (Read-only) */}
                <Form.Item name="salaryAmount" label="Pending Amount (₹)">
                  <Input
                    type="number"
                    placeholder="Auto-filled"
                    readOnly
                    prefix="₹"
                    style={{backgroundColor: "#f5f5f5"}}
                  />
                </Form.Item>

                {/* Payment Amount */}
                <Form.Item
                  name="amount"
                  label="Amount to Pay (₹)"
                  rules={[
                    {
                      required: true,
                      message: "Please enter the amount",
                    },
                    {
                      validator: (_, value) => {
                        if (value && value <= 0) {
                          return Promise.reject(
                            new Error("Amount must be greater than 0")
                          );
                        }
                        return Promise.resolve();
                      },
                    },
                  ]}
                  extra={
                    pendingAmount > 0
                      ? `Total pending: ₹${pendingAmount.toLocaleString()}`
                      : "Enter the amount to pay"
                  }
                >
                  <Input
                    type="number"
                    placeholder="Enter amount"
                    prefix="₹"
                    min="0"
                    step="0.01"
                  />
                </Form.Item>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 16,
                }}
              >
                {/* Payment Method */}
                <Form.Item
                  name="paymentMethod"
                  label="Payment Method"
                  rules={[
                    {required: true, message: "Please select payment method"},
                  ]}
                >
                  <Select
                    placeholder="Select payment method"
                    onChange={handlePaymentMethodChange}
                  >
                    <Option value="Cash">Cash</Option>
                    <Option value="Bank_transfer">Bank Transfer</Option>
                    <Option value="UPI">UPI</Option>
                  </Select>
                </Form.Item>

                {/* Date */}
                <Form.Item
                  name="date"
                  label="Date"
                  rules={[{required: true, message: "Please select date"}]}
                >
                  <Input type="date" />
                </Form.Item>
              </div>

              {/* Transaction ID (Conditional) */}
              {showTransactionId && (
                <Form.Item
                  name="transactionId"
                  label="Transaction ID"
                  rules={[
                    {
                      required: true,
                      message:
                        "Transaction ID is required for UPI and Card payments",
                    },
                  ]}
                  extra="Please enter the transaction reference number"
                >
                  <Input placeholder="Enter transaction ID" maxLength={50} />
                </Form.Item>
              )}

              {/* Remarks */}
              <Form.Item
                name="remarks"
                label="Remarks / Notes"
                extra="Add any additional notes about this payment"
              >
                <Input.TextArea
                  placeholder="e.g., Salary for March 2024, Bonus payment, etc."
                  rows={3}
                />
              </Form.Item>

              <div style={{textAlign: "center", marginTop: 16}}>
                <button
                  type="button"
                  onClick={() => setActiveTab("employee")}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#f5f5f5",
                    color: "#333",
                    border: "1px solid #d9d9d9",
                    borderRadius: "4px",
                    cursor: "pointer",
                    marginRight: "8px",
                  }}
                >
                  Back to Employee
                </button>
              </div>
            </Form>
          </TabPane>
        </Tabs>

        {/* Payment Summary */}
        {activeTab === "payment" && employeeInfo && (
          <Card
            size="small"
            type="inner"
            title="Payment Summary"
            style={{marginTop: 16, border: "1px solid #e8f4fd"}}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 8,
              }}
            >
              <div>
                <strong>Employee:</strong> {employeeInfo.name}
              </div>
              <div>
                <strong>Amount:</strong> ₹
                {(form.getFieldValue("amount") || 0).toLocaleString()}
              </div>
              <div>
                <strong>Method:</strong>{" "}
                {form.getFieldValue("paymentMethod") || "Not selected"}
              </div>
              {form.getFieldValue("transactionId") && (
                <div>
                  <strong>Transaction ID:</strong>{" "}
                  {form.getFieldValue("transactionId")}
                </div>
              )}
            </div>
            {pendingAmount > 0 && (
              <div style={{marginTop: 8}}>
                <div style={{color: "#fa8c16", fontSize: "12px"}}>
                  <ExclamationCircleOutlined /> Total pending: ₹
                  {pendingAmount.toLocaleString()}
                </div>
                {form.getFieldValue("amount") > pendingAmount && (
                  <div
                    style={{color: "#52c41a", fontSize: "12px", marginTop: 4}}
                  >
                    <ExclamationCircleOutlined /> Advance salary: ₹
                    {(
                      form.getFieldValue("amount") - pendingAmount
                    ).toLocaleString()}
                  </div>
                )}
              </div>
            )}
          </Card>
        )}
      </Spin>
    </Modal>
  );
};

export default PaymentModal;
