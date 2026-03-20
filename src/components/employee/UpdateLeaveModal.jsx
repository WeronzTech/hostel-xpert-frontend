import {Modal, Form, Input, Card, message, Space, Radio, Tag} from "antd";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {updatePayrollLeave} from "../../hooks/accounts/useAccounts";
import {useState, useEffect, useCallback} from "react";
import {InfoCircleOutlined} from "@ant-design/icons";

const UpdateLeaveModal = ({visible, payroll, onCancel, onSuccess}) => {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const [messageApi, contextHolder] = message.useMessage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [calculatedDeduction, setCalculatedDeduction] = useState(0);
  const [updateMode, setUpdateMode] = useState("replace");
  const [inputValue, setInputValue] = useState(0);

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

  const getPayrollMonth = (month, year) => {
    if (month === undefined || year === undefined) return "";
    return `${months[month % 12]} ${year}`;
  };

  // Calculate per day salary
  const getPerDaySalary = useCallback(() => {
    if (!payroll) return 0;
    return payroll.salary / 30;
  }, [payroll]);

  // Calculate leave deduction based on leave days
  const calculateLeaveDeduction = useCallback(
    (leaveDays) => {
      if (!payroll) return 0;
      // Handle 0 leave days properly
      if (leaveDays === 0 || leaveDays === null || leaveDays === undefined)
        return 0;
      const perDaySalary = getPerDaySalary();
      return Math.round(perDaySalary * leaveDays);
    },
    [payroll, getPerDaySalary],
  );

  // Get final leave days based on mode
  const getFinalLeaveDays = useCallback(
    (value) => {
      if (!payroll) return 0;

      const currentLeaveDays = payroll.leaveDays || 0;
      const current = Number(currentLeaveDays);
      // Handle value properly - if it's 0, keep it as 0
      const input = value === null || value === undefined ? 0 : Number(value);

      switch (updateMode) {
        case "add":
          return current + input;
        case "subtract":
          return Math.max(0, current - input);
        case "replace":
        default:
          return input;
      }
    },
    [payroll, updateMode],
  );

  // Update calculation whenever dependencies change
  useEffect(() => {
    if (!payroll) return;

    const finalLeaveDays = getFinalLeaveDays(inputValue);
    const deduction = calculateLeaveDeduction(finalLeaveDays);
    setCalculatedDeduction(deduction);
  }, [
    inputValue,
    updateMode,
    payroll,
    getFinalLeaveDays,
    calculateLeaveDeduction,
  ]);

  // Handle input change
  const handleLeaveDaysChange = (e) => {
    const value = e.target.value === "" ? 0 : parseInt(e.target.value);
    setInputValue(value);
    form.setFieldsValue({leaveDays: value});
  };

  // Handle mode change
  const handleModeChange = (e) => {
    const mode = e.target.value;
    setUpdateMode(mode);
    // No need to recalculate here as useEffect will handle it
  };

  // Reset form when modal opens
  useEffect(() => {
    if (visible && payroll) {
      form.resetFields();
      setInputValue(0);
      setUpdateMode("replace");
      form.setFieldsValue({leaveDays: 0});

      // Set initial calculation based on current leave days
      const initialDeduction = calculateLeaveDeduction(payroll.leaveDays || 0);
      setCalculatedDeduction(initialDeduction);
      setIsSubmitting(false);
    }
  }, [visible, payroll, form, calculateLeaveDeduction]);

  const leaveMutation = useMutation({
    mutationFn: (data) => {
      return updatePayrollLeave(data);
    },
    onSuccess: (response) => {
      if (!response.success) {
        messageApi.error(response.message);
        return;
      }
      queryClient.invalidateQueries(["payrolls"]);
      messageApi.success("Leave days updated successfully");
      setIsSubmitting(false);

      setTimeout(() => {
        onSuccess();
        form.resetFields();
      }, 500);
    },
    onError: (error) => {
      messageApi.error(error.message || "Failed to update leave days");
      setIsSubmitting(false);
    },
  });

  const handleSubmit = async (values) => {
    // Prevent multiple submissions
    if (isSubmitting || leaveMutation.isLoading) {
      messageApi.warning("Update is already being processed");
      return;
    }

    setIsSubmitting(true);

    const currentLeaveDays = payroll.leaveDays || 0;
    const finalLeaveDays = getFinalLeaveDays(values.leaveDays);

    const leaveData = {
      payrollId: payroll._id,
      leaveDays: finalLeaveDays,
      updateMode: updateMode,
      inputValue: values.leaveDays,
      previousLeaveDays: currentLeaveDays,
    };

    console.log("Submitting leave update:", leaveData);
    leaveMutation.mutate(leaveData);
  };

  const handleCancel = () => {
    if (isSubmitting || leaveMutation.isLoading) {
      messageApi.warning("Please wait while update is being processed");
      return;
    }
    form.resetFields();
    setInputValue(0);
    onCancel();
  };

  if (!payroll) return null;

  const perDaySalary = getPerDaySalary();
  const currentLeaveDays = payroll.leaveDays || 0;
  const newNetSalary = Math.max(
    0,
    payroll.salary - calculatedDeduction - (payroll.advanceAdjusted || 0),
  );

  return (
    <>
      {contextHolder}
      <Modal
        title={
          <Space>
            <InfoCircleOutlined style={{color: "#fa8c16"}} />
            Update Leave Days - {payroll.name}
          </Space>
        }
        open={visible}
        onCancel={handleCancel}
        onOk={() => form.submit()}
        confirmLoading={leaveMutation.isLoading || isSubmitting}
        width={650}
        okText="Update Leave"
        cancelButtonProps={{disabled: isSubmitting || leaveMutation.isLoading}}
        maskClosable={!isSubmitting && !leaveMutation.isLoading}
        closable={!isSubmitting && !leaveMutation.isLoading}
      >
        {/* Payroll Summary */}
        <Card size="small" style={{marginBottom: 20, background: "#fafafa"}}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "8px",
            }}
          >
            <div>
              <span style={{fontWeight: 500, marginRight: 16}}>
                {getPayrollMonth(payroll.month, payroll.year)}
              </span>
              <span style={{color: "#666"}}>
                ₹{payroll.salary?.toLocaleString()}/month
              </span>
            </div>
            <div>
              <Tag color="blue">₹{perDaySalary.toLocaleString()}/day</Tag>
              <Tag color="orange">{currentLeaveDays} days</Tag>
            </div>
          </div>
        </Card>

        {/* Leave Update Form */}
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          disabled={isSubmitting || leaveMutation.isLoading}
        >
          {/* Update Mode Selection */}
          <Form.Item label="Update Mode" required>
            <Radio.Group
              value={updateMode}
              onChange={handleModeChange}
              optionType="button"
              buttonStyle="solid"
            >
              <Radio.Button value="replace">Replace</Radio.Button>
              <Radio.Button value="add">Add</Radio.Button>
              <Radio.Button value="subtract">Subtract</Radio.Button>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            name="leaveDays"
            label={`Enter Leave Days to ${updateMode === "replace" ? "Set" : updateMode}`}
            rules={[
              {required: true, message: "Please enter leave days"},
              {
                validator: (_, value) => {
                  // Allow 0 as a valid value
                  if (value === null || value === undefined || value === "") {
                    return Promise.reject(new Error("Please enter leave days"));
                  }

                  if (value < 0) {
                    return Promise.reject(
                      new Error("Leave days cannot be negative"),
                    );
                  }

                  // Check if final days would exceed 30
                  const finalDays = getFinalLeaveDays(value);
                  if (finalDays > 30) {
                    return Promise.reject(
                      new Error(
                        `Total leave days (${finalDays}) cannot exceed 30 days`,
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
              min={0}
              max={30}
              step={0.5}
              onChange={handleLeaveDaysChange}
              suffix="days"
              disabled={isSubmitting || leaveMutation.isLoading}
              placeholder="Enter number of days"
            />
          </Form.Item>

          {/* Preview of Changes */}
          <Card
            size="small"
            style={{marginTop: 8, marginBottom: 16, background: "#e6f7ff"}}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div style={{fontSize: 12, color: "#666"}}>Leave Days</div>
                <div>
                  <Tag>{currentLeaveDays} days</Tag>
                  <span style={{margin: "0 8px"}}>→</span>
                  <Tag color="processing">
                    {getFinalLeaveDays(inputValue)} days
                  </Tag>
                </div>
              </div>
              <div style={{textAlign: "right"}}>
                <div style={{fontSize: 12, color: "#666"}}>Deduction</div>
                <div style={{color: "#cf1322"}}>
                  ₹{calculatedDeduction.toLocaleString()}
                </div>
              </div>
            </div>
          </Card>

          <Form.Item style={{marginTop: 16}}>
            <div style={{color: "#888", fontSize: 12}}>
              * Leave deduction calculated as (Monthly salary / 30) × leave days
            </div>
            <div style={{color: "#888", fontSize: 12, marginTop: 4}}>
              *{" "}
              {updateMode === "replace" &&
                "Replace current leave days with entered value"}
              {updateMode === "add" && "Add entered days to current leave days"}
              {updateMode === "subtract" &&
                "Subtract entered days from current leave days"}
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default UpdateLeaveModal;
