import {useState, useEffect} from "react";
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Card,
  Statistic,
  message,
  Button,
  Alert,
  Spin,
  DatePicker,
} from "antd";
import {useSelector} from "react-redux";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {getAvailableCash, addVoucher} from "../../hooks/accounts/useAccounts";
import {UserOutlined} from "../../icons";

const {TextArea} = Input;

const CreateVoucherModal = ({visible, onCancel, onSuccess}) => {
  const queryClient = useQueryClient();
  const [messageApi, contextHolder] = message.useMessage();

  const {user} = useSelector((state) => state.auth);
  const [form] = Form.useForm();
  const [localAvailableCash, setLocalAvailableCash] = useState(0);

  // Query for available cash using TanStack
  const {
    data: availableCash = 0,
    isLoading: fetchingCash,
    error: cashError,
  } = useQuery({
    queryKey: ["availableCash", ""],
    queryFn: () => getAvailableCash(""),
    enabled: !!visible,
    staleTime: 1000 * 60,
  });

  const addVoucherMutation = useMutation({
    mutationFn: addVoucher,
    onSuccess: (data) => {
      messageApi.success({
        content: `${data.message}`,
        duration: 3,
      });

      queryClient.invalidateQueries({queryKey: ["availableCash"]});

      form.resetFields();
      onSuccess?.();
      onCancel();
    },
    onError: (error) => {
      messageApi.error({
        content: `${error.message}`,
        duration: 3,
      });
    },
  });

  // Sync local state with query data
  useEffect(() => {
    if (!fetchingCash && availableCash !== undefined) {
      setLocalAvailableCash(availableCash);
    }
  }, [availableCash, fetchingCash]);

  const handleSubmit = async (values) => {
    const voucherData = {
      recipientName: values.name,
      purpose: values.purpose,
      amount: values.amount,
      date: values.date,
      createdBy: user?.name,
    };

    console.log("Voucher creation data:", voucherData);
    addVoucherMutation.mutate(voucherData);
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  const validateAmount = (_, value) => {
    if (!value) {
      return Promise.reject(new Error("Please enter voucher amount"));
    }

    const numericValue = parseFloat(value);
    if (isNaN(numericValue) || numericValue <= 0) {
      return Promise.reject(new Error("Amount must be greater than 0"));
    }

    // Use localAvailableCash for validation
    if (numericValue > localAvailableCash) {
      return Promise.reject(
        new Error(
          `Amount cannot exceed available cash of ₹${localAvailableCash.toLocaleString()}`
        )
      );
    }

    return Promise.resolve();
  };

  const handleAmountChange = (value) => {
    if (value !== undefined && value !== null) {
      form.validateFields(["amount"]);
    }
  };

  // Show error if cash fetching fails
  if (cashError) {
    return (
      <Modal
        title="Create Voucher"
        open={visible}
        onCancel={handleCancel}
        footer={null}
        width={500}
        centered
        maskClosable={false}
        destroyOnClose
      >
        <Alert
          message="Error Loading Cash Balance"
          description="Failed to load available cash balance. Please try again."
          type="error"
          showIcon
        />
        <div style={{marginTop: 16, textAlign: "right"}}>
          <Button onClick={handleCancel}>Cancel</Button>
        </div>
      </Modal>
    );
  }

  return (
    <>
      {contextHolder}
      <Modal
        title="Create Voucher"
        open={visible}
        onCancel={handleCancel}
        footer={null}
        width={500}
        centered
        maskClosable={false}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
          initialValues={{
            name: "",
            purpose: "",
            amount: undefined,
          }}
        >
          {/* Available Cash Display */}
          <Card size="small" style={{marginBottom: 16, textAlign: "center"}}>
            {fetchingCash ? (
              <Spin />
            ) : (
              <Statistic
                title="Total Available Cash Balance"
                value={localAvailableCash}
                precision={2}
                valueStyle={{
                  color: localAvailableCash > 0 ? "#3f8600" : "#cf1322",
                }}
                prefix="₹"
              />
            )}
            {!fetchingCash && localAvailableCash === 0 && (
              <Alert
                message="No available cash to create voucher"
                type="warning"
                showIcon
                style={{marginTop: 8}}
              />
            )}
          </Card>

          {/* Voucher Details */}
          <Card size="small" title="Voucher Details">
            {/* Name Field */}
            <Form.Item
              label="Recipient Name"
              name="name"
              rules={[
                {required: true, message: "Please enter recipient name"},
                {min: 2, message: "Name must be at least 2 characters"},
                {max: 50, message: "Name cannot exceed 50 characters"},
                {
                  pattern: /^[a-zA-Z\s]*$/,
                  message: "Name can only contain letters and spaces",
                },
              ]}
            >
              <Input
                placeholder="Enter recipient name"
                prefix={<UserOutlined />}
                maxLength={50}
                showCount
              />
            </Form.Item>

            <Form.Item
              label="Purpose of Voucher"
              name="purpose"
              rules={[
                {required: true, message: "Please enter voucher purpose"},
                {min: 5, message: "Purpose must be at least 5 characters"},
                {max: 200, message: "Purpose cannot exceed 200 characters"},
              ]}
            >
              <TextArea
                placeholder="Enter the purpose or description for this voucher"
                rows={3}
                showCount
                maxLength={200}
              />
            </Form.Item>

            <Form.Item
              label="Date"
              name="date"
              rules={[{required: true, message: "Please select date"}]}
            >
              <DatePicker
                style={{width: "100%"}}
                placeholder="Select date"
                format="YYYY-MM-DD"
              />
            </Form.Item>

            <Form.Item
              label="Amount"
              name="amount"
              rules={[
                {required: true, message: "Please enter voucher amount"},
                {validator: validateAmount},
              ]}
              help={`Maximum allowed amount: ₹${localAvailableCash.toLocaleString()}`}
            >
              <InputNumber
                placeholder="Enter voucher amount"
                style={{width: "100%"}}
                min={0}
                step={0.01}
                precision={2}
                formatter={(value) =>
                  `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                parser={(value) => {
                  const parsed = parseFloat(value.replace(/₹\s?|,/g, ""));
                  return isNaN(parsed) ? 0 : parsed;
                }}
                disabled={localAvailableCash === 0}
                onChange={handleAmountChange}
                onBlur={() => form.validateFields(["amount"])}
              />
            </Form.Item>
          </Card>

          {/* Action Buttons */}
          <Form.Item
            style={{marginTop: 16, marginBottom: 0, textAlign: "right"}}
          >
            <Button
              style={{marginRight: 8}}
              onClick={handleCancel}
              disabled={addVoucherMutation.isLoading}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={addVoucherMutation.isLoading}
              disabled={localAvailableCash === 0}
            >
              Create Voucher
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default CreateVoucherModal;
