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
  Statistic,
  message,
} from "antd";
import {HomeOutlined} from "@ant-design/icons";
import {useState, useEffect} from "react";
import dayjs from "dayjs";
import {useSelector} from "react-redux";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {getAvailableRoomsByProperty} from "../../hooks/property/useProperty";
import {registerResident} from "../../hooks/users/useUser";
import {useWatch} from "antd/es/form/Form";

const {Option} = Select;

const RegistrationModal = ({visible, onCancel, rentType}) => {
  const {properties, selectedProperty} = useSelector(
    (state) => state.properties
  );
  const [currentCategoryType, setCurrentCategoryType] = useState("");
  const [currentProperty, setCurrentProperty] = useState(selectedProperty);
  const [form] = Form.useForm();
  const [totalDays, setTotalDays] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [dailyRent, setDailyRent] = useState(0);
  const [messDays, setMessDays] = useState(0);
  const [selectedSharingType, setSelectedSharingType] = useState("");

  const [messageApi, contextHolder] = message.useMessage();
  const queryClient = useQueryClient();

  const {data: availableRooms} = useQuery({
    queryKey: ["availableRooms", selectedProperty?.id || currentProperty?._id],
    queryFn: ({queryKey}) => {
      const [, propertyId] = queryKey;
      return getAvailableRoomsByProperty(propertyId);
    },
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
      setSelectedSharingType("");

      // Optional: Show success message
      messageApi.success({
        content: `${data.message}`,
        duration: 3,
      });
    },
    onError: (error) => {
      console.log("Registration failed:", error);
      // Optional: Show error message
      messageApi.error({
        content: `${error.details}`,
        duration: 3,
      });
    },
  });

  // Calculate total days and amount when dates or daily rent change for daily rent
  useEffect(() => {
    if (rentType === "daily") {
      const checkIn = form.getFieldValue("checkIn");
      const checkOut = form.getFieldValue("checkOut");
      const rentPerDay = form.getFieldValue("dailyRent") || 0;

      console.log("CheckIn:", checkIn);
      console.log("CheckOut:", checkOut);
      console.log("RentPerDay:", rentPerDay);

      if (checkIn && checkOut && rentPerDay > 0) {
        const days = checkOut.diff(checkIn, "days");
        console.log("Calculated Days:", days);
        setTotalDays(days > 0 ? days : 0);
        setTotalAmount(days > 0 ? days * rentPerDay : 0);
      } else {
        setTotalDays(0);
        setTotalAmount(0);
      }
    }
  }, [
    form,
    dailyRent,
    rentType,
    form.getFieldValue("checkIn"),
    form.getFieldValue("checkOut"),
  ]);

  // Calculate mess days when mess dates change
  useEffect(() => {
    if (rentType === "mess") {
      const messStartDate = form.getFieldValue("messStartDate");
      const messEndDate = form.getFieldValue("messEndDate");

      if (messStartDate && messEndDate) {
        const days = messEndDate.diff(messStartDate, "days");
        setMessDays(days > 0 ? days : 0);
      } else {
        setMessDays(0);
      }
    }
  }, [
    form,
    rentType,
    form.getFieldValue("messStartDate"),
    form.getFieldValue("messEndDate"),
  ]);

  const handleCancel = () => {
    form.resetFields();
    setTotalDays(0);
    setTotalAmount(0);
    setDailyRent(0);
    setMessDays(0);
    setSelectedSharingType("");

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
        // Get selected room details
        const selectedRoomDetails = getAvailableRoomsForSharingType(
          selectedSharingType
        ).find((room) => room.roomNo === values.roomNumber);

        // Transform form values based on rentType
        const submitData = {
          userType: userType,
          name: values.name,
          email: values.email,
          contact: values.contact,
          password: "Nikhil@123",

          // Dynamic key: messDetails or stayDetails
          [rentType === "mess" ? "messDetails" : "stayDetails"]: {
            ...(rentType === "mess"
              ? {
                  messStartDate: values.messStartDate?.toISOString(),
                  messEndDate: values.messEndDate?.toISOString(),
                  noOfDays: messDays,
                  rent: values.ratePerDay,
                }
              : {
                  checkInDate: values.checkIn?.toISOString(),
                  checkOutDate: values.checkOut?.toISOString(),
                  noOfDays: totalDays,
                  dailyRent: Number(values.dailyRent),
                  sharingType: values.sharingType,
                  propertyId: selectedProperty.id || currentProperty._id,
                  propertyName: (
                    selectedProperty.name || currentProperty.name
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
  };

  // Handle sharing type change
  const handleSharingTypeChange = (sharingType) => {
    setSelectedSharingType(sharingType);
    // Reset room number when sharing type changes
    form.setFieldsValue({roomNumber: undefined});
  };

  const handleMessDateChange = () => {
    if (rentType === "mess") {
      const messStartDate = form.getFieldValue("messStartDate");
      const messEndDate = form.getFieldValue("messEndDate");

      if (messStartDate && messEndDate) {
        const days = messEndDate.diff(messStartDate, "days");
        setMessDays(days > 0 ? days : 0);
      } else {
        setMessDays(0);
      }
    }
  };

  const disabledCheckOutDate = (current) => {
    const checkIn = form.getFieldValue("checkIn");
    if (!checkIn) {
      return false; // Allow all dates when no check-in is selected
    }
    return current && current < dayjs(checkIn).startOf("day");
  };

  const checkIn = useWatch("checkIn", form);
  const checkOut = useWatch("checkOut", form);
  const rent = useWatch("dailyRent", form);

  useEffect(() => {
    console.log("useEffect triggered with:", {
      checkIn,
      checkOut,
      rent,
      rentType,
    });

    if (rentType === "daily") {
      const rentPerDay = rent || 0;

      if (checkIn && checkOut && rentPerDay > 0) {
        // Ensure we're comparing dates without time components
        const start = dayjs(checkIn).startOf("day");
        const end = dayjs(checkOut).startOf("day");

        const days = end.diff(start, "day") + 1;
        console.log(
          "Calculated days:",
          days,
          "from",
          start.format("DD/MM/YYYY"),
          "to",
          end.format("DD/MM/YYYY")
        );

        setTotalDays(days > 0 ? days : 0);
        setTotalAmount(days > 0 ? days * rentPerDay : 0);
      } else {
        setTotalDays(0);
        setTotalAmount(0);
      }
    }
  }, [checkIn, checkOut, rent, rentType]);

  const handlePropertyChange = (propertyId) => {
    if (propertyId) {
      const property = properties.find((p) => p._id === propertyId);
      setCurrentProperty(property);
      form.setFieldsValue({handler: undefined});
      form.setFieldsValue({kitchenId: undefined});
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

  // Check if a property is selected
  const hasSelectedProperty = selectedProperty && selectedProperty.id;

  // Clean the property name by removing "Heavens Living - " prefix
  const cleanPropertyName =
    currentProperty?.name?.replace(/^Heavens Living -\s*/, "") || "";

  // Build modal title
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

  // Get unique sharing types from available rooms for daily rent
  const getUniqueSharingTypes = () => {
    if (!availableRooms?.rooms || rentType !== "daily") return [];

    const sharingTypes = availableRooms.rooms
      .filter((room) => room.vacantSlot > 0)
      .map((room) => room.sharingType);

    return [...new Set(sharingTypes)];
  };

  // Get available rooms for selected sharing type
  const getAvailableRoomsForSharingType = (sharingType) => {
    if (!availableRooms?.rooms || !sharingType) return [];

    return availableRooms.rooms.filter(
      (room) => room.sharingType === sharingType && room.vacantSlot > 0
    );
  };

  return (
    <>
      {contextHolder}
      <Modal
        centered
        maskClosable={false}
        title={
          <div style={{display: "flex", alignItems: "center", gap: 8}}>
            {getModalTitle()}
          </div>
        }
        open={visible}
        onCancel={handleCancel}
        footer={[
          <Button key="cancel" onClick={handleCancel}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" onClick={handleOk}>
            Register
          </Button>,
        ]}
        destroyOnClose
        width={800}
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
        >
          {/* Basic Information */}
          <div style={{marginBottom: 16}}>
            <h3>Basic Information</h3>
          </div>
          <Row gutter={[16, 16]}>
            {/* Full Name */}
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                label="Full Name"
                name="name"
                rules={[
                  {required: true, message: "Please enter the full name"},
                ]}
              >
                <Input placeholder="Enter full name" />
              </Form.Item>
            </Col>

            {/* Email */}
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                label="Email"
                name="email"
                rules={[{type: "email", message: "Please enter a valid email"}]}
              >
                <Input placeholder="Enter email address" />
              </Form.Item>
            </Col>

            {/* Contact Number */}
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                label="Contact Number"
                name="contact"
                rules={[
                  {required: true, message: "Please enter contact number"},
                ]}
              >
                <Input placeholder="Enter contact number" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            {/* Gender Field */}
            <Col span={12}>
              <Form.Item
                label="Gender"
                name="gender"
                rules={[{required: true, message: "Please select gender"}]}
              >
                <Select placeholder="Select gender">
                  <Option value="Male">Male</Option>
                  <Option value="Female">Female</Option>
                  <Option value="Other">Other</Option>
                </Select>
              </Form.Item>
            </Col>

            {/* Address Field (now in same row as Gender) */}
            <Col span={12}>
              <Form.Item label="Address" name="address">
                <Input placeholder="Enter complete address" />
              </Form.Item>
            </Col>
          </Row>
          {/* Property Selection for Mess Category when no property is selected */}
          {/* {!hasSelectedProperty && (
            <Card size="small" style={{marginBottom: 16}}>
              <Form.Item
                label="Select Property"
                name="propertyId"
                rules={[{required: true, message: "Please select a property"}]}
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
          )} */}
          {/* Stay Details for Daily Rent */}
          {rentType === "daily" && (
            <>
              <div style={{marginBottom: 16, marginTop: 24}}>
                <h3>Stay Details</h3>
              </div>
              {/* Property Selection for Mess Category when no property is selected */}
              {!hasSelectedProperty && (
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
              <Row gutter={16}>
                {/* Sharing Type */}
                <Col span={12}>
                  <Form.Item
                    label="Sharing Type"
                    name="sharingType"
                    rules={[
                      {required: true, message: "Please select sharing type"},
                    ]}
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
                {/* Select Room — only show if sharing type is selected */}
                <Col span={12}>
                  <Form.Item
                    label="Select Room"
                    name="roomNumber"
                    rules={[{required: true, message: "Please select a room"}]}
                  >
                    <Select
                      disabled={!selectedSharingType}
                      placeholder="Select room number"
                      // onChange={handleRoomNumberChange}
                    >
                      {getAvailableRoomsForSharingType(selectedSharingType).map(
                        (room) => (
                          <Option key={room._id} value={room.roomNo}>
                            {room.roomNo} (Vacant: {room.vacantSlot})
                          </Option>
                        )
                      )}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                {/* Rent/Day */}
                <Col span={8}>
                  <Form.Item
                    label="Rent/Day"
                    name="dailyRent"
                    rules={[
                      {
                        required: true,
                        message: "Please enter rent per day",
                      },
                    ]}
                  >
                    <Input
                      type="number"
                      placeholder="Enter rent per day"
                      onChange={handleDailyRentChange}
                    />
                  </Form.Item>
                </Col>

                {/* Check-In Date */}
                <Col span={8}>
                  <Form.Item
                    label="Check-In Date"
                    name="checkIn"
                    rules={[
                      {required: true, message: "Please select check-in date"},
                    ]}
                  >
                    <DatePicker style={{width: "100%"}} format="DD/MM/YYYY" />
                  </Form.Item>
                </Col>

                {/* Check-Out Date */}
                <Col span={8}>
                  <Form.Item
                    label="Check-Out Date"
                    name="checkOut"
                    rules={[
                      {required: true, message: "Please select check-out date"},
                    ]}
                  >
                    <DatePicker
                      style={{width: "100%"}}
                      format="DD/MM/YYYY"
                      disabledDate={disabledCheckOutDate}
                    />
                  </Form.Item>
                </Col>
              </Row>

              {/* Total Days and Amount Calculation for Daily Rent */}
              {(totalDays > 0 || totalAmount > 0) && (
                <Row gutter={16} style={{marginBottom: 16}}>
                  <Col span={12}>
                    <Card size="small">
                      <Statistic
                        title="Total Days"
                        value={totalDays}
                        valueStyle={{color: "#3f8600"}}
                      />
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card size="small">
                      <Statistic
                        title="Total Amount"
                        value={totalAmount}
                        precision={2}
                        prefix="₹"
                        valueStyle={{color: "#cf1322"}}
                      />
                    </Card>
                  </Col>
                </Row>
              )}
            </>
          )}
          {/* Mess Details for Mess Rent */}
          {rentType === "mess" && (
            <>
              <div style={{marginBottom: 16, marginTop: 24}}>
                <h3>Mess Details</h3>
              </div>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="Rate/Day"
                    name="ratePerDay"
                    rules={[
                      {
                        required: true,
                        message: "Please enter rate per day",
                      },
                    ]}
                  >
                    <Input type="number" placeholder="Enter rate per day" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="Mess Start Date"
                    name="messStartDate"
                    rules={[
                      {
                        required: true,
                        message: "Please select mess start date",
                      },
                    ]}
                  >
                    <DatePicker style={{width: "100%"}} format="DD/MM/YYYY" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Mess End Date"
                    name="messEndDate"
                    rules={[
                      {required: true, message: "Please select mess end date"},
                    ]}
                  >
                    <DatePicker
                      style={{width: "100%"}}
                      format="DD/MM/YYYY"
                      disabledDate={handleMessDateChange}
                    />
                  </Form.Item>
                </Col>
              </Row>

              {/* Mess Days Calculation */}
              {messDays > 0 && (
                <Row gutter={16} style={{marginBottom: 16}}>
                  <Col span={12}>
                    <Card size="small">
                      <Statistic
                        title="Total Mess Days"
                        value={messDays}
                        valueStyle={{color: "#3f8600"}}
                      />
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card size="small">
                      <Statistic
                        title="Total Mess Amount"
                        value={
                          messDays * (form.getFieldValue("ratePerDay") || 0)
                        }
                        precision={2}
                        prefix="₹"
                        valueStyle={{color: "#cf1322"}}
                      />
                    </Card>
                  </Col>
                </Row>
              )}
            </>
          )}

          {/* <div style={{marginBottom: 16, marginTop: 24}}>
            <h3>Personal Details</h3>
          </div>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Gender"
                name="gender"
                rules={[{required: true, message: "Please select gender"}]}
              >
                <Select placeholder="Select gender">
                  <Option value="Male">Male</Option>
                  <Option value="Female">Female</Option>
                  <Option value="Other">Other</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label="Address" name="address">
                <Input placeholder="Enter complete address" />
              </Form.Item>
            </Col>
          </Row> */}
        </Form>
      </Modal>
    </>
  );
};

export default RegistrationModal;
