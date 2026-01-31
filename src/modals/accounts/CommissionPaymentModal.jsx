import {useState} from "react";
import {useQuery, useMutation, useQueryClient} from "@tanstack/react-query";
import {
  Modal,
  Form,
  Input,
  Select,
  Table,
  Card,
  Button,
  message,
  DatePicker,
} from "antd";
import {SearchOutlined} from "@ant-design/icons";
import {
  getAllAgencies,
  getUsersByAgencyId,
  addCommission,
} from "../../hooks/accounts/useAccounts";

const {Option} = Select;
const {TextArea} = Input;

const CommissionPaymentModal = ({visible, onCancel, onSuccess}) => {
  const [form] = Form.useForm();
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [paymentType, setPaymentType] = useState("Cash");

  const queryClient = useQueryClient();
  const [messageApi, contextHolder] = message.useMessage();

  const addCommissionMutation = useMutation({
    mutationFn: addCommission,
    onSuccess: (data) => {
      queryClient.invalidateQueries({queryKey: ["commissions"]});
      queryClient.invalidateQueries({queryKey: ["transactions"]});
      queryClient.invalidateQueries({queryKey: ["users"]});
      queryClient.invalidateQueries({
        queryKey: ["availableCash"],
      });

      messageApi.success({content: data.message, duration: 3});
      form.resetFields();
      setSelectedAgent(null);
      setPaymentType("");
      onSuccess();
      onCancel();
    },
    onError: (error) => {
      console.error("Error processing commission payment:", error);
      messageApi.error({content: error.message, duration: 3});
    },
  });

  const {data: agents = [], isLoading: agentsLoading} = useQuery({
    queryKey: ["agents", "no-agency"],
    queryFn: () => getAllAgencies(),
    enabled: visible,
    staleTime: 5 * 60 * 1000,
  });

  const {data: usersData, isLoading: usersLoading} = useQuery({
    queryKey: ["users-by-agency", selectedAgent?._id],
    queryFn: ({queryKey}) => {
      const agentId = queryKey[1];
      return getUsersByAgencyId(agentId);
    },
    enabled: !!selectedAgent?._id && visible,
    staleTime: 5 * 60 * 1000,
  });

  const resetForm = () => {
    form.resetFields();
    setSelectedAgent(null);
    setPaymentType("Cash");
  };

  const handleAgentSelect = (value) => {
    const agent = agents.find((a) => a._id === value);
    setSelectedAgent(agent || null);
    form.setFieldsValue({agentId: value});
  };

  const handlePaymentTypeChange = (value) => {
    setPaymentType(value);
    if (value === "Cash") form.setFieldsValue({transactionId: undefined});
  };

  const transformUsersData = (users) => {
    return (users || []).map((user) => ({
      id: user._id,
      name: user.name,
      contact: user.contact,
      property: user.stayDetails?.propertyName || "N/A",
      propertyId: user.stayDetails?.propertyId || "N/A",
      monthlyRent:
        user.stayDetails?.monthlyRent ||
        user.financialDetails?.monthlyRent ||
        0,
      totalDeposit:
        (user.stayDetails?.nonRefundableDeposit || 0) +
        (user.stayDetails?.refundableDeposit || 0),
      depositAmount: user.stayDetails?.depositAmountPaid || 0,
      moveInDate: user.stayDetails?.joinDate
        ? new Date(user.stayDetails.joinDate).toISOString().split("T")[0]
        : "N/A",
      commissionEarned: user.commissionEarned || 0,
    }));
  };

  const handleSubmit = async (values) => {
    const userIds = transformedUsers
      .map((user) => user.id)
      .filter((id) => id && id !== "N/A");

    const propertyIds = [
      ...new Set(
        transformedUsers
          .map((user) => user.propertyId)
          .filter((id) => id && id !== "N/A")
      ),
    ];
    console.log(propertyIds);
    const commissionData = {
      agentName: selectedAgent?.agentName,
      agencyName: selectedAgent?.agencyName,
      contactNumber: selectedAgent?.contactNumber,
      amount: Number(values.amount),
      paymentType: values.paymentType,
      transactionId: values.transactionId,
      remarks: values.remarks,
      agent: selectedAgent?._id,
      property: propertyIds,
      userIds: userIds,
      paymentDate: values.paymentDate,
    };

    addCommissionMutation.mutate(commissionData);
  };

  const handleCancel = () => {
    resetForm();
    onCancel();
  };

  const userColumns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      width: 150,
      render: (text, record) => (
        <div>
          <div>{text}</div>
          {record.commissionEarned > 0 && (
            <div style={{fontSize: "12px", color: "#888"}}>
              Commission: ₹{record.commissionEarned.toLocaleString()}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Contact",
      dataIndex: "contact",
      key: "contact",
      align: "center",
      width: 120,
    },
    {
      title: "Deposit",
      dataIndex: "totalDeposit",
      key: "totalDeposit",
      render: (amount) => `₹${amount?.toLocaleString() || "0"}`,
      align: "center",
      width: 100,
    },
    {
      title: "Paid",
      dataIndex: "depositAmount",
      key: "depositAmount",
      render: (amount) => `₹${amount?.toLocaleString() || "0"}`,
      align: "center",
      width: 100,
    },
    {
      title: "Join Date",
      dataIndex: "moveInDate",
      key: "moveInDate",
      align: "center",
      width: 120,
    },
  ];

  const transformedUsers = transformUsersData(usersData?.data);

  const filterAgentOption = (input, option) => {
    const agent = agents.find((a) => a._id === option.value);
    if (!agent) return false;

    const searchText = input.toLowerCase();
    return (
      agent.agentName?.toLowerCase().includes(searchText) ||
      agent.agencyName?.toLowerCase().includes(searchText) ||
      agent.contactNumber?.includes(searchText)
    );
  };

  return (
    <>
      {contextHolder}
      <Modal
        title="Pay Commission"
        open={visible}
        onCancel={handleCancel}
        footer={null}
        width={800}
        centered
        maskClosable={false}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
          initialValues={{paymentType: "Cash"}}
        >
          <Card size="small" title="Agent Details" style={{marginBottom: 16}}>
            <Form.Item
              label="Select Agent"
              name="agentId"
              rules={[{required: true, message: "Please select an agent"}]}
            >
              <Select
                showSearch
                placeholder="Search agent by name or agency"
                onChange={handleAgentSelect}
                filterOption={filterAgentOption}
                suffixIcon={<SearchOutlined />}
                allowClear
                loading={agentsLoading}
                notFoundContent={
                  agentsLoading ? "Loading..." : "No agents found"
                }
              >
                {agents.map((agent) => {
                  const displayText = `${agent.agentName} ${
                    agent.hasAgency
                      ? `(${agent.agencyName || "No agency name"})`
                      : `(${agent.contactNumber || "No contact"})`
                  }`;
                  return (
                    <Option key={agent._id} value={agent._id}>
                      {displayText}
                    </Option>
                  );
                })}
              </Select>
            </Form.Item>
          </Card>

          {selectedAgent && (
            <Card
              size="small"
              title={`Users Associated with ${selectedAgent.agentName} (${transformedUsers.length} users)`}
              style={{marginBottom: 16}}
            >
              {transformedUsers.length > 0 ? (
                <Table
                  dataSource={transformedUsers}
                  columns={userColumns}
                  pagination={false}
                  size="small"
                  scroll={{y: 200, x: "max-content"}} // allows horizontal scrolling
                  rowKey="id"
                  loading={usersLoading}
                />
              ) : (
                <div
                  style={{textAlign: "center", padding: "20px", color: "#999"}}
                >
                  No users associated with this agent
                </div>
              )}
            </Card>
          )}

          <Card
            size="small"
            title={
              usersData?.totalCommission > 0
                ? `Payment Details (Total Paid: ₹${usersData.totalCommission.toLocaleString()})`
                : "Commission Payment Details"
            }
          >
            {/* First row — Amount & Payment Type */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
              }}
            >
              <Form.Item
                label="Amount"
                name="amount"
                rules={[
                  {required: true, message: "Please enter commission amount"},
                  {
                    pattern: /^[0-9]+(\.[0-9]{1,2})?$/,
                    message: "Please enter valid amount",
                  },
                ]}
              >
                <Input
                  placeholder="Enter amount"
                  prefix="₹"
                  type="number"
                  min={0}
                  step="0.01"
                />
              </Form.Item>

              <Form.Item
                label="Payment Type"
                name="paymentType"
                rules={[
                  {required: true, message: "Please select payment type"},
                ]}
              >
                <Select
                  placeholder="Select payment type"
                  onChange={handlePaymentTypeChange}
                >
                  <Option value="Cash">Cash</Option>
                  <Option value="UPI">UPI</Option>
                  <Option value="Bank Transfer">Bank Transfer</Option>
                </Select>
              </Form.Item>
            </div>

            {/* Conditional second row */}
            {paymentType === "UPI" || paymentType === "Bank Transfer" ? (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "16px",
                }}
              >
                {/* Transaction ID */}
                <Form.Item
                  label="Transaction ID"
                  name="transactionId"
                  rules={[
                    {required: true, message: "Please enter transaction ID"},
                  ]}
                >
                  <Input placeholder="Enter transaction ID" />
                </Form.Item>

                {/* Payment Date */}
                <Form.Item
                  label="Payment Date"
                  name="paymentDate"
                  rules={[
                    {required: true, message: "Please select payment date"},
                  ]}
                >
                  <DatePicker
                    style={{width: "100%"}}
                    placeholder="Select payment date"
                    format="YYYY-MM-DD"
                  />
                </Form.Item>
              </div>
            ) : (
              // For Cash — show only Date field
              <Form.Item
                label="Payment Date"
                name="paymentDate"
                rules={[
                  {required: true, message: "Please select payment date"},
                ]}
              >
                <DatePicker
                  style={{width: "100%"}}
                  placeholder="Select payment date"
                  format="YYYY-MM-DD"
                />
              </Form.Item>
            )}

            {/* Remarks field (always shown) */}
            <Form.Item label="Remarks" name="remarks">
              <TextArea
                placeholder="Enter any remarks or notes about this commission payment"
                rows={3}
              />
            </Form.Item>
          </Card>

          <Form.Item
            style={{marginTop: 24, marginBottom: 0, textAlign: "right"}}
          >
            <Button style={{marginRight: 8}} onClick={handleCancel}>
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={addCommissionMutation.isLoading}
              disabled={!selectedAgent}
            >
              Process Commission Payment
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default CommissionPaymentModal;
