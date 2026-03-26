// import {useState} from "react";
// import {useNavigate} from "react-router-dom";
// import {validateRegistrationForm} from "../../utils/validator.js";
// import {registerClient} from "../../hooks/client/useClient.js";
// import {
//   Card,
//   Form,
//   Input,
//   Button,
//   Alert,
//   Typography,
//   Row,
//   Col,
//   Select,
//   Divider,
//   message,
// } from "antd";
// import {
//   UserOutlined,
//   MailOutlined,
//   PhoneOutlined,
//   LockOutlined,
//   HomeOutlined,
//   EnvironmentOutlined,
// } from "@ant-design/icons";

// const {Title, Paragraph, Text} = Typography;
// const {Option} = Select;

// const AdminRegistration = () => {
//   const navigate = useNavigate();
//   const [form] = Form.useForm();
//   const [showPassword, setShowPassword] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [errorMsg, setErrorMsg] = useState("");
//   const [messageApi, contextHolder] = message.useMessage();

//   const initialValues = {
//     companyName: "",
//     primaryAdmin: {
//       name: "",
//       email: "",
//       phone: "",
//       password: "",
//     },
//     address: {
//       street: "",
//       city: "",
//       state: "",
//       country: "",
//       // zipCode: "",
//     },
//     activeModules: ["properties", "users", "timeOff", "kitchen", "accounts"],
//   };

//   const handleSubmit = async (values) => {
//     setErrorMsg("");
//     setLoading(true);

//     // Frontend validation
//     const validationErrors = validateRegistrationForm(values);
//     if (validationErrors.length > 0) {
//       setErrorMsg(validationErrors.join("\n"));
//       setLoading(false);
//       return;
//     }

//     try {
//       const response = await registerClient(values);
//       console.log("Registration Success:", response);
//       messageApi.success(response?.data?.message || "Registration Success");

//       if (response.success) {
//         navigate("/login", {
//           state: {
//             email: values.primaryAdmin.email,
//             password: values.primaryAdmin.password,
//           },
//         });
//       } else {
//         console.log(response);
//         setErrorMsg(response.message || "Registration completed with warnings");
//       }
//     } catch (err) {
//       console.error("Registration Error:", err);

//       let errorMessage = "Registration failed. Please try again.";

//       if (err.details) {
//         console.log(err.details);
//         if (Array.isArray(err.details)) {
//           errorMessage = err.details.join("\n");
//         } else if (typeof err.details === "object") {
//           errorMessage = Object.values(err.details).flat().join("\n");
//         } else {
//           errorMessage = err.details;
//         }
//       } else if (err.message) {
//         errorMessage = err.message;
//       }
//       console.log(errorMessage);
//       setErrorMsg(err?.details?.message);
//       window.scrollTo({top: 0, behavior: "smooth"});
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
//       {contextHolder}
//       <Card
//         className="w-full max-w-4xl shadow-lg rounded-2xl overflow-hidden"
//         bordered={false}
//         styles={{
//           body: {padding: 0},
//         }}
//       >
//         {/* Header */}
//         <div
//           className="bg-gradient-to-r from-[#059669] to-[#059669] p-6 text-white"
//           style={{
//             background: "linear-gradient(to right, #059669, #059669)",
//           }}
//         >
//           <Title level={3} style={{color: "white", margin: 0}}>
//             Admin Registration
//           </Title>
//           <Paragraph style={{color: "#e0e7ff", margin: "0.25rem 0 0 0"}}>
//             Create your organization's admin account
//           </Paragraph>
//         </div>

//         <div className="p-6 sm:p-8">
//           <Form
//             form={form}
//             name="registration-form"
//             initialValues={initialValues}
//             onFinish={handleSubmit}
//             layout="vertical"
//             size="large"
//           >
//             {/* Error Message */}
//             {errorMsg && (
//               <Alert
//                 message={<div style={{whiteSpace: "pre-line"}}>{errorMsg}</div>}
//                 type="error"
//                 showIcon
//                 style={{marginBottom: "24px", borderRadius: "8px"}}
//                 closable
//                 onClose={() => setErrorMsg("")}
//               />
//             )}

//             {/* Company Information */}
//             <div style={{marginBottom: "32px"}}>
//               <div
//                 style={{
//                   display: "flex",
//                   alignItems: "center",
//                   marginBottom: "24px",
//                   paddingBottom: "12px",
//                   borderBottom: "2px solid #e5e7eb",
//                 }}
//               >
//                 <HomeOutlined
//                   style={{
//                     color: "#059669",
//                     marginRight: "12px",
//                     fontSize: "18px",
//                   }}
//                 />
//                 <Title level={4} style={{margin: 0, color: "#1f2937"}}>
//                   Company Information
//                 </Title>
//               </div>
//               <Form.Item
//                 label="Company Name"
//                 name="companyName"
//                 rules={[{required: true, message: "Please enter company name"}]}
//                 style={{marginBottom: "16px"}}
//               >
//                 <Input
//                   prefix={<HomeOutlined style={{color: "#9ca3af"}} />}
//                   placeholder="Enter company/organization name"
//                   style={{borderRadius: "8px"}}
//                 />
//               </Form.Item>

//               <Form.Item
//                 label="Active Modules"
//                 name="activeModules"
//                 rules={[{required: true, message: "Please select at least one module"}]}
//                 style={{marginBottom: "16px"}}
//               >
//                 <Select
//                   mode="multiple"
//                   placeholder="Select modules for this client"
//                   style={{borderRadius: "8px"}}
//                 >
//                   <Option value="properties">Property Management</Option>
//                   <Option value="users">User Management</Option>
//                   <Option value="timeOff">Attendance & Leave</Option>
//                   <Option value="kitchen">Mess & Kitchen</Option>
//                   <Option value="accounts">Accounts & Finance</Option>
//                 </Select>
//               </Form.Item>
//             </div>

//             <Row gutter={[24, 0]}>
//               {/* Primary Admin Section */}
//               <Col xs={24} md={12}>
//                 <div
//                   style={{
//                     display: "flex",
//                     alignItems: "center",
//                     marginBottom: "24px",
//                     paddingBottom: "12px",
//                     borderBottom: "2px solid #e5e7eb",
//                   }}
//                 >
//                   <UserOutlined
//                     style={{
//                       color: "#059669",
//                       marginRight: "12px",
//                       fontSize: "18px",
//                     }}
//                   />
//                   <Title level={4} style={{margin: 0, color: "#1f2937"}}>
//                     Primary Admin
//                   </Title>
//                 </div>

//                 <Form.Item
//                   label="Full Name"
//                   name={["primaryAdmin", "name"]}
//                   rules={[{required: true, message: "Please enter admin name"}]}
//                   style={{marginBottom: "16px"}}
//                 >
//                   <Input
//                     prefix={<UserOutlined style={{color: "#9ca3af"}} />}
//                     placeholder="Admin's full name"
//                     style={{borderRadius: "8px"}}
//                   />
//                 </Form.Item>

//                 <Form.Item
//                   label="Email"
//                   name={["primaryAdmin", "email"]}
//                   rules={[
//                     {required: true, message: "Please enter email"},
//                     {type: "email", message: "Please enter valid email"},
//                   ]}
//                   style={{marginBottom: "16px"}}
//                 >
//                   <Input
//                     prefix={<MailOutlined style={{color: "#9ca3af"}} />}
//                     placeholder="official@company.com"
//                     style={{borderRadius: "8px"}}
//                   />
//                 </Form.Item>

//                 <Form.Item
//                   label="Phone"
//                   name={["primaryAdmin", "phone"]}
//                   rules={[
//                     {required: true, message: "Please enter phone number"},
//                   ]}
//                   style={{marginBottom: "16px"}}
//                 >
//                   <Input
//                     prefix={<PhoneOutlined style={{color: "#9ca3af"}} />}
//                     placeholder="Please enter phone number"
//                     style={{borderRadius: "8px"}}
//                   />
//                 </Form.Item>

//                 <Form.Item
//                   label="Password"
//                   name={["primaryAdmin", "password"]}
//                   rules={[
//                     {required: true, message: "Please enter password"},
//                     {min: 6, message: "Minimum 6 characters"},
//                   ]}
//                   style={{marginBottom: "8px"}}
//                 >
//                   <Input.Password
//                     prefix={<LockOutlined style={{color: "#9ca3af"}} />}
//                     placeholder="••••••••"
//                     style={{borderRadius: "8px"}}
//                     visibilityToggle={{
//                       visible: showPassword,
//                       onVisibleChange: setShowPassword,
//                     }}
//                   />
//                 </Form.Item>
//                 <Text
//                   type="secondary"
//                   style={{
//                     fontSize: "12px",
//                     display: "block",
//                     marginBottom: "24px",
//                   }}
//                 >
//                   Min 6 chars, incl. 1 number, uppercase & special character
//                 </Text>
//               </Col>

//               {/* Address Information Section */}
//               <Col xs={24} md={12}>
//                 <div
//                   style={{
//                     display: "flex",
//                     alignItems: "center",
//                     marginBottom: "24px",
//                     paddingBottom: "12px",
//                     borderBottom: "2px solid #e5e7eb",
//                   }}
//                 >
//                   <EnvironmentOutlined
//                     style={{
//                       color: "#059669",
//                       marginRight: "12px",
//                       fontSize: "18px",
//                     }}
//                   />
//                   <Title level={4} style={{margin: 0, color: "#1f2937"}}>
//                     Company Address
//                   </Title>
//                 </div>

//                 <Form.Item
//                   label="Street"
//                   name={["address", "street"]}
//                   rules={[
//                     {required: true, message: "Please enter street address"},
//                   ]}
//                   style={{marginBottom: "16px"}}
//                 >
//                   <Input
//                     prefix={<EnvironmentOutlined style={{color: "#9ca3af"}} />}
//                     placeholder="Street address"
//                     style={{borderRadius: "8px"}}
//                   />
//                 </Form.Item>

//                 <Row gutter={16} style={{marginBottom: "16px"}}>
//                   <Col span={12}>
//                     <Form.Item
//                       label="City"
//                       name={["address", "city"]}
//                       rules={[{required: true, message: "Please enter city"}]}
//                       style={{marginBottom: 0}}
//                     >
//                       <Input placeholder="City" style={{borderRadius: "8px"}} />
//                     </Form.Item>
//                   </Col>
//                   <Col span={12}>
//                     <Form.Item
//                       label="State"
//                       name={["address", "state"]}
//                       rules={[{required: true, message: "Please enter state"}]}
//                       style={{marginBottom: 0}}
//                     >
//                       <Input
//                         placeholder="State/Province"
//                         style={{borderRadius: "8px"}}
//                       />
//                     </Form.Item>
//                   </Col>
//                 </Row>

//                 <Row gutter={16}>
//                   <Col span={12}>
//                     <Form.Item
//                       label="Country"
//                       name={["address", "country"]}
//                       rules={[
//                         {required: true, message: "Please enter country"},
//                       ]}
//                       style={{marginBottom: 0}}
//                     >
//                       <Input
//                         placeholder="Enter country"
//                         style={{borderRadius: "8px"}}
//                       />
//                     </Form.Item>
//                   </Col>
//                   {/* <Col span={12}>
//                     <Form.Item
//                       label="ZIP Code"
//                       name={["address", "zipCode"]}
//                       rules={[
//                         {required: true, message: "Please enter ZIP code"},
//                       ]}
//                       style={{marginBottom: 0}}
//                     >
//                       <Input
//                         placeholder="Postal/ZIP code"
//                         style={{borderRadius: "8px"}}
//                       />
//                     </Form.Item>
//                   </Col> */}
//                 </Row>
//               </Col>
//             </Row>

//             {/* Form Actions */}
//             <Divider style={{margin: "32px 0 24px 0"}} />

//             <div className="flex flex-col-reverse sm:flex-row sm:justify-between items-center gap-4">
//               <Text style={{color: "#6b7280", textAlign: "center"}}>
//                 Already have an account?{" "}
//                 <Button
//                   type="link"
//                   onClick={() => navigate("/login")}
//                   style={{
//                     color: "#059669",
//                     padding: 0,
//                     height: "auto",
//                     fontWeight: 500,
//                   }}
//                 >
//                   Login
//                 </Button>
//               </Text>

//               <Button
//                 type="primary"
//                 htmlType="submit"
//                 loading={loading}
//                 style={{
//                   backgroundColor: "#059669",
//                   borderColor: "#059669",
//                   borderRadius: "8px",
//                   height: "40px",
//                   padding: "0 24px",
//                   fontWeight: 500,
//                   width: "100%",
//                   maxWidth: "200px",
//                 }}
//                 className="hover:opacity-90"
//               >
//                 {loading ? "Registering..." : "Register"}
//               </Button>
//             </div>
//           </Form>
//         </div>
//       </Card>
//     </div>
//   );
// };

import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { validateRegistrationForm } from "../../utils/validator.js";
import { registerClient } from "../../hooks/client/useClient.js";
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
  ConfigProvider
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
  ArrowLeftOutlined
} from "@ant-design/icons";

const { Option } = Select;

const QUOTES = [
  { text: "Great things in business are never done by one person.", author: "Steve Jobs" },
  { text: "The beginning is the most important part of the work.", author: "Plato" },
  { text: "Growth is never by mere chance; it is the result of forces working together.", author: "James Cash Penney" }
];
const SELECTED_QUOTE = QUOTES[Math.floor(Math.random() * QUOTES.length)];

// Floating orb component for the background
const Orb = ({ style }) => (
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
    primaryAdmin: { name: "", email: "", phone: "", password: "" },
    address: { street: "", city: "", state: "", country: "" },
    activeModules: ["properties", "users", "timeOff", "kitchen", "accounts"],
  };

  const stepsConfig = [
    { title: "Organization", fields: ["companyName", "activeModules"] },
    {
      title: "Admin Info",
      fields: [
        ["primaryAdmin", "name"],
        ["primaryAdmin", "email"],
        ["primaryAdmin", "phone"],
        ["primaryAdmin", "password"]
      ]
    },
    {
      title: "Location",
      fields: [
        ["address", "street"],
        ["address", "city"],
        ["address", "state"],
        ["address", "country"]
      ]
    }
  ];

  const smoothScrollToTop = () => {
    // Small timeout ensures the DOM has rendered the new step before scrolling
    setTimeout(() => {
      formTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const handleNext = async () => {
    try {
      await form.validateFields(stepsConfig[currentStep].fields);
      setErrorMsg("");
      setCurrentStep(prev => prev + 1);
      smoothScrollToTop();
    } catch (error) {
      console.log("Validation failed:", error);
    }
  };

  const handlePrev = () => {
    setErrorMsg("");
    setCurrentStep(prev => prev - 1);
    smoothScrollToTop();
  };

  const handleSubmit = async (values) => {
    setErrorMsg("");
    setLoading(true);

    const validationErrors = validateRegistrationForm(values);
    if (validationErrors?.length > 0) {
      setErrorMsg(validationErrors.join("\n"));
      setLoading(false);
      return;
    }

    try {
      const response = await registerClient(values);
      messageApi.success(response?.data?.message || "Registration Success");

      if (response.success) {
        navigate("/login", {
          state: {
            email: values.primaryAdmin.email,
            password: values.primaryAdmin.password,
          },
        });
      } else {
        setErrorMsg(response.message || "Registration completed with warnings");
      }
    } catch (err) {
      let errorMessage = "Registration failed. Please try again.";
      if (err.details) {
        errorMessage = Array.isArray(err.details)
          ? err.details.join("\n")
          : typeof err.details === "object"
            ? Object.values(err.details).flat().join("\n")
            : err.details;
      } else if (err.message) {
        errorMessage = err.message;
      }
      setErrorMsg(err?.details?.message || errorMessage);
      smoothScrollToTop();
    } finally {
      setLoading(false);
    }
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#059669', 
          borderRadius: 12,
          fontFamily: "'DM Sans', sans-serif",
          colorBorder: '#e5e7eb',
          colorBgContainer: '#ffffff',
          colorError: '#ef4444',
        },
        components: {
          Input: {
            controlHeight: 50,
            paddingInline: 16,
            activeShadow: '0 0 0 3px rgba(5,150,105,0.12)',
          },
          Select: {
            controlHeight: 50,
            activeShadow: '0 0 0 3px rgba(5,150,105,0.12)',
          },
          Button: {
            controlHeight: 48,
            fontWeight: 600,
          },
          Steps: {
            colorPrimary: '#059669',
          }
        }
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
          <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)", backgroundSize: "48px 48px", pointerEvents: "none" }} />
          <Orb style={{ width: 500, height: 500, background: "#ffffff", top: -150, left: -150 }} />
          <Orb style={{ width: 400, height: 400, background: "#d1fae5", bottom: 0, right: -100, opacity: 0.3 }} />

          <div style={{ position: "relative", zIndex: 1 }}>
            <div className="ar-brand">Hostel<em>Xpert</em><span>Business</span></div>
          </div>

          <div style={{ position: "relative", zIndex: 1 }}>
            <h1 className="ar-tagline">Set up your workspace,<br /><em>step by step.</em></h1>
            <div className="ar-quote-block">
              <p className="ar-quote-text">"{SELECTED_QUOTE.text}"</p>
              <p className="ar-quote-author">— {SELECTED_QUOTE.author}</p>
            </div>
          </div>

          <div style={{ position: "relative", zIndex: 1 }}>
            <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.7)", letterSpacing: "0.04em", margin: 0 }}>© 2026 HostelXpert Business. All rights reserved.</p>
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="ar-right">
          {/* Invisible ref element to control scroll position */}
          <div ref={formTopRef} style={{ position: "absolute", top: 0 }} />

          <div className="ar-form-wrap">
            <h2 className="ar-title">Create Account</h2>
            <p className="ar-subtitle">Join us to manage your properties effortlessly.</p>

            {errorMsg && (
              <Alert
                message={<div style={{ whiteSpace: "pre-line" }}>{errorMsg}</div>}
                type="error"
                showIcon
                style={{ marginBottom: "24px", borderRadius: "10px" }}
                closable
                onClose={() => setErrorMsg("")}
              />
            )}

            <Steps 
              current={currentStep} 
              size="small" 
              responsive={false}
              labelPlacement="vertical"
              style={{ marginBottom: "2rem" }}
              items={[
                { title: 'Company' },
                { title: 'Admin' },
                { title: 'Address' }
              ]}
            />

            <Form
              form={form}
              layout="vertical"
              initialValues={initialValues}
              onFinish={handleSubmit}
              requiredMark={false}
            >
              {/* STEP 0: ORGANIZATION */}
              {currentStep === 0 && (
                <div className="ar-step-content" key="step-0">
                  <Form.Item
                    label="Company Name"
                    name="companyName"
                    rules={[{ required: true, message: "Please enter company name" }]}
                  >
                    <Input prefix={<HomeOutlined />} placeholder="e.g. Acme Properties Ltd." />
                  </Form.Item>

                  <Form.Item
                    label="Active Modules"
                    name="activeModules"
                    rules={[{ required: true, message: "Please select at least one module" }]}
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
                    rules={[{ required: true, message: "Please enter admin name" }]}
                  >
                    <Input prefix={<UserOutlined />} placeholder="Jane Doe" />
                  </Form.Item>

                  <Form.Item
                    label="Email Address"
                    name={["primaryAdmin", "email"]}
                    rules={[
                      { required: true, message: "Please enter email" },
                      { type: "email", message: "Please enter valid email" },
                    ]}
                  >
                    <Input prefix={<MailOutlined />} placeholder="jane@company.com" />
                  </Form.Item>

                  <Row gutter={16}>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        label="Phone Number"
                        name={["primaryAdmin", "phone"]}
                        rules={[{ required: true, message: "Required" }]}
                      >
                        <Input prefix={<PhoneOutlined />} placeholder="+1 234 567 890" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        label="Password"
                        name={["primaryAdmin", "password"]}
                        rules={[
                          { required: true, message: "Required" },
                          { min: 6, message: "Min 6 chars" },
                        ]}
                      >
                        <Input.Password prefix={<LockOutlined />} placeholder="••••••••" />
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
                    rules={[{ required: true, message: "Please enter street address" }]}
                  >
                    <Input prefix={<EnvironmentOutlined />} placeholder="123 Business Parkway" />
                  </Form.Item>

                  <Row gutter={16}>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        label="City"
                        name={["address", "city"]}
                        rules={[{ required: true, message: "Required" }]}
                      >
                        <Input placeholder="City" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        label="State/Province"
                        name={["address", "state"]}
                        rules={[{ required: true, message: "Required" }]}
                      >
                        <Input placeholder="State" />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item
                    label="Country"
                    name={["address", "country"]}
                    rules={[{ required: true, message: "Please enter country" }]}
                  >
                    <Input placeholder="Country" />
                  </Form.Item>
                </div>
              )}

              {/* Navigation Buttons */}
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1rem", paddingTop: "1.5rem", borderTop: "1px solid #f3f4f6" }}>
                {currentStep > 0 ? (
                  <Button onClick={handlePrev} icon={<ArrowLeftOutlined />}>
                    Back
                  </Button>
                ) : (
                  <Button type="text" onClick={() => navigate("/login")} style={{ color: "#6b7280", paddingLeft: 0 }}>
                    Log in instead
                  </Button>
                )}

                {currentStep < stepsConfig.length - 1 ? (
                  <Button type="primary" onClick={handleNext} style={{ display: 'flex', alignItems: 'center' }}>
                    Next Step <ArrowRightOutlined />
                  </Button>
                ) : (
                  <Button type="primary" htmlType="submit" loading={loading} style={{ width: 140 }}>
                    {loading ? "Registering" : "Complete"}
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