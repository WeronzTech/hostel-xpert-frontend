import {useState} from "react";
import {useNavigate} from "react-router-dom";
import {validateRegistrationForm} from "../../utils/validator.js";
import {registerClient} from "../../hooks/client/useClient.js";
import {
  Card,
  Form,
  Input,
  Button,
  Alert,
  Typography,
  Row,
  Col,
  Select,
  Divider,
  message,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  LockOutlined,
  HomeOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";

const {Title, Paragraph, Text} = Typography;
const {Option} = Select;

const AdminRegistration = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [messageApi, contextHolder] = message.useMessage();

  const initialValues = {
    companyName: "",
    primaryAdmin: {
      name: "",
      email: "",
      phone: "",
      password: "",
    },
    address: {
      street: "",
      city: "",
      state: "",
      country: "India",
      zipCode: "",
    },
  };

  const handleSubmit = async (values) => {
    setErrorMsg("");
    setLoading(true);

    // Frontend validation
    const validationErrors = validateRegistrationForm(values);
    if (validationErrors.length > 0) {
      setErrorMsg(validationErrors.join("\n"));
      setLoading(false);
      return;
    }

    try {
      const response = await registerClient(values);
      console.log("Registration Success:", response);
      messageApi.success(response?.data?.message || "Registration Success");

      if (response.success) {
        navigate("/login", {
          state: {
            email: values.primaryAdmin.email,
            password: values.primaryAdmin.password,
          },
        });
      } else {
        console.log(response);
        setErrorMsg(response.message || "Registration completed with warnings");
      }
    } catch (err) {
      console.error("Registration Error:", err);

      let errorMessage = "Registration failed. Please try again.";

      if (err.details) {
        console.log(err.details);
        if (Array.isArray(err.details)) {
          errorMessage = err.details.join("\n");
        } else if (typeof err.details === "object") {
          errorMessage = Object.values(err.details).flat().join("\n");
        } else {
          errorMessage = err.details;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      console.log(errorMessage);
      setErrorMsg(err?.details?.message);
      window.scrollTo({top: 0, behavior: "smooth"});
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      {contextHolder}
      <Card
        className="w-full max-w-4xl shadow-lg rounded-2xl overflow-hidden"
        bordered={false}
        styles={{
          body: {padding: 0},
        }}
      >
        {/* Header */}
        <div
          className="bg-gradient-to-r from-[#059669] to-[#059669] p-6 text-white"
          style={{
            background: "linear-gradient(to right, #059669, #059669)",
          }}
        >
          <Title level={3} style={{color: "white", margin: 0}}>
            Admin Registration
          </Title>
          <Paragraph style={{color: "#e0e7ff", margin: "0.25rem 0 0 0"}}>
            Create your organization's admin account
          </Paragraph>
        </div>

        <div className="p-6 sm:p-8">
          <Form
            form={form}
            name="registration-form"
            initialValues={initialValues}
            onFinish={handleSubmit}
            layout="vertical"
            size="large"
          >
            {/* Error Message */}
            {errorMsg && (
              <Alert
                message={<div style={{whiteSpace: "pre-line"}}>{errorMsg}</div>}
                type="error"
                showIcon
                style={{marginBottom: "24px", borderRadius: "8px"}}
                closable
                onClose={() => setErrorMsg("")}
              />
            )}

            {/* Company Information */}
            <div style={{marginBottom: "32px"}}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "24px",
                  paddingBottom: "12px",
                  borderBottom: "2px solid #e5e7eb",
                }}
              >
                <HomeOutlined
                  style={{
                    color: "#059669",
                    marginRight: "12px",
                    fontSize: "18px",
                  }}
                />
                <Title level={4} style={{margin: 0, color: "#1f2937"}}>
                  Company Information
                </Title>
              </div>
              <Form.Item
                label="Company Name"
                name="companyName"
                rules={[{required: true, message: "Please enter company name"}]}
                style={{marginBottom: "16px"}}
              >
                <Input
                  prefix={<HomeOutlined style={{color: "#9ca3af"}} />}
                  placeholder="Enter company/organization name"
                  style={{borderRadius: "8px"}}
                />
              </Form.Item>
            </div>

            <Row gutter={[24, 0]}>
              {/* Primary Admin Section */}
              <Col xs={24} md={12}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "24px",
                    paddingBottom: "12px",
                    borderBottom: "2px solid #e5e7eb",
                  }}
                >
                  <UserOutlined
                    style={{
                      color: "#059669",
                      marginRight: "12px",
                      fontSize: "18px",
                    }}
                  />
                  <Title level={4} style={{margin: 0, color: "#1f2937"}}>
                    Primary Admin
                  </Title>
                </div>

                <Form.Item
                  label="Full Name"
                  name={["primaryAdmin", "name"]}
                  rules={[{required: true, message: "Please enter admin name"}]}
                  style={{marginBottom: "16px"}}
                >
                  <Input
                    prefix={<UserOutlined style={{color: "#9ca3af"}} />}
                    placeholder="Admin's full name"
                    style={{borderRadius: "8px"}}
                  />
                </Form.Item>

                <Form.Item
                  label="Email"
                  name={["primaryAdmin", "email"]}
                  rules={[
                    {required: true, message: "Please enter email"},
                    {type: "email", message: "Please enter valid email"},
                  ]}
                  style={{marginBottom: "16px"}}
                >
                  <Input
                    prefix={<MailOutlined style={{color: "#9ca3af"}} />}
                    placeholder="official@company.com"
                    style={{borderRadius: "8px"}}
                  />
                </Form.Item>

                <Form.Item
                  label="Phone"
                  name={["primaryAdmin", "phone"]}
                  rules={[
                    {required: true, message: "Please enter phone number"},
                  ]}
                  style={{marginBottom: "16px"}}
                >
                  <Input
                    prefix={<PhoneOutlined style={{color: "#9ca3af"}} />}
                    placeholder="Please enter phone number"
                    style={{borderRadius: "8px"}}
                  />
                </Form.Item>

                <Form.Item
                  label="Password"
                  name={["primaryAdmin", "password"]}
                  rules={[
                    {required: true, message: "Please enter password"},
                    {min: 6, message: "Minimum 6 characters"},
                  ]}
                  style={{marginBottom: "8px"}}
                >
                  <Input.Password
                    prefix={<LockOutlined style={{color: "#9ca3af"}} />}
                    placeholder="••••••••"
                    style={{borderRadius: "8px"}}
                    visibilityToggle={{
                      visible: showPassword,
                      onVisibleChange: setShowPassword,
                    }}
                  />
                </Form.Item>
                <Text
                  type="secondary"
                  style={{
                    fontSize: "12px",
                    display: "block",
                    marginBottom: "24px",
                  }}
                >
                  Min 6 chars, incl. 1 number, uppercase & special character
                </Text>
              </Col>

              {/* Address Information Section */}
              <Col xs={24} md={12}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "24px",
                    paddingBottom: "12px",
                    borderBottom: "2px solid #e5e7eb",
                  }}
                >
                  <EnvironmentOutlined
                    style={{
                      color: "#059669",
                      marginRight: "12px",
                      fontSize: "18px",
                    }}
                  />
                  <Title level={4} style={{margin: 0, color: "#1f2937"}}>
                    Company Address
                  </Title>
                </div>

                <Form.Item
                  label="Street"
                  name={["address", "street"]}
                  rules={[
                    {required: true, message: "Please enter street address"},
                  ]}
                  style={{marginBottom: "16px"}}
                >
                  <Input
                    prefix={<EnvironmentOutlined style={{color: "#9ca3af"}} />}
                    placeholder="Street address"
                    style={{borderRadius: "8px"}}
                  />
                </Form.Item>

                <Row gutter={16} style={{marginBottom: "16px"}}>
                  <Col span={12}>
                    <Form.Item
                      label="City"
                      name={["address", "city"]}
                      rules={[{required: true, message: "Please enter city"}]}
                      style={{marginBottom: 0}}
                    >
                      <Input placeholder="City" style={{borderRadius: "8px"}} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label="State"
                      name={["address", "state"]}
                      rules={[{required: true, message: "Please enter state"}]}
                      style={{marginBottom: 0}}
                    >
                      <Input
                        placeholder="State/Province"
                        style={{borderRadius: "8px"}}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      label="Country"
                      name={["address", "country"]}
                      rules={[
                        {required: true, message: "Please select country"},
                      ]}
                      style={{marginBottom: 0}}
                    >
                      <Select
                        placeholder="Select country"
                        style={{borderRadius: "8px"}}
                      >
                        <Option value="India">India</Option>
                        <Option value="Other">Other</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label="ZIP Code"
                      name={["address", "zipCode"]}
                      rules={[
                        {required: true, message: "Please enter ZIP code"},
                      ]}
                      style={{marginBottom: 0}}
                    >
                      <Input
                        placeholder="Postal/ZIP code"
                        style={{borderRadius: "8px"}}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Col>
            </Row>

            {/* Form Actions */}
            <Divider style={{margin: "32px 0 24px 0"}} />

            <div className="flex flex-col-reverse sm:flex-row sm:justify-between items-center gap-4">
              <Text style={{color: "#6b7280", textAlign: "center"}}>
                Already have an account?{" "}
                <Button
                  type="link"
                  onClick={() => navigate("/login")}
                  style={{
                    color: "#059669",
                    padding: 0,
                    height: "auto",
                    fontWeight: 500,
                  }}
                >
                  Login
                </Button>
              </Text>

              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                style={{
                  backgroundColor: "#059669",
                  borderColor: "#059669",
                  borderRadius: "8px",
                  height: "40px",
                  padding: "0 24px",
                  fontWeight: 500,
                  width: "100%",
                  maxWidth: "200px",
                }}
                className="hover:opacity-90"
              >
                {loading ? "Registering..." : "Register"}
              </Button>
            </div>
          </Form>
        </div>
      </Card>
    </div>
  );
};

export default AdminRegistration;
