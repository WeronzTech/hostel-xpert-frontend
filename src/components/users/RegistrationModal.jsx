// import {
//   Modal,
//   Form,
//   Input,
//   DatePicker,
//   Select,
//   Button,
//   Row,
//   Col,
//   Card,
//   message,
//   Space,
//   Typography,
//   Switch,
//   Divider,
//   Tooltip,
//   Checkbox,
// } from "antd";
// import {
//   HomeOutlined,
//   CalculatorOutlined,
//   InfoCircleOutlined,
// } from "@ant-design/icons";
// import {useState, useEffect} from "react";
// import dayjs from "dayjs";
// import {useSelector} from "react-redux";
// import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
// import {getAvailableRoomsByProperty} from "../../hooks/property/useProperty";
// import {registerResident} from "../../hooks/users/useUser";
// import {useWatch} from "antd/es/form/Form";
// import {getKitchens} from "../../hooks/inventory/useInventory";

// const {Text} = Typography;
// const {Option} = Select;

// // Custom hook for responsive design
// const useResponsive = () => {
//   const [isMobile, setIsMobile] = useState(false);

//   useEffect(() => {
//     const checkMobile = () => {
//       setIsMobile(window.innerWidth <= 768);
//     };

//     checkMobile();
//     window.addEventListener("resize", checkMobile);

//     return () => window.removeEventListener("resize", checkMobile);
//   }, []);

//   return {isMobile};
// };

// const RegistrationModal = ({visible, onCancel, rentType}) => {
//   const {properties, selectedProperty} = useSelector(
//     (state) => state.properties,
//   );
//   const {isMobile} = useResponsive();
//   const [currentCategoryType, setCurrentCategoryType] = useState("");
//   const [currentProperty, setCurrentProperty] = useState(selectedProperty);
//   const [form] = Form.useForm();
//   const [totalDays, setTotalDays] = useState(0);
//   const [totalAmount, setTotalAmount] = useState(0);
//   const [dailyRent, setDailyRent] = useState(0);
//   const [messDays, setMessDays] = useState(0);
//   const [messTotalAmount, setMessTotalAmount] = useState(0);
//   const [selectedSharingType, setSelectedSharingType] = useState("");
//   const [manualDaysMode, setManualDaysMode] = useState(false);
//   const [selectedMealTypes, setSelectedMealTypes] = useState([]);

//   const [messageApi, contextHolder] = message.useMessage();
//   const queryClient = useQueryClient();

//   const {data: availableRooms} = useQuery({
//     queryKey: ["availableRooms", selectedProperty?.id || currentProperty?._id],
//     queryFn: ({queryKey}) => {
//       const [, propertyId] = queryKey;
//       return getAvailableRoomsByProperty(propertyId);
//     },
//     enabled: !!(selectedProperty?.id || currentProperty?._id),
//   });

//   const {data: kitchens, isLoading: kitchensLoading} = useQuery({
//     queryKey: ["kitchens", selectedProperty.id],
//     queryFn: () => getKitchens({propertyId: selectedProperty.id}),
//   });
//   console.log(kitchens);

//   const registerMutation = useMutation({
//     mutationFn: registerResident,
//     onSuccess: (data) => {
//       queryClient.invalidateQueries(["expenses"]);
//       onCancel();
//       form.resetFields();
//       setTotalDays(0);
//       setTotalAmount(0);
//       setDailyRent(0);
//       setMessDays(0);
//       setMessTotalAmount(0);
//       setSelectedSharingType("");
//       setManualDaysMode(false);
//       setSelectedMealTypes([]);

//       messageApi.success({
//         content: `${data.message}`,
//         duration: 3,
//       });
//     },
//     onError: (error) => {
//       console.log("Registration failed:", error);
//       messageApi.error({
//         content: `${error.details}`,
//         duration: 3,
//       });
//     },
//   });

//   const calculateDaysFromDates = (startDate, endDate) => {
//     if (startDate && endDate) {
//       const start = dayjs(startDate).startOf("day");
//       const end = dayjs(endDate).startOf("day");
//       return end.diff(start, "day") + 1;
//     }
//     return 0;
//   };

//   const handleManualDaysChange = (e) => {
//     const manualDays = parseInt(e.target.value) || 0;
//     setTotalDays(manualDays);
//     const rentPerDay = form.getFieldValue("dailyRent") || 0;
//     setTotalAmount(manualDays * rentPerDay);
//   };

//   const handleModeToggle = (checked) => {
//     setManualDaysMode(checked);

//     if (!checked) {
//       const checkIn = form.getFieldValue("checkIn");
//       const checkOut = form.getFieldValue("checkOut");
//       const rentPerDay = form.getFieldValue("dailyRent") || 0;

//       const days = calculateDaysFromDates(checkIn, checkOut);
//       setTotalDays(days);
//       setTotalAmount(days * rentPerDay);
//     }
//   };

//   const handleCancel = () => {
//     form.resetFields();
//     setTotalDays(0);
//     setTotalAmount(0);
//     setDailyRent(0);
//     setMessDays(0);
//     setMessTotalAmount(0);
//     setSelectedSharingType("");
//     setManualDaysMode(false);
//     setSelectedMealTypes([]);

//     onCancel();
//   };

//   const handleOk = () => {
//     const userType =
//       rentType === "daily"
//         ? "dailyRent"
//         : rentType === "mess"
//           ? "messOnly"
//           : "student";

//     form
//       .validateFields()
//       .then((values) => {
//         const selectedRoomDetails = getAvailableRoomsForSharingType(
//           selectedSharingType,
//         )?.find((room) => room.roomNo === values.roomNumber);

//         const submitData = {
//           userType: userType,
//           name: values.name,
//           email: values.email,
//           contact: values.contact,
//           password: "Nikhil@123",

//           [rentType === "mess" ? "messDetails" : "stayDetails"]: {
//             ...(rentType === "mess"
//               ? {
//                   messStartDate: values.messStartDate?.toISOString(),
//                   messEndDate: values.messEndDate?.toISOString(),
//                   noOfDays: messDays,
//                   rent: values.ratePerDay,
//                   mealType: selectedMealTypes, // Add selected meal types
//                 }
//               : {
//                   checkInDate: values.checkIn?.toISOString(),
//                   checkOutDate: values.checkOut?.toISOString(),
//                   noOfDays: totalDays,
//                   dailyRent: Number(values.dailyRent),
//                   sharingType: values.sharingType,
//                   propertyId: selectedProperty?.id || currentProperty?._id,
//                   propertyName: (
//                     selectedProperty?.name || currentProperty?.name
//                   )?.replace(/^Heavens Living\s*-\s*/i, ""),
//                   roomNumber: values.roomNumber,
//                   roomId: selectedRoomDetails?._id,
//                 }),
//           },

//           personalDetails: {
//             address: values.address,
//             gender: values.gender,
//           },
//           isApproved: true,
//           isHeavens: true,
//         };
//         registerMutation.mutate(submitData);
//       })
//       .catch((info) => {
//         console.log("Validation Failed:", info);
//       });
//   };

//   const handleDailyRentChange = (e) => {
//     const value = parseFloat(e.target.value) || 0;
//     setDailyRent(value);

//     if (!manualDaysMode) {
//       const checkIn = form.getFieldValue("checkIn");
//       const checkOut = form.getFieldValue("checkOut");
//       const days = calculateDaysFromDates(checkIn, checkOut);
//       setTotalAmount(days * value);
//     } else {
//       setTotalAmount(totalDays * value);
//     }
//   };

//   const handleSharingTypeChange = (sharingType) => {
//     setSelectedSharingType(sharingType);
//     form.setFieldsValue({roomNumber: undefined});
//   };

//   const handleMealTypeChange = (checkedValues) => {
//     setSelectedMealTypes(checkedValues);
//   };

//   const disabledCheckOutDate = (current) => {
//     const checkIn = form.getFieldValue("checkIn");
//     if (!checkIn) {
//       return false;
//     }
//     return current && current < dayjs(checkIn).startOf("day");
//   };

//   const disabledMessEndDate = (current) => {
//     const messStart = form.getFieldValue("messStartDate");
//     if (!messStart) {
//       return false;
//     }
//     return current && current < dayjs(messStart).startOf("day");
//   };

//   const checkIn = useWatch("checkIn", form);
//   const checkOut = useWatch("checkOut", form);
//   const rent = useWatch("dailyRent", form);

//   // Mess watches
//   const messStartDate = useWatch("messStartDate", form);
//   const messEndDate = useWatch("messEndDate", form);
//   const messRate = useWatch("ratePerDay", form);

//   // Update calculations when dates or rent change (auto mode only)
//   useEffect(() => {
//     if (rentType === "daily" && !manualDaysMode) {
//       const rentPerDay = rent || 0;

//       if (checkIn && checkOut && rentPerDay > 0) {
//         const start = dayjs(checkIn).startOf("day");
//         const end = dayjs(checkOut).startOf("day");

//         const days = end.diff(start, "day") + 1;
//         setTotalDays(days > 0 ? days : 0);
//         setTotalAmount(days > 0 ? days * rentPerDay : 0);
//       } else {
//         setTotalDays(0);
//         setTotalAmount(0);
//       }
//     }
//   }, [checkIn, checkOut, rent, rentType, manualDaysMode]);

//   // Calculate mess days and amount when mess dates change
//   useEffect(() => {
//     if (rentType === "mess") {
//       if (messStartDate && messEndDate) {
//         const days = calculateDaysFromDates(messStartDate, messEndDate);
//         setMessDays(days > 0 ? days : 0);

//         const ratePerDay = messRate || 0;
//         setMessTotalAmount(days > 0 ? days * ratePerDay : 0);
//       } else {
//         setMessDays(0);
//         setMessTotalAmount(0);
//       }
//     }
//   }, [messStartDate, messEndDate, messRate, rentType]);

//   const handlePropertyChange = (propertyId) => {
//     if (propertyId) {
//       const property = properties.find((p) => p._id === propertyId);
//       setCurrentProperty(property);
//       form.setFieldsValue({handler: undefined, kitchenId: undefined});
//     } else {
//       setCurrentProperty({_id: null, name: ""});
//     }
//   };

//   useEffect(() => {
//     if (rentType) {
//       setCurrentCategoryType(rentType);
//       form.setFieldsValue({categoryType: rentType});
//     }
//   }, [rentType, form]);

//   useEffect(() => {
//     if (selectedProperty && selectedProperty.id) {
//       setCurrentProperty(selectedProperty);
//     } else {
//       setCurrentProperty({id: null, name: ""});
//     }
//   }, [selectedProperty]);

//   const getCategoryDisplayName = (type) => {
//     const names = {
//       daily: "Daily Rent",
//       mess: "Mess Only",
//     };
//     return names[type] || type;
//   };

//   const hasSelectedProperty = selectedProperty && selectedProperty.id;

//   const cleanPropertyName =
//     currentProperty?.name?.replace(/^Heavens Living -\s*/, "") || "";

//   const getModalTitle = () => {
//     let title = "Register";

//     if (cleanPropertyName) {
//       title += ` - ${cleanPropertyName}`;
//     }

//     if (currentCategoryType) {
//       title += cleanPropertyName
//         ? ` (${getCategoryDisplayName(currentCategoryType)})`
//         : ` - ${getCategoryDisplayName(currentCategoryType)}`;
//     }

//     return title;
//   };

//   const getUniqueSharingTypes = () => {
//     if (!availableRooms?.rooms || rentType !== "daily") return [];

//     const sharingTypes = availableRooms.rooms
//       .filter((room) => room.vacantSlot > 0)
//       .map((room) => room.sharingType);

//     return [...new Set(sharingTypes)];
//   };

//   const getAvailableRoomsForSharingType = (sharingType) => {
//     if (!availableRooms?.rooms || !sharingType) return [];

//     return availableRooms.rooms.filter(
//       (room) => room.sharingType === sharingType && room.vacantSlot > 0,
//     );
//   };

//   // Mobile styles - only applied when isMobile is true
//   const mobileModalStyle = isMobile
//     ? {
//         width: "95%",
//         maxWidth: "95%",
//         margin: "10px auto",
//         top: 10,
//       }
//     : {};

//   const mobileBodyStyle = isMobile
//     ? {
//         maxHeight: "calc(100vh - 150px)",
//         overflowY: "auto",
//         padding: "12px",
//       }
//     : {};

//   const mobileCardStyle = isMobile
//     ? {
//         marginBottom: 12,
//       }
//     : {marginBottom: 16};

//   const mobileGutter = isMobile ? [8, 8] : [16, 16];

//   const mobileFormItemStyle = isMobile
//     ? {
//         marginBottom: 8,
//       }
//     : {};

//   const mobileDividerStyle = isMobile
//     ? {
//         margin: "8px 0",
//       }
//     : {margin: "12px 0"};

//   const mobileSpaceDirection = isMobile ? "vertical" : "horizontal";
//   const mobileSpaceSize = isMobile ? 4 : 8;

//   // Meal type options
//   const mealTypeOptions = [
//     {label: "Breakfast", value: "breakfast"},
//     {label: "Lunch", value: "lunch"},
//     {label: "Dinner", value: "dinner"},
//   ];

//   return (
//     <>
//       {contextHolder}
//       <Modal
//         centered
//         maskClosable={false}
//         title={
//           <div
//             style={{
//               display: "flex",
//               alignItems: "center",
//               gap: 8,
//               fontSize: isMobile ? "14px" : "16px",
//               whiteSpace: isMobile ? "normal" : "nowrap",
//               wordBreak: "break-word",
//               padding: isMobile ? "4px 0" : 0,
//             }}
//           >
//             {getModalTitle()}
//           </div>
//         }
//         open={visible}
//         onCancel={handleCancel}
//         footer={[
//           <Button
//             key="cancel"
//             onClick={handleCancel}
//             size={isMobile ? "middle" : "default"}
//             style={isMobile ? {flex: 1} : {}}
//           >
//             Cancel
//           </Button>,
//           <Button
//             key="submit"
//             type="primary"
//             onClick={handleOk}
//             size={isMobile ? "middle" : "default"}
//             style={isMobile ? {flex: 1, marginLeft: 8} : {}}
//           >
//             Register
//           </Button>,
//         ]}
//         destroyOnClose
//         width={800}
//         style={mobileModalStyle}
//         bodyStyle={mobileBodyStyle}
//         footerStyle={isMobile ? {padding: "10px 12px"} : {}}
//       >
//         <Form
//           form={form}
//           layout="vertical"
//           name="registrationForm"
//           initialValues={{
//             rentType,
//             userType: "student",
//             isHeavens: true,
//           }}
//           size={isMobile ? "middle" : "default"}
//         >
//           {/* Basic Information */}
//           <Card
//             size={isMobile ? "small" : "small"}
//             title="Basic Information"
//             style={mobileCardStyle}
//             headStyle={{backgroundColor: "#f5f5f5"}}
//           >
//             <Row gutter={mobileGutter}>
//               <Col xs={24} sm={12} md={8}>
//                 <Form.Item
//                   label="Full Name"
//                   name="name"
//                   rules={[
//                     {required: true, message: "Please enter the full name"},
//                   ]}
//                   style={mobileFormItemStyle}
//                 >
//                   <Input placeholder="Enter full name" />
//                 </Form.Item>
//               </Col>

//               <Col xs={24} sm={12} md={8}>
//                 <Form.Item
//                   label="Email"
//                   name="email"
//                   rules={[
//                     {type: "email", message: "Please enter a valid email"},
//                   ]}
//                   style={mobileFormItemStyle}
//                 >
//                   <Input placeholder="Enter email address" />
//                 </Form.Item>
//               </Col>

//               <Col xs={24} sm={12} md={8}>
//                 <Form.Item
//                   label="Contact Number"
//                   name="contact"
//                   rules={[
//                     {required: true, message: "Please enter contact number"},
//                   ]}
//                   style={mobileFormItemStyle}
//                 >
//                   <Input placeholder="Enter contact number" />
//                 </Form.Item>
//               </Col>

//               <Col xs={24} sm={12}>
//                 <Form.Item
//                   label="Gender"
//                   name="gender"
//                   rules={[{required: true, message: "Please select gender"}]}
//                   style={mobileFormItemStyle}
//                 >
//                   <Select placeholder="Select gender">
//                     <Option value="Male">Male</Option>
//                     <Option value="Female">Female</Option>
//                     <Option value="Other">Other</Option>
//                   </Select>
//                 </Form.Item>
//               </Col>

//               <Col xs={24} sm={12}>
//                 <Form.Item
//                   label="Address"
//                   name="address"
//                   style={mobileFormItemStyle}
//                 >
//                   <Input placeholder="Enter complete address" />
//                 </Form.Item>
//               </Col>
//             </Row>
//           </Card>

//           {/* Stay Details for Daily Rent */}
//           {rentType === "daily" && (
//             <>
//               <Card
//                 size={isMobile ? "small" : "small"}
//                 title="Stay Details"
//                 style={mobileCardStyle}
//                 headStyle={{backgroundColor: "#f5f5f5"}}
//               >
//                 {/* Property Selection for Daily Rent when no property is selected */}
//                 {!hasSelectedProperty && (
//                   <div style={{marginBottom: isMobile ? 12 : 16}}>
//                     <Form.Item
//                       label="Select Property"
//                       name="propertyId"
//                       rules={[
//                         {required: true, message: "Please select a property"},
//                       ]}
//                       style={mobileFormItemStyle}
//                     >
//                       <Select
//                         placeholder="Choose a property"
//                         onChange={handlePropertyChange}
//                         suffixIcon={<HomeOutlined />}
//                         allowClear
//                       >
//                         {properties
//                           .filter((property) => property._id !== null)
//                           .map((property) => (
//                             <Option key={property._id} value={property._id}>
//                               {property.name}
//                             </Option>
//                           ))}
//                       </Select>
//                     </Form.Item>
//                   </div>
//                 )}

//                 <Row gutter={mobileGutter}>
//                   <Col xs={24} sm={12}>
//                     <Form.Item
//                       label="Sharing Type"
//                       name="sharingType"
//                       rules={[
//                         {required: true, message: "Please select sharing type"},
//                       ]}
//                       style={mobileFormItemStyle}
//                     >
//                       <Select
//                         placeholder="Select sharing type"
//                         onChange={handleSharingTypeChange}
//                       >
//                         {getUniqueSharingTypes().map((sharingType) => (
//                           <Option key={sharingType} value={sharingType}>
//                             {sharingType}
//                           </Option>
//                         ))}
//                       </Select>
//                     </Form.Item>
//                   </Col>
//                   <Col xs={24} sm={12}>
//                     <Form.Item
//                       label="Select Room"
//                       name="roomNumber"
//                       rules={[
//                         {required: true, message: "Please select a room"},
//                       ]}
//                       style={mobileFormItemStyle}
//                     >
//                       <Select
//                         disabled={!selectedSharingType}
//                         placeholder="Select room number"
//                       >
//                         {getAvailableRoomsForSharingType(
//                           selectedSharingType,
//                         )?.map((room) => (
//                           <Option key={room._id} value={room.roomNo}>
//                             {room.roomNo} (Vacant: {room.vacantSlot})
//                           </Option>
//                         ))}
//                       </Select>
//                     </Form.Item>
//                   </Col>
//                 </Row>

//                 <Row gutter={mobileGutter}>
//                   <Col xs={24} sm={8}>
//                     <Form.Item
//                       label="Rent Per Day (₹)"
//                       name="dailyRent"
//                       rules={[
//                         {
//                           required: true,
//                           message: "Please enter rent per day",
//                         },
//                       ]}
//                       style={mobileFormItemStyle}
//                     >
//                       <Input
//                         type="number"
//                         placeholder="Enter amount"
//                         onChange={handleDailyRentChange}
//                         prefix="₹"
//                       />
//                     </Form.Item>
//                   </Col>

//                   <Col xs={24} sm={8}>
//                     <Form.Item
//                       label="Check-In Date"
//                       name="checkIn"
//                       rules={[
//                         {
//                           required: true,
//                           message: "Please select check-in date",
//                         },
//                       ]}
//                       style={mobileFormItemStyle}
//                     >
//                       <DatePicker style={{width: "100%"}} format="DD/MM/YYYY" />
//                     </Form.Item>
//                   </Col>

//                   <Col xs={24} sm={8}>
//                     <Form.Item
//                       label="Check-Out Date"
//                       name="checkOut"
//                       rules={[
//                         {
//                           required: true,
//                           message: "Please select check-out date",
//                         },
//                       ]}
//                       style={mobileFormItemStyle}
//                     >
//                       <DatePicker
//                         style={{width: "100%"}}
//                         format="DD/MM/YYYY"
//                         disabledDate={disabledCheckOutDate}
//                       />
//                     </Form.Item>
//                   </Col>
//                 </Row>

//                 {/* Calculation Section */}
//                 <Divider orientation="left" style={mobileDividerStyle}>
//                   <Space size={mobileSpaceSize}>
//                     <CalculatorOutlined />
//                     <Text strong style={{fontSize: isMobile ? "13px" : "14px"}}>
//                       Stay Duration & Payment Summary
//                     </Text>
//                   </Space>
//                 </Divider>

//                 {/* Mode Toggle */}
//                 <Row gutter={16} style={{marginBottom: isMobile ? 12 : 16}}>
//                   <Col span={24}>
//                     <Space
//                       align="center"
//                       style={{marginBottom: 8, width: "100%"}}
//                       direction={mobileSpaceDirection}
//                       size={mobileSpaceSize}
//                     >
//                       <Switch
//                         checked={manualDaysMode}
//                         onChange={handleModeToggle}
//                         checkedChildren="Manual"
//                         unCheckedChildren="Auto"
//                         size={isMobile ? "small" : "default"}
//                       />
//                       <Text
//                         type="secondary"
//                         style={{fontSize: isMobile ? "12px" : "14px"}}
//                       >
//                         {manualDaysMode
//                           ? "Manually enter days"
//                           : "Auto-calculated from dates"}
//                       </Text>
//                       <Tooltip
//                         title={
//                           manualDaysMode
//                             ? "Switch to auto mode"
//                             : "Switch to manual mode"
//                         }
//                       >
//                         <InfoCircleOutlined
//                           style={{
//                             color: "#999",
//                             fontSize: isMobile ? "12px" : "14px",
//                           }}
//                         />
//                       </Tooltip>
//                     </Space>
//                   </Col>
//                 </Row>

//                 <Row gutter={mobileGutter} align="middle">
//                   {/* Days Input */}
//                   <Col xs={24} sm={12}>
//                     <Card
//                       size="small"
//                       style={{backgroundColor: "#fafafa"}}
//                       bodyStyle={{padding: isMobile ? "8px" : "12px"}}
//                     >
//                       <Space
//                         direction="vertical"
//                         style={{width: "100%"}}
//                         size={isMobile ? 2 : 4}
//                       >
//                         <Space wrap style={{marginBottom: isMobile ? 2 : 0}}>
//                           <Text
//                             strong
//                             style={{fontSize: isMobile ? "13px" : "14px"}}
//                           >
//                             Total Days
//                           </Text>
//                           {!manualDaysMode && (
//                             <Text
//                               type="secondary"
//                               style={{fontSize: isMobile ? "10px" : "12px"}}
//                             >
//                               (from dates)
//                             </Text>
//                           )}
//                           {manualDaysMode && (
//                             <Text
//                               type="warning"
//                               style={{fontSize: isMobile ? "10px" : "12px"}}
//                             >
//                               (manual)
//                             </Text>
//                           )}
//                         </Space>

//                         {manualDaysMode ? (
//                           <Input
//                             type="number"
//                             value={totalDays}
//                             onChange={handleManualDaysChange}
//                             min={1}
//                             style={{width: "100%"}}
//                             placeholder="Enter days"
//                             addonAfter="days"
//                             size={isMobile ? "small" : "middle"}
//                           />
//                         ) : (
//                           <div
//                             style={{
//                               fontSize: isMobile ? "20px" : "24px",
//                               fontWeight: "bold",
//                               color: "#1890ff",
//                             }}
//                           >
//                             {totalDays} {totalDays === 1 ? "day" : "days"}
//                           </div>
//                         )}

//                         {/* Show date range in auto mode */}
//                         {!manualDaysMode && checkIn && checkOut && (
//                           <Text
//                             type="secondary"
//                             style={{fontSize: isMobile ? "10px" : "12px"}}
//                           >
//                             {dayjs(checkIn).format("DD/MM/YYYY")} -{" "}
//                             {dayjs(checkOut).format("DD/MM/YYYY")}
//                           </Text>
//                         )}
//                       </Space>
//                     </Card>
//                   </Col>

//                   {/* Total Amount */}
//                   <Col xs={24} sm={12}>
//                     <Card
//                       size="small"
//                       style={{
//                         backgroundColor: "#fff1f0",
//                         borderColor: "#ffa39e",
//                       }}
//                       bodyStyle={{padding: isMobile ? "8px" : "12px"}}
//                     >
//                       <Space
//                         direction="vertical"
//                         style={{width: "100%"}}
//                         size={isMobile ? 2 : 4}
//                       >
//                         <Text
//                           strong
//                           style={{fontSize: isMobile ? "13px" : "14px"}}
//                         >
//                           Total Amount
//                         </Text>
//                         <div
//                           style={{
//                             fontSize: isMobile ? "22px" : "28px",
//                             fontWeight: "bold",
//                             color: "#cf1322",
//                             wordBreak: "break-word",
//                           }}
//                         >
//                           ₹
//                           {totalAmount.toLocaleString("en-IN", {
//                             minimumFractionDigits: 2,
//                             maximumFractionDigits: 2,
//                           })}
//                         </div>
//                         {dailyRent > 0 && totalDays > 0 && (
//                           <Text
//                             type="secondary"
//                             style={{fontSize: isMobile ? "10px" : "12px"}}
//                           >
//                             ₹{dailyRent} × {totalDays}{" "}
//                             {totalDays === 1 ? "day" : "days"}
//                           </Text>
//                         )}
//                       </Space>
//                     </Card>
//                   </Col>
//                 </Row>

//                 {/* Note */}
//                 {!manualDaysMode && (
//                   <Row style={{marginTop: isMobile ? 8 : 12}}>
//                     <Col span={24}>
//                       <Text
//                         type="warning"
//                         style={{fontSize: isMobile ? "11px" : "12px"}}
//                       >
//                         <InfoCircleOutlined
//                           style={{
//                             fontSize: isMobile ? "11px" : "12px",
//                             marginRight: 4,
//                           }}
//                         />
//                         {isMobile
//                           ? "Edit days manually if needed"
//                           : "Total Days are calculated based on the selected date range. You can edit the total days manually if needed"}
//                       </Text>
//                     </Col>
//                   </Row>
//                 )}
//               </Card>
//             </>
//           )}

//           {/* Mess Details for Mess Rent */}
//           {rentType === "mess" && (
//             <Card
//               size={isMobile ? "small" : "small"}
//               title="Mess Details"
//               style={mobileCardStyle}
//               headStyle={{backgroundColor: "#f5f5f5"}}
//             >
//               <Row gutter={mobileGutter}>
//                 <Col xs={24} sm={12}>
//                   <Form.Item
//                     label="Rate Per Day (₹)"
//                     name="ratePerDay"
//                     rules={[
//                       {
//                         required: true,
//                         message: "Please enter rate per day",
//                       },
//                     ]}
//                     style={mobileFormItemStyle}
//                   >
//                     <Input
//                       type="number"
//                       placeholder="Enter amount"
//                       prefix="₹"
//                     />
//                   </Form.Item>
//                 </Col>
//               </Row>

//               <Row gutter={mobileGutter}>
//                 <Col xs={24} sm={12}>
//                   <Form.Item
//                     label="Mess Start Date"
//                     name="messStartDate"
//                     rules={[
//                       {
//                         required: true,
//                         message: "Please select mess start date",
//                       },
//                     ]}
//                     style={mobileFormItemStyle}
//                   >
//                     <DatePicker style={{width: "100%"}} format="DD/MM/YYYY" />
//                   </Form.Item>
//                 </Col>
//                 <Col xs={24} sm={12}>
//                   <Form.Item
//                     label="Mess End Date"
//                     name="messEndDate"
//                     rules={[
//                       {required: true, message: "Please select mess end date"},
//                     ]}
//                     style={mobileFormItemStyle}
//                   >
//                     <DatePicker
//                       style={{width: "100%"}}
//                       format="DD/MM/YYYY"
//                       disabledDate={disabledMessEndDate}
//                     />
//                   </Form.Item>
//                 </Col>
//               </Row>

//               {/* Meal Type Selection */}
//               <Row gutter={mobileGutter}>
//                 <Col xs={24}>
//                   <Form.Item
//                     label="Meal Types"
//                     name="mealType"
//                     rules={[
//                       {
//                         required: true,
//                         message: "Please select at least one meal type",
//                         validator: (_, value) => {
//                           if (selectedMealTypes.length > 0) {
//                             return Promise.resolve();
//                           }
//                           return Promise.reject(
//                             new Error("Please select at least one meal type"),
//                           );
//                         },
//                       },
//                     ]}
//                     style={mobileFormItemStyle}
//                   >
//                     <Checkbox.Group
//                       options={mealTypeOptions}
//                       value={selectedMealTypes}
//                       onChange={handleMealTypeChange}
//                       style={{
//                         display: "flex",
//                         flexDirection: isMobile ? "column" : "row",
//                         gap: isMobile ? "8px" : "16px",
//                       }}
//                     />
//                   </Form.Item>
//                 </Col>
//               </Row>

//               {/* Mess Calculation Section */}
//               {messStartDate && messEndDate && (
//                 <>
//                   <Divider orientation="left" style={mobileDividerStyle}>
//                     <Space size={mobileSpaceSize}>
//                       <CalculatorOutlined />
//                       <Text
//                         strong
//                         style={{fontSize: isMobile ? "13px" : "14px"}}
//                       >
//                         Mess Duration & Payment Summary
//                       </Text>
//                     </Space>
//                   </Divider>

//                   <Row
//                     gutter={mobileGutter}
//                     style={{marginTop: isMobile ? 8 : 12}}
//                   >
//                     {/* Mess Days */}
//                     <Col xs={24} sm={12}>
//                       <Card
//                         size="small"
//                         style={{backgroundColor: "#f6ffed"}}
//                         bodyStyle={{padding: isMobile ? "8px" : "12px"}}
//                       >
//                         <Space
//                           direction="vertical"
//                           style={{width: "100%"}}
//                           size={isMobile ? 2 : 4}
//                         >
//                           <Text
//                             strong
//                             style={{fontSize: isMobile ? "13px" : "14px"}}
//                           >
//                             Total Mess Days
//                           </Text>
//                           <div
//                             style={{
//                               fontSize: isMobile ? "20px" : "24px",
//                               fontWeight: "bold",
//                               color: "#3f8600",
//                             }}
//                           >
//                             {messDays} {messDays === 1 ? "day" : "days"}
//                           </div>
//                           {messStartDate && messEndDate && (
//                             <Text
//                               type="secondary"
//                               style={{fontSize: isMobile ? "10px" : "12px"}}
//                             >
//                               {dayjs(messStartDate).format("DD/MM/YYYY")} -{" "}
//                               {dayjs(messEndDate).format("DD/MM/YYYY")}
//                             </Text>
//                           )}
//                         </Space>
//                       </Card>
//                     </Col>

//                     {/* Total Mess Amount */}
//                     <Col xs={24} sm={12}>
//                       <Card
//                         size="small"
//                         style={{
//                           backgroundColor: "#fff1f0",
//                           borderColor: "#ffa39e",
//                         }}
//                         bodyStyle={{padding: isMobile ? "8px" : "12px"}}
//                       >
//                         <Space
//                           direction="vertical"
//                           style={{width: "100%"}}
//                           size={isMobile ? 2 : 4}
//                         >
//                           <Text
//                             strong
//                             style={{fontSize: isMobile ? "13px" : "14px"}}
//                           >
//                             Total Mess Amount
//                           </Text>
//                           <div
//                             style={{
//                               fontSize: isMobile ? "22px" : "28px",
//                               fontWeight: "bold",
//                               color: "#cf1322",
//                               wordBreak: "break-word",
//                             }}
//                           >
//                             ₹
//                             {messTotalAmount.toLocaleString("en-IN", {
//                               minimumFractionDigits: 2,
//                               maximumFractionDigits: 2,
//                             })}
//                           </div>
//                           {messRate > 0 && messDays > 0 && (
//                             <Text
//                               type="secondary"
//                               style={{fontSize: isMobile ? "10px" : "12px"}}
//                             >
//                               ₹{messRate} × {messDays}{" "}
//                               {messDays === 1 ? "day" : "days"}
//                             </Text>
//                           )}
//                         </Space>
//                       </Card>
//                     </Col>
//                   </Row>

//                   {/* Selected Meal Types Display */}
//                   {selectedMealTypes.length > 0 && (
//                     <Row style={{marginTop: isMobile ? 8 : 12}}>
//                       <Col span={24}>
//                         <Card size="small" style={{backgroundColor: "#e6f7ff"}}>
//                           <Space direction="vertical" size={isMobile ? 2 : 4}>
//                             <Text
//                               strong
//                               style={{fontSize: isMobile ? "13px" : "14px"}}
//                             >
//                               Selected Meal Types:
//                             </Text>
//                             <div
//                               style={{
//                                 display: "flex",
//                                 gap: isMobile ? 4 : 8,
//                                 flexWrap: "wrap",
//                               }}
//                             >
//                               {selectedMealTypes.map((type) => (
//                                 <Text
//                                   key={type}
//                                   style={{
//                                     backgroundColor: "#1890ff",
//                                     color: "white",
//                                     padding: "2px 8px",
//                                     borderRadius: "4px",
//                                     fontSize: isMobile ? "11px" : "12px",
//                                   }}
//                                 >
//                                   {type.charAt(0).toUpperCase() + type.slice(1)}
//                                 </Text>
//                               ))}
//                             </div>
//                           </Space>
//                         </Card>
//                       </Col>
//                     </Row>
//                   )}
//                 </>
//               )}
//             </Card>
//           )}
//         </Form>
//       </Modal>
//     </>
//   );
// };

// export default RegistrationModal;
import {
  Modal,
  Form,
  Input,
  DatePicker,
  Select,
  Button,
  Row,
  Col,
  Card,
  message,
  Space,
  Typography,
  Switch,
  Divider,
  Tooltip,
  Checkbox,
} from "antd";
import {
  HomeOutlined,
  CalculatorOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import {useState, useEffect} from "react";
import dayjs from "dayjs";
import {useSelector} from "react-redux";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {getAvailableRoomsByProperty} from "../../hooks/property/useProperty";
import {registerResident} from "../../hooks/users/useUser";
import {useWatch} from "antd/es/form/Form";
import {getKitchens} from "../../hooks/inventory/useInventory";

const {Text} = Typography;
const {Option} = Select;

// Custom hook for responsive design
const useResponsive = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return {isMobile};
};

const RegistrationModal = ({visible, onCancel, rentType}) => {
  const {properties, selectedProperty} = useSelector(
    (state) => state.properties,
  );
  const {isMobile} = useResponsive();
  const [currentCategoryType, setCurrentCategoryType] = useState("");
  const [currentProperty, setCurrentProperty] = useState(selectedProperty);
  const [form] = Form.useForm();
  const [totalDays, setTotalDays] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [dailyRent, setDailyRent] = useState(0);
  const [messDays, setMessDays] = useState(0);
  const [messTotalAmount, setMessTotalAmount] = useState(0);
  const [selectedSharingType, setSelectedSharingType] = useState("");
  const [manualDaysMode, setManualDaysMode] = useState(false);
  const [selectedMealTypes, setSelectedMealTypes] = useState([]);
  const [selectedKitchen, setSelectedKitchen] = useState(null);

  const [messageApi, contextHolder] = message.useMessage();
  const queryClient = useQueryClient();

  const {data: availableRooms} = useQuery({
    queryKey: ["availableRooms", selectedProperty?.id || currentProperty?._id],
    queryFn: ({queryKey}) => {
      const [, propertyId] = queryKey;
      return getAvailableRoomsByProperty(propertyId);
    },
    enabled:
      !!(selectedProperty?.id || currentProperty?._id) && rentType === "daily",
  });

  const {data: kitchens, isLoading: kitchensLoading} = useQuery({
    queryKey: ["kitchens", selectedProperty?.id],
    queryFn: () => getKitchens({propertyId: selectedProperty?.id}),
  });

  const registerMutation = useMutation({
    mutationFn: registerResident,
    onSuccess: (data) => {
      queryClient.invalidateQueries(["expenses"]);
      onCancel();
      form.resetFields();
      setTotalDays(0);
      setTotalAmount(0);
      setDailyRent(0);
      setMessDays(0);
      setMessTotalAmount(0);
      setSelectedSharingType("");
      setManualDaysMode(false);
      setSelectedMealTypes([]);
      setSelectedKitchen(null);

      messageApi.success({
        content: `${data.message}`,
        duration: 3,
      });
    },
    onError: (error) => {
      console.log("Registration failed:", error);
      messageApi.error({
        content: `${error.details}`,
        duration: 3,
      });
    },
  });

  const calculateDaysFromDates = (startDate, endDate) => {
    if (startDate && endDate) {
      const start = dayjs(startDate).startOf("day");
      const end = dayjs(endDate).startOf("day");
      return end.diff(start, "day") + 1;
    }
    return 0;
  };

  const handleManualDaysChange = (e) => {
    const manualDays = parseInt(e.target.value) || 0;
    setTotalDays(manualDays);
    const rentPerDay = form.getFieldValue("dailyRent") || 0;
    setTotalAmount(manualDays * rentPerDay);
  };

  const handleModeToggle = (checked) => {
    setManualDaysMode(checked);

    if (!checked) {
      const checkIn = form.getFieldValue("checkIn");
      const checkOut = form.getFieldValue("checkOut");
      const rentPerDay = form.getFieldValue("dailyRent") || 0;

      const days = calculateDaysFromDates(checkIn, checkOut);
      setTotalDays(days);
      setTotalAmount(days * rentPerDay);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setTotalDays(0);
    setTotalAmount(0);
    setDailyRent(0);
    setMessDays(0);
    setMessTotalAmount(0);
    setSelectedSharingType("");
    setManualDaysMode(false);
    setSelectedMealTypes([]);
    setSelectedKitchen(null);

    onCancel();
  };

  const handleOk = () => {
    const userType =
      rentType === "daily"
        ? "dailyRent"
        : rentType === "mess"
          ? "messOnly"
          : "student";

    form
      .validateFields()
      .then((values) => {
        const selectedRoomDetails = getAvailableRoomsForSharingType(
          selectedSharingType,
        )?.find((room) => room.roomNo === values.roomNumber);

        // Find selected kitchen details
        const selectedKitchenDetails = kitchens?.find(
          (kitchen) => kitchen._id === values.kitchenId,
        );

        const submitData = {
          userType: userType,
          name: values.name,
          email: values.email,
          contact: values.contact,
          password: "Nikhil@123",

          [rentType === "mess" ? "messDetails" : "stayDetails"]: {
            ...(rentType === "mess"
              ? {
                  kitchenId: values.kitchenId, // Send kitchen ID
                  kitchenName: selectedKitchenDetails?.name, // Send kitchen name
                  messStartDate: values.messStartDate?.toISOString(),
                  messEndDate: values.messEndDate?.toISOString(),
                  noOfDays: messDays,
                  rent: values.ratePerDay,
                  mealType: selectedMealTypes,
                }
              : {
                  checkInDate: values.checkIn?.toISOString(),
                  checkOutDate: values.checkOut?.toISOString(),
                  noOfDays: totalDays,
                  dailyRent: Number(values.dailyRent),
                  sharingType: values.sharingType,
                  propertyId: selectedProperty?.id || currentProperty?._id,
                  propertyName: (
                    selectedProperty?.name || currentProperty?.name
                  )?.replace(/^Heavens Living\s*-\s*/i, ""),
                  roomNumber: values.roomNumber,
                  roomId: selectedRoomDetails?._id,
                }),
          },

          personalDetails: {
            address: values.address,
            gender: values.gender,
          },
          isApproved: true,
          isHeavens: true,
        };
        registerMutation.mutate(submitData);
      })
      .catch((info) => {
        console.log("Validation Failed:", info);
      });
  };

  const handleDailyRentChange = (e) => {
    const value = parseFloat(e.target.value) || 0;
    setDailyRent(value);

    if (!manualDaysMode) {
      const checkIn = form.getFieldValue("checkIn");
      const checkOut = form.getFieldValue("checkOut");
      const days = calculateDaysFromDates(checkIn, checkOut);
      setTotalAmount(days * value);
    } else {
      setTotalAmount(totalDays * value);
    }
  };

  const handleSharingTypeChange = (sharingType) => {
    setSelectedSharingType(sharingType);
    form.setFieldsValue({roomNumber: undefined});
  };

  const handleMealTypeChange = (checkedValues) => {
    setSelectedMealTypes(checkedValues);
  };

  const handleKitchenChange = (kitchenId, option) => {
    setSelectedKitchen(kitchenId);
    // You can also store kitchen details if needed
    console.log("Selected kitchen:", option);
  };

  const disabledCheckOutDate = (current) => {
    const checkIn = form.getFieldValue("checkIn");
    if (!checkIn) {
      return false;
    }
    return current && current < dayjs(checkIn).startOf("day");
  };

  const disabledMessEndDate = (current) => {
    const messStart = form.getFieldValue("messStartDate");
    if (!messStart) {
      return false;
    }
    return current && current < dayjs(messStart).startOf("day");
  };

  const checkIn = useWatch("checkIn", form);
  const checkOut = useWatch("checkOut", form);
  const rent = useWatch("dailyRent", form);

  // Mess watches
  const messStartDate = useWatch("messStartDate", form);
  const messEndDate = useWatch("messEndDate", form);
  const messRate = useWatch("ratePerDay", form);

  // Update calculations when dates or rent change (auto mode only)
  useEffect(() => {
    if (rentType === "daily" && !manualDaysMode) {
      const rentPerDay = rent || 0;

      if (checkIn && checkOut && rentPerDay > 0) {
        const start = dayjs(checkIn).startOf("day");
        const end = dayjs(checkOut).startOf("day");

        const days = end.diff(start, "day") + 1;
        setTotalDays(days > 0 ? days : 0);
        setTotalAmount(days > 0 ? days * rentPerDay : 0);
      } else {
        setTotalDays(0);
        setTotalAmount(0);
      }
    }
  }, [checkIn, checkOut, rent, rentType, manualDaysMode]);

  // Calculate mess days and amount when mess dates change
  useEffect(() => {
    if (rentType === "mess") {
      if (messStartDate && messEndDate) {
        const days = calculateDaysFromDates(messStartDate, messEndDate);
        setMessDays(days > 0 ? days : 0);

        const ratePerDay = messRate || 0;
        setMessTotalAmount(days > 0 ? days * ratePerDay : 0);
      } else {
        setMessDays(0);
        setMessTotalAmount(0);
      }
    }
  }, [messStartDate, messEndDate, messRate, rentType]);

  const handlePropertyChange = (propertyId) => {
    if (propertyId) {
      const property = properties.find((p) => p._id === propertyId);
      setCurrentProperty(property);
      form.setFieldsValue({handler: undefined, kitchenId: undefined});
    } else {
      setCurrentProperty({_id: null, name: ""});
    }
  };

  useEffect(() => {
    if (rentType) {
      setCurrentCategoryType(rentType);
      form.setFieldsValue({categoryType: rentType});
    }
  }, [rentType, form]);

  useEffect(() => {
    if (selectedProperty && selectedProperty.id) {
      setCurrentProperty(selectedProperty);
    } else {
      setCurrentProperty({id: null, name: ""});
    }
  }, [selectedProperty]);

  const getCategoryDisplayName = (type) => {
    const names = {
      daily: "Daily Rent",
      mess: "Mess Only",
    };
    return names[type] || type;
  };

  const hasSelectedProperty = selectedProperty && selectedProperty.id;

  const cleanPropertyName =
    currentProperty?.name?.replace(/^Heavens Living -\s*/, "") || "";

  const getModalTitle = () => {
    let title = "Register";

    if (cleanPropertyName) {
      title += ` - ${cleanPropertyName}`;
    }

    if (currentCategoryType) {
      title += cleanPropertyName
        ? ` (${getCategoryDisplayName(currentCategoryType)})`
        : ` - ${getCategoryDisplayName(currentCategoryType)}`;
    }

    return title;
  };

  const getUniqueSharingTypes = () => {
    if (!availableRooms?.rooms || rentType !== "daily") return [];

    const sharingTypes = availableRooms.rooms
      .filter((room) => room.vacantSlot > 0)
      .map((room) => room.sharingType);

    return [...new Set(sharingTypes)];
  };

  const getAvailableRoomsForSharingType = (sharingType) => {
    if (!availableRooms?.rooms || !sharingType) return [];

    return availableRooms.rooms.filter(
      (room) => room.sharingType === sharingType && room.vacantSlot > 0,
    );
  };

  // Mobile styles - only applied when isMobile is true
  const mobileModalStyle = isMobile
    ? {
        width: "95%",
        maxWidth: "95%",
        margin: "10px auto",
        top: 10,
      }
    : {};

  const mobileBodyStyle = isMobile
    ? {
        maxHeight: "calc(100vh - 150px)",
        overflowY: "auto",
        padding: "12px",
      }
    : {};

  const mobileCardStyle = isMobile
    ? {
        marginBottom: 12,
      }
    : {marginBottom: 16};

  const mobileGutter = isMobile ? [8, 8] : [16, 16];

  const mobileFormItemStyle = isMobile
    ? {
        marginBottom: 8,
      }
    : {};

  const mobileDividerStyle = isMobile
    ? {
        margin: "8px 0",
      }
    : {margin: "12px 0"};

  const mobileSpaceDirection = isMobile ? "vertical" : "horizontal";
  const mobileSpaceSize = isMobile ? 4 : 8;

  // Meal type options
  const mealTypeOptions = [
    {label: "Breakfast", value: "breakfast"},
    {label: "Lunch", value: "lunch"},
    {label: "Dinner", value: "dinner"},
  ];

  return (
    <>
      {contextHolder}
      <Modal
        centered
        maskClosable={false}
        title={
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: isMobile ? "14px" : "16px",
              whiteSpace: isMobile ? "normal" : "nowrap",
              wordBreak: "break-word",
              padding: isMobile ? "4px 0" : 0,
            }}
          >
            {getModalTitle()}
          </div>
        }
        open={visible}
        onCancel={handleCancel}
        footer={[
          <Button
            key="cancel"
            onClick={handleCancel}
            size={isMobile ? "middle" : "default"}
            style={isMobile ? {flex: 1} : {}}
          >
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={handleOk}
            size={isMobile ? "middle" : "default"}
            style={isMobile ? {flex: 1, marginLeft: 8} : {}}
          >
            Register
          </Button>,
        ]}
        destroyOnClose
        width={800}
        style={mobileModalStyle}
        bodyStyle={mobileBodyStyle}
        footerStyle={isMobile ? {padding: "10px 12px"} : {}}
      >
        <Form
          form={form}
          layout="vertical"
          name="registrationForm"
          initialValues={{
            rentType,
            userType: "student",
            isHeavens: true,
          }}
          size={isMobile ? "middle" : "default"}
        >
          {/* Basic Information */}
          <Card
            size={isMobile ? "small" : "small"}
            title="Basic Information"
            style={mobileCardStyle}
            headStyle={{backgroundColor: "#f5f5f5"}}
          >
            <Row gutter={mobileGutter}>
              <Col xs={24} sm={12} md={8}>
                <Form.Item
                  label="Full Name"
                  name="name"
                  rules={[
                    {required: true, message: "Please enter the full name"},
                  ]}
                  style={mobileFormItemStyle}
                >
                  <Input placeholder="Enter full name" />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={8}>
                <Form.Item
                  label="Email"
                  name="email"
                  rules={[
                    {type: "email", message: "Please enter a valid email"},
                  ]}
                  style={mobileFormItemStyle}
                >
                  <Input placeholder="Enter email address" />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={8}>
                <Form.Item
                  label="Contact Number"
                  name="contact"
                  rules={[
                    {required: true, message: "Please enter contact number"},
                  ]}
                  style={mobileFormItemStyle}
                >
                  <Input placeholder="Enter contact number" />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12}>
                <Form.Item
                  label="Gender"
                  name="gender"
                  rules={[{required: true, message: "Please select gender"}]}
                  style={mobileFormItemStyle}
                >
                  <Select placeholder="Select gender">
                    <Option value="Male">Male</Option>
                    <Option value="Female">Female</Option>
                    <Option value="Other">Other</Option>
                  </Select>
                </Form.Item>
              </Col>

              <Col xs={24} sm={12}>
                <Form.Item
                  label="Address"
                  name="address"
                  style={mobileFormItemStyle}
                >
                  <Input placeholder="Enter complete address" />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* Stay Details for Daily Rent */}
          {rentType === "daily" && (
            <>
              <Card
                size={isMobile ? "small" : "small"}
                title="Stay Details"
                style={mobileCardStyle}
                headStyle={{backgroundColor: "#f5f5f5"}}
              >
                {/* Property Selection for Daily Rent when no property is selected */}
                {!hasSelectedProperty && (
                  <div style={{marginBottom: isMobile ? 12 : 16}}>
                    <Form.Item
                      label="Select Property"
                      name="propertyId"
                      rules={[
                        {required: true, message: "Please select a property"},
                      ]}
                      style={mobileFormItemStyle}
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
                  </div>
                )}

                <Row gutter={mobileGutter}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      label="Sharing Type"
                      name="sharingType"
                      rules={[
                        {required: true, message: "Please select sharing type"},
                      ]}
                      style={mobileFormItemStyle}
                    >
                      <Select
                        placeholder="Select sharing type"
                        onChange={handleSharingTypeChange}
                      >
                        {getUniqueSharingTypes().map((sharingType) => (
                          <Option key={sharingType} value={sharingType}>
                            {sharingType}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      label="Select Room"
                      name="roomNumber"
                      rules={[
                        {required: true, message: "Please select a room"},
                      ]}
                      style={mobileFormItemStyle}
                    >
                      <Select
                        disabled={!selectedSharingType}
                        placeholder="Select room number"
                      >
                        {getAvailableRoomsForSharingType(
                          selectedSharingType,
                        )?.map((room) => (
                          <Option key={room._id} value={room.roomNo}>
                            {room.roomNo} (Vacant: {room.vacantSlot})
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={mobileGutter}>
                  <Col xs={24} sm={8}>
                    <Form.Item
                      label="Rent Per Day (₹)"
                      name="dailyRent"
                      rules={[
                        {
                          required: true,
                          message: "Please enter rent per day",
                        },
                      ]}
                      style={mobileFormItemStyle}
                    >
                      <Input
                        type="number"
                        placeholder="Enter amount"
                        onChange={handleDailyRentChange}
                        prefix="₹"
                      />
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={8}>
                    <Form.Item
                      label="Check-In Date"
                      name="checkIn"
                      rules={[
                        {
                          required: true,
                          message: "Please select check-in date",
                        },
                      ]}
                      style={mobileFormItemStyle}
                    >
                      <DatePicker style={{width: "100%"}} format="DD/MM/YYYY" />
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={8}>
                    <Form.Item
                      label="Check-Out Date"
                      name="checkOut"
                      rules={[
                        {
                          required: true,
                          message: "Please select check-out date",
                        },
                      ]}
                      style={mobileFormItemStyle}
                    >
                      <DatePicker
                        style={{width: "100%"}}
                        format="DD/MM/YYYY"
                        disabledDate={disabledCheckOutDate}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                {/* Calculation Section */}
                <Divider orientation="left" style={mobileDividerStyle}>
                  <Space size={mobileSpaceSize}>
                    <CalculatorOutlined />
                    <Text strong style={{fontSize: isMobile ? "13px" : "14px"}}>
                      Stay Duration & Payment Summary
                    </Text>
                  </Space>
                </Divider>

                {/* Mode Toggle */}
                <Row gutter={16} style={{marginBottom: isMobile ? 12 : 16}}>
                  <Col span={24}>
                    <Space
                      align="center"
                      style={{marginBottom: 8, width: "100%"}}
                      direction={mobileSpaceDirection}
                      size={mobileSpaceSize}
                    >
                      <Switch
                        checked={manualDaysMode}
                        onChange={handleModeToggle}
                        checkedChildren="Manual"
                        unCheckedChildren="Auto"
                        size={isMobile ? "small" : "default"}
                      />
                      <Text
                        type="secondary"
                        style={{fontSize: isMobile ? "12px" : "14px"}}
                      >
                        {manualDaysMode
                          ? "Manually enter days"
                          : "Auto-calculated from dates"}
                      </Text>
                      <Tooltip
                        title={
                          manualDaysMode
                            ? "Switch to auto mode"
                            : "Switch to manual mode"
                        }
                      >
                        <InfoCircleOutlined
                          style={{
                            color: "#999",
                            fontSize: isMobile ? "12px" : "14px",
                          }}
                        />
                      </Tooltip>
                    </Space>
                  </Col>
                </Row>

                <Row gutter={mobileGutter} align="middle">
                  {/* Days Input */}
                  <Col xs={24} sm={12}>
                    <Card
                      size="small"
                      style={{backgroundColor: "#fafafa"}}
                      bodyStyle={{padding: isMobile ? "8px" : "12px"}}
                    >
                      <Space
                        direction="vertical"
                        style={{width: "100%"}}
                        size={isMobile ? 2 : 4}
                      >
                        <Space wrap style={{marginBottom: isMobile ? 2 : 0}}>
                          <Text
                            strong
                            style={{fontSize: isMobile ? "13px" : "14px"}}
                          >
                            Total Days
                          </Text>
                          {!manualDaysMode && (
                            <Text
                              type="secondary"
                              style={{fontSize: isMobile ? "10px" : "12px"}}
                            >
                              (from dates)
                            </Text>
                          )}
                          {manualDaysMode && (
                            <Text
                              type="warning"
                              style={{fontSize: isMobile ? "10px" : "12px"}}
                            >
                              (manual)
                            </Text>
                          )}
                        </Space>

                        {manualDaysMode ? (
                          <Input
                            type="number"
                            value={totalDays}
                            onChange={handleManualDaysChange}
                            min={1}
                            style={{width: "100%"}}
                            placeholder="Enter days"
                            addonAfter="days"
                            size={isMobile ? "small" : "middle"}
                          />
                        ) : (
                          <div
                            style={{
                              fontSize: isMobile ? "20px" : "24px",
                              fontWeight: "bold",
                              color: "#1890ff",
                            }}
                          >
                            {totalDays} {totalDays === 1 ? "day" : "days"}
                          </div>
                        )}

                        {/* Show date range in auto mode */}
                        {!manualDaysMode && checkIn && checkOut && (
                          <Text
                            type="secondary"
                            style={{fontSize: isMobile ? "10px" : "12px"}}
                          >
                            {dayjs(checkIn).format("DD/MM/YYYY")} -{" "}
                            {dayjs(checkOut).format("DD/MM/YYYY")}
                          </Text>
                        )}
                      </Space>
                    </Card>
                  </Col>

                  {/* Total Amount */}
                  <Col xs={24} sm={12}>
                    <Card
                      size="small"
                      style={{
                        backgroundColor: "#fff1f0",
                        borderColor: "#ffa39e",
                      }}
                      bodyStyle={{padding: isMobile ? "8px" : "12px"}}
                    >
                      <Space
                        direction="vertical"
                        style={{width: "100%"}}
                        size={isMobile ? 2 : 4}
                      >
                        <Text
                          strong
                          style={{fontSize: isMobile ? "13px" : "14px"}}
                        >
                          Total Amount
                        </Text>
                        <div
                          style={{
                            fontSize: isMobile ? "22px" : "28px",
                            fontWeight: "bold",
                            color: "#cf1322",
                            wordBreak: "break-word",
                          }}
                        >
                          ₹
                          {totalAmount.toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </div>
                        {dailyRent > 0 && totalDays > 0 && (
                          <Text
                            type="secondary"
                            style={{fontSize: isMobile ? "10px" : "12px"}}
                          >
                            ₹{dailyRent} × {totalDays}{" "}
                            {totalDays === 1 ? "day" : "days"}
                          </Text>
                        )}
                      </Space>
                    </Card>
                  </Col>
                </Row>

                {/* Note */}
                {!manualDaysMode && (
                  <Row style={{marginTop: isMobile ? 8 : 12}}>
                    <Col span={24}>
                      <Text
                        type="warning"
                        style={{fontSize: isMobile ? "11px" : "12px"}}
                      >
                        <InfoCircleOutlined
                          style={{
                            fontSize: isMobile ? "11px" : "12px",
                            marginRight: 4,
                          }}
                        />
                        {isMobile
                          ? "Edit days manually if needed"
                          : "Total Days are calculated based on the selected date range. You can edit the total days manually if needed"}
                      </Text>
                    </Col>
                  </Row>
                )}
              </Card>
            </>
          )}

          {/* Mess Details for Mess Rent */}
          {rentType === "mess" && (
            <Card
              size={isMobile ? "small" : "small"}
              title="Mess Details"
              style={mobileCardStyle}
              headStyle={{backgroundColor: "#f5f5f5"}}
            >
              {/* Kitchen Selection */}
              <Row gutter={mobileGutter}>
                <Col xs={24}>
                  <Form.Item
                    label="Select Kitchen"
                    name="kitchenId"
                    rules={[
                      {required: true, message: "Please select a kitchen"},
                    ]}
                    style={mobileFormItemStyle}
                  >
                    <Select
                      placeholder="Choose a kitchen"
                      onChange={handleKitchenChange}
                      loading={kitchensLoading}
                      allowClear
                      // suffixIcon={<KitchenOutlined />}
                    >
                      {kitchens?.map((kitchen) => (
                        <Option key={kitchen._id} value={kitchen._id}>
                          {kitchen.name} - {kitchen.location}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={mobileGutter}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Rate Per Day (₹)"
                    name="ratePerDay"
                    rules={[
                      {
                        required: true,
                        message: "Please enter rate per day",
                      },
                    ]}
                    style={mobileFormItemStyle}
                  >
                    <Input
                      type="number"
                      placeholder="Enter amount"
                      prefix="₹"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={mobileGutter}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Mess Start Date"
                    name="messStartDate"
                    rules={[
                      {
                        required: true,
                        message: "Please select mess start date",
                      },
                    ]}
                    style={mobileFormItemStyle}
                  >
                    <DatePicker style={{width: "100%"}} format="DD/MM/YYYY" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Mess End Date"
                    name="messEndDate"
                    rules={[
                      {required: true, message: "Please select mess end date"},
                    ]}
                    style={mobileFormItemStyle}
                  >
                    <DatePicker
                      style={{width: "100%"}}
                      format="DD/MM/YYYY"
                      disabledDate={disabledMessEndDate}
                    />
                  </Form.Item>
                </Col>
              </Row>

              {/* Meal Type Selection */}
              <Row gutter={mobileGutter}>
                <Col xs={24}>
                  <Form.Item
                    label="Meal Types"
                    name="mealType"
                    rules={[
                      {
                        required: true,
                        message: "Please select at least one meal type",
                        validator: (_, value) => {
                          if (selectedMealTypes.length > 0) {
                            return Promise.resolve();
                          }
                          return Promise.reject(
                            new Error("Please select at least one meal type"),
                          );
                        },
                      },
                    ]}
                    style={mobileFormItemStyle}
                  >
                    <Checkbox.Group
                      options={mealTypeOptions}
                      value={selectedMealTypes}
                      onChange={handleMealTypeChange}
                      style={{
                        display: "flex",
                        flexDirection: isMobile ? "column" : "row",
                        gap: isMobile ? "8px" : "16px",
                      }}
                    />
                  </Form.Item>
                </Col>
              </Row>

              {/* Mess Calculation Section */}
              {messStartDate && messEndDate && (
                <>
                  <Divider orientation="left" style={mobileDividerStyle}>
                    <Space size={mobileSpaceSize}>
                      <CalculatorOutlined />
                      <Text
                        strong
                        style={{fontSize: isMobile ? "13px" : "14px"}}
                      >
                        Mess Duration & Payment Summary
                      </Text>
                    </Space>
                  </Divider>

                  <Row
                    gutter={mobileGutter}
                    style={{marginTop: isMobile ? 8 : 12}}
                  >
                    {/* Mess Days */}
                    <Col xs={24} sm={12}>
                      <Card
                        size="small"
                        style={{backgroundColor: "#f6ffed"}}
                        bodyStyle={{padding: isMobile ? "8px" : "12px"}}
                      >
                        <Space
                          direction="vertical"
                          style={{width: "100%"}}
                          size={isMobile ? 2 : 4}
                        >
                          <Text
                            strong
                            style={{fontSize: isMobile ? "13px" : "14px"}}
                          >
                            Total Mess Days
                          </Text>
                          <div
                            style={{
                              fontSize: isMobile ? "20px" : "24px",
                              fontWeight: "bold",
                              color: "#3f8600",
                            }}
                          >
                            {messDays} {messDays === 1 ? "day" : "days"}
                          </div>
                          {messStartDate && messEndDate && (
                            <Text
                              type="secondary"
                              style={{fontSize: isMobile ? "10px" : "12px"}}
                            >
                              {dayjs(messStartDate).format("DD/MM/YYYY")} -{" "}
                              {dayjs(messEndDate).format("DD/MM/YYYY")}
                            </Text>
                          )}
                        </Space>
                      </Card>
                    </Col>

                    {/* Total Mess Amount */}
                    <Col xs={24} sm={12}>
                      <Card
                        size="small"
                        style={{
                          backgroundColor: "#fff1f0",
                          borderColor: "#ffa39e",
                        }}
                        bodyStyle={{padding: isMobile ? "8px" : "12px"}}
                      >
                        <Space
                          direction="vertical"
                          style={{width: "100%"}}
                          size={isMobile ? 2 : 4}
                        >
                          <Text
                            strong
                            style={{fontSize: isMobile ? "13px" : "14px"}}
                          >
                            Total Mess Amount
                          </Text>
                          <div
                            style={{
                              fontSize: isMobile ? "22px" : "28px",
                              fontWeight: "bold",
                              color: "#cf1322",
                              wordBreak: "break-word",
                            }}
                          >
                            ₹
                            {messTotalAmount.toLocaleString("en-IN", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </div>
                          {messRate > 0 && messDays > 0 && (
                            <Text
                              type="secondary"
                              style={{fontSize: isMobile ? "10px" : "12px"}}
                            >
                              ₹{messRate} × {messDays}{" "}
                              {messDays === 1 ? "day" : "days"}
                            </Text>
                          )}
                        </Space>
                      </Card>
                    </Col>
                  </Row>

                  {/* Selected Meal Types Display */}
                  {selectedMealTypes.length > 0 && (
                    <Row style={{marginTop: isMobile ? 8 : 12}}>
                      <Col span={24}>
                        <Card size="small" style={{backgroundColor: "#e6f7ff"}}>
                          <Space direction="vertical" size={isMobile ? 2 : 4}>
                            <Text
                              strong
                              style={{fontSize: isMobile ? "13px" : "14px"}}
                            >
                              Selected Meal Types:
                            </Text>
                            <div
                              style={{
                                display: "flex",
                                gap: isMobile ? 4 : 8,
                                flexWrap: "wrap",
                              }}
                            >
                              {selectedMealTypes.map((type) => (
                                <Text
                                  key={type}
                                  style={{
                                    backgroundColor: "#1890ff",
                                    color: "white",
                                    padding: "2px 8px",
                                    borderRadius: "4px",
                                    fontSize: isMobile ? "11px" : "12px",
                                  }}
                                >
                                  {type.charAt(0).toUpperCase() + type.slice(1)}
                                </Text>
                              ))}
                            </div>
                          </Space>
                        </Card>
                      </Col>
                    </Row>
                  )}
                </>
              )}
            </Card>
          )}
        </Form>
      </Modal>
    </>
  );
};

export default RegistrationModal;
