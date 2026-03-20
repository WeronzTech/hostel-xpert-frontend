import {useState, useEffect} from "react";
import {
  Modal,
  Form,
  Select,
  InputNumber,
  Button,
  message,
  Row,
  Col,
  Card,
  Statistic,
  Space,
  Input,
  DatePicker,
} from "antd";
import {FiPocket, FiPlus} from "react-icons/fi";
import {useSelector} from "react-redux";
import {useQuery, useMutation, useQueryClient} from "@tanstack/react-query";
import {getAllManagers} from "../../hooks/employee/useEmployee";
import {
  addPettyCash,
  getPettyCashByManagerId,
} from "../../hooks/accounts/useAccounts";
import dayjs from "dayjs";

const {Option} = Select;
const {TextArea} = Input;

const PettyCashModal = ({visible, onCancel, selectedEmployeeId}) => {
  const {selectedProperty} = useSelector((state) => state.properties);
  const {user} = useSelector((state) => state.auth); // Get current user from auth
  const [form] = Form.useForm();
  const [selectedManager, setSelectedManager] = useState(null);
  const [amountType, setAmountType] = useState(null);
  const [paymentMode, setPaymentMode] = useState(null);
  const [currentProperty, setCurrentProperty] = useState(selectedProperty);
  const queryClient = useQueryClient();

  const [messageApi, contextHolder] = message.useMessage();

  // ✅ Fetch managers from API
  const {data: managers = [], isLoading: managersLoading} = useQuery({
    queryKey: ["managers", currentProperty?.id ?? "all"],
    queryFn: () => getAllManagers(currentProperty?.id),
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });

  // ✅ Fetch petty cash data for selected manager
  const {data: pettyCashData, isLoading: pettyCashLoading} = useQuery({
    queryKey: ["pettyCash", selectedManager?._id],
    queryFn: () => getPettyCashByManagerId(selectedManager?._id),
    enabled: !!selectedManager?._id,
    refetchOnWindowFocus: false,
  });

  // ✅ Mutation for adding petty cash
  const addPettyCashMutation = useMutation({
    mutationFn: addPettyCash,
    onSuccess: (data) => {
      messageApi.success({
        content: `${data.message}`,
        duration: 3,
      });

      // ✅ Invalidate and refetch petty cash data
      queryClient.invalidateQueries(["pettyCash", selectedManager?._id]);

      handleClose();
    },
    onError: (error) => {
      messageApi.error({
        content: `${error.message}`,
        duration: 3,
      });
    },
  });

  const filteredManagers =
    selectedProperty?.id && selectedEmployeeId
      ? managers.filter((manager) => manager._id === selectedEmployeeId)
      : managers;

  useEffect(() => {
    if (visible && managers.length > 0) {
      if (selectedProperty?.id && selectedEmployeeId) {
        const manager = managers.find((m) => m._id === selectedEmployeeId);
        if (manager) {
          setSelectedManager(manager);
          form.setFieldsValue({
            managerId: manager._id,
          });
        } else {
          setSelectedManager(null);
          form.setFieldsValue({
            managerId: undefined,
          });
          message.warning("Selected manager not found in the list");
        }
      } else {
        setSelectedManager(null);
        form.setFieldsValue({
          managerId: undefined,
        });
      }
    }
  }, [visible, selectedEmployeeId, selectedProperty, managers, form]);

  useEffect(() => {
    if (visible) {
      setCurrentProperty(selectedProperty);
      // Set default date to today
      form.setFieldsValue({
        date: dayjs(),
      });
    }
  }, [visible, selectedProperty, form]);

  const handleManagerChange = (managerId) => {
    const manager = managers.find((m) => m._id === managerId);
    setSelectedManager(manager);
  };

  const handleAmountTypeChange = (type) => {
    setAmountType(type);
    setPaymentMode(null); // Reset payment mode when amount type changes
    form.setFieldsValue({
      amountType: type,
      paymentMode: undefined,
      transactionId: undefined,
    });
  };

  const handlePaymentModeChange = (mode) => {
    setPaymentMode(mode);
    form.setFieldsValue({paymentMode: mode});
  };

  const onFinish = async (values) => {
    const {managerId, amount, date, paymentMode, transactionId, notes} = values;
    const manager = managers.find((m) => m._id === managerId);

    if (!manager) {
      message.error("Manager not found");
      return;
    }

    if (!user) {
      message.error("User not authenticated");
      return;
    }

    // ✅ Prepare data for API based on amount type
    const requestData = {
      manager: managerId,
      managerName: manager.name,
      date: date.format("YYYY-MM-DD"), // Format date as string
      createdBy: user._id || user.id, // Add current user ID
      createdByName: user.name || user.email, // Add current user name
      notes: notes || "", // Add notes if provided
    };

    // ✅ Set amounts based on selected type
    if (amountType === "hand") {
      requestData.inHandAmount = amount;
      requestData.inAccountAmount = 0;
      requestData.paymentMode = "cash"; // For hand cash, default to cash
      requestData.transactionId = null;
    } else {
      requestData.inHandAmount = 0;
      requestData.inAccountAmount = amount;
      requestData.paymentMode = paymentMode;
      requestData.transactionId = transactionId || null;
    }

    console.log("Adding Petty Cash:", requestData);

    // ✅ Call the mutation
    addPettyCashMutation.mutate(requestData);
  };

  const handleClose = () => {
    form.resetFields();
    setSelectedManager(null);
    setAmountType(null);
    setPaymentMode(null);
    setCurrentProperty({id: null, name: ""});
    onCancel();
  };

  const cleanName = currentProperty?.name?.replace(/^Heavens Living -\s*/, "");
  const modalTitle = currentProperty?.name
    ? `Add Petty Cash - ${cleanName}`
    : "Add Petty Cash";

  return (
    <>
      {contextHolder}
      <Modal
        title={
          <div style={{display: "flex", alignItems: "center", gap: "8px"}}>
            <FiPocket style={{fontSize: "18px"}} />
            {modalTitle}
          </div>
        }
        open={visible}
        onCancel={handleClose}
        footer={null}
        centered
        width={500}
        maskClosable={false}
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          {/* ✅ Select Manager from API */}
          <Form.Item
            name="managerId"
            label="Select Manager"
            rules={[{required: true, message: "Please select a manager"}]}
          >
            <Select
              placeholder={
                managersLoading
                  ? "Loading managers..."
                  : selectedProperty?.id && selectedEmployeeId
                    ? "Selected manager"
                    : "Choose a manager"
              }
              onChange={handleManagerChange}
              showSearch={!selectedProperty?.id || !selectedEmployeeId}
              optionFilterProp="children"
              loading={managersLoading}
              disabled={managersLoading}
              value={selectedManager?._id}
              allowClear
            >
              {filteredManagers.map((manager) => (
                <Option key={manager._id} value={manager._id}>
                  {manager.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          {/* ✅ Current Balance from Petty Cash API */}
          {selectedManager && (
            <Row gutter={16} style={{marginBottom: "16px"}}>
              <Col span={8}>
                <Card size="small" loading={pettyCashLoading}>
                  <Statistic
                    title="Cash In Hand"
                    value={pettyCashData?.inHandAmount || 0}
                    prefix="₹"
                    valueStyle={{fontSize: "14px"}}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small" loading={pettyCashLoading}>
                  <Statistic
                    title="Cash In Account"
                    value={pettyCashData?.inAccountAmount || 0}
                    prefix="₹"
                    valueStyle={{fontSize: "14px"}}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small" loading={pettyCashLoading}>
                  <Statistic
                    title="Total Petty Cash"
                    value={pettyCashData?.total || 0}
                    prefix="₹"
                    valueStyle={{fontSize: "14px", color: "#1890ff"}}
                  />
                </Card>
              </Col>
            </Row>
          )}

          <Form.Item
            name="amountType"
            label="Add Cash To"
            rules={[
              {required: true, message: "Please select where to add cash"},
            ]}
          >
            <Select
              placeholder="Please select where to add cash"
              onChange={handleAmountTypeChange}
              value={amountType}
              allowClear
            >
              <Option value="hand">Cash In Hand</Option>
              <Option value="account">Cash In Account</Option>
            </Select>
          </Form.Item>

          {/* Payment Mode (only for account) */}
          {amountType === "account" && (
            <>
              <Form.Item
                name="paymentMode"
                label="Payment Mode"
                rules={[
                  {required: true, message: "Please select payment mode"},
                ]}
              >
                <Select
                  placeholder="Select payment mode"
                  onChange={handlePaymentModeChange}
                  value={paymentMode}
                  allowClear
                >
                  <Option value="upi">UPI</Option>
                  <Option value="bank_transfer">Bank Transfer</Option>
                </Select>
              </Form.Item>

              {/* Transaction ID (only for account and if payment mode selected) */}
              {paymentMode && paymentMode !== "cash" && (
                <Form.Item
                  name="transactionId"
                  label={`${paymentMode.replace("_", " ").toUpperCase()} Transaction ID`}
                  rules={[
                    {
                      required: true,
                      message: `Please enter ${paymentMode} transaction ID`,
                    },
                  ]}
                >
                  <Input
                    placeholder={`Enter ${paymentMode.replace("_", " ")} transaction ID`}
                  />
                </Form.Item>
              )}
            </>
          )}

          {/* Amount Input */}
          <Form.Item
            name="amount"
            label="Amount to Add"
            rules={[
              {required: true, message: "Please enter amount"},
              {
                validator: (_, value) => {
                  if (value <= 0) {
                    return Promise.reject(
                      new Error("Amount must be greater than 0"),
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <InputNumber
              style={{width: "100%"}}
              placeholder="Enter amount to add"
              prefix="₹"
              min={0}
              step={100}
            />
          </Form.Item>

          {/* Date Field */}
          <Form.Item
            name="date"
            label="Date of Transaction"
            rules={[{required: true, message: "Please select a date"}]}
          >
            <DatePicker
              style={{width: "100%"}}
              format="DD-MM-YYYY"
              disabledDate={(current) => {
                // Can't select future dates
                return current && current > dayjs().endOf("day");
              }}
            />
          </Form.Item>

          {/* Notes Field (Optional) */}
          <Form.Item name="notes" label="Notes (Optional)">
            <TextArea
              placeholder="Enter any additional notes about this transaction"
              rows={2}
              maxLength={500}
              showCount
            />
          </Form.Item>

          {/* Added By Info (Read-only) */}
          {user && (
            <div
              style={{
                backgroundColor: "#f6f6f6",
                borderRadius: 6,
                padding: 8,
                marginBottom: 16,
                fontSize: 12,
                color: "#666",
              }}
            >
              <strong>Added by:</strong> {user.name || user.email}
            </div>
          )}

          {/* Actions */}
          <Form.Item style={{marginBottom: 0, textAlign: "right"}}>
            <Space>
              <Button
                onClick={handleClose}
                disabled={addPettyCashMutation.isLoading}
              >
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                disabled={
                  !selectedManager ||
                  pettyCashLoading ||
                  (amountType === "account" && !paymentMode)
                }
                loading={addPettyCashMutation.isLoading}
              >
                <FiPlus /> Add Cash
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default PettyCashModal;
