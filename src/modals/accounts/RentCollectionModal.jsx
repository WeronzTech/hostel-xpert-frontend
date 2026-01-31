// import React, {useState, useEffect} from "react";
// import {
//   Modal,
//   Tabs,
//   Form,
//   Input,
//   Select,
//   DatePicker,
//   InputNumber,
//   Button,
//   Switch,
//   Divider,
//   Radio,
//   Card,
//   Row,
//   Col,
//   Alert,
//   message,
// } from "antd";
// import {FiSearch, FiCalendar, FiFileText} from "react-icons/fi";
// import {useSelector} from "react-redux";
// import {HomeOutlined} from "../../icons";
// import {getUsers} from "../../hooks/users/useUser";
// import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
// import {
//   getLatestFeePaymentByUserId,
//   makeDepositPayment,
//   makeFeePayment,
// } from "../../hooks/accounts/useAccounts";

// const {Option} = Select;
// const {TabPane} = Tabs;

// const RentCollectionModal = ({visible, onCancel, selectedOption}) => {
//   const {properties, selectedProperty} = useSelector(
//     (state) => state.properties
//   );
//   const [selectedUser, setSelectedUser] = useState(null);
//   const [activeTab, setActiveTab] = useState("basic");
//   const [form] = Form.useForm();
//   const [depositForm] = Form.useForm(); // Separate form for deposit payment
//   const [enableWaiveOff, setEnableWaiveOff] = useState(false);
//   const [waiveOffAmount, setWaiveOffAmount] = useState(0);
//   const [remainingAmount, setRemainingAmount] = useState(0);
//   const [paymentAction, setPaymentAction] = useState("fullPayment");
//   const [currentProperty, setCurrentProperty] = useState(selectedProperty);
//   const [paymentMode, setPaymentMode] = useState("");
//   const [depositPaymentMode, setDepositPaymentMode] = useState(""); // For deposit payment

//   const [messageApi, contextHolder] = message.useMessage();

//   const queryClient = useQueryClient();

//   const {
//     data: usersData,
//     isLoading: usersLoading,
//     error: usersError,
//     refetch: refetchUsers,
//   } = useQuery({
//     queryKey: [
//       "users",
//       currentProperty?.id || currentProperty?._id,
//       selectedOption,
//     ],
//     queryFn: () =>
//       getUsers({
//         rentType: selectedOption,
//         propertyId: currentProperty?.id || currentProperty?._id,
//         all: true,
//       }),
//     refetchOnWindowFocus: false,
//     staleTime: 5 * 60 * 1000,
//   });

//   const users = usersData?.data || [];

//   const {data: latestPayment} = useQuery({
//     queryKey: ["latestPayment", selectedUser?._id],
//     queryFn: () => getLatestFeePaymentByUserId(selectedUser?._id),
//     enabled: !!selectedUser?._id,
//     refetchOnWindowFocus: false,
//   });

//   const {mutate: recordFeePayment, isLoading: isFeeSubmitting} = useMutation({
//     mutationFn: makeFeePayment,
//     onSuccess: async (data) => {
//       messageApi.success({
//         content: `${data.message}`,
//         duration: 3,
//       });

//       form.resetFields();

//       queryClient.invalidateQueries({
//         queryKey: ["accountDashboard"],
//       });
//       queryClient.invalidateQueries({
//         queryKey: ["availableCash"],
//       });

//       const refreshed = await refetchUsers();
//       const freshUsers = refreshed?.data?.data || [];
//       const updatedUser = freshUsers.find((u) => u._id === selectedUser?._id);

//       if (updatedUser) setSelectedUser(updatedUser);
//       handleModalClose();
//     },
//     onError: (error) => {
//       messageApi.error({
//         content: `${error.message}`,
//         duration: 3,
//       });
//       console.error("Deposit payment failed:", error);
//     },
//   });

//   const {mutate: recordDepositPayment, isLoading: isDepositSubmitting} =
//     useMutation({
//       mutationFn: makeDepositPayment,
//       onSuccess: async (data) => {
//         messageApi.success({
//           content: `${data.message}`,
//           duration: 3,
//         });

//         depositForm.resetFields();

//         queryClient.invalidateQueries({
//           queryKey: ["accountDashboardDeposit"],
//         });
//         queryClient.invalidateQueries({
//           queryKey: ["availableCash"],
//         });

//         const refreshed = await refetchUsers();
//         const freshUsers = refreshed?.data?.data || [];
//         const updatedUser = freshUsers.find((u) => u._id === selectedUser?._id);

//         if (updatedUser) setSelectedUser(updatedUser);
//         setActiveTab("payment");
//       },
//       onError: (error) => {
//         messageApi.error({
//           content: `${error.message}`,
//           duration: 3,
//         });
//         console.error("Fee payment failed:", error);
//       },
//     });

//   useEffect(() => {
//     if (visible) {
//       setCurrentProperty(selectedProperty);
//     }
//   }, [visible, selectedProperty]);

//   const handleModalClose = () => {
//     form.resetFields();
//     depositForm.resetFields();
//     setSelectedUser(null);
//     setActiveTab("basic");
//     setEnableWaiveOff(false);
//     setWaiveOffAmount(0);
//     setRemainingAmount(0);
//     setPaymentAction("fullPayment");
//     setPaymentMode("");
//     setDepositPaymentMode("");
//     setCurrentProperty(selectedProperty);
//     onCancel();
//   };

//   const handleUserSelect = (userId) => {
//     const user = users.find((u) => u._id === userId);
//     console.log("Selected User:", user);
//     setSelectedUser(user);
//     setRemainingAmount(user?.pendingRent || user?.pendingAmount || 0);
//     setWaiveOffAmount(0);
//     setEnableWaiveOff(false);
//     setPaymentAction("fullPayment");
//     setPaymentMode("");
//     setDepositPaymentMode("");
//   };

//   const userWithPayment = React.useMemo(() => {
//     if (!selectedUser) return null;

//     return {
//       ...selectedUser,
//       lastPaidDate: latestPayment?.paymentDate
//         ? new Date(latestPayment.paymentDate).toLocaleDateString()
//         : null,
//       clearedMonths:
//         latestPayment?.paymentForMonths?.length > 0
//           ? latestPayment.paymentForMonths
//           : [],
//     };
//   }, [selectedUser, latestPayment]);
//   console.log(userWithPayment);
//   const handleWaiveOffToggle = (checked) => {
//     setEnableWaiveOff(checked);
//     if (!checked) {
//       setWaiveOffAmount(0);
//       setRemainingAmount(
//         selectedUser?.pendingRent || selectedUser?.pendingAmount || 0
//       );
//       setPaymentAction("fullPayment");
//     }
//   };

//   const handleWaiveOffAmountChange = (value) => {
//     const waiveOff = value || 0;
//     const totalPending =
//       selectedUser?.pendingRent || selectedUser?.pendingAmount || 0;

//     setWaiveOffAmount(waiveOff);
//     setRemainingAmount(Math.max(0, totalPending - waiveOff));
//   };

//   const handlePaymentActionChange = (e) => {
//     setPaymentAction(e.target.value);
//   };

//   const handlePaymentModeChange = (value) => {
//     setPaymentMode(value);
//   };

//   const handleDepositPaymentModeChange = (value) => {
//     setDepositPaymentMode(value);
//   };

//   const handlePaymentSubmit = (values) => {
//     const paymentData = {
//       ...values,
//       userId: selectedUser._id,
//       type: selectedOption,
//       amount: values.paidAmount || 0,
//       waveOffAmount: enableWaiveOff ? waiveOffAmount : 0,
//       waveOffReason: values.waveOffReason,
//       paymentMethod:
//         paymentMode === "upi"
//           ? "UPI"
//           : paymentMode === "bank_transfer"
//           ? "Bank Transfer"
//           : paymentMode === "card"
//           ? "Card"
//           : "Cash",
//       paymentDate: values.paymentDate,
//       collectedBy: values.collectedBy || "",
//       transactionId: values.transactionId || null,
//       remarks: values.remarks || "",
//     };
//     recordFeePayment(paymentData);
//     console.log("Payment submitted:", paymentData);
//   };

//   const handleDepositPaymentSubmit = (values) => {
//     if (!selectedUser?._id) {
//       message.warning("Please select a user first.");
//       return;
//     }

//     const payload = {
//       userId: selectedUser._id,
//       amount: values.depositAmountPaid,
//       paymentMethod:
//         depositPaymentMode === "upi"
//           ? "UPI"
//           : depositPaymentMode === "bank_transfer"
//           ? "Bank Transfer"
//           : depositPaymentMode === "card"
//           ? "Card"
//           : "Cash",
//       paymentDate: values.depositPaymentDate,
//       collectedBy: values.depositCollectedBy || "",
//       transactionId: values.depTransactionId || null,
//       remarks: values.DepRemarks || "",
//     };

//     recordDepositPayment(payload);
//   };

//   const handleSkipDeposit = () => {
//     setActiveTab("payment");
//   };

//   const handlePropertyChange = (propertyId) => {
//     if (propertyId) {
//       const property = properties.find((p) => p._id === propertyId);
//       setCurrentProperty(property);
//       setSelectedUser(null);
//     } else {
//       setCurrentProperty(null);
//     }
//   };

//   const getModalTitle = () => {
//     switch (selectedOption) {
//       case "monthly":
//         return "Collect Monthly Rent";
//       case "daily":
//         return "Collect Daily Rent";
//       case "mess":
//         return "Collect Mess Charges";
//       default:
//         return "Collect Payment";
//     }
//   };

//   // Check if deposit payment is required
//   const requiresDepositPayment = userWithPayment?.depositStatus === "pending";

//   // Calculate deposit amounts
//   const totalDeposit = userWithPayment?.depositAmount || 0;
//   const depositPaid = userWithPayment?.depositPaid || 0;
//   const depositRemaining = totalDeposit - depositPaid;

//   // Custom filter function for user search
//   const filterOption = (input, option) => {
//     const user = users?.find((u) => u._id === option.value);
//     if (user) {
//       const searchString = `${user.name} ${user.roomNumber}`.toLowerCase();
//       return searchString.includes(input.toLowerCase());
//     }
//     return false;
//   };

//   // Format date for display
//   const formatDate = (dateString) => {
//     if (!dateString) return "N/A";
//     return new Date(dateString).toLocaleDateString("en-IN", {
//       day: "2-digit",
//       month: "2-digit",
//       year: "numeric",
//     });
//   };

//   // Clean property name
//   const cleanName =
//     currentProperty?.name?.replace(/^Heavens Living -\s*/, "") || "";
//   const modalTitle = cleanName
//     ? `${getModalTitle()} - ${cleanName}`
//     : `${getModalTitle()}`;

//   // Check if transaction ID field is needed for rent payment
//   const showTransactionIdField =
//     paymentMode === "upi" || paymentMode === "bank_transfer";

//   // Check if transaction ID field is needed for deposit payment
//   const showDepositTransactionIdField =
//     depositPaymentMode === "upi" || depositPaymentMode === "bank_transfer";

//   // Check if collected by field is needed for deposit payment
//   const showDepositCollectedByField = depositPaymentMode === "cash";

//   const showCollectedByField = paymentMode === "cash";

//   return (
//     <>
//       {contextHolder}
//       <Modal
//         title={modalTitle}
//         open={visible}
//         onCancel={handleModalClose}
//         footer={null}
//         width={700}
//         centered
//         maskClosable={false}
//       >
//         <Tabs
//           activeKey={activeTab}
//           onChange={setActiveTab}
//           centered
//           items={[
//             {
//               key: "basic",
//               label: "Basic Information",
//               children: (
//                 <Form layout="vertical" form={form}>
//                   {/* Property Selection (only show if no property is selected initially) */}
//                   {!selectedProperty?.id && (
//                     <Card size="small" style={{marginBottom: 16}}>
//                       <Form.Item
//                         label="Select Property"
//                         name="propertyId"
//                         rules={[
//                           {required: true, message: "Please select a property"},
//                         ]}
//                       >
//                         <Select
//                           placeholder="Choose a property"
//                           onChange={handlePropertyChange}
//                           suffixIcon={<HomeOutlined />}
//                           allowClear
//                         >
//                           {properties
//                             .filter((property) => property._id !== null)
//                             .map((property) => (
//                               <Option key={property._id} value={property._id}>
//                                 {property.name}
//                               </Option>
//                             ))}
//                         </Select>
//                       </Form.Item>
//                     </Card>
//                   )}
//                   {/* If property is selected from dropdown, show it as a hidden field */}
//                   {currentProperty?.id && !selectedProperty?.id && (
//                     <Form.Item
//                       name="propertyId"
//                       initialValue={currentProperty.id}
//                       style={{display: "none"}}
//                     >
//                       <Input />
//                     </Form.Item>
//                   )}
//                   {(selectedProperty?.id || currentProperty?._id) && (
//                     <Form.Item label={`Select User (${users.length})`} required>
//                       <Select
//                         showSearch
//                         placeholder="Search user by name or room number"
//                         value={selectedUser?._id || undefined}
//                         onChange={handleUserSelect}
//                         filterOption={filterOption}
//                         suffixIcon={<FiSearch />}
//                         loading={usersLoading}
//                         notFoundContent={
//                           usersError ? "Error loading users" : "No users found"
//                         }
//                       >
//                         {users.map((user) => (
//                           <Option key={user?._id} value={user?._id}>
//                             {user.name} (Room {user.roomNumber})
//                           </Option>
//                         ))}
//                       </Select>
//                     </Form.Item>
//                   )}
//                   {userWithPayment && (
//                     <>
//                       {selectedOption === "monthly" ? (
//                         // ✅ MONTHLY LAYOUT (no change)
//                         <Row gutter={16}>
//                           <Col span={12}>
//                             <Form.Item label="Monthly Rent">
//                               <Input
//                                 value={`₹ ${userWithPayment.monthlyRent || 0}`}
//                                 readOnly
//                               />
//                             </Form.Item>
//                           </Col>

//                           <Col span={12}>
//                             <Form.Item label="Join Date">
//                               <Input
//                                 value={formatDate(userWithPayment.joinedDate)}
//                                 prefix={<FiCalendar />}
//                                 readOnly
//                               />
//                             </Form.Item>
//                           </Col>
//                         </Row>
//                       ) : (
//                         // ✅ DAILY or MESS LAYOUT (rearranged)
//                         <>
//                           {/* 🔹 First Row — Check-in/Check-out or Mess Start/End */}
//                           <Row gutter={16}>
//                             <Col span={12}>
//                               <Form.Item
//                                 label={
//                                   selectedOption === "mess"
//                                     ? "Mess Start Date"
//                                     : "Check-In Date"
//                                 }
//                               >
//                                 <Input
//                                   value={formatDate(
//                                     selectedOption === "mess"
//                                       ? userWithPayment.messStartDate
//                                       : userWithPayment.checkInDate
//                                   )}
//                                   prefix={<FiCalendar />}
//                                   readOnly
//                                 />
//                               </Form.Item>
//                             </Col>

//                             <Col span={12}>
//                               <Form.Item
//                                 label={
//                                   selectedOption === "mess"
//                                     ? "Mess End Date"
//                                     : "Check-Out Date"
//                                 }
//                               >
//                                 <Input
//                                   value={formatDate(
//                                     selectedOption === "mess"
//                                       ? userWithPayment.messEndDate
//                                       : userWithPayment.checkOutDate
//                                   )}
//                                   prefix={<FiCalendar />}
//                                   readOnly
//                                 />
//                               </Form.Item>
//                             </Col>
//                           </Row>

//                           {/* 🔹 Second Row — Total Days + Rent/Day */}
//                           <Row gutter={16}>
//                             <Col span={12}>
//                               <Form.Item
//                                 label={
//                                   selectedOption === "mess"
//                                     ? "Total Mess Days"
//                                     : "Total No. of Days"
//                                 }
//                               >
//                                 <Input
//                                   value={
//                                     userWithPayment.noOfDays ||
//                                     userWithPayment.noOfDaysMess ||
//                                     0
//                                   }
//                                   readOnly
//                                 />
//                               </Form.Item>
//                             </Col>

//                             <Col span={12}>
//                               <Form.Item
//                                 label={
//                                   selectedOption === "mess"
//                                     ? "Mess Rent / Day"
//                                     : "Rent / Day"
//                                 }
//                               >
//                                 <Input
//                                   value={`₹ ${
//                                     selectedOption === "mess"
//                                       ? userWithPayment.rent || 0
//                                       : userWithPayment.rent || 0
//                                   }`}
//                                   readOnly
//                                 />
//                               </Form.Item>
//                             </Col>
//                           </Row>
//                         </>
//                       )}

//                       {/* 🔹 Rent Cleared Till / Last Paid Date */}
//                       <Row gutter={16}>
//                         {userWithPayment?.clearedMonths?.length > 0 &&
//                           selectedOption === "monthly" && (
//                             <Col span={12}>
//                               <Form.Item label="Rent Cleared Till">
//                                 <Input
//                                   value={userWithPayment.clearedMonths.at(-1)}
//                                   readOnly
//                                 />
//                               </Form.Item>
//                             </Col>
//                           )}

//                         {userWithPayment?.lastPaidDate && (
//                           <Col span={12}>
//                             <Form.Item label="Last Paid Date">
//                               <Input
//                                 value={formatDate(userWithPayment.lastPaidDate)}
//                                 prefix={<FiCalendar />}
//                                 readOnly
//                               />
//                             </Form.Item>
//                           </Col>
//                         )}
//                       </Row>

//                       {/* 🔹 Pending / Total Amount */}
//                       <Form.Item label="Pending Amount">
//                         <Input
//                           value={`₹ ${
//                             selectedOption === "monthly"
//                               ? userWithPayment.pendingRent || 0
//                               : userWithPayment.pendingAmount || 0
//                           }`}
//                           style={{
//                             fontWeight: "bold",
//                             fontSize: "16px",
//                             color:
//                               (selectedOption === "monthly"
//                                 ? userWithPayment.pendingRent
//                                 : userWithPayment.pendingAmount) > 0
//                                 ? "#f56565"
//                                 : "#10b981",
//                           }}
//                           readOnly
//                         />
//                       </Form.Item>

//                       {/* 🔹 Deposit Alert */}
//                       {requiresDepositPayment && (
//                         <Alert
//                           message="Deposit Payment Pending"
//                           description={`${userWithPayment?.name} has a pending deposit of ₹${depositRemaining}.`}
//                           type="warning"
//                           showIcon
//                           style={{
//                             marginBottom: 12,
//                             padding: "6px 12px",
//                             fontSize: 12,
//                             lineHeight: 1.2,
//                           }}
//                         />
//                       )}

//                       {/* 🔹 Outstanding Fines */}
//                       {userWithPayment.outstandingFines > 0 && (
//                         <Form.Item label="Outstanding Fines">
//                           <Input
//                             value={`₹ ${userWithPayment.outstandingFines}`}
//                             style={{
//                               fontWeight: "bold",
//                               fontSize: "14px",
//                               color: "#ed8936",
//                             }}
//                             readOnly
//                           />
//                         </Form.Item>
//                       )}

//                       {/* 🔹 Proceed Button */}
//                       <Form.Item style={{textAlign: "right"}}>
//                         <Button
//                           type="primary"
//                           onClick={() =>
//                             setActiveTab(
//                               requiresDepositPayment ? "deposit" : "payment"
//                             )
//                           }
//                         >
//                           {requiresDepositPayment
//                             ? "Proceed to Deposit Payment"
//                             : userWithPayment.pendingRent === 0
//                             ? "Pay in Advance"
//                             : "Proceed to Payment"}
//                         </Button>
//                       </Form.Item>
//                     </>
//                   )}
//                 </Form>
//               ),
//             },
//             {
//               key: "deposit",
//               label: "Make Deposit Payment",
//               disabled: !userWithPayment || !requiresDepositPayment,
//               children: (
//                 <Form
//                   layout="vertical"
//                   form={depositForm}
//                   onFinish={handleDepositPaymentSubmit}
//                 >
//                   <Card
//                     style={{marginBottom: 16}}
//                     headStyle={{
//                       backgroundColor: "#f0f8ff",
//                       borderBottom: "1px solid #d6e9ff",
//                     }}
//                   >
//                     {/* Simplified Deposit Summary */}
//                     <div style={{marginBottom: 20}}>
//                       {depositPaid > 0 ? (
//                         <Alert
//                           description={
//                             <span>
//                               {userWithPayment?.name} has a total deposit of{" "}
//                               <strong>₹{totalDeposit}</strong>, with{" "}
//                               <strong>₹{depositPaid}</strong> already paid,
//                               leaving <strong>₹{depositRemaining}</strong>{" "}
//                               pending
//                             </span>
//                           }
//                           type="info"
//                           style={{marginBottom: 16}}
//                         />
//                       ) : (
//                         <Alert
//                           description={
//                             <span>
//                               {userWithPayment?.name} has a pending deposit of
//                               <strong> ₹{totalDeposit}</strong>
//                             </span>
//                           }
//                           type="warning"
//                           style={{marginBottom: 16}}
//                         />
//                       )}
//                     </div>

//                     {/* Deposit Payment Form */}
//                     <Row gutter={16}>
//                       <Col span={12}>
//                         <Form.Item
//                           name="depositAmountPaid"
//                           label="Amount Paying"
//                           rules={[
//                             {required: true, message: "Please enter amount"},
//                           ]}
//                         >
//                           <InputNumber
//                             style={{width: "100%"}}
//                             placeholder="Enter amount"
//                             prefix="₹"
//                             min={0}
//                           />
//                         </Form.Item>
//                       </Col>
//                       <Col span={12}>
//                         <Form.Item
//                           name="depositPaymentDate"
//                           label="Payment Date"
//                           rules={[
//                             {
//                               required: true,
//                               message: "Please select payment date",
//                             },
//                           ]}
//                         >
//                           <DatePicker
//                             style={{width: "100%"}}
//                             suffixIcon={<FiCalendar />}
//                           />
//                         </Form.Item>
//                       </Col>
//                     </Row>

//                     <Row gutter={16}>
//                       <Col span={12}>
//                         <Form.Item
//                           name="paymentMode"
//                           label="Payment Mode"
//                           rules={[
//                             {
//                               required: true,
//                               message: "Please select payment mode",
//                             },
//                           ]}
//                         >
//                           <Select
//                             placeholder="Select payment mode"
//                             onChange={handleDepositPaymentModeChange}
//                           >
//                             <Option value="cash">Cash</Option>
//                             <Option value="bank_transfer">Bank Transfer</Option>
//                             <Option value="upi">UPI</Option>
//                             <Option value="card">Card</Option>
//                           </Select>
//                         </Form.Item>
//                       </Col>
//                       <Col span={12}>
//                         {showDepositCollectedByField && (
//                           <Form.Item
//                             name="depositCollectedBy"
//                             label="Collected By"
//                             rules={[
//                               {
//                                 required: true,
//                                 message: "Please enter collector name",
//                               },
//                             ]}
//                           >
//                             <Input placeholder="Enter collector name" />
//                           </Form.Item>
//                         )}
//                       </Col>
//                     </Row>

//                     {showDepositTransactionIdField && (
//                       <Row gutter={16}>
//                         <Col span={24}>
//                           <Form.Item
//                             name="depTransactionId"
//                             label="Transaction ID"
//                             rules={[
//                               {
//                                 required: true,
//                                 message: "Please enter transaction ID",
//                               },
//                             ]}
//                           >
//                             <Input placeholder="Enter transaction ID" />
//                           </Form.Item>
//                         </Col>
//                       </Row>
//                     )}

//                     <Form.Item name="DepRemarks" label="Remarks (Optional)">
//                       <Input.TextArea
//                         placeholder="Add any remarks for deposit payment"
//                         rows={2}
//                       />
//                     </Form.Item>
//                   </Card>

//                   <Form.Item style={{textAlign: "right"}}>
//                     <Button
//                       style={{marginRight: "8px"}}
//                       onClick={() => setActiveTab("basic")}
//                     >
//                       Back to Basic Info
//                     </Button>
//                     <Button
//                       style={{marginRight: "8px"}}
//                       onClick={handleSkipDeposit}
//                     >
//                       Skip & Proceed to Rent Payment
//                     </Button>
//                     <Button
//                       type="primary"
//                       htmlType="submit"
//                       loading={isDepositSubmitting}
//                       disabled={isDepositSubmitting}
//                     >
//                       Submit Deposit Payment
//                     </Button>
//                   </Form.Item>
//                 </Form>
//               ),
//             },
//             {
//               key: "payment",
//               label: "Make Rent Payment",
//               disabled: !userWithPayment,
//               children: (
//                 <Form
//                   layout="vertical"
//                   form={form}
//                   onFinish={handlePaymentSubmit}
//                 >
//                   {/* Waive-Off Section */}
//                   <div style={{marginBottom: "16px"}}>
//                     <div
//                       style={{
//                         display: "flex",
//                         justifyContent: "space-between",
//                         alignItems: "center",
//                         marginBottom: "8px",
//                       }}
//                     >
//                       <span style={{fontWeight: 500}}>Enable Waive-Off</span>
//                       <Switch
//                         checked={enableWaiveOff}
//                         onChange={handleWaiveOffToggle}
//                         checkedChildren="Yes"
//                         unCheckedChildren="No"
//                       />
//                     </div>

//                     {enableWaiveOff && (
//                       <Card
//                         style={{
//                           backgroundColor: "#fff8f8ff",
//                           border: "1px solid #e6f7ff",
//                           marginTop: "10px",
//                         }}
//                         bodyStyle={{padding: "16px"}}
//                       >
//                         {/* Row 1: Waive-Off Amount + Amount After Waive-Off */}
//                         <Row gutter={16}>
//                           <Col xs={24} sm={24} md={12}>
//                             <Form.Item
//                               label="Waive-Off Amount"
//                               rules={[
//                                 {
//                                   required: true,
//                                   message: "Please enter waive-off amount",
//                                 },
//                               ]}
//                               required
//                             >
//                               <InputNumber
//                                 style={{width: "100%"}}
//                                 placeholder="Enter amount"
//                                 prefix="₹"
//                                 min={0}
//                                 max={
//                                   userWithPayment?.pendingRent ||
//                                   userWithPayment?.pendingAmount
//                                 }
//                                 value={waiveOffAmount}
//                                 onChange={handleWaiveOffAmountChange}
//                               />
//                             </Form.Item>
//                           </Col>

//                           <Col xs={24} sm={24} md={12}>
//                             <Form.Item label="Amount After Waive-Off">
//                               <Input
//                                 value={`${remainingAmount}`}
//                                 prefix="₹"
//                                 style={{
//                                   fontWeight: "bold",
//                                   fontSize: "16px",
//                                   color: "#f56565",
//                                   backgroundColor: "#fff",
//                                 }}
//                                 disabled
//                               />
//                             </Form.Item>
//                           </Col>
//                         </Row>

//                         {/* Row 2: Waive-Off Reason (full width) */}
//                         <Row gutter={16}>
//                           <Col xs={24}>
//                             <Form.Item
//                               name="waveOffReason"
//                               label="Waive-Off Reason"
//                             >
//                               <Input.TextArea
//                                 placeholder="Enter reason for waive-off"
//                                 rows={2}
//                                 style={{minHeight: "32px"}}
//                               />
//                             </Form.Item>
//                           </Col>
//                         </Row>

//                         <Divider />

//                         {/* Payment Action Selection */}
//                         <Form.Item label="Select Payment Action" required>
//                           <Radio.Group
//                             onChange={handlePaymentActionChange}
//                             value={paymentAction}
//                             style={{width: "100%"}}
//                           >
//                             <Row gutter={[16, 16]}>
//                               <Col xs={24} md={12}>
//                                 <Radio
//                                   value="fullWaiveOff"
//                                   style={{width: "100%"}}
//                                 >
//                                   <strong>Proceed with Waive-Off</strong>
//                                   <div
//                                     style={{fontSize: "12px", color: "#666"}}
//                                   >
//                                     Waive off the amount from ₹{remainingAmount}
//                                   </div>
//                                 </Radio>
//                               </Col>

//                               <Col xs={24} md={12}>
//                                 <Radio
//                                   value="remainingPayment"
//                                   style={{width: "100%"}}
//                                 >
//                                   <strong>Make Remaining Payment</strong>
//                                   <div
//                                     style={{fontSize: "12px", color: "#666"}}
//                                   >
//                                     Pay the remaining amount after waive-off
//                                   </div>
//                                 </Radio>
//                               </Col>
//                             </Row>
//                           </Radio.Group>
//                         </Form.Item>
//                       </Card>
//                     )}
//                   </div>

//                   {/* Regular Payment Fields - Only show if waive-off is disabled OR if remaining payment is selected */}
//                   {(paymentAction === "remainingPayment" ||
//                     !enableWaiveOff) && (
//                     <>
//                       <Divider />

//                       {/* Case 1: Waive-Off Disabled */}
//                       {!enableWaiveOff && (
//                         <>
//                           {/* Row 1: Net Amount + Amount Paying */}
//                           <Row gutter={16}>
//                             <Col span={12}>
//                               <Form.Item label="Net Amount to Pay">
//                                 <Input
//                                   value={`${remainingAmount}`}
//                                   prefix="₹"
//                                   style={{
//                                     fontWeight: "bold",
//                                     fontSize: "16px",
//                                     color: "#f56565",
//                                   }}
//                                   disabled
//                                 />
//                               </Form.Item>
//                             </Col>
//                             <Col span={12}>
//                               <Form.Item
//                                 name="paidAmount"
//                                 label="Amount Paying"
//                                 rules={[
//                                   {
//                                     required: true,
//                                     message: "Please enter amount",
//                                   },
//                                 ]}
//                               >
//                                 <InputNumber
//                                   style={{width: "100%"}}
//                                   placeholder="Enter amount"
//                                   prefix="₹"
//                                   min={0}
//                                 />
//                               </Form.Item>
//                             </Col>
//                           </Row>

//                           {/* Row 2: Payment Date + Payment Mode */}
//                           <Row gutter={16}>
//                             <Col span={12}>
//                               <Form.Item
//                                 name="paymentDate"
//                                 label="Payment Date"
//                                 rules={[
//                                   {
//                                     required: true,
//                                     message: "Please select payment date",
//                                   },
//                                 ]}
//                               >
//                                 <DatePicker
//                                   style={{width: "100%"}}
//                                   suffixIcon={<FiCalendar />}
//                                 />
//                               </Form.Item>
//                             </Col>
//                             <Col span={12}>
//                               <Form.Item
//                                 name="paymentMode"
//                                 label="Payment Mode"
//                                 rules={[
//                                   {
//                                     required: true,
//                                     message: "Please select payment mode",
//                                   },
//                                 ]}
//                               >
//                                 <Select
//                                   placeholder="Select payment mode"
//                                   onChange={handlePaymentModeChange}
//                                 >
//                                   <Option value="cash">Cash</Option>
//                                   <Option value="bank_transfer">
//                                     Bank Transfer
//                                   </Option>
//                                   <Option value="upi">UPI</Option>
//                                   <Option value="card">Card</Option>
//                                 </Select>
//                               </Form.Item>
//                             </Col>
//                             <Col span={12}>
//                               {showCollectedByField && (
//                                 <Form.Item
//                                   name="collectedBy"
//                                   label="Collected By"
//                                   rules={[
//                                     {
//                                       required: true,
//                                       message: "Please enter collector name",
//                                     },
//                                   ]}
//                                 >
//                                   <Input placeholder="Enter collector name" />
//                                 </Form.Item>
//                               )}
//                             </Col>
//                           </Row>

//                           {/* Transaction ID Field (shown only for UPI/Bank Transfer) */}
//                           {showTransactionIdField && (
//                             <Row gutter={16}>
//                               <Col span={24}>
//                                 <Form.Item
//                                   name="transactionId"
//                                   label="Transaction ID"
//                                   rules={[
//                                     {
//                                       required: true,
//                                       message: "Please enter transaction ID",
//                                     },
//                                   ]}
//                                 >
//                                   <Input
//                                     placeholder="Enter transaction ID"
//                                     style={{width: "100%"}}
//                                   />
//                                 </Form.Item>
//                               </Col>
//                             </Row>
//                           )}
//                         </>
//                       )}

//                       {/* Case 2: Waive-Off Enabled + Remaining Payment */}
//                       {enableWaiveOff &&
//                         paymentAction === "remainingPayment" && (
//                           <>
//                             {/* Row 1: Amount Paying + Payment Date */}
//                             <Row gutter={16}>
//                               <Col span={12}>
//                                 <Form.Item
//                                   name="paidAmount"
//                                   label="Amount Paying"
//                                   rules={[
//                                     {
//                                       required: true,
//                                       message: "Please enter amount",
//                                     },
//                                     {
//                                       validator: (_, value) => {
//                                         if (value > remainingAmount) {
//                                           return Promise.reject(
//                                             new Error(
//                                               `Amount cannot exceed ₹${remainingAmount}`
//                                             )
//                                           );
//                                         }
//                                         return Promise.resolve();
//                                       },
//                                     },
//                                   ]}
//                                 >
//                                   <InputNumber
//                                     style={{width: "100%"}}
//                                     placeholder="Enter amount"
//                                     prefix="₹"
//                                     min={0}
//                                     max={remainingAmount}
//                                   />
//                                 </Form.Item>
//                               </Col>
//                               <Col span={12}>
//                                 <Form.Item
//                                   name="paymentDate"
//                                   label="Payment Date"
//                                   rules={[
//                                     {
//                                       required: true,
//                                       message: "Please select payment date",
//                                     },
//                                   ]}
//                                 >
//                                   <DatePicker
//                                     style={{width: "100%"}}
//                                     suffixIcon={<FiCalendar />}
//                                   />
//                                 </Form.Item>
//                               </Col>
//                             </Row>

//                             {/* Row 2: Payment Mode */}
//                             <Row gutter={16}>
//                               <Col span={12}>
//                                 <Form.Item
//                                   name="paymentMode"
//                                   label="Payment Mode"
//                                   rules={[
//                                     {
//                                       required: true,
//                                       message: "Please select payment mode",
//                                     },
//                                   ]}
//                                 >
//                                   <Select
//                                     placeholder="Select payment mode"
//                                     onChange={handlePaymentModeChange}
//                                   >
//                                     <Option value="cash">Cash</Option>
//                                     <Option value="bank_transfer">
//                                       Bank Transfer
//                                     </Option>
//                                     <Option value="upi">UPI</Option>
//                                     <Option value="card">Card</Option>
//                                   </Select>
//                                 </Form.Item>
//                               </Col>
//                               <Col span={12}>
//                                 {/* Transaction ID Field (shown only for UPI/Bank Transfer) */}
//                                 {showTransactionIdField && (
//                                   <Form.Item
//                                     name="transactionId"
//                                     label="Transaction ID"
//                                     rules={[
//                                       {
//                                         required: true,
//                                         message: "Please enter transaction ID",
//                                       },
//                                     ]}
//                                   >
//                                     <Input placeholder="Enter transaction ID" />
//                                   </Form.Item>
//                                 )}
//                               </Col>
//                             </Row>
//                           </>
//                         )}

//                       {/* Row 3: Remarks (always shown) */}
//                       <Form.Item name="remarks" label="Remarks">
//                         <Input.TextArea
//                           placeholder="Add any remarks here"
//                           rows={3}
//                           prefix={<FiFileText />}
//                         />
//                       </Form.Item>
//                     </>
//                   )}

//                   <Form.Item style={{textAlign: "right"}}>
//                     <Button
//                       style={{marginRight: "8px"}}
//                       onClick={() =>
//                         setActiveTab(
//                           requiresDepositPayment ? "deposit" : "basic"
//                         )
//                       }
//                     >
//                       {requiresDepositPayment
//                         ? "Back to Deposit"
//                         : "Back to Basic Info"}
//                     </Button>
//                     <Button
//                       type="primary"
//                       htmlType="submit"
//                       loading={isFeeSubmitting}
//                       disabled={isFeeSubmitting}
//                     >
//                       {enableWaiveOff && paymentAction === "fullWaiveOff"
//                         ? "Confirm Waive-Off"
//                         : "Submit Payment"}
//                     </Button>
//                   </Form.Item>
//                 </Form>
//               ),
//             },
//           ]}
//         />
//       </Modal>
//     </>
//   );
// };

// export default RentCollectionModal;
import React, {useState, useEffect} from "react";
import {
  Modal,
  Tabs,
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  Button,
  Switch,
  Divider,
  Radio,
  Card,
  Row,
  Col,
  Alert,
  message,
} from "antd";
import {FiSearch, FiCalendar, FiFileText} from "react-icons/fi";
import {useSelector} from "react-redux";
import {HomeOutlined} from "../../icons";
import {getUsers} from "../../hooks/users/useUser";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {
  getLatestFeePaymentByUserId,
  makeBusFeePayment,
  makeDepositPayment,
  makeFeePayment,
} from "../../hooks/accounts/useAccounts";
import {useNavigate} from "react-router-dom";

const {Option} = Select;
const {TabPane} = Tabs;

const RentCollectionModal = ({
  visible,
  onCancel,
  selectedOption,
  preSelectedUser = null,
  preSelectedProperty = null,
  onSuccess,
}) => {
  console.log(preSelectedUser);
  console.log(preSelectedProperty);
  console.log(selectedOption);

  const {properties, selectedProperty} = useSelector(
    (state) => state.properties
  );
  const [selectedUser, setSelectedUser] = useState(null);
  const [activeTab, setActiveTab] = useState("basic");
  const [form] = Form.useForm();
  const [depositForm] = Form.useForm();
  const [busFeeForm] = Form.useForm();
  const [enableWaiveOff, setEnableWaiveOff] = useState(false);
  const [waiveOffAmount, setWaiveOffAmount] = useState(0);
  const [remainingAmount, setRemainingAmount] = useState(0);
  const [paymentAction, setPaymentAction] = useState("fullPayment");
  const [currentProperty, setCurrentProperty] = useState(selectedProperty);
  const [paymentMode, setPaymentMode] = useState("");
  const [depositPaymentMode, setDepositPaymentMode] = useState("");
  const [busPaymentMode, setBusPaymentMode] = useState("");

  const [messageApi, contextHolder] = message.useMessage();

  const queryClient = useQueryClient();

  const navigate = useNavigate();

  // Use pre-selected property or fallback to Redux selected property
  useEffect(() => {
    if (preSelectedProperty) {
      setCurrentProperty(preSelectedProperty);
    } else {
      setCurrentProperty(selectedProperty);
    }
  }, [preSelectedProperty, selectedProperty]);

  // Auto-select user when preSelectedUser is provided
  useEffect(() => {
    if (visible && preSelectedUser) {
      setSelectedUser(preSelectedUser);
      setRemainingAmount(
        preSelectedUser?.pendingRent ||
          preSelectedUser?.financialDetails?.pendingRent ||
          preSelectedUser?.pendingAmount ||
          preSelectedUser?.financialDetails?.pendingAmount ||
          0
      );
      setWaiveOffAmount(0);
      setEnableWaiveOff(false);
      setPaymentAction("fullPayment");

      // If user has stayDetails with propertyId, use that property
      if (preSelectedUser.stayDetails?.propertyId) {
        const userProperty = properties.find(
          (p) => p._id === preSelectedUser.stayDetails.propertyId
        );
        if (userProperty) {
          setCurrentProperty(userProperty);
        }
      }

      setActiveTab("basic");
    }
  }, [visible, preSelectedUser, properties]);

  const {
    data: usersData,
    isLoading: usersLoading,
    error: usersError,
    refetch: refetchUsers,
  } = useQuery({
    queryKey: [
      "users",
      currentProperty?.id || currentProperty?._id,
      selectedOption,
    ],
    queryFn: () =>
      getUsers({
        rentType: selectedOption,
        propertyId: currentProperty?.id || currentProperty?._id,
        all: true,
      }),
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
    enabled: !preSelectedUser, // Only fetch users if no pre-selected user
  });

  const users = usersData?.data || [];

  const {data: latestPayment} = useQuery({
    queryKey: ["latestPayment", selectedUser?._id],
    queryFn: () => getLatestFeePaymentByUserId(selectedUser?._id),
    enabled: !!selectedUser?._id,
    refetchOnWindowFocus: false,
  });

  const {mutate: recordFeePayment, isLoading: isFeeSubmitting} = useMutation({
    mutationFn: makeFeePayment,
    onSuccess: async (data) => {
      messageApi.success({
        content: `${data.message}`,
        duration: 3,
      });
      form.resetFields();

      queryClient.invalidateQueries({queryKey: ["resident"]});
      queryClient.invalidateQueries({queryKey: ["monthlyRentUsers"]});
      queryClient.invalidateQueries({queryKey: ["accountDashboard"]});
      queryClient.invalidateQueries({queryKey: ["availableCash"]});

      const refreshed = await refetchUsers();
      const freshUsers = refreshed?.data?.data || [];
      const updatedUser = freshUsers.find((u) => u._id === selectedUser?._id);
      console.log(updatedUser);
      if (updatedUser) setSelectedUser(updatedUser);

      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess(data);
      }

      handleModalClose();
      navigate(`/accounts/transactions/${selectedUser.rentType}`);
    },
    onError: (error) => {
      messageApi.error({
        content: `${error.message}`,
        duration: 3,
      });
      console.error("Deposit payment failed:", error);
    },
  });

  const {mutate: recordDepositPayment, isLoading: isDepositSubmitting} =
    useMutation({
      mutationFn: makeDepositPayment,
      onSuccess: async (data) => {
        messageApi.success({
          content: `${data.message}`,
          duration: 3,
        });

        depositForm.resetFields();

        queryClient.invalidateQueries({queryKey: ["resident"]});
        queryClient.invalidateQueries({queryKey: ["monthlyRentUsers"]});
        queryClient.invalidateQueries({queryKey: ["accountDashboardDeposit"]});
        queryClient.invalidateQueries({queryKey: ["availableCash"]});

        const refreshed = await refetchUsers();
        const freshUsers = refreshed?.data?.data || [];
        const updatedUser = freshUsers.find((u) => u._id === selectedUser?._id);

        if (updatedUser) setSelectedUser(updatedUser);
        setActiveTab(requiresBusFeePayment ? "busFee" : "payment");
      },
      onError: (error) => {
        messageApi.error({
          content: `${error.message}`,
          duration: 3,
        });
        console.error("Fee payment failed:", error);
      },
    });

  const {mutate: recordBusPayment, isLoading: isBusFeeSubmitting} = useMutation(
    {
      mutationFn: makeBusFeePayment,
      onSuccess: async (data) => {
        messageApi.success({
          content: `${data.message}`,
          duration: 3,
        });

        depositForm.resetFields();

        queryClient.invalidateQueries({queryKey: ["resident"]});
        queryClient.invalidateQueries({queryKey: ["monthlyRentUsers"]});
        queryClient.invalidateQueries({queryKey: ["accountDashboardDeposit"]});
        queryClient.invalidateQueries({queryKey: ["availableCash"]});

        const refreshed = await refetchUsers();
        const freshUsers = refreshed?.data?.data || [];
        const updatedUser = freshUsers.find((u) => u._id === selectedUser?._id);

        if (updatedUser) setSelectedUser(updatedUser);
        setActiveTab("payment");
      },
      onError: (error) => {
        messageApi.error({
          content: `${error.message}`,
          duration: 3,
        });
        console.error("Fee payment failed:", error);
      },
    }
  );

  const handleModalClose = () => {
    form.resetFields();
    depositForm.resetFields();
    setSelectedUser(null);
    setActiveTab("basic");
    setEnableWaiveOff(false);
    setWaiveOffAmount(0);
    setRemainingAmount(0);
    setPaymentAction("fullPayment");
    setPaymentMode("");
    setDepositPaymentMode("");
    setBusPaymentMode("");
    setCurrentProperty(preSelectedProperty || selectedProperty);
    onCancel();
  };

  const handleUserSelect = (userId) => {
    const user = users.find((u) => u._id === userId);
    console.log("Selected User:", user);
    setSelectedUser(user);
    setRemainingAmount(user?.pendingRent || user?.pendingAmount || 0);
    setWaiveOffAmount(0);
    setEnableWaiveOff(false);
    setPaymentAction("fullPayment");
    setPaymentMode("");
    setDepositPaymentMode("");
  };

  const userWithPayment = React.useMemo(() => {
    if (!selectedUser) return null;

    return {
      ...selectedUser,
      lastPaidDate: latestPayment?.paymentDate || null,
      clearedMonths:
        latestPayment?.paymentForMonths?.length > 0
          ? latestPayment.paymentForMonths
          : [],
    };
  }, [selectedUser, latestPayment]);
  console.log(userWithPayment);
  const handleWaiveOffToggle = (checked) => {
    setEnableWaiveOff(checked);
    if (!checked) {
      setWaiveOffAmount(0);
      setRemainingAmount(
        selectedUser?.pendingRent ||
          selectedUser?.financialDetails?.pendingRent ||
          selectedUser?.pendingAmount ||
          selectedUser?.financialDetails?.pendingAmount ||
          0
      );
      setPaymentAction("fullPayment");
    }
  };

  const handleWaiveOffAmountChange = (value) => {
    const waiveOff = value || 0;
    const totalPending =
      selectedUser?.pendingRent ||
      selectedUser?.financialDetails?.pendingRent ||
      selectedUser?.pendingAmount ||
      selectedUser?.financialDetails?.pendingAmount ||
      0;

    setWaiveOffAmount(waiveOff);
    setRemainingAmount(Math.max(0, totalPending - waiveOff));
  };

  const handlePaymentActionChange = (e) => {
    setPaymentAction(e.target.value);
  };

  const handlePaymentModeChange = (value) => {
    setPaymentMode(value);
  };

  const handleDepositPaymentModeChange = (value) => {
    setDepositPaymentMode(value);
  };

  const handleBusFeePaymentModeChange = (value) => {
    setBusPaymentMode(value);
  };

  const handlePaymentSubmit = (values) => {
    const paymentData = {
      ...values,
      userId: selectedUser._id,
      type: selectedOption,
      amount: values.paidAmount || 0,
      waveOffAmount: enableWaiveOff ? waiveOffAmount : 0,
      waveOffReason: values.waveOffReason,
      paymentMethod:
        paymentMode === "upi"
          ? "UPI"
          : paymentMode === "bank_transfer"
          ? "Bank Transfer"
          : paymentMode === "card"
          ? "Card"
          : "Cash",
      paymentDate: values.paymentDate,
      collectedBy: values.collectedBy || "",
      transactionId: values.transactionId || null,
      remarks: values.remarks || "",
    };
    recordFeePayment(paymentData);
    console.log("Payment submitted:", paymentData);
  };

  const handleDepositPaymentSubmit = (values) => {
    if (!selectedUser?._id) {
      message.warning("Please select a user first.");
      return;
    }

    const payload = {
      userId: selectedUser._id,
      amount: values.depositAmountPaid,
      paymentMethod:
        depositPaymentMode === "upi"
          ? "UPI"
          : depositPaymentMode === "bank_transfer"
          ? "Bank Transfer"
          : depositPaymentMode === "card"
          ? "Card"
          : "Cash",
      paymentDate: values.depositPaymentDate,
      collectedBy: values.depositCollectedBy || "",
      transactionId: values.depTransactionId || null,
      remarks: values.DepRemarks || "",
    };

    recordDepositPayment(payload);
  };

  const handleBusPaymentSubmit = (values) => {
    if (!selectedUser?._id) {
      message.warning("Please select a user first.");
      return;
    }

    const payload = {
      userId: selectedUser._id,
      amount: values.busFeeAmountPaid,
      paymentMethod:
        busPaymentMode === "upi"
          ? "UPI"
          : busPaymentMode === "bank_transfer"
          ? "Bank Transfer"
          : busPaymentMode === "card"
          ? "Card"
          : "Cash",
      paymentDate: values.busFeePaymentDate,
      collectedBy: values.busFeeCollectedBy || "",
      transactionId: values.busFeeTransactionId || null,
      remarks: values.busFeeRemarks || "",
    };

    recordBusPayment(payload);
  };

  const handlePropertyChange = (propertyId) => {
    if (propertyId) {
      const property = properties.find((p) => p._id === propertyId);
      setCurrentProperty(property);
      setSelectedUser(null);
    } else {
      setCurrentProperty(null);
    }
  };

  const getModalTitle = () => {
    switch (selectedOption) {
      case "monthly":
        return "Collect Monthly Rent";
      case "daily":
        return "Collect Daily Rent";
      case "mess":
        return "Collect Mess Charges";
      default:
        return "Collect Payment";
    }
  };

  // Calculate deposit amounts
  const totalDeposit =
    userWithPayment?.depositAmount ||
    userWithPayment?.stayDetails?.refundableDeposit +
      userWithPayment?.stayDetails?.nonRefundableDeposit ||
    0;

  const totalBusFee =
    userWithPayment?.busFeeAmount || userWithPayment?.busFee?.yearlyAmount || 0;

  // Check if deposit payment is required
  const requiresDepositPayment =
    totalDeposit !== 0 &&
    (userWithPayment?.depositStatus === "pending" ||
      userWithPayment?.stayDetails?.depositStatus === "pending");

  const requiresBusFeePayment =
    totalBusFee !== 0 &&
    (userWithPayment?.busFeeStatus === "pending" ||
      userWithPayment?.busFee?.status === "pending");

  const depositPaid =
    userWithPayment?.depositPaid ||
    userWithPayment?.stayDetails?.depositAmountPaid ||
    0;

  const busFeePaid =
    userWithPayment?.busFeePaid || userWithPayment?.busFee?.amountPaid || 0;

  const depositRemaining = totalDeposit - depositPaid;
  const busFeeRemaining = totalBusFee - busFeePaid;

  // Custom filter function for user search
  const filterOption = (input, option) => {
    const user = users?.find((u) => u._id === option.value);
    if (user) {
      const searchString = `${user.name} ${user.roomNumber}`.toLowerCase();
      return searchString.includes(input.toLowerCase());
    }
    return false;
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Clean property name
  const cleanName =
    currentProperty?.name?.replace(/^Heavens Living -\s*/, "") || "";
  const modalTitle = cleanName
    ? `${getModalTitle()} - ${cleanName}`
    : `${getModalTitle()}`;

  // Check if transaction ID field is needed for rent payment
  const showTransactionIdField =
    paymentMode === "upi" || paymentMode === "bank_transfer";

  // Check if transaction ID field is needed for deposit payment
  const showDepositTransactionIdField =
    depositPaymentMode === "upi" || depositPaymentMode === "bank_transfer";

  const showBusFeeTransactionIdField =
    busPaymentMode === "upi" || busPaymentMode === "bank_transfer";

  // Check if collected by field is needed for deposit payment
  const showDepositCollectedByField = depositPaymentMode === "cash";

  const showBusFeeCollectedByField = busPaymentMode === "cash";

  const showCollectedByField = paymentMode === "cash";

  // Check if we should show property selection (only show if no pre-selected data)
  const showPropertySelection = !preSelectedProperty && !selectedProperty?.id;

  return (
    <>
      {contextHolder}
      <Modal
        title={modalTitle}
        open={visible}
        onCancel={handleModalClose}
        footer={null}
        width={700}
        centered
        maskClosable={false}
      >
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          centered
          items={[
            {
              key: "basic",
              label: "Basic Information",
              children: (
                <Form layout="vertical" form={form}>
                  {/* Property Selection (only show if no pre-selected property) */}
                  {showPropertySelection && (
                    <Card size="small" style={{marginBottom: 16}}>
                      <Form.Item
                        label="Select Property"
                        name="propertyId"
                        rules={[
                          {required: true, message: "Please select a property"},
                        ]}
                      >
                        <Select
                          placeholder="Choose a property"
                          onChange={handlePropertyChange}
                          suffixIcon={<HomeOutlined />}
                          allowClear
                        >
                          {properties
                            .filter((property) => property._id !== null)
                            .map((property) => (
                              <Option key={property._id} value={property._id}>
                                {property.name}
                              </Option>
                            ))}
                        </Select>
                      </Form.Item>
                    </Card>
                  )}

                  {/* If property is selected from dropdown, show it as a hidden field */}
                  {currentProperty?.id && !selectedProperty?.id && (
                    <Form.Item
                      name="propertyId"
                      initialValue={currentProperty.id}
                      style={{display: "none"}}
                    >
                      <Input />
                    </Form.Item>
                  )}

                  {/* User Selection - Only show if no pre-selected user */}
                  {!preSelectedUser &&
                    (selectedProperty?.id || currentProperty?._id) && (
                      <Form.Item
                        label={`Select User (${users.length})`}
                        required
                      >
                        <Select
                          showSearch
                          placeholder="Search user by name or room number"
                          value={selectedUser?._id || undefined}
                          onChange={handleUserSelect}
                          filterOption={filterOption}
                          suffixIcon={<FiSearch />}
                          loading={usersLoading}
                          notFoundContent={
                            usersError
                              ? "Error loading users"
                              : "No users found"
                          }
                        >
                          {users.map((user) => (
                            <Option key={user?._id} value={user?._id}>
                              {user.name} (Room {user.roomNumber})
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                    )}

                  {/* Show pre-selected user info */}
                  {preSelectedUser && selectedUser && (
                    <div
                      style={{
                        display: "flex",
                        gap: 16,
                        marginBottom: 16,
                        alignItems: "center",
                      }}
                    >
                      <div style={{display: "flex", flexDirection: "column"}}>
                        <label>
                          <strong>User Name</strong>
                        </label>
                        <Input
                          value={selectedUser.name}
                          readOnly
                          style={{width: 320}}
                        />
                      </div>

                      <div style={{display: "flex", flexDirection: "column"}}>
                        <label>
                          <strong>Property</strong>
                        </label>
                        <Input
                          value={
                            selectedUser.propertyName ||
                            selectedUser?.stayDetails?.propertyName ||
                            "N/A"
                          }
                          readOnly
                          style={{width: 320}}
                        />
                      </div>
                    </div>
                  )}

                  {userWithPayment && (
                    <>
                      {selectedOption === "monthly" ? (
                        <Row gutter={16}>
                          <Col span={12}>
                            <Form.Item label="Monthly Rent">
                              <Input
                                value={`₹ ${
                                  userWithPayment.monthlyRent ||
                                  userWithPayment?.financialDetails
                                    .monthlyRent ||
                                  0
                                }`}
                                readOnly
                              />
                            </Form.Item>
                          </Col>

                          <Col span={12}>
                            <Form.Item label="Join Date">
                              <Input
                                value={formatDate(
                                  userWithPayment.joinedDate ||
                                    userWithPayment?.stayDetails?.joinDate
                                )}
                                prefix={<FiCalendar />}
                                readOnly
                              />
                            </Form.Item>
                          </Col>
                        </Row>
                      ) : (
                        <>
                          <Row gutter={16}>
                            <Col span={12}>
                              <Form.Item
                                label={
                                  selectedOption === "mess"
                                    ? "Mess Start Date"
                                    : "Check-In Date"
                                }
                              >
                                <Input
                                  value={formatDate(
                                    selectedOption === "mess"
                                      ? userWithPayment.messStartDate
                                      : userWithPayment.checkInDate ||
                                          userWithPayment?.stayDetails
                                            .checkInDate
                                  )}
                                  prefix={<FiCalendar />}
                                  readOnly
                                />
                              </Form.Item>
                            </Col>

                            <Col span={12}>
                              <Form.Item
                                label={
                                  selectedOption === "mess"
                                    ? "Mess End Date"
                                    : "Check-Out Date"
                                }
                              >
                                <Input
                                  value={formatDate(
                                    selectedOption === "mess"
                                      ? userWithPayment?.messEndDate
                                      : userWithPayment?.extendDate ??
                                          userWithPayment?.stayDetails
                                            ?.extendDate ??
                                          userWithPayment?.checkOutDate ??
                                          userWithPayment?.stayDetails
                                            ?.checkOutDate
                                  )}
                                  prefix={<FiCalendar />}
                                  readOnly
                                />
                              </Form.Item>
                            </Col>
                          </Row>

                          <Row gutter={16}>
                            <Col span={12}>
                              <Form.Item
                                label={
                                  selectedOption === "mess"
                                    ? "Total Mess Days"
                                    : "Total No. of Days"
                                }
                              >
                                <Input
                                  value={
                                    userWithPayment.noOfDays ||
                                    userWithPayment?.stayDetails?.noOfDays ||
                                    userWithPayment.noOfDaysMess ||
                                    0
                                  }
                                  readOnly
                                />
                              </Form.Item>
                            </Col>

                            <Col span={12}>
                              <Form.Item
                                label={
                                  selectedOption === "mess"
                                    ? "Mess Rent / Day"
                                    : "Rent / Day"
                                }
                              >
                                <Input
                                  value={`₹ ${
                                    selectedOption === "mess"
                                      ? userWithPayment.rent || 0
                                      : userWithPayment.rent ||
                                        userWithPayment?.stayDetails
                                          .dailyRent ||
                                        0
                                  }`}
                                  readOnly
                                />
                              </Form.Item>
                            </Col>
                          </Row>
                        </>
                      )}

                      <Row gutter={16}>
                        {userWithPayment?.clearedMonths?.length > 0 &&
                          selectedOption === "monthly" && (
                            <Col span={12}>
                              <Form.Item label="Rent Cleared Till">
                                <Input
                                  value={userWithPayment.clearedMonths.at(-1)}
                                  readOnly
                                />
                              </Form.Item>
                            </Col>
                          )}

                        {userWithPayment?.lastPaidDate && (
                          <Col span={12}>
                            <Form.Item label="Last Paid Date">
                              <Input
                                value={formatDate(userWithPayment.lastPaidDate)}
                                prefix={<FiCalendar />}
                                readOnly
                              />
                            </Form.Item>
                          </Col>
                        )}
                      </Row>

                      <Form.Item label="Pending Amount">
                        <Input
                          value={`₹ ${
                            selectedOption === "monthly"
                              ? userWithPayment?.financialDetails
                                  ?.pendingRent ??
                                userWithPayment?.pendingRent ??
                                0
                              : userWithPayment?.financialDetails
                                  ?.pendingAmount ??
                                userWithPayment?.pendingAmount ??
                                0
                          }`}
                          style={{
                            fontWeight: "bold",
                            fontSize: "16px",
                            color:
                              (selectedOption === "monthly"
                                ? userWithPayment?.financialDetails
                                    ?.pendingRent ??
                                  userWithPayment?.pendingRent ??
                                  0
                                : userWithPayment?.financialDetails
                                    ?.pendingAmount ??
                                  userWithPayment?.pendingAmount ??
                                  0) > 0
                                ? "#f56565"
                                : "#10b981",
                          }}
                          readOnly
                        />
                      </Form.Item>

                      {requiresDepositPayment && (
                        <Alert
                          message="Deposit Payment Pending"
                          description={`${userWithPayment?.name} has a pending deposit of ₹${depositRemaining}.`}
                          type="warning"
                          showIcon
                          style={{
                            marginBottom: 12,
                            padding: "6px 12px",
                            fontSize: 12,
                            lineHeight: 1.2,
                          }}
                        />
                      )}

                      {userWithPayment.outstandingFines > 0 && (
                        <Form.Item label="Outstanding Fines">
                          <Input
                            value={`₹ ${userWithPayment.outstandingFines}`}
                            style={{
                              fontWeight: "bold",
                              fontSize: "14px",
                              color: "#ed8936",
                            }}
                            readOnly
                          />
                        </Form.Item>
                      )}
                      <Form.Item style={{textAlign: "right"}}>
                        <Button
                          type="primary"
                          onClick={() =>
                            setActiveTab(
                              requiresDepositPayment
                                ? "deposit"
                                : requiresBusFeePayment
                                ? "busFee"
                                : "payment"
                            )
                          }
                        >
                          {requiresDepositPayment
                            ? "Proceed to Deposit Payment"
                            : requiresBusFeePayment
                            ? "Proceed to Bus Fee Payment"
                            : userWithPayment.pendingRent === 0 &&
                              userWithPayment.pendingAmount === 0
                            ? "Pay in Advance"
                            : "Proceed to Payment"}
                        </Button>
                      </Form.Item>
                    </>
                  )}
                </Form>
              ),
            },
            // ... rest of the tabs remain the same (deposit and payment tabs)
            {
              key: "deposit",
              label: "Make Deposit Payment",
              disabled: !userWithPayment || !requiresDepositPayment,
              children: (
                <Form
                  layout="vertical"
                  form={depositForm}
                  onFinish={handleDepositPaymentSubmit}
                >
                  <Card
                    style={{marginBottom: 16}}
                    headStyle={{
                      backgroundColor: "#f0f8ff",
                      borderBottom: "1px solid #d6e9ff",
                    }}
                  >
                    <div style={{marginBottom: 20}}>
                      {depositPaid > 0 ? (
                        <Alert
                          description={
                            <span>
                              {userWithPayment?.name} has a total deposit of{" "}
                              <strong>₹{totalDeposit}</strong>, with{" "}
                              <strong>₹{depositPaid}</strong> already paid,
                              leaving <strong>₹{depositRemaining}</strong>{" "}
                              pending
                            </span>
                          }
                          type="info"
                          style={{marginBottom: 16}}
                        />
                      ) : (
                        <Alert
                          description={
                            <span>
                              {userWithPayment?.name} has a pending deposit of
                              <strong> ₹{totalDeposit}</strong>
                            </span>
                          }
                          type="warning"
                          style={{marginBottom: 16}}
                        />
                      )}
                    </div>

                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          name="depositAmountPaid"
                          label="Amount Paying"
                          rules={[
                            {required: true, message: "Please enter amount"},
                          ]}
                        >
                          <InputNumber
                            style={{width: "100%"}}
                            placeholder="Enter amount"
                            prefix="₹"
                            min={0}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          name="depositPaymentDate"
                          label="Payment Date"
                          rules={[
                            {
                              required: true,
                              message: "Please select payment date",
                            },
                          ]}
                        >
                          <DatePicker
                            style={{width: "100%"}}
                            suffixIcon={<FiCalendar />}
                          />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          name="paymentMode"
                          label="Payment Mode"
                          rules={[
                            {
                              required: true,
                              message: "Please select payment mode",
                            },
                          ]}
                        >
                          <Select
                            placeholder="Select payment mode"
                            onChange={handleDepositPaymentModeChange}
                          >
                            <Option value="cash">Cash</Option>
                            <Option value="bank_transfer">Bank Transfer</Option>
                            <Option value="upi">UPI</Option>
                            <Option value="card">Card</Option>
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        {showDepositCollectedByField && (
                          <Form.Item
                            name="depositCollectedBy"
                            label="Collected By"
                            rules={[
                              {
                                required: true,
                                message: "Please enter collector name",
                              },
                            ]}
                          >
                            <Input placeholder="Enter collector name" />
                          </Form.Item>
                        )}
                      </Col>
                    </Row>

                    {showDepositTransactionIdField && (
                      <Row gutter={16}>
                        <Col span={24}>
                          <Form.Item
                            name="depTransactionId"
                            label="Transaction ID"
                            rules={[
                              {
                                required: true,
                                message: "Please enter transaction ID",
                              },
                            ]}
                          >
                            <Input placeholder="Enter transaction ID" />
                          </Form.Item>
                        </Col>
                      </Row>
                    )}

                    <Form.Item name="DepRemarks" label="Remarks (Optional)">
                      <Input.TextArea
                        placeholder="Add any remarks for deposit payment"
                        rows={2}
                      />
                    </Form.Item>
                  </Card>

                  <Form.Item style={{textAlign: "right"}}>
                    <Button
                      style={{marginRight: "8px"}}
                      onClick={() => setActiveTab("basic")}
                    >
                      Back to Basic Info
                    </Button>

                    <Button
                      style={{marginRight: "8px"}}
                      onClick={() =>
                        setActiveTab(
                          requiresBusFeePayment ? "busFee" : "payment"
                        )
                      }
                    >
                      {requiresBusFeePayment
                        ? "Skip & Proceed to Bus Fee Payment"
                        : "Skip & Proceed to Rent Payment"}
                    </Button>

                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={isDepositSubmitting}
                      disabled={isDepositSubmitting}
                    >
                      Submit Deposit Payment
                    </Button>
                  </Form.Item>
                </Form>
              ),
            },
            {
              key: "busFee",
              label: "Bus Fee Payment",
              disabled: !userWithPayment || !requiresBusFeePayment, // you may control this
              children: (
                <Form
                  layout="vertical"
                  form={busFeeForm}
                  onFinish={handleBusPaymentSubmit}
                >
                  <Card
                    style={{marginBottom: 16}}
                    headStyle={{
                      backgroundColor: "#f0f8ff",
                      borderBottom: "1px solid #d6e9ff",
                    }}
                  >
                    {/* BUS FEE STATUS INFO */}
                    <div style={{marginBottom: 20}}>
                      {busFeePaid > 0 ? (
                        <Alert
                          description={
                            <span>
                              Yearly Bus Fee: <strong>₹{totalBusFee}</strong>,
                              Paid: <strong>₹{busFeePaid}</strong>, Pending:{" "}
                              <strong>₹{busFeeRemaining}</strong>
                            </span>
                          }
                          type="info"
                          style={{marginBottom: 16}}
                        />
                      ) : (
                        <Alert
                          description={
                            <span>
                              Bus fee pending:{" "}
                              <strong>₹{busFeeRemaining}</strong>
                            </span>
                          }
                          type="warning"
                          style={{marginBottom: 16}}
                        />
                      )}
                    </div>

                    {/* AMOUNT + DATE */}
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          name="busFeeAmountPaid"
                          label="Amount Paying"
                          rules={[
                            {
                              required: true,
                              message: "Please enter bus fee amount",
                            },
                          ]}
                        >
                          <InputNumber
                            style={{width: "100%"}}
                            placeholder="Enter amount"
                            prefix="₹"
                            min={0}
                          />
                        </Form.Item>
                      </Col>

                      <Col span={12}>
                        <Form.Item
                          name="busFeePaymentDate"
                          label="Payment Date"
                          rules={[
                            {
                              required: true,
                              message: "Please select payment date",
                            },
                          ]}
                        >
                          <DatePicker
                            style={{width: "100%"}}
                            suffixIcon={<FiCalendar />}
                          />
                        </Form.Item>
                      </Col>
                    </Row>

                    {/* PAYMENT MODE */}
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          name="busFeePaymentMode"
                          label="Payment Mode"
                          rules={[
                            {
                              required: true,
                              message: "Please select payment mode",
                            },
                          ]}
                        >
                          <Select
                            placeholder="Select payment mode"
                            onChange={handleBusFeePaymentModeChange}
                          >
                            <Option value="cash">Cash</Option>
                            <Option value="bank_transfer">Bank Transfer</Option>
                            <Option value="upi">UPI</Option>
                            <Option value="card">Card</Option>
                          </Select>
                        </Form.Item>
                      </Col>

                      <Col span={12}>
                        {showBusFeeCollectedByField && (
                          <Form.Item
                            name="busFeeCollectedBy"
                            label="Collected By"
                            rules={[
                              {
                                required: true,
                                message: "Please enter collector name",
                              },
                            ]}
                          >
                            <Input placeholder="Enter collector name" />
                          </Form.Item>
                        )}
                      </Col>
                    </Row>

                    {/* TRANSACTION ID */}
                    {showBusFeeTransactionIdField && (
                      <Row gutter={16}>
                        <Col span={24}>
                          <Form.Item
                            name="busFeeTransactionId"
                            label="Transaction ID"
                            rules={[
                              {
                                required: true,
                                message: "Please enter transaction ID",
                              },
                            ]}
                          >
                            <Input placeholder="Enter transaction ID" />
                          </Form.Item>
                        </Col>
                      </Row>
                    )}

                    {/* REMARKS */}
                    <Form.Item name="busFeeRemarks" label="Remarks (Optional)">
                      <Input.TextArea
                        placeholder="Add remarks for bus fee payment"
                        rows={2}
                      />
                    </Form.Item>
                  </Card>

                  {/* ACTION BUTTONS */}
                  <Form.Item style={{textAlign: "right"}}>
                    {/* Back Button */}
                    <Button
                      style={{marginRight: "8px"}}
                      onClick={() =>
                        setActiveTab(
                          requiresDepositPayment ? "deposit" : "rent"
                        )
                      }
                    >
                      {requiresDepositPayment
                        ? "Back to Deposit"
                        : "Back to Rent"}
                    </Button>

                    {/* Skip Button */}
                    <Button
                      style={{marginRight: "8px"}}
                      onClick={() => setActiveTab("payment")}
                    >
                      Skip & Proceed to Rent Payment
                    </Button>

                    {/* Submit Button */}
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={isBusFeeSubmitting}
                      disabled={isBusFeeSubmitting}
                    >
                      Submit Bus Fee Payment
                    </Button>
                  </Form.Item>
                </Form>
              ),
            },
            {
              key: "payment",
              label: "Make Rent Payment",
              disabled: !userWithPayment,
              children: (
                <Form
                  layout="vertical"
                  form={form}
                  onFinish={handlePaymentSubmit}
                >
                  {/* Waive-Off Section */}
                  <div style={{marginBottom: "16px"}}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "8px",
                      }}
                    >
                      <span style={{fontWeight: 500}}>Enable Waive-Off</span>
                      <Switch
                        checked={enableWaiveOff}
                        onChange={handleWaiveOffToggle}
                        checkedChildren="Yes"
                        unCheckedChildren="No"
                      />
                    </div>

                    {enableWaiveOff && (
                      <Card
                        style={{
                          backgroundColor: "#fff8f8ff",
                          border: "1px solid #e6f7ff",
                          marginTop: "10px",
                        }}
                        bodyStyle={{padding: "16px"}}
                      >
                        <Row gutter={16}>
                          <Col xs={24} sm={24} md={12}>
                            <Form.Item
                              label="Waive-Off Amount"
                              rules={[
                                {
                                  required: true,
                                  message: "Please enter waive-off amount",
                                },
                              ]}
                              required
                            >
                              <InputNumber
                                style={{width: "100%"}}
                                placeholder="Enter amount"
                                prefix="₹"
                                min={0}
                                max={
                                  userWithPayment?.pendingRent ||
                                  userWithPayment?.pendingAmount
                                }
                                value={waiveOffAmount}
                                onChange={handleWaiveOffAmountChange}
                              />
                            </Form.Item>
                          </Col>

                          <Col xs={24} sm={24} md={12}>
                            <Form.Item label="Amount After Waive-Off">
                              <Input
                                value={`${remainingAmount}`}
                                prefix="₹"
                                style={{
                                  fontWeight: "bold",
                                  fontSize: "16px",
                                  color: "#f56565",
                                  backgroundColor: "#fff",
                                }}
                                disabled
                              />
                            </Form.Item>
                          </Col>
                        </Row>

                        <Row gutter={16}>
                          <Col xs={24}>
                            <Form.Item
                              name="waveOffReason"
                              label="Waive-Off Reason"
                            >
                              <Input.TextArea
                                placeholder="Enter reason for waive-off"
                                rows={2}
                                style={{minHeight: "32px"}}
                              />
                            </Form.Item>
                          </Col>
                        </Row>

                        <Divider />

                        <Form.Item label="Select Payment Action" required>
                          <Radio.Group
                            onChange={handlePaymentActionChange}
                            value={paymentAction}
                            style={{width: "100%"}}
                          >
                            <Row gutter={[16, 16]}>
                              <Col xs={24} md={12}>
                                <Radio
                                  disabled
                                  value="fullWaiveOff"
                                  style={{width: "100%"}}
                                >
                                  <strong>Proceed with Waive-Off</strong>
                                  <div
                                    style={{fontSize: "12px", color: "#666"}}
                                  >
                                    Waive off the amount from ₹{remainingAmount}
                                  </div>
                                </Radio>
                              </Col>

                              <Col xs={24} md={12}>
                                <Radio
                                  value="remainingPayment"
                                  style={{width: "100%"}}
                                >
                                  <strong>Make Remaining Payment</strong>
                                  <div
                                    style={{fontSize: "12px", color: "#666"}}
                                  >
                                    Pay the remaining amount after waive-off
                                  </div>
                                </Radio>
                              </Col>
                            </Row>
                          </Radio.Group>
                        </Form.Item>
                      </Card>
                    )}
                  </div>

                  {(paymentAction === "remainingPayment" ||
                    !enableWaiveOff) && (
                    <>
                      <Divider />

                      {!enableWaiveOff && (
                        <>
                          <Row gutter={16}>
                            <Col span={12}>
                              <Form.Item label="Net Amount to Pay">
                                <Input
                                  value={`${remainingAmount}`}
                                  prefix="₹"
                                  style={{
                                    fontWeight: "bold",
                                    fontSize: "16px",
                                    color: "#f56565",
                                  }}
                                  disabled
                                />
                              </Form.Item>
                            </Col>
                            <Col span={12}>
                              <Form.Item
                                name="paidAmount"
                                label="Amount Paying"
                                rules={[
                                  {
                                    required: true,
                                    message: "Please enter amount",
                                  },
                                ]}
                              >
                                <InputNumber
                                  style={{width: "100%"}}
                                  placeholder="Enter amount"
                                  prefix="₹"
                                  min={0}
                                />
                              </Form.Item>
                            </Col>
                          </Row>

                          <Row gutter={16}>
                            <Col span={12}>
                              <Form.Item
                                name="paymentDate"
                                label="Payment Date"
                                rules={[
                                  {
                                    required: true,
                                    message: "Please select payment date",
                                  },
                                ]}
                              >
                                <DatePicker
                                  style={{width: "100%"}}
                                  suffixIcon={<FiCalendar />}
                                />
                              </Form.Item>
                            </Col>
                            <Col span={12}>
                              <Form.Item
                                name="paymentMode"
                                label="Payment Mode"
                                rules={[
                                  {
                                    required: true,
                                    message: "Please select payment mode",
                                  },
                                ]}
                              >
                                <Select
                                  placeholder="Select payment mode"
                                  onChange={handlePaymentModeChange}
                                >
                                  <Option value="cash">Cash</Option>
                                  <Option value="bank_transfer">
                                    Bank Transfer
                                  </Option>
                                  <Option value="upi">UPI</Option>
                                  <Option value="card">Card</Option>
                                </Select>
                              </Form.Item>
                            </Col>
                            <Col span={12}>
                              {showCollectedByField && (
                                <Form.Item
                                  name="collectedBy"
                                  label="Collected By"
                                  rules={[
                                    {
                                      required: true,
                                      message: "Please enter collector name",
                                    },
                                  ]}
                                >
                                  <Input placeholder="Enter collector name" />
                                </Form.Item>
                              )}
                            </Col>
                          </Row>

                          {showTransactionIdField && (
                            <Row gutter={16}>
                              <Col span={24}>
                                <Form.Item
                                  name="transactionId"
                                  label="Transaction ID"
                                  rules={[
                                    {
                                      required: true,
                                      message: "Please enter transaction ID",
                                    },
                                  ]}
                                >
                                  <Input
                                    placeholder="Enter transaction ID"
                                    style={{width: "100%"}}
                                  />
                                </Form.Item>
                              </Col>
                            </Row>
                          )}
                        </>
                      )}

                      {enableWaiveOff &&
                        paymentAction === "remainingPayment" && (
                          <>
                            <Row gutter={16}>
                              <Col span={12}>
                                <Form.Item
                                  name="paidAmount"
                                  label="Amount Paying"
                                  rules={[
                                    {
                                      required: true,
                                      message: "Please enter amount",
                                    },
                                    {
                                      validator: (_, value) => {
                                        if (value > remainingAmount) {
                                          return Promise.reject(
                                            new Error(
                                              `Amount cannot exceed ₹${remainingAmount}`
                                            )
                                          );
                                        }
                                        return Promise.resolve();
                                      },
                                    },
                                  ]}
                                >
                                  <InputNumber
                                    style={{width: "100%"}}
                                    placeholder="Enter amount"
                                    prefix="₹"
                                    min={0}
                                    max={remainingAmount}
                                  />
                                </Form.Item>
                              </Col>
                              <Col span={12}>
                                <Form.Item
                                  name="paymentDate"
                                  label="Payment Date"
                                  rules={[
                                    {
                                      required: true,
                                      message: "Please select payment date",
                                    },
                                  ]}
                                >
                                  <DatePicker
                                    style={{width: "100%"}}
                                    suffixIcon={<FiCalendar />}
                                  />
                                </Form.Item>
                              </Col>
                            </Row>

                            <Row gutter={16}>
                              <Col span={12}>
                                <Form.Item
                                  name="paymentMode"
                                  label="Payment Mode"
                                  rules={[
                                    {
                                      required: true,
                                      message: "Please select payment mode",
                                    },
                                  ]}
                                >
                                  <Select
                                    placeholder="Select payment mode"
                                    onChange={handlePaymentModeChange}
                                  >
                                    <Option value="cash">Cash</Option>
                                    <Option value="bank_transfer">
                                      Bank Transfer
                                    </Option>
                                    <Option value="upi">UPI</Option>
                                    <Option value="card">Card</Option>
                                  </Select>
                                </Form.Item>
                              </Col>
                              <Col span={12}>
                                {showTransactionIdField && (
                                  <Form.Item
                                    name="transactionId"
                                    label="Transaction ID"
                                    rules={[
                                      {
                                        required: true,
                                        message: "Please enter transaction ID",
                                      },
                                    ]}
                                  >
                                    <Input placeholder="Enter transaction ID" />
                                  </Form.Item>
                                )}
                              </Col>
                            </Row>
                          </>
                        )}

                      <Form.Item name="remarks" label="Remarks">
                        <Input.TextArea
                          placeholder="Add any remarks here"
                          rows={3}
                          prefix={<FiFileText />}
                        />
                      </Form.Item>
                    </>
                  )}

                  <Form.Item style={{textAlign: "right"}}>
                    <Button
                      style={{marginRight: "8px"}}
                      onClick={() =>
                        setActiveTab(
                          requiresDepositPayment ? "deposit" : "basic"
                        )
                      }
                    >
                      {requiresDepositPayment
                        ? "Back to Deposit"
                        : "Back to Basic Info"}
                    </Button>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={isFeeSubmitting}
                      disabled={isFeeSubmitting}
                    >
                      {enableWaiveOff && paymentAction === "fullWaiveOff"
                        ? "Confirm Waive-Off"
                        : "Submit Payment"}
                    </Button>
                  </Form.Item>
                </Form>
              ),
            },
          ]}
        />
      </Modal>
    </>
  );
};
export default RentCollectionModal;
