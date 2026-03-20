// import React, { useState } from "react";
// import {
//   Modal,
//   Card,
//   Button,
//   Form,
//   Select,
//   Typography,
//   message,
//   Spin,
//   Row,
//   Col,
//   Space,
// } from "antd";
// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import {
//   getAllSubscriptions,
//   createSubscriptionPayment,
// } from "../../hooks/client/useSubscription";
// import { CheckCircleOutlined } from "@ant-design/icons";

// const { Text, Title } = Typography;
// const { Option } = Select;

// const PlanSelectionModal = ({ visible, onClose, clientId }) => {
//   const [form] = Form.useForm();
//   const [selectedPlan, setSelectedPlan] = useState(null);
//   const queryClient = useQueryClient();

//   // Fetch available active plans
//   const { data: plansData, isLoading: isLoadingPlans } = useQuery({
//     queryKey: ["subscriptions"],
//     queryFn: getAllSubscriptions,
//     enabled: visible,
//   });

//   const plans = plansData || [];

//   const paymentMutation = useMutation({
//     mutationFn: createSubscriptionPayment,
//     onSuccess: () => {
//       message.success(
//         "Payment submitted successfully. Awaiting admin approval.",
//       );
//       queryClient.invalidateQueries(["paymentHistory"]);
//       queryClient.invalidateQueries(["userProfile"]); // Refresh user to update status
//       form.resetFields();
//       setSelectedPlan(null);
//       onClose();
//     },
//     onError: (error) => {
//       message.error(error.message || "Failed to submit payment");
//     },
//   });

//   const handleFinish = (values) => {
//     if (!selectedPlan) {
//       return message.error("Please select a subscription plan.");
//     }

//     const payload = {
//       clientId,
//       subscriptionId: selectedPlan._id,
//       amount: selectedPlan.price,
//       paymentMethod: values.paymentMethod,
//       transactionId: values.transactionId || `TXN-${Date.now()}`,
//       remarks: "Purchased via Client Portal",
//     };

//     paymentMutation.mutate(payload);
//   };

//   return (
//     <Modal
//       title="Upgrade or Renew Subscription"
//       open={visible}
//       onCancel={onClose}
//       footer={null}
//       width={700}
//       destroyOnClose
//     >
//       {isLoadingPlans ? (
//         <div style={{ textAlign: "center", padding: "40px" }}>
//           <Spin size="large" />
//         </div>
//       ) : (
//         <Form form={form} layout="vertical" onFinish={handleFinish}>
//           <Title level={5}>1. Select a Plan</Title>
//           <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
//             {plans.map((plan) => (
//               <Col span={12} key={plan._id}>
//                 <Card
//                   hoverable
//                   onClick={() => setSelectedPlan(plan)}
//                   style={{
//                     borderColor:
//                       selectedPlan?._id === plan._id ? "#059669" : "#f0f0f0",
//                     borderWidth: selectedPlan?._id === plan._id ? 2 : 1,
//                     backgroundColor:
//                       selectedPlan?._id === plan._id ? "#f0fdf4" : "white",
//                   }}
//                 >
//                   <Title level={4} style={{ color: "#059669", margin: 0 }}>
//                     {plan.name}
//                   </Title>
//                   <Title level={3} style={{ margin: "8px 0" }}>
//                     ₹{plan.amount}
//                   </Title>
//                   <Text type="secondary">{plan.durationInDays} Days Valid</Text>

//                   <div style={{ marginTop: 16 }}>
//                     {plan.features?.map((feature, idx) => (
//                       <div key={idx}>
//                         <CheckCircleOutlined style={{ color: "#059669" }} />{" "}
//                         {feature}
//                       </div>
//                     ))}
//                   </div>
//                 </Card>
//               </Col>
//             ))}
//           </Row>

//           {selectedPlan && (
//             <>
//               <Title level={5}>2. Payment Details</Title>
//               <Row gutter={16}>
//                 <Col span={12}>
//                   <Form.Item
//                     name="paymentMethod"
//                     label="Payment Method"
//                     rules={[
//                       { required: true, message: "Select payment method" },
//                     ]}
//                   >
//                     <Select placeholder="Select method">
//                       <Option value="credit_card">Credit Card</Option>
//                       <Option value="bank_transfer">Bank Transfer</Option>
//                       <Option value="upi">UPI</Option>
//                     </Select>
//                   </Form.Item>
//                 </Col>
//                 <Col span={12}>
//                   <Form.Item
//                     name="transactionId"
//                     label="Transaction ID (Optional)"
//                   >
//                     <Select
//                       mode="tags"
//                       maxCount={1}
//                       placeholder="Auto-generated if empty"
//                     />
//                   </Form.Item>
//                 </Col>
//               </Row>
//               <div style={{ textAlign: "right", marginTop: 16 }}>
//                 <Space>
//                   <Button onClick={onClose}>Cancel</Button>
//                   <Button
//                     type="primary"
//                     htmlType="submit"
//                     loading={paymentMutation.isLoading}
//                   >
//                     Pay ₹{selectedPlan.price}
//                   </Button>
//                 </Space>
//               </div>
//             </>
//           )}
//         </Form>
//       )}
//     </Modal>
//   );
// };

// export default PlanSelectionModal;
import React, { useState } from "react";
import {
  Modal,
  Card,
  Button,
  Form,
  Select,
  Typography,
  message,
  Spin,
  Row,
  Col,
  Space,
  Input,
  Tag,
  Divider,
} from "antd";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllSubscriptions,
  createSubscriptionPayment, // ✅ Restored back to your Payment API
} from "../../hooks/client/useSubscription";
import { CheckCircleOutlined, InfoCircleOutlined } from "@ant-design/icons";

const { Text, Title } = Typography;
const { Option } = Select;

const PlanSelectionModal = ({ visible, onClose, clientId }) => {
  const [form] = Form.useForm();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const queryClient = useQueryClient();

  // Fetch available active plans (Master Plans)
  const { data: plansData, isLoading: isLoadingPlans } = useQuery({
    queryKey: ["subscriptions"],
    queryFn: () => getAllSubscriptions({ isActive: true }),
    enabled: visible,
  });

  // Handle both generic response arrays or nested .data arrays
  const plans = plansData?.data || plansData || [];

  const paymentMutation = useMutation({
    mutationFn: createSubscriptionPayment, // ✅ Triggers your payment creation endpoint
    onSuccess: () => {
      message.success(
        "Payment submitted successfully. Awaiting admin approval.",
      );
      queryClient.invalidateQueries(["paymentHistory"]);
      queryClient.invalidateQueries(["userProfile"]);
      form.resetFields();
      setSelectedPlan(null);
      onClose();
    },
    onError: (error) => {
      message.error(error.message || "Failed to submit payment");
    },
  });

  const handleFinish = (values) => {
    if (!selectedPlan) {
      return message.error("Please select a subscription plan.");
    }

    // ✅ Matches your backend createSubscriptionPayment payload
    const payload = {
      clientId,
      subscriptionId: selectedPlan._id, // ID of the plan they are buying
      amount: selectedPlan.amount || selectedPlan.price, // Fallback depending on your exact model field
      paymentMethod: values.paymentMethod,
      transactionId: values.transactionId || `TXN-${Date.now()}`,
      remarks: values.remarks || "Purchased via Client Portal",
    };

    paymentMutation.mutate(payload);
  };

  const formatPricingType = (type, cycle) => {
    let typeText = "Fixed";
    if (type === "user") typeText = "per User";
    if (type === "bed") typeText = "per Bed";

    let cycleText = "";
    if (cycle === "monthly") cycleText = "/ Month";
    if (cycle === "quarterly") cycleText = "/ Quarter";
    if (cycle === "half_yearly") cycleText = "/ Half-Year";
    if (cycle === "yearly") cycleText = "/ Year";

    return `${typeText} ${cycleText}`;
  };

  return (
    <Modal
      title="Upgrade or Renew Subscription"
      open={visible}
      onCancel={onClose}
      footer={null}
      width={700}
      destroyOnClose
    >
      {isLoadingPlans ? (
        <div style={{ textAlign: "center", padding: "40px" }}>
          <Spin size="large" />
        </div>
      ) : (
        <Form form={form} layout="vertical" onFinish={handleFinish}>
          <Title level={5}>1. Select a Plan</Title>
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            {plans.map((plan) => (
              <Col span={12} key={plan._id}>
                <Card
                  hoverable
                  onClick={() => setSelectedPlan(plan)}
                  style={{
                    borderColor:
                      selectedPlan?._id === plan._id ? "#059669" : "#f0f0f0",
                    borderWidth: selectedPlan?._id === plan._id ? 2 : 1,
                    backgroundColor:
                      selectedPlan?._id === plan._id ? "#f0fdf4" : "white",
                    height: "100%",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <Title level={4} style={{ color: "#059669", margin: 0 }}>
                      {plan.name}
                    </Title>
                    <Tag color="blue" style={{ textTransform: "capitalize" }}>
                      {plan.billingCycle?.replace("_", " ")}
                    </Tag>
                  </div>

                  <div style={{ margin: "16px 0" }}>
                    <Title
                      level={2}
                      style={{ margin: 0, display: "inline-block" }}
                    >
                      ₹{plan.amount}
                    </Title>
                    <Text
                      type="secondary"
                      style={{ marginLeft: 8, fontSize: "16px" }}
                    >
                      {formatPricingType(plan.type, plan.billingCycle)}
                    </Text>
                  </div>

                  <Text
                    type="secondary"
                    style={{ display: "block", marginBottom: 12 }}
                  >
                    <InfoCircleOutlined style={{ marginRight: 6 }} />
                    Plan locked for {plan.durationInDays} days
                  </Text>

                  <Divider style={{ margin: "12px 0" }} />

                  <div>
                    {plan.features?.map((feature, idx) => (
                      <div key={idx} style={{ marginBottom: 6 }}>
                        <CheckCircleOutlined
                          style={{ color: "#059669", marginRight: 8 }}
                        />
                        <Text>{feature}</Text>
                      </div>
                    ))}
                  </div>
                </Card>
              </Col>
            ))}
          </Row>

          {selectedPlan && (
            <>
              <Title level={5}>2. Payment Details</Title>
              <div
                style={{
                  backgroundColor: "#f9fafb",
                  padding: 16,
                  borderRadius: 8,
                  marginBottom: 16,
                }}
              >
                <Text strong>Selected Plan: </Text>{" "}
                <Text>{selectedPlan.name}</Text>
                <br />
                <Text strong>Amount to Pay: </Text>{" "}
                <Text type="success">
                  ₹{selectedPlan.amount || selectedPlan.price}
                </Text>
              </div>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="paymentMethod"
                    label="Payment Method"
                    rules={[
                      { required: true, message: "Select payment method" },
                    ]}
                  >
                    <Select placeholder="Select method">
                      <Option value="credit_card">Credit Card</Option>
                      <Option value="bank_transfer">Bank Transfer</Option>
                      <Option value="upi">UPI</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="transactionId"
                    label="Transaction ID (Optional)"
                    tooltip="Leave empty to auto-generate a reference ID"
                  >
                    <Input placeholder="Auto-generated if empty" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item name="remarks" label="Remarks (Optional)">
                <Input.TextArea
                  rows={2}
                  placeholder="Any notes about this payment..."
                />
              </Form.Item>

              <div style={{ textAlign: "right", marginTop: 16 }}>
                <Space>
                  <Button onClick={onClose}>Cancel</Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={paymentMutation.isLoading}
                  >
                    Submit Payment of ₹
                    {selectedPlan.amount || selectedPlan.price}
                  </Button>
                </Space>
              </div>
            </>
          )}
        </Form>
      )}
    </Modal>
  );
};

export default PlanSelectionModal;
