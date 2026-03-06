import {
  Modal,
  Form,
  Input,
  DatePicker,
  Select,
  InputNumber,
  Button,
  Divider,
  message,
  Row,
  Col,
} from "antd";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {useSelector} from "react-redux";
import {createManualJournalEntry} from "../../hooks/accounts/useAccounts";

const JournalEntryModal = ({isOpen, onClose, onSuccess, accounts}) => {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const [messageApi, contextHolder] = message.useMessage();

  // Get properties from Redux store
  const {properties, selectedProperty} = useSelector(
    (state) => state.properties,
  );

  // TanStack Query mutation for creating journal entry
  const createJournalEntryMutation = useMutation({
    mutationFn: createManualJournalEntry,
    onSuccess: (data) => {
      if (data.success) {
        messageApi.success({
          content: `${data.message}`,
          duration: 3,
        });
        // Invalidate relevant queries to refresh data
        queryClient.invalidateQueries({queryKey: ["journalEntries"]});
        queryClient.invalidateQueries({queryKey: ["chartOfAccounts"]});
        queryClient.invalidateQueries({queryKey: ["financialReports"]});
        onSuccess();
        form.resetFields();
      } else {
        message.error(data.message || "Failed to create journal entry");
      }
    },
    onError: (error) => {
      console.error("Failed to create journal entry:", error);
      messageApi.error({
        content: `${error.message}`,
        duration: 3,
      });
    },
  });

  const handleSubmit = async (values) => {
    // Validate transactions
    if (!values.debitAccountId || !values.creditAccountId) {
      message.error("Please select both debit and credit accounts");
      return;
    }

    if (!values.debitAmount || values.debitAmount <= 0) {
      message.error("Please enter a valid debit amount");
      return;
    }

    if (!values.creditAmount || values.creditAmount <= 0) {
      message.error("Please enter a valid credit amount");
      return;
    }

    // Check if amounts are equal (balanced)
    if (Math.abs(values.debitAmount - values.creditAmount) > 0.01) {
      message.error("Debit and credit amounts must be equal");
      return;
    }

    // Determine propertyId - use selectedProperty if available, otherwise use form value
    const propertyId = selectedProperty?.id || values.propertyId;

    if (!propertyId) {
      message.error("Property selection is required");
      return;
    }

    // Prepare data for API
    const transactions = [
      {
        accountId: values.debitAccountId,
        debit: parseFloat(values.debitAmount) || 0,
        credit: 0,
      },
      {
        accountId: values.creditAccountId,
        debit: 0,
        credit: parseFloat(values.creditAmount) || 0,
      },
    ];

    const journalEntryData = {
      date: values.date,
      description: values.description,
      propertyId: propertyId,
      transactions: transactions,
      performedBy: "current-user",
    };

    createJournalEntryMutation.mutate(journalEntryData);
  };

  const cleanName =
    selectedProperty?.name?.replace(/^Heavens Living\s*-\s*/, "") || "";

  const modalTitle = selectedProperty?.id
    ? `Create Journal Entry - ${cleanName}`
    : "Create Journal Entry";

  const debitAmount = Form.useWatch("debitAmount", form);
  const creditAmount = Form.useWatch("creditAmount", form);
  const isBalanced = Math.abs((debitAmount || 0) - (creditAmount || 0)) < 0.01;

  return (
    <>
      {contextHolder}
      <Modal
        title={modalTitle}
        open={isOpen}
        onCancel={onClose}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            debitAmount: 0,
            creditAmount: 0,
          }}
          style={{marginTop: 8}}
        >
          {/* First Row: Property (if needed) and Date */}
          <Row gutter={16}>
            {!selectedProperty?.id ? (
              <>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="propertyId"
                    label="Property"
                    rules={[
                      {required: true, message: "Please select a property"},
                    ]}
                  >
                    <Select placeholder="Select property">
                      {properties
                        ?.filter((property) => property?._id)
                        .map((property) => (
                          <Select.Option
                            key={property._id}
                            value={property._id}
                          >
                            {property.name?.replace(
                              /^Heavens Living\s*-\s*/,
                              "",
                            )}
                          </Select.Option>
                        ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="date"
                    label="Date"
                    rules={[{required: true, message: "Please select date"}]}
                  >
                    <DatePicker style={{width: "100%"}} format="DD/MM/YYYY" />
                  </Form.Item>
                </Col>
              </>
            ) : (
              <Col xs={24}>
                <Form.Item
                  name="date"
                  label="Date"
                  rules={[{required: true, message: "Please select date"}]}
                >
                  <DatePicker style={{width: "100%"}} format="DD/MM/YYYY" />
                </Form.Item>
              </Col>
            )}
          </Row>

          {/* Second Row: Full width Description */}
          <Row gutter={16}>
            <Col xs={24}>
              <Form.Item
                name="description"
                label="Description"
                rules={[{required: true, message: "Please enter description"}]}
              >
                <Input placeholder="Enter description" />
              </Form.Item>
            </Col>
          </Row>

          {/* Third Row: Both Transactions side by side */}
          <Row gutter={24}>
            {/* Debit Entry */}
            <Col xs={24} md={12}>
              <Divider orientation="left">Debit Entry</Divider>
              <Form.Item
                name="debitAccountId"
                label="Account"
                rules={[{required: true, message: "Please select account"}]}
              >
                <Select
                  placeholder="Select account to debit"
                  showSearch
                  optionFilterProp="children"
                >
                  {accounts?.map((account) => (
                    <Select.Option key={account._id} value={account._id}>
                      {account.name} ({account.accountType})
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="debitAmount"
                label="Amount"
                rules={[
                  {required: true, message: "Please enter amount"},
                  {
                    validator: (_, value) => {
                      if (value > 0) return Promise.resolve();
                      return Promise.reject("Amount must be greater than 0");
                    },
                  },
                ]}
              >
                <InputNumber
                  placeholder="0.00"
                  min={0}
                  style={{width: "100%"}}
                  precision={2}
                  prefix="₹"
                  onChange={(value) => {
                    const creditAmount = form.getFieldValue("creditAmount");
                    if (!creditAmount || creditAmount === 0) {
                      form.setFieldsValue({creditAmount: value});
                    }
                  }}
                />
              </Form.Item>
            </Col>

            {/* Credit Entry */}
            <Col xs={24} md={12}>
              <Divider orientation="left">Credit Entry</Divider>
              <Form.Item
                name="creditAccountId"
                label="Account"
                rules={[{required: true, message: "Please select account"}]}
              >
                <Select
                  placeholder="Select account to credit"
                  showSearch
                  optionFilterProp="children"
                >
                  {accounts?.map((account) => (
                    <Select.Option key={account._id} value={account._id}>
                      {account.name} ({account.accountType})
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="creditAmount"
                label="Amount"
                rules={[
                  {required: true, message: "Please enter amount"},
                  {
                    validator: (_, value) => {
                      if (value > 0) return Promise.resolve();
                      return Promise.reject("Amount must be greater than 0");
                    },
                  },
                ]}
              >
                <InputNumber
                  placeholder="0.00"
                  min={0}
                  style={{width: "100%"}}
                  precision={2}
                  prefix="₹"
                  onChange={(value) => {
                    const debitAmount = form.getFieldValue("debitAmount");
                    if (!debitAmount || debitAmount === 0) {
                      form.setFieldsValue({debitAmount: value});
                    }
                  }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Divider />

          {/* Balance Summary */}
          <div
            style={{
              padding: "12px",
              background: "#f5f5f5",
              borderRadius: "6px",
              marginBottom: 16,
            }}
          >
            <Row gutter={8}>
              <Col span={8}>
                <div style={{fontSize: "13px", color: "#666"}}>Debits</div>
                <div style={{fontSize: "16px", fontWeight: "bold"}}>
                  ₹{(debitAmount || 0).toFixed(2)}
                </div>
              </Col>
              <Col span={8}>
                <div style={{fontSize: "13px", color: "#666"}}>Credits</div>
                <div style={{fontSize: "16px", fontWeight: "bold"}}>
                  ₹{(creditAmount || 0).toFixed(2)}
                </div>
              </Col>
              <Col span={8}>
                <div style={{fontSize: "13px", color: "#666"}}>Status</div>
                <div
                  style={{
                    fontSize: "14px",
                    fontWeight: "bold",
                    color: isBalanced ? "#52c41a" : "#ff4d4f",
                  }}
                >
                  {isBalanced ? "✓ Balanced" : "✗ Unbalanced"}
                </div>
              </Col>
            </Row>
          </div>

          {/* Form Actions */}
          <div style={{textAlign: "right"}}>
            <Button
              onClick={onClose}
              style={{marginRight: 8}}
              disabled={createJournalEntryMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={createJournalEntryMutation.isPending}
            >
              Create Entry
            </Button>
          </div>
        </Form>
      </Modal>
    </>
  );
};

export default JournalEntryModal;
