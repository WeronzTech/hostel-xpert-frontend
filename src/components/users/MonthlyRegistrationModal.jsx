import {useState, useEffect} from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  Button,
  Row,
  Col,
  Tabs,
  message,
  Grid,
  Typography,
  Empty,
  DatePicker,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  LockOutlined,
  PhoneOutlined,
} from "@ant-design/icons";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {useSelector} from "react-redux";
import {
  getAvailableRoomsByProperty,
  getPropertyDetails,
} from "../../hooks/property/useProperty.js";
import {registerMonthlyUser} from "../../hooks/users/useUser.js";

const {Option} = Select;
const {TabPane} = Tabs;
const {useBreakpoint} = Grid;
const {Text} = Typography;

const MonthlyRegistrationModal = ({visible, onCancel, onSuccess}) => {
  const {properties} = useSelector((state) => state.properties);
  const [currentProperty, setCurrentProperty] = useState(null);
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState("personal");
  const [selectedSharingType, setSelectedSharingType] = useState("");
  const {user} = useSelector((state) => state.auth);

  const [messageApi, contextHolder] = message.useMessage();
  const queryClient = useQueryClient();

  // State for total payable to trigger re-renders
  const [totalPayable, setTotalPayable] = useState(0);

  const screens = useBreakpoint();
  const isMobile = !screens.md;

  // Fetch property details when property is selected
  const {data: propertyDetails, isLoading: propertyLoading} = useQuery({
    queryKey: ["propertyDetails", currentProperty?._id],
    queryFn: () => getPropertyDetails(currentProperty?._id),
    enabled: !!currentProperty?._id,
  });

  // Fetch available rooms for the selected property
  const {data: availableRooms, isLoading: roomsLoading} = useQuery({
    queryKey: ["availableRooms", currentProperty?._id],
    queryFn: () => getAvailableRoomsByProperty(currentProperty?._id),
    enabled: !!currentProperty?._id,
  });

  // Registration mutation
  const registerMutation = useMutation({
    mutationFn: (userData) => registerMonthlyUser(userData),
    onSuccess: (data) => {
      queryClient.invalidateQueries(["monthlyRentUsers"]);
      onCancel();
      messageApi.success({
        content: `${data.message}`,
        duration: 3,
      });
      form.resetFields();
      setCurrentProperty(null);
      setSelectedSharingType("");
      setTotalPayable(0);
      onSuccess?.();
    },
    onError: (error) => {
      messageApi.error(error.message || "Failed to register user");
    },
  });

  // Calculate total payable whenever financial values change
  const calculateTotalPayable = () => {
    const monthlyRent =
      Number(form.getFieldValue(["financialDetails", "monthlyRent"])) || 0;
    const nonRefundableDeposit =
      Number(
        form.getFieldValue(["financialDetails", "nonRefundableDeposit"]),
      ) || 0;
    const refundableDeposit =
      Number(form.getFieldValue(["financialDetails", "refundableDeposit"])) ||
      0;

    const total = monthlyRent + nonRefundableDeposit + refundableDeposit;
    setTotalPayable(total);
    return total;
  };

  // Reset stay details when property changes
  const handlePropertyChange = (propertyId) => {
    if (propertyId) {
      const property = properties.find((p) => p._id === propertyId);
      setCurrentProperty(property);
      // Reset sharing type and room number
      setSelectedSharingType("");
      form.setFieldsValue({
        stayDetails: {
          propertyId: propertyId,
          propertyName: property?.name,
          sharingType: undefined,
          roomNumber: undefined,
          roomId: undefined,
          joinDate: undefined,
        },
        financialDetails: {
          nonRefundableDeposit: undefined,
          refundableDeposit: undefined,
          monthlyRent: undefined,
        },
      });
      setTotalPayable(0);
    } else {
      setCurrentProperty(null);
      setSelectedSharingType("");
      form.setFieldsValue({
        stayDetails: {
          propertyId: undefined,
          propertyName: undefined,
          sharingType: undefined,
          roomNumber: undefined,
          roomId: undefined,
          joinDate: undefined,
        },
        financialDetails: {
          nonRefundableDeposit: undefined,
          refundableDeposit: undefined,
          monthlyRent: undefined,
        },
      });
      setTotalPayable(0);
    }
  };

  // Handle sharing type change
  const handleSharingTypeChange = (sharingType) => {
    setSelectedSharingType(sharingType);

    // Get monthly rent based on selected sharing type
    let monthlyRent = 0;
    if (
      propertyDetails?.sharingPrices &&
      propertyDetails.sharingPrices[sharingType]
    ) {
      monthlyRent = Number(propertyDetails.sharingPrices[sharingType]);
    }

    form.setFieldsValue({
      stayDetails: {
        ...form.getFieldValue("stayDetails"),
        sharingType: sharingType,
        roomNumber: undefined,
        roomId: undefined,
      },
      financialDetails: {
        ...form.getFieldValue("financialDetails"),
        monthlyRent: monthlyRent,
      },
    });

    // Recalculate total after updating monthly rent
    setTimeout(() => calculateTotalPayable(), 0);
  };

  // Handle room selection
  const handleRoomChange = (roomId) => {
    const selectedRoom = getAvailableRoomsForSharingType(
      selectedSharingType,
    )?.find((r) => r._id === roomId);

    if (selectedRoom) {
      form.setFieldsValue({
        stayDetails: {
          ...form.getFieldValue("stayDetails"),
          roomNumber: selectedRoom.roomNo,
          roomId: selectedRoom._id,
        },
      });
    }
  };

  // Handle monthly rent change
  const handleMonthlyRentChange = (e) => {
    const value = e.target.value;
    const numericValue = value === "" ? undefined : Number(value);
    form.setFieldsValue({
      financialDetails: {
        ...form.getFieldValue("financialDetails"),
        monthlyRent: numericValue,
      },
    });
    calculateTotalPayable();
  };

  // Handle non-refundable deposit change
  const handleNonRefundableDepositChange = (e) => {
    const value = e.target.value;
    const numericValue = value === "" ? undefined : Number(value);
    form.setFieldsValue({
      financialDetails: {
        ...form.getFieldValue("financialDetails"),
        nonRefundableDeposit: numericValue,
      },
    });
    calculateTotalPayable();
  };

  // Handle refundable deposit change
  const handleRefundableDepositChange = (e) => {
    const value = e.target.value;
    const numericValue = value === "" ? undefined : Number(value);
    form.setFieldsValue({
      financialDetails: {
        ...form.getFieldValue("financialDetails"),
        refundableDeposit: numericValue,
      },
    });
    calculateTotalPayable();
  };

  // Get unique sharing types from available rooms
  const getUniqueSharingTypes = () => {
    if (!availableRooms?.rooms) return [];

    const sharingTypes = availableRooms.rooms
      .filter((room) => room.vacantSlot > 0)
      .map((room) => room.sharingType);

    return [...new Set(sharingTypes)];
  };

  // Get available rooms for specific sharing type
  const getAvailableRoomsForSharingType = (sharingType) => {
    if (!availableRooms?.rooms || !sharingType) return [];

    return availableRooms.rooms.filter(
      (room) => room.sharingType === sharingType && room.vacantSlot > 0,
    );
  };

  // Get deposit amounts from property
  const getDepositAmounts = () => {
    if (!propertyDetails?.deposit) return {refundable: 0, nonRefundable: 0};
    return {
      refundable: Number(propertyDetails.deposit.refundable) || 0,
      nonRefundable: Number(propertyDetails.deposit.nonRefundable) || 0,
    };
  };

  // Pre-fill financial details when property is loaded
  useEffect(() => {
    if (propertyDetails) {
      const deposits = getDepositAmounts();
      const currentMonthlyRent =
        form.getFieldValue(["financialDetails", "monthlyRent"]) || 0;

      form.setFieldsValue({
        financialDetails: {
          nonRefundableDeposit: deposits.nonRefundable,
          refundableDeposit: deposits.refundable,
          monthlyRent: currentMonthlyRent,
        },
      });

      calculateTotalPayable();
    }
  }, [propertyDetails]);

  // Handle form submission
  // const handleSubmit = async () => {
  //   try {
  //     const values = await form.validateFields();

  //     // Prepare user data
  //     const userData = {
  //       name: values.name,
  //       email: values.email,
  //       contact: values.contact,
  //       password: values.password,
  //       userType: values.userType,
  //       stayDetails: {
  //         propertyId: values.stayDetails?.propertyId,
  //         propertyName: values.stayDetails?.propertyName,
  //         sharingType: values.stayDetails?.sharingType,
  //         roomNumber: values.stayDetails?.roomNumber,
  //         roomId: values.stayDetails?.roomId,
  //         joinDate: values.stayDetails?.joinDate,
  //         monthlyRent: Number(values.financialDetails?.monthlyRent) || 0,
  //         nonRefundableDeposit:
  //           Number(values.financialDetails?.nonRefundableDeposit) || 0,
  //         refundableDeposit:
  //           Number(values.financialDetails?.refundableDeposit) || 0,
  //       },
  //       registeredBy: user?._id,
  //     };

  //     registerMutation.mutate(userData);
  //   } catch (error) {
  //     console.log("Validation failed:", error);
  //   }
  // };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      // Validate all fields across all tabs
      const values = await form.validateFields([
        // Personal tab fields
        "name",
        "email",
        "contact",
        "password",
        "userType",
        // Stay tab fields
        ["stayDetails", "propertyId"],
        ["stayDetails", "sharingType"],
        ["stayDetails", "roomNumber"],
        ["stayDetails", "joinDate"],
        // Financial tab fields
        ["financialDetails", "monthlyRent"],
        ["financialDetails", "nonRefundableDeposit"],
        ["financialDetails", "refundableDeposit"],
      ]);

      // Prepare user data
      const userData = {
        name: values.name,
        email: values.email,
        contact: values.contact,
        password: values.password,
        userType: values.userType,
        stayDetails: {
          propertyId: values.stayDetails?.propertyId,
          propertyName: values.stayDetails?.propertyName,
          sharingType: values.stayDetails?.sharingType,
          roomNumber: values.stayDetails?.roomNumber,
          roomId: values.stayDetails?.roomId,
          joinDate: values.stayDetails?.joinDate,
          monthlyRent: Number(values.financialDetails?.monthlyRent) || 0,
          nonRefundableDeposit:
            Number(values.financialDetails?.nonRefundableDeposit) || 0,
          refundableDeposit:
            Number(values.financialDetails?.refundableDeposit) || 0,
        },
        registeredBy: user?._id,
      };

      registerMutation.mutate(userData);
    } catch (error) {
      console.log("Validation failed:", error);

      // Find which fields have errors
      const errorFields = error.errorFields || [];

      if (errorFields.length > 0) {
        // Get unique tab names where errors occurred
        const tabsWithErrors = new Set();

        errorFields.forEach((field) => {
          const fieldPath = field.name.join(".");
          if (fieldPath.includes("stayDetails")) {
            tabsWithErrors.add("Stay Details");
          } else if (fieldPath.includes("financialDetails")) {
            tabsWithErrors.add("Financial Details");
          } else {
            tabsWithErrors.add("Personal Details");
          }
        });

        const errorTabs = Array.from(tabsWithErrors).join(", ");

        messageApi.error({
          content: `Please fill all required fields in: ${errorTabs}`,
          duration: 4,
        });

        // Switch to the first tab that has an error
        if (tabsWithErrors.has("Personal Details")) {
          setActiveTab("personal");
        } else if (tabsWithErrors.has("Stay Details")) {
          setActiveTab("stay");
        } else if (tabsWithErrors.has("Financial Details")) {
          setActiveTab("financial");
        }
      } else {
        messageApi.error("Please fill all required fields");
      }
    }
  };

  // Handle tab change
  const handleTabChange = (key) => {
    setActiveTab(key);
  };

  // Go to next tab
  const nextTab = async () => {
    try {
      // Validate current tab fields before proceeding
      if (activeTab === "personal") {
        await form.validateFields([
          "name",
          "email",
          "contact",
          "password",
          "userType",
        ]);
      } else if (activeTab === "stay") {
        await form.validateFields([
          ["stayDetails", "propertyId"],
          ["stayDetails", "sharingType"],
          ["stayDetails", "roomNumber"],
        ]);
      }

      const tabOrder = ["personal", "stay", "financial"];
      const currentIndex = tabOrder.indexOf(activeTab);
      if (currentIndex < tabOrder.length - 1) {
        setActiveTab(tabOrder[currentIndex + 1]);
      }
    } catch (error) {
      messageApi.error("Please fill all required fields in current tab");
    }
  };

  // Go to previous tab
  const prevTab = () => {
    const tabOrder = ["personal", "stay", "financial"];
    const currentIndex = tabOrder.indexOf(activeTab);
    if (currentIndex > 0) {
      setActiveTab(tabOrder[currentIndex - 1]);
    }
  };

  const mobileFormItemStyle = isMobile
    ? {
        marginBottom: 8,
      }
    : {};

  return (
    <>
      {contextHolder}
      <Modal
        title="Monthly User Registration"
        open={visible}
        maskClosable={false}
        onCancel={() => {
          form.resetFields();
          setActiveTab("personal");
          setCurrentProperty(null);
          setSelectedSharingType("");
          setTotalPayable(0);
          onCancel();
        }}
        width={800}
        footer={[
          <Button key="cancel" onClick={onCancel}>
            Cancel
          </Button>,
          activeTab !== "personal" && (
            <Button key="prev" onClick={prevTab}>
              Previous
            </Button>
          ),
          activeTab !== "financial" ? (
            <Button key="next" type="primary" onClick={nextTab}>
              Next
            </Button>
          ) : (
            <Button
              key="submit"
              type="primary"
              onClick={handleSubmit}
              loading={registerMutation.isPending}
            >
              Register User
            </Button>
          ),
        ]}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            userType: "student",
          }}
        >
          <Tabs activeKey={activeTab} onChange={handleTabChange} type="card">
            {/* Personal Details Tab */}
            <TabPane tab="Personal Details" key="personal">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="userType"
                    label="User Type"
                    rules={[
                      {required: true, message: "Please select user type"},
                    ]}
                  >
                    <Select placeholder="Select user type">
                      <Option value="student">Student</Option>
                      <Option value="worker">Working Professional</Option>
                    </Select>
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    name="name"
                    label="Full Name"
                    rules={[
                      {required: true, message: "Please enter full name"},
                    ]}
                  >
                    <Input prefix={<UserOutlined />} placeholder="Full Name" />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    name="email"
                    label="Email"
                    rules={[
                      {required: true, message: "Please enter email"},
                      {type: "email", message: "Please enter valid email"},
                    ]}
                  >
                    <Input prefix={<MailOutlined />} placeholder="Email" />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    name="contact"
                    label="Contact Number"
                    rules={[
                      {required: true, message: "Please enter contact number"},
                      {
                        pattern: /^[0-9]{10}$/,
                        message: "Please enter valid 10-digit mobile number",
                      },
                    ]}
                  >
                    <Input
                      prefix={<PhoneOutlined />}
                      placeholder="Contact Number"
                    />
                  </Form.Item>
                </Col>

                <Col span={24}>
                  <Form.Item
                    name="password"
                    label="Password"
                    rules={[
                      {required: true, message: "Please enter password"},
                      {
                        min: 6,
                        message: "Password must be at least 6 characters",
                      },
                    ]}
                  >
                    <Input.Password
                      prefix={<LockOutlined />}
                      placeholder="Password"
                    />
                  </Form.Item>
                </Col>
              </Row>
            </TabPane>

            {/* Stay Details Tab */}
            <TabPane tab="Stay Details" key="stay">
              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item
                    name={["stayDetails", "propertyId"]}
                    label={
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          width: "100%",
                          paddingRight: "8px",
                        }}
                      >
                        <span style={{fontWeight: 500}}>Select Property</span>
                        {currentProperty && propertyDetails?.propertyType && (
                          <div
                            style={{
                              display: "flex",
                              gap: "4px",
                              alignItems: "center",
                            }}
                          >
                            <span
                              style={{
                                color: "#1890ff",
                                fontWeight: 500,
                                backgroundColor: "#e6f7ff",
                                padding: "2px 8px",
                                borderRadius: "4px",
                                fontSize: "12px",
                                marginLeft: "10px",
                              }}
                            >
                              {propertyDetails.propertyType}
                            </span>
                          </div>
                        )}
                      </div>
                    }
                    rules={[
                      {required: true, message: "Please select a property"},
                    ]}
                  >
                    <Select
                      placeholder="Select property"
                      showSearch
                      onChange={handlePropertyChange}
                      optionFilterProp="children"
                      loading={propertyLoading}
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
                </Col>
              </Row>

              {currentProperty && propertyDetails && (
                <>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name={["stayDetails", "sharingType"]}
                        label="Sharing Type"
                        rules={[
                          {
                            required: true,
                            message: "Please select sharing type",
                          },
                        ]}
                        style={mobileFormItemStyle}
                      >
                        <Select
                          placeholder="Select sharing type"
                          onChange={handleSharingTypeChange}
                          loading={roomsLoading}
                          value={selectedSharingType}
                        >
                          {getUniqueSharingTypes().map((sharingType) => (
                            <Option key={sharingType} value={sharingType}>
                              {sharingType}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>

                    <Col span={12}>
                      <Form.Item
                        name={["stayDetails", "roomNumber"]}
                        label="Select Room"
                        rules={[
                          {required: true, message: "Please select a room"},
                        ]}
                        style={mobileFormItemStyle}
                      >
                        <Select
                          disabled={!selectedSharingType}
                          placeholder="Select room number"
                          loading={roomsLoading}
                          onChange={(roomId) => handleRoomChange(roomId)}
                        >
                          {getAvailableRoomsForSharingType(
                            selectedSharingType,
                          )?.map((room) => (
                            <Option key={room._id} value={room._id}>
                              Room {room.roomNo} (Vacant: {room.vacantSlot})
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name={["stayDetails", "joinDate"]}
                        label="Join Date"
                        rules={[
                          {required: true, message: "Please select join date"},
                        ]}
                        style={mobileFormItemStyle}
                      >
                        <DatePicker
                          style={{width: "100%"}}
                          placeholder="Select join date"
                          format="YYYY-MM-DD"
                        />
                      </Form.Item>
                    </Col>

                    <Col span={12}>
                      {/* Optional: You can add another field here if needed, or leave empty */}
                    </Col>
                  </Row>

                  <Col span={24}>
                    <Form.Item
                      name={["stayDetails", "propertyName"]}
                      label="Property Name"
                      hidden
                    >
                      <Input />
                    </Form.Item>
                  </Col>

                  <Col span={24}>
                    <Form.Item
                      name={["stayDetails", "roomId"]}
                      label="Room ID"
                      hidden
                    >
                      <Input />
                    </Form.Item>
                  </Col>
                </>
              )}
            </TabPane>

            {/* Financial Details Tab */}
            <TabPane tab="Financial Details" key="financial">
              {currentProperty && propertyDetails ? (
                <>
                  <Row gutter={16}>
                    <Col span={8}>
                      <Form.Item
                        name={["financialDetails", "monthlyRent"]}
                        label="Monthly Rent"
                        rules={[
                          {
                            required: true,
                            message: "Please enter monthly rent",
                          },
                          {
                            validator: (_, value) => {
                              if (value && value < 0) {
                                return Promise.reject(
                                  "Amount cannot be negative",
                                );
                              }
                              return Promise.resolve();
                            },
                          },
                        ]}
                      >
                        <Input
                          type="number"
                          placeholder="Enter monthly rent"
                          prefix="₹"
                          onChange={handleMonthlyRentChange}
                        />
                      </Form.Item>
                      {!selectedSharingType && (
                        <Text
                          type="warning"
                          style={{
                            fontSize: 12,
                            marginTop: -8,
                            display: "block",
                          }}
                        >
                          * Select sharing type to auto-fill rent
                        </Text>
                      )}
                    </Col>

                    <Col span={8}>
                      <Form.Item
                        name={["financialDetails", "nonRefundableDeposit"]}
                        label="Non-Refundable Deposit"
                        rules={[
                          {
                            required: true,
                            message:
                              "Please enter non-refundable deposit amount",
                          },
                          {
                            validator: (_, value) => {
                              if (value && value < 0) {
                                return Promise.reject(
                                  "Amount cannot be negative",
                                );
                              }
                              return Promise.resolve();
                            },
                          },
                        ]}
                      >
                        <Input
                          type="number"
                          placeholder="Enter amount"
                          prefix="₹"
                          onChange={handleNonRefundableDepositChange}
                        />
                      </Form.Item>
                    </Col>

                    <Col span={8}>
                      <Form.Item
                        name={["financialDetails", "refundableDeposit"]}
                        label="Refundable Deposit"
                        rules={[
                          {
                            required: true,
                            message: "Please enter refundable deposit amount",
                          },
                          {
                            validator: (_, value) => {
                              if (value && value < 0) {
                                return Promise.reject(
                                  "Amount cannot be negative",
                                );
                              }
                              return Promise.resolve();
                            },
                          },
                        ]}
                      >
                        <Input
                          type="number"
                          placeholder="Enter amount"
                          prefix="₹"
                          onChange={handleRefundableDepositChange}
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row>
                    <Col span={24}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "flex-end",
                          alignItems: "center",
                          gap: "16px",
                          padding: "12px 0",
                          borderTop: "1px solid #f0f0f0",
                          marginTop: "8px",
                        }}
                      >
                        <span style={{fontSize: "16px", fontWeight: "500"}}>
                          Total Payable:
                        </span>
                        <span
                          style={{
                            fontSize: "20px",
                            fontWeight: "bold",
                            color: "#1890ff",
                          }}
                        >
                          ₹{totalPayable.toLocaleString("en-IN")}
                        </span>
                      </div>
                    </Col>
                  </Row>
                </>
              ) : (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={<span>Please select a property</span>}
                  ></Empty>
                </div>
              )}
            </TabPane>
          </Tabs>
        </Form>
      </Modal>
    </>
  );
};

export default MonthlyRegistrationModal;
