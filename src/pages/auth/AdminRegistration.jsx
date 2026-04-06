import {useState, useRef} from "react";
import {useNavigate} from "react-router-dom";
import {registerClient} from "../../hooks/client/useClient.js";
import {
  Form,
  Input,
  Button,
  Alert,
  Select,
  message,
  Steps,
  Row,
  Col,
  ConfigProvider,
  Typography,
  InputNumber,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  LockOutlined,
  HomeOutlined,
  EnvironmentOutlined,
  AppstoreAddOutlined,
  ArrowRightOutlined,
  ArrowLeftOutlined,
  DollarOutlined,
  CalendarOutlined,
} from "@ant-design/icons";

const {Option} = Select;
const {Title, Text} = Typography;

const QUOTES = [
  {
    text: "Great things in business are never done by one person.",
    author: "Steve Jobs",
  },
  {
    text: "The beginning is the most important part of the work.",
    author: "Plato",
  },
  {
    text: "Growth is never by mere chance; it is the result of forces working together.",
    author: "James Cash Penney",
  },
];
const SELECTED_QUOTE = QUOTES[Math.floor(Math.random() * QUOTES.length)];

// Floating orb component for the background
const Orb = ({style}) => (
  <div
    style={{
      position: "absolute",
      borderRadius: "50%",
      filter: "blur(70px)",
      opacity: 0.15,
      ...style,
    }}
  />
);

const AdminRegistration = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [messageApi, contextHolder] = message.useMessage();

  // Ref to handle smooth scrolling to the top of the form
  const formTopRef = useRef(null);

  const initialValues = {
    companyName: "",
    primaryAdmin: {name: "", email: "", phone: "", password: ""},
    address: {street: "", city: "", state: "", country: ""},
    activeModules: ["properties", "users", "timeOff", "kitchen", "accounts"],
    billingConfig: {
      billingDay: 1,
      graceDays: 7,
    },
  };

  const stepsConfig = [
    {title: "Organization", fields: ["companyName", "activeModules"]},
    {
      title: "Admin Info",
      fields: [
        ["primaryAdmin", "name"],
        ["primaryAdmin", "email"],
        ["primaryAdmin", "phone"],
        ["primaryAdmin", "password"],
      ],
    },
    {
      title: "Location",
      fields: [
        ["address", "street"],
        ["address", "city"],
        ["address", "state"],
        ["address", "country"],
      ],
    },
    {
      title: "Billing",
      fields: [
        ["billingConfig", "billingDay"],
        ["billingConfig", "graceDays"],
      ],
    },
  ];

  const smoothScrollToTop = () => {
    // Small timeout ensures the DOM has rendered the new step before scrolling
    setTimeout(() => {
      formTopRef.current?.scrollIntoView({behavior: "smooth", block: "start"});
    }, 100);
  };

  const handleNext = async () => {
    try {
      await form.validateFields(stepsConfig[currentStep].fields);
      setErrorMsg("");
      setCurrentStep((prev) => prev + 1);
      smoothScrollToTop();
    } catch (error) {
      console.log("Validation failed:", error);
    }
  };

  const handlePrev = () => {
    setErrorMsg("");
    setCurrentStep((prev) => prev - 1);
    smoothScrollToTop();
  };

  const handleSubmit = async () => {
    // Prevent multiple submissions while loading
    if (loading) {
      return;
    }

    setErrorMsg("");
    setLoading(true);

    try {
      // Get ALL form values (not just current step)
      const allValues = form.getFieldsValue(true);

      console.log("All form values:", allValues);
      console.log("Company Name:", allValues.companyName);
      console.log("PrimaryAdmin:", allValues.primaryAdmin);
      console.log("Address:", allValues.address);
      console.log("Active Modules:", allValues.activeModules);
      console.log("Billing Config:", allValues.billingConfig);

      // Check if values are present
      if (!allValues.companyName) {
        console.error("Company name is missing");
        setErrorMsg("Company name is required");
        setLoading(false);
        return;
      }

      if (!allValues.primaryAdmin) {
        console.error("PrimaryAdmin object is missing");
        setErrorMsg("Admin information is required");
        setLoading(false);
        return;
      }

      if (
        !allValues.primaryAdmin.name ||
        !allValues.primaryAdmin.email ||
        !allValues.primaryAdmin.phone ||
        !allValues.primaryAdmin.password
      ) {
        console.error("Admin fields are missing:", {
          name: allValues.primaryAdmin.name,
          email: allValues.primaryAdmin.email,
          phone: allValues.primaryAdmin.phone,
          password: allValues.primaryAdmin.password,
        });
        setErrorMsg("All admin fields are required");
        setLoading(false);
        return;
      }

      if (!allValues.address) {
        console.error("Address object is missing");
        setErrorMsg("Address information is required");
        setLoading(false);
        return;
      }

      if (
        !allValues.address.street ||
        !allValues.address.city ||
        !allValues.address.state ||
        !allValues.address.country
      ) {
        console.error("Address fields are missing:", allValues.address);
        setErrorMsg("All address fields are required");
        setLoading(false);
        return;
      }

      // Prepare the data - ensure all fields are properly structured
      const submissionData = {
        companyName: allValues.companyName,
        activeModules: allValues.activeModules || [
          "properties",
          "users",
          "timeOff",
          "kitchen",
          "accounts",
        ],
        primaryAdmin: {
          name: allValues.primaryAdmin.name,
          email: allValues.primaryAdmin.email,
          phone: allValues.primaryAdmin.phone,
          password: allValues.primaryAdmin.password,
        },
        address: {
          street: allValues.address.street,
          city: allValues.address.city,
          state: allValues.address.state,
          country: allValues.address.country,
        },
        billingConfig: {
          billingDay: allValues.billingConfig?.billingDay || 1,
          graceDays: allValues.billingConfig?.graceDays || 7,
        },
      };

      console.log("Final submission data:", submissionData);

      const response = await registerClient(submissionData);
      console.log("Registration response:", response);

      if (response && response.success) {
        messageApi.success(
          response?.data?.message || "Registration Successful!",
        );

        setTimeout(() => {
          navigate("/login", {
            state: {
              email: submissionData.primaryAdmin.email,
              password: submissionData.primaryAdmin.password,
            },
          });
        }, 1500);
      } else {
        setErrorMsg(
          response?.message || "Registration completed with warnings",
        );
        setLoading(false);
      }
    } catch (err) {
      console.error("Registration error:", err);

      let errorMessage = "Registration failed. Please try again.";
      if (err?.details) {
        errorMessage = Array.isArray(err.details)
          ? err.details.join("\n")
          : typeof err.details === "object"
            ? Object.values(err.details).flat().join("\n")
            : err.details;
      } else if (err?.message) {
        errorMessage = err.message;
      }

      setErrorMsg(errorMessage);
      smoothScrollToTop();
      setLoading(false);
    }
  };

  // Helper function to get module display name
  const getModuleDisplayName = (module) => {
    const moduleMap = {
      properties: "Property Management",
      users: "User Management",
      timeOff: "Attendance & Leave",
      kitchen: "Mess & Kitchen",
      accounts: "Accounts & Finance",
    };
    return moduleMap[module] || module;
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#059669",
          borderRadius: 12,
          fontFamily: "'DM Sans', sans-serif",
          colorBorder: "#e5e7eb",
          colorBgContainer: "#ffffff",
          colorError: "#ef4444",
        },
        components: {
          Input: {
            controlHeight: 50,
            paddingInline: 16,
            activeShadow: "0 0 0 3px rgba(5,150,105,0.12)",
          },
          Select: {
            controlHeight: 50,
            activeShadow: "0 0 0 3px rgba(5,150,105,0.12)",
          },
          Button: {
            controlHeight: 48,
            fontWeight: 600,
          },
          Steps: {
            colorPrimary: "#059669",
          },
        },
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,300;0,400;1,300;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');

        .ar-root { font-family: 'DM Sans', sans-serif; display: flex; min-height: 100vh; }
        
        .ar-left {
          position: relative;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 3.5rem;
          flex: 1;
        }

        .ar-right {
          flex: 1.2;
          background: #f8faf9;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          position: relative;
          overflow-y: auto;
          scroll-behavior: smooth;
        }

        .ar-brand { font-family: 'Fraunces', serif; font-size: 1.85rem; color: #fff; line-height: 1; }
        .ar-brand em { font-style: italic; font-weight: 300; color: #a7f3d0; }
        .ar-brand span { font-family: 'DM Sans', sans-serif; font-weight: 600; font-size: 0.7rem; color: rgba(255,255,255,0.8); letter-spacing: 0.15em; text-transform: uppercase; margin-left: 8px; }
        
        .ar-tagline { font-family: 'Fraunces', serif; font-weight: 300; font-size: clamp(2rem, 3.5vw, 2.8rem); color: #fff; line-height: 1.25; margin: 0 0 1.5rem 0; }
        .ar-tagline em { color: #d1fae5; font-style: normal; }
        
        .ar-quote-block { border-left: 2px solid rgba(255,255,255,0.5); padding-left: 1.25rem; }
        .ar-quote-text { font-family: 'Fraunces', serif; font-weight: 300; font-size: 1.05rem; color: rgba(255,255,255,0.9); line-height: 1.65; margin: 0 0 0.5rem 0; }
        .ar-quote-author { font-size: 0.78rem; color: #a7f3d0; letter-spacing: 0.1em; text-transform: uppercase; font-weight: 600; margin: 0; }

        .ar-form-wrap { 
          width: 100%; 
          max-width: 540px; 
          background: #fff; 
          padding: 3rem; 
          border-radius: 24px; 
          box-shadow: 0 12px 40px rgba(0,0,0,0.03), 0 1px 3px rgba(0,0,0,0.05); 
        }

        .ar-title { font-family: 'Fraunces', serif; font-size: 1.85rem; color: #111827; margin: 0 0 0.5rem 0; }
        .ar-subtitle { font-size: 0.95rem; color: #6b7280; margin: 0 0 2.5rem 0; }
        
        .ant-form-item-label > label { font-size: 0.8rem !important; font-weight: 600 !important; color: #4b5563 !important; text-transform: uppercase; letter-spacing: 0.05em; }
        
        .ant-input-prefix { color: #9ca3af; margin-right: 12px !important; font-size: 1.1rem; }
        .ant-input-affix-wrapper-focused .ant-input-prefix { color: #059669; transition: color 0.3s; }

        /* UPDATED: Smooth horizontal slide-in animation */
        .ar-step-content { animation: slideInRight 0.5s cubic-bezier(0.16, 1, 0.3, 1) both; }
        @keyframes slideInRight { 
          from { opacity: 0; transform: translateX(20px); } 
          to { opacity: 1; transform: translateX(0); } 
        }

        /* Tablet Responsive adjustments */
        @media (max-width: 992px) { 
          .ar-left { display: none; } 
          .ar-right { padding: 1.5rem; }
          .ar-form-wrap { padding: 2.5rem; border-radius: 16px; }
        }

        /* Mobile Responsive adjustments */
        @media (max-width: 576px) {
          .ar-right { padding: 1rem; }
          .ar-form-wrap { padding: 1.5rem; border-radius: 12px; }
          .ar-title { font-size: 1.5rem; }
          .ar-subtitle { font-size: 0.85rem; margin-bottom: 1.5rem; }
          .ant-form-item { margin-bottom: 1rem !important; }
          
          /* Ensure horizontal steps stay neat on mobile */
          .ant-steps-horizontal.ant-steps-label-vertical {
            flex-wrap: nowrap;
            overflow-x: auto;
            scrollbar-width: none; 
            -ms-overflow-style: none;
          }
          .ant-steps-horizontal.ant-steps-label-vertical::-webkit-scrollbar {
            display: none;
          }
        }
      `}</style>

      {contextHolder}
      <div className="ar-root">
        {/* ── LEFT PANEL ── */}
        <div className="ar-left">
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
              pointerEvents: "none",
            }}
          />
          <Orb
            style={{
              width: 500,
              height: 500,
              background: "#ffffff",
              top: -150,
              left: -150,
            }}
          />
          <Orb
            style={{
              width: 400,
              height: 400,
              background: "#d1fae5",
              bottom: 0,
              right: -100,
              opacity: 0.3,
            }}
          />

          <div style={{position: "relative", zIndex: 1}}>
            <div className="ar-brand">
              Hostel<em>Xpert</em>
              <span>Business</span>
            </div>
          </div>

          <div style={{position: "relative", zIndex: 1}}>
            <h1 className="ar-tagline">
              Set up your workspace,
              <br />
              <em>step by step.</em>
            </h1>
            <div className="ar-quote-block">
              <p className="ar-quote-text">"{SELECTED_QUOTE.text}"</p>
              <p className="ar-quote-author">— {SELECTED_QUOTE.author}</p>
            </div>
          </div>

          <div style={{position: "relative", zIndex: 1}}>
            <p
              style={{
                fontSize: "0.75rem",
                color: "rgba(255,255,255,0.7)",
                letterSpacing: "0.04em",
                margin: 0,
              }}
            >
              © 2026 HostelXpert Business. All rights reserved.
            </p>
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="ar-right">
          {/* Invisible ref element to control scroll position */}
          <div ref={formTopRef} style={{position: "absolute", top: 0}} />

          <div className="ar-form-wrap">
            <h2 className="ar-title">Create Account</h2>
            <p className="ar-subtitle">
              Join us to manage your properties effortlessly.
            </p>

            {errorMsg && (
              <Alert
                message={<div style={{whiteSpace: "pre-line"}}>{errorMsg}</div>}
                type="error"
                showIcon
                style={{marginBottom: "24px", borderRadius: "10px"}}
                closable
                onClose={() => setErrorMsg("")}
              />
            )}

            <Steps
              current={currentStep}
              size="small"
              responsive={false}
              labelPlacement="vertical"
              style={{marginBottom: "2rem"}}
              items={[
                {title: "Company"},
                {title: "Admin"},
                {title: "Location"},
                {title: "Billing"},
              ]}
            />

            <Form
              form={form}
              layout="vertical"
              initialValues={initialValues}
              requiredMark={false}
            >
              {/* STEP 0: ORGANIZATION */}
              {currentStep === 0 && (
                <div className="ar-step-content" key="step-0">
                  <Form.Item
                    label="Company Name"
                    name="companyName"
                    rules={[
                      {required: true, message: "Please enter company name"},
                    ]}
                  >
                    <Input
                      prefix={<HomeOutlined />}
                      placeholder="e.g. Acme Properties Ltd."
                    />
                  </Form.Item>

                  <Form.Item
                    label="Active Modules"
                    name="activeModules"
                    rules={[
                      {
                        required: true,
                        message: "Please select at least one module",
                      },
                    ]}
                  >
                    <Select
                      mode="multiple"
                      placeholder="Select modules for this client"
                      suffixIcon={<AppstoreAddOutlined />}
                    >
                      <Option value="properties">Property Management</Option>
                      <Option value="users">User Management</Option>
                      <Option value="timeOff">Attendance & Leave</Option>
                      <Option value="kitchen">Mess & Kitchen</Option>
                      <Option value="accounts">Accounts & Finance</Option>
                    </Select>
                  </Form.Item>
                </div>
              )}

              {/* STEP 1: ADMIN INFO */}
              {currentStep === 1 && (
                <div className="ar-step-content" key="step-1">
                  <Form.Item
                    label="Admin Full Name"
                    name={["primaryAdmin", "name"]}
                    rules={[
                      {required: true, message: "Please enter admin name"},
                    ]}
                  >
                    <Input prefix={<UserOutlined />} placeholder="Jane Doe" />
                  </Form.Item>

                  <Form.Item
                    label="Email Address"
                    name={["primaryAdmin", "email"]}
                    rules={[
                      {required: true, message: "Please enter email"},
                      {type: "email", message: "Please enter valid email"},
                    ]}
                  >
                    <Input
                      prefix={<MailOutlined />}
                      placeholder="jane@company.com"
                    />
                  </Form.Item>

                  <Row gutter={16}>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        label="Phone Number"
                        name={["primaryAdmin", "phone"]}
                        rules={[{required: true, message: "Required"}]}
                      >
                        <Input
                          prefix={<PhoneOutlined />}
                          placeholder="+1 234 567 890"
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        label="Password"
                        name={["primaryAdmin", "password"]}
                        rules={[
                          {required: true, message: "Required"},
                          {min: 6, message: "Min 6 chars"},
                        ]}
                      >
                        <Input.Password
                          prefix={<LockOutlined />}
                          placeholder="••••••••"
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                </div>
              )}

              {/* STEP 2: ADDRESS */}
              {currentStep === 2 && (
                <div className="ar-step-content" key="step-2">
                  <Form.Item
                    label="Street Address"
                    name={["address", "street"]}
                    rules={[
                      {required: true, message: "Please enter street address"},
                    ]}
                  >
                    <Input
                      prefix={<EnvironmentOutlined />}
                      placeholder="123 Business Parkway"
                    />
                  </Form.Item>

                  <Row gutter={16}>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        label="City"
                        name={["address", "city"]}
                        rules={[{required: true, message: "Required"}]}
                      >
                        <Input placeholder="City" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        label="State/Province"
                        name={["address", "state"]}
                        rules={[{required: true, message: "Required"}]}
                      >
                        <Input placeholder="State" />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item
                    label="Country"
                    name={["address", "country"]}
                    rules={[{required: true, message: "Please enter country"}]}
                  >
                    <Input placeholder="Country" />
                  </Form.Item>
                </div>
              )}

              {/* STEP 3: BILLING CONFIG & REGISTRATION */}
              {currentStep === 3 && (
                <div className="ar-step-content" key="step-3">
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
                      <DollarOutlined
                        style={{
                          color: "#059669",
                          marginRight: "12px",
                          fontSize: "18px",
                        }}
                      />
                      <Title level={4} style={{margin: 0, color: "#1f2937"}}>
                        Billing Settings
                      </Title>
                    </div>

                    <Row gutter={[24, 24]}>
                      <Col xs={24} md={12}>
                        <Form.Item
                          label={
                            <span>
                              <CalendarOutlined
                                style={{marginRight: "8px", color: "#059669"}}
                              />
                              Billing Day
                            </span>
                          }
                          name={["billingConfig", "billingDay"]}
                          rules={[
                            {
                              required: true,
                              message: "Please select billing day",
                            },
                            {
                              type: "number",
                              min: 1,
                              max: 28,
                              message: "Billing day must be between 1 and 28",
                            },
                          ]}
                          tooltip="The day of the month when billing will be processed (1-28)"
                        >
                          <InputNumber
                            min={1}
                            max={28}
                            placeholder="Select billing day (1-28)"
                            style={{width: "100%", borderRadius: "8px"}}
                          />
                        </Form.Item>
                      </Col>

                      <Col xs={24} md={12}>
                        <Form.Item
                          label={
                            <span>
                              <CalendarOutlined
                                style={{marginRight: "8px", color: "#059669"}}
                              />
                              Grace Period (Days)
                            </span>
                          }
                          name={["billingConfig", "graceDays"]}
                          rules={[
                            {
                              required: true,
                              message: "Please enter grace period",
                            },
                            {
                              type: "number",
                              min: 0,
                              max: 30,
                              message:
                                "Grace period must be between 0 and 30 days",
                            },
                          ]}
                          tooltip="Number of days allowed for payment after the billing date"
                        >
                          <InputNumber
                            min={0}
                            max={30}
                            placeholder="Enter grace period in days"
                            style={{width: "100%", borderRadius: "8px"}}
                          />
                        </Form.Item>
                      </Col>
                    </Row>

                    {/* Billing Summary Card */}
                    <div
                      style={{
                        padding: "14px",
                        backgroundColor: "#f0f9ff",
                        borderRadius: "12px",
                        border: "1px solid #bae6fd",
                        marginBottom: "24px",
                      }}
                    >
                      <Text type="secondary" style={{fontSize: "12px"}}>
                        Billing will be automatically processed on the selected
                        day each month. Users will have the configured grace
                        period to complete their payment.
                      </Text>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: "1rem",
                  paddingTop: "1.5rem",
                  borderTop: "1px solid #f3f4f6",
                }}
              >
                {currentStep > 0 ? (
                  <Button
                    onClick={handlePrev}
                    icon={<ArrowLeftOutlined />}
                    disabled={loading}
                  >
                    Back
                  </Button>
                ) : (
                  <Button
                    type="text"
                    onClick={() => navigate("/login")}
                    style={{color: "#6b7280", paddingLeft: 0}}
                    disabled={loading}
                  >
                    Log in instead
                  </Button>
                )}

                {currentStep < stepsConfig.length - 1 ? (
                  <Button
                    type="primary"
                    onClick={handleNext}
                    style={{display: "flex", alignItems: "center"}}
                    disabled={loading}
                  >
                    Next Step <ArrowRightOutlined />
                  </Button>
                ) : (
                  <Button
                    type="primary"
                    onClick={handleSubmit}
                    loading={loading}
                    style={{width: 200, backgroundColor: "#059669"}}
                    size="large"
                  >
                    {loading ? "Registering..." : "Complete Registration"}
                  </Button>
                )}
              </div>
            </Form>
          </div>
        </div>
      </div>
    </ConfigProvider>
  );
};

export default AdminRegistration;
