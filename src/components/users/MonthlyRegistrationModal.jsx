import {useState, useEffect} from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  Row,
  Col,
  Tabs,
  Divider,
  message,
  Upload,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  LockOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import {useQuery, useMutation} from "@tanstack/react-query";
import {useSelector} from "react-redux";
// import {registerMonthlyUser} from "../../hooks/user/useUser.js";
import {getAllHeavensProperties} from "../../hooks/property/useProperty.js";

const {Option} = Select;
const {TabPane} = Tabs;
const {TextArea} = Input;

const MonthlyRegistrationModal = ({visible, onCancel, onSuccess}) => {
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState("personal");
  const [userType, setUserType] = useState("student");
  const [selectedProperty, setSelectedProperty] = useState(null);
  const {user} = useSelector((state) => state.auth);
  const [messageApi, contextHolder] = message.useMessage();

  // Fetch properties for dropdown
  const {data: properties, isLoading: propertiesLoading} = useQuery({
    queryKey: ["properties"],
    queryFn: getAllHeavensProperties,
    enabled: visible,
  });

  // Registration mutation
  const registerMutation = useMutation({
    mutationFn: (userData) => registerMonthlyUser(userData),
    onSuccess: (data) => {
      messageApi.success("User registered successfully");
      form.resetFields();
      setActiveTab("personal");
      onSuccess?.();
    },
    onError: (error) => {
      messageApi.error(error.message || "Failed to register user");
    },
  });

  // Watch user type to conditionally show/hide fields
  useEffect(() => {
    const type = form.getFieldValue("userType");
    setUserType(type || "student");
  }, [form]);

  // Handle property selection
  const handlePropertyChange = (value, option) => {
    setSelectedProperty(option?.property);
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      // Format dates
      if (values.personalDetails?.dob) {
        values.personalDetails.dob =
          values.personalDetails.dob.format("YYYY-MM-DD");
      }

      // Prepare user data
      const userData = {
        name: values.name,
        email: values.email,
        password: values.password,
        userType: values.userType,
        personalDetails: values.personalDetails,
        stayDetails: {
          propertyId: values.stayDetails?.propertyId,
          propertyName: values.stayDetails?.propertyName,
          sharingType: values.stayDetails?.sharingType,
          roomNumber: values.stayDetails?.roomNumber,
          nonRefundableDeposit: values.stayDetails?.nonRefundableDeposit,
          refundableDeposit: values.stayDetails?.refundableDeposit,
        },
        registeredBy: user?._id,
      };

      // Add conditional fields based on user type
      if (values.userType === "student") {
        userData.studyDetails = values.studyDetails;
        userData.parentsDetails = values.parentsDetails;
      } else if (values.userType === "worker") {
        userData.workingDetails = values.workingDetails;
      }

      // Add coliving partner if provided
      if (values.colivingPartner?.name) {
        userData.colivingPartner = values.colivingPartner;
      }

      registerMutation.mutate(userData);
    } catch (error) {
      console.log("Validation failed:", error);
    }
  };

  // Handle tab change
  const handleTabChange = (key) => {
    setActiveTab(key);
  };

  // Go to next tab
  const nextTab = () => {
    const tabOrder = ["personal", "stay", "documents"];
    const currentIndex = tabOrder.indexOf(activeTab);
    if (currentIndex < tabOrder.length - 1) {
      setActiveTab(tabOrder[currentIndex + 1]);
    }
  };

  // Go to previous tab
  const prevTab = () => {
    const tabOrder = ["personal", "stay", "documents"];
    const currentIndex = tabOrder.indexOf(activeTab);
    if (currentIndex > 0) {
      setActiveTab(tabOrder[currentIndex - 1]);
    }
  };

  // Upload props for file uploads
  const uploadProps = {
    beforeUpload: (file) => {
      const isImage = file.type.startsWith("image/");
      if (!isImage) {
        messageApi.error("You can only upload image files!");
      }
      return false; // Prevent auto upload
    },
    maxCount: 1,
  };

  return (
    <>
      {contextHolder}
      <Modal
        title="Monthly User Registration"
        open={visible}
        onCancel={() => {
          form.resetFields();
          setActiveTab("personal");
          onCancel();
        }}
        width={800}
        footer={[
          <Button key="back" onClick={() => form.resetFields()}>
            Reset
          </Button>,
          <Button key="cancel" onClick={onCancel}>
            Cancel
          </Button>,
          activeTab !== "personal" && (
            <Button key="prev" onClick={prevTab}>
              Previous
            </Button>
          ),
          activeTab !== "documents" ? (
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
                {/* Property Selection - Only if not already selected */}
                {!selectedProperty && (
                  <Col span={24}>
                    <Form.Item
                      name="propertyId"
                      label="Select Property"
                      rules={[
                        {
                          required: true,
                          message: "Please select a property",
                        },
                      ]}
                    >
                      <Select
                        placeholder="Select property"
                        loading={propertiesLoading}
                        onChange={handlePropertyChange}
                        showSearch
                        optionFilterProp="children"
                      >
                        {properties?.map((prop) => (
                          <Option
                            key={prop._id}
                            value={prop._id}
                            property={prop}
                          >
                            {prop.propertyName}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                )}

                <Col span={12}>
                  <Form.Item
                    name="userType"
                    label="User Type"
                    rules={[
                      {required: true, message: "Please select user type"},
                    ]}
                  >
                    <Select
                      placeholder="Select user type"
                      onChange={(value) => setUserType(value)}
                    >
                      <Option value="student">Student</Option>
                      <Option value="worker">Worker</Option>
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

                <Divider orientation="left">Personal Details</Divider>

                <Col span={8}>
                  <Form.Item
                    name={["personalDetails", "address"]}
                    label="Address"
                  >
                    <TextArea placeholder="Address" rows={2} />
                  </Form.Item>
                </Col>

                <Col span={8}>
                  <Form.Item
                    name={["personalDetails", "dob"]}
                    label="Date of Birth"
                  >
                    <DatePicker style={{width: "100%"}} format="YYYY-MM-DD" />
                  </Form.Item>
                </Col>

                <Col span={8}>
                  <Form.Item
                    name={["personalDetails", "gender"]}
                    label="Gender"
                  >
                    <Select placeholder="Select gender">
                      <Option value="male">Male</Option>
                      <Option value="female">Female</Option>
                      <Option value="other">Other</Option>
                    </Select>
                  </Form.Item>
                </Col>

                <Col span={8}>
                  <Form.Item
                    label="Profile Image"
                    name={["personalDetails", "profileImg"]}
                  >
                    <Upload {...uploadProps} listType="picture">
                      <Button icon={<UploadOutlined />}>Upload</Button>
                    </Upload>
                  </Form.Item>
                </Col>

                <Col span={8}>
                  <Form.Item
                    label="Aadhar Front"
                    name={["personalDetails", "aadharFront"]}
                  >
                    <Upload {...uploadProps} listType="picture">
                      <Button icon={<UploadOutlined />}>Upload</Button>
                    </Upload>
                  </Form.Item>
                </Col>

                <Col span={8}>
                  <Form.Item
                    label="Aadhar Back"
                    name={["personalDetails", "aadharBack"]}
                  >
                    <Upload {...uploadProps} listType="picture">
                      <Button icon={<UploadOutlined />}>Upload</Button>
                    </Upload>
                  </Form.Item>
                </Col>
              </Row>

              {/* Conditional sections based on user type */}
              {userType === "student" && (
                <>
                  <Divider orientation="left">Parents Details</Divider>
                  <Row gutter={16}>
                    <Col span={8}>
                      <Form.Item
                        name={["parentsDetails", "name"]}
                        label="Parent Name"
                      >
                        <Input placeholder="Parent's full name" />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        name={["parentsDetails", "email"]}
                        label="Parent Email"
                        rules={[{type: "email", message: "Invalid email"}]}
                      >
                        <Input placeholder="Parent's email" />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        name={["parentsDetails", "contact"]}
                        label="Parent Contact"
                      >
                        <Input placeholder="Parent's contact number" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name={["parentsDetails", "occupation"]}
                        label="Parent Occupation"
                      >
                        <Input placeholder="Parent's occupation" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name={["parentsDetails", "address"]}
                        label="Parent Address"
                      >
                        <Input placeholder="Parent's address" />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Divider orientation="left">Study Details</Divider>
                  <Row gutter={16}>
                    <Col span={8}>
                      <Form.Item
                        name={["studyDetails", "course"]}
                        label="Course"
                      >
                        <Input placeholder="Course name" />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        name={["studyDetails", "yearOfStudy"]}
                        label="Year of Study"
                      >
                        <Select placeholder="Select year">
                          <Option value="1st">1st Year</Option>
                          <Option value="2nd">2nd Year</Option>
                          <Option value="3rd">3rd Year</Option>
                          <Option value="4th">4th Year</Option>
                          <Option value="5th">5th Year</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        name={["studyDetails", "institution"]}
                        label="Institution"
                      >
                        <Input placeholder="College/University name" />
                      </Form.Item>
                    </Col>
                  </Row>
                </>
              )}

              {userType === "worker" && (
                <>
                  <Divider orientation="left">Working Details</Divider>
                  <Row gutter={16}>
                    <Col span={8}>
                      <Form.Item
                        name={["workingDetails", "jobTitle"]}
                        label="Job Title"
                      >
                        <Input placeholder="Job title" />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        name={["workingDetails", "companyName"]}
                        label="Company Name"
                      >
                        <Input placeholder="Company name" />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        name={["workingDetails", "location"]}
                        label="Work Location"
                      >
                        <Input placeholder="Work location" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name={["workingDetails", "emergencyContact"]}
                        label="Emergency Contact"
                      >
                        <Input placeholder="Emergency contact number" />
                      </Form.Item>
                    </Col>
                  </Row>
                </>
              )}
            </TabPane>

            {/* Stay Details Tab */}
            <TabPane tab="Stay Details" key="stay">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name={["stayDetails", "propertyId"]}
                    label="Property ID"
                    hidden
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item
                    name={["stayDetails", "propertyName"]}
                    label="Property Name"
                  >
                    <Input placeholder="Property name" disabled />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name={["stayDetails", "sharingType"]}
                    label="Sharing Type"
                    rules={[
                      {required: true, message: "Please select sharing type"},
                    ]}
                  >
                    <Select placeholder="Select sharing type">
                      <Option value="Private">Private</Option>
                      <Option value="2 Sharing">2 Sharing</Option>
                      <Option value="3 Sharing">3 Sharing</Option>
                      <Option value="4 Sharing">4 Sharing</Option>
                      <Option value="Co-Living">Co-Living</Option>
                    </Select>
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    name={["stayDetails", "roomNumber"]}
                    label="Room Number"
                  >
                    <Input placeholder="Room number" />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    name={["stayDetails", "roomId"]}
                    label="Room ID"
                    hidden
                  >
                    <Input />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    name={["stayDetails", "nonRefundableDeposit"]}
                    label="Non-Refundable Deposit"
                  >
                    <Input type="number" placeholder="Amount" />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    name={["stayDetails", "refundableDeposit"]}
                    label="Refundable Deposit"
                  >
                    <Input type="number" placeholder="Amount" />
                  </Form.Item>
                </Col>
              </Row>
            </TabPane>

            {/* Documents Tab */}
            <TabPane tab="Documents & Co-living" key="documents">
              <Divider orientation="left">Co-living Partner (Optional)</Divider>
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item
                    name={["colivingPartner", "name"]}
                    label="Partner Name"
                  >
                    <Input placeholder="Partner's full name" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name={["colivingPartner", "contact"]}
                    label="Contact"
                  >
                    <Input placeholder="Partner's contact" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name={["colivingPartner", "email"]}
                    label="Email"
                    rules={[{type: "email", message: "Invalid email"}]}
                  >
                    <Input placeholder="Partner's email" />
                  </Form.Item>
                </Col>

                <Col span={8}>
                  <Form.Item
                    name={["colivingPartner", "relation"]}
                    label="Relation"
                  >
                    <Input placeholder="Relation (friend, spouse, etc.)" />
                  </Form.Item>
                </Col>

                <Col span={8}>
                  <Form.Item
                    label="Partner Profile"
                    name={["colivingPartner", "profileImg"]}
                  >
                    <Upload {...uploadProps} listType="picture">
                      <Button icon={<UploadOutlined />}>Upload</Button>
                    </Upload>
                  </Form.Item>
                </Col>

                <Col span={8}>
                  <Form.Item
                    label="Partner Aadhar Front"
                    name={["colivingPartner", "aadharFront"]}
                  >
                    <Upload {...uploadProps} listType="picture">
                      <Button icon={<UploadOutlined />}>Upload</Button>
                    </Upload>
                  </Form.Item>
                </Col>

                <Col span={8}>
                  <Form.Item
                    label="Partner Aadhar Back"
                    name={["colivingPartner", "aadharBack"]}
                  >
                    <Upload {...uploadProps} listType="picture">
                      <Button icon={<UploadOutlined />}>Upload</Button>
                    </Upload>
                  </Form.Item>
                </Col>
              </Row>
            </TabPane>
          </Tabs>
        </Form>
      </Modal>
    </>
  );
};

export default MonthlyRegistrationModal;
