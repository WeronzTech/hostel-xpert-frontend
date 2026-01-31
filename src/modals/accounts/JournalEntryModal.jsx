import {
  Modal,
  Form,
  Input,
  DatePicker,
  Select,
  InputNumber,
  Button,
  Space,
  Divider,
  message,
} from "antd";
import {PlusOutlined, MinusCircleOutlined} from "@ant-design/icons";
import {useState} from "react";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {useSelector} from "react-redux";
import {createManualJournalEntry} from "../../hooks/accounts/useAccounts";

const JournalEntryModal = ({isOpen, onClose, onSuccess, accounts}) => {
  const [form] = Form.useForm();
  const [transactions, setTransactions] = useState([
    {accountId: null, debit: 0, credit: 0},
  ]);
  const queryClient = useQueryClient();
  const [messageApi, contextHolder] = message.useMessage();

  // Get properties from Redux store
  const {properties, selectedProperty} = useSelector(
    (state) => state.properties
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
        setTransactions([{accountId: null, debit: 0, credit: 0}]);
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

  const handleAddTransaction = () => {
    setTransactions([...transactions, {accountId: null, debit: 0, credit: 0}]);
  };

  const handleRemoveTransaction = (index) => {
    if (transactions.length > 1) {
      const newTransactions = transactions.filter((_, i) => i !== index);
      setTransactions(newTransactions);
    }
  };

  const calculateTotal = (field) => {
    return transactions.reduce(
      (sum, transaction) => sum + (parseFloat(transaction[field]) || 0),
      0
    );
  };

  const handleSubmit = async (values) => {
    // Filter out empty transactions and validate
    const validTransactions = transactions
      .filter((t) => t.accountId && (t.debit > 0 || t.credit > 0))
      .map((t) => ({
        accountId: t.accountId,
        debit: parseFloat(t.debit) || 0,
        credit: parseFloat(t.credit) || 0,
      }));

    if (validTransactions.length < 2) {
      message.error("At least two valid transactions are required");
      return;
    }

    // Determine propertyId - use selectedProperty if available, otherwise use form value
    const propertyId = selectedProperty?.id || values.propertyId;

    if (!propertyId) {
      message.error("Property selection is required");
      return;
    }

    // Prepare data for API
    const journalEntryData = {
      ...values,
      propertyId: propertyId,
      transactions: validTransactions,
      performedBy: "current-user", // You'll need to get this from auth context
    };

    createJournalEntryMutation.mutate(journalEntryData);
  };

  const totalDebits = calculateTotal("debit");
  const totalCredits = calculateTotal("credit");
  const isBalanced = Math.abs(totalDebits - totalCredits) < 0.01;
  const hasValidTransactions =
    transactions.filter((t) => t.accountId && (t.debit > 0 || t.credit > 0))
      .length >= 2;

  const cleanName =
    selectedProperty?.name?.replace(/^Heavens Living\s*-\s*/, "") || "";

  const modalTitle = selectedProperty?.id
    ? `Create Journal Entry - ${cleanName}`
    : "Create Journal Entry";

  return (
    <>
      {contextHolder}
      <Modal
        title={modalTitle}
        open={isOpen}
        onCancel={onClose}
        footer={null}
        width={800}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          {/* Show property selection dropdown only if no selectedProperty */}
          {!selectedProperty?.id && (
            <Form.Item
              name="propertyId"
              label="Property"
              rules={[{required: true, message: "Please select a property"}]}
            >
              <Select placeholder="Select property">
                {properties
                  ?.filter((property) => property?._id) // ✅ exclude null/undefined/empty IDs
                  .map((property) => (
                    <Select.Option key={property._id} value={property._id}>
                      {property.name?.replace(/^Heavens Living\s*-\s*/, "")}{" "}
                    </Select.Option>
                  ))}
              </Select>
            </Form.Item>
          )}

          <Form.Item
            name="date"
            label="Date"
            rules={[{required: true, message: "Please select date"}]}
          >
            <DatePicker style={{width: "100%"}} />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[{required: true, message: "Please enter description"}]}
          >
            <Input.TextArea
              rows={2}
              placeholder="Enter transaction description"
            />
          </Form.Item>

          <Divider>Transactions</Divider>

          {transactions.map((transaction, index) => (
            <Space
              key={index}
              style={{display: "flex", marginBottom: 8}}
              align="baseline"
            >
              <Form.Item
                label="Account"
                style={{marginBottom: 0}}
                required
                validateStatus={!transaction.accountId ? "error" : ""}
                help={!transaction.accountId ? "Please select account" : ""}
              >
                <Select
                  style={{width: 200}}
                  placeholder="Select account"
                  value={transaction.accountId}
                  onChange={(value) => {
                    const newTransactions = [...transactions];
                    newTransactions[index].accountId = value;
                    setTransactions(newTransactions);
                  }}
                >
                  {accounts?.map((account) => (
                    <Select.Option key={account._id} value={account._id}>
                      {account.name} ({account.accountType})
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                label="Debit"
                style={{marginBottom: 0}}
                validateStatus={
                  transaction.debit > 0 && transaction.credit > 0 ? "error" : ""
                }
                help={
                  transaction.debit > 0 && transaction.credit > 0
                    ? "Cannot have both debit and credit"
                    : ""
                }
              >
                <InputNumber
                  placeholder="0.00"
                  min={0}
                  value={transaction.debit}
                  onChange={(value) => {
                    const newTransactions = [...transactions];
                    newTransactions[index].debit = value || 0;
                    if (value > 0) {
                      newTransactions[index].credit = 0; // Reset credit when debit is entered
                    }
                    setTransactions(newTransactions);
                  }}
                  style={{width: 120}}
                  precision={2}
                />
              </Form.Item>

              <Form.Item
                label="Credit"
                style={{marginBottom: 0}}
                validateStatus={
                  transaction.debit > 0 && transaction.credit > 0 ? "error" : ""
                }
                help={
                  transaction.debit > 0 && transaction.credit > 0
                    ? "Cannot have both debit and credit"
                    : ""
                }
              >
                <InputNumber
                  placeholder="0.00"
                  min={0}
                  value={transaction.credit}
                  onChange={(value) => {
                    const newTransactions = [...transactions];
                    newTransactions[index].credit = value || 0;
                    if (value > 0) {
                      newTransactions[index].debit = 0; // Reset debit when credit is entered
                    }
                    setTransactions(newTransactions);
                  }}
                  style={{width: 120}}
                  precision={2}
                />
              </Form.Item>

              {transactions.length > 1 && (
                <MinusCircleOutlined
                  onClick={() => handleRemoveTransaction(index)}
                  style={{
                    color: "#ff4d4f",
                    fontSize: "16px",
                    cursor: "pointer",
                  }}
                />
              )}
            </Space>
          ))}

          <Button
            type="dashed"
            onClick={handleAddTransaction}
            block
            icon={<PlusOutlined />}
            style={{marginBottom: 16}}
          >
            Add Transaction
          </Button>

          <div
            style={{
              padding: "16px",
              background: "#f5f5f5",
              borderRadius: "6px",
            }}
          >
            <Space>
              <span>
                Total Debits: <strong>₹{totalDebits.toFixed(2)}</strong>
              </span>
              <span>
                Total Credits: <strong>₹{totalCredits.toFixed(2)}</strong>
              </span>
              <span style={{color: isBalanced ? "#52c41a" : "#ff4d4f"}}>
                {isBalanced ? "✓ Balanced" : "✗ Unbalanced"}
              </span>
            </Space>
          </div>

          <div style={{marginTop: 24, textAlign: "right"}}>
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
              disabled={!isBalanced || !hasValidTransactions}
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
