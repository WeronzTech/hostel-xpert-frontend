// import { useState } from "react";
// import { useLocation, useNavigate } from "react-router-dom";
// import { loginStart, loginSuccess } from "../../redux/authSlice";
// import { useDispatch } from "react-redux";
// import { validateLoginForm } from "../../utils/validator";
// import { tenantLogin } from "../../hooks/auth/useAuth";
// import { Card, Form, Input, Button, Alert, Typography, Space } from "antd";
// import { MailOutlined, LockOutlined } from "@ant-design/icons";

// const { Title, Paragraph } = Typography;

// const AdminLogin = () => {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const location = useLocation();
//   const [form] = Form.useForm();
//   const [fieldErrors, setFieldErrors] = useState({});
//   const [apiError, setApiError] = useState("");
//   const [isLoading, setIsLoading] = useState(false);

//   const initialValues = {
//     email: location.state?.email || "",
//     password: location.state?.password || "",
//   };

//   const handleChange = (changedValues) => {
//     const fieldName = Object.keys(changedValues)[0];

//     // Clear field-specific error
//     if (fieldErrors[fieldName]) {
//       setFieldErrors((prev) => ({ ...prev, [fieldName]: "" }));
//     }

//     // Clear general API error
//     if (apiError) setApiError("");
//   };

//   const handleSubmit = async (values) => {
//     dispatch(loginStart());

//     const formErrors = validateLoginForm(values);
//     if (Object.keys(formErrors).length > 0) {
//       setFieldErrors(formErrors);
//       return;
//     }

//     setIsLoading(true);
//     setApiError("");
//     try {
//       const response = await tenantLogin({
//         email: values.email,
//         password: values.password,
//       });

//       console.log("Login Success:", response);
//       dispatch(loginSuccess(response));
//       navigate("/");
//     } catch (err) {
//       console.log(err.data);
//       const displayMessage =
//         err.userMessage ||
//         (err.status === 401
//           ? "Invalid credentials"
//           : err.status === 403
//             ? "Account not approved"
//             : "Login failed");

//       setApiError(displayMessage);

//       if (err.details) {
//         console.log("Additional error details:", err.details);
//       }
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
//       <Card
//         className="w-full max-w-md shadow-lg rounded-2xl overflow-hidden"
//         bordered={false}
//         styles={{
//           body: { padding: 0 },
//         }}
//       >
//         {/* Header */}
//         <div
//           className="bg-gradient-to-r from-[#059669] to-[#059669] p-6 text-white text-center"
//           style={{
//             background: "linear-gradient(to right, #059669, #059669)",
//             padding: "1.5rem",
//           }}
//         >
//           <Title level={3} style={{ color: "white", margin: 0 }}>
//             Admin Portal
//           </Title>
//           <Paragraph style={{ color: "#e0e7ff", margin: "0.25rem 0 0 0" }}>
//             Sign in to your account
//           </Paragraph>
//         </div>

//         <div className="p-6 sm:p-8">
//           <Form
//             form={form}
//             name="login-form"
//             initialValues={initialValues}
//             onFinish={handleSubmit}
//             onValuesChange={handleChange}
//             layout="vertical"
//             size="large"
//           >
//             {apiError && (
//               <Alert
//                 message={apiError}
//                 type="error"
//                 showIcon
//                 style={{ marginBottom: "16px", borderRadius: "8px" }}
//                 closable
//                 onClose={() => setApiError("")}
//               />
//             )}

//             {/* Email Field */}
//             <Form.Item
//               label="Email Address"
//               name="email"
//               validateStatus={fieldErrors.email ? "error" : ""}
//               help={fieldErrors.email}
//               rules={[
//                 { required: true, message: "Please enter your email" },
//                 { type: "email", message: "Please enter a valid email" },
//               ]}
//               style={{ marginBottom: "16px" }}
//             >
//               <Input
//                 prefix={<MailOutlined style={{ color: "#9ca3af" }} />}
//                 placeholder="official@company.com"
//                 style={{ borderRadius: "8px" }}
//               />
//             </Form.Item>

//             {/* Password Field */}
//             <Form.Item
//               label="Password"
//               name="password"
//               validateStatus={fieldErrors.password ? "error" : ""}
//               help={fieldErrors.password}
//               rules={[
//                 { required: true, message: "Please enter your password" },
//               ]}
//               style={{ marginBottom: "8px" }}
//             >
//               <Input.Password
//                 prefix={<LockOutlined style={{ color: "#9ca3af" }} />}
//                 placeholder="Enter your password"
//                 style={{ borderRadius: "8px" }}
//               />
//             </Form.Item>

//             {/* Forgot Password Link */}
//             <div className="flex justify-end" style={{ marginBottom: "14px" }}>
//               <Button
//                 type="link"
//                 onClick={() => navigate("/forgot-password")}
//                 style={{
//                   color: "#059669",
//                   padding: 0,
//                   height: "auto",
//                   fontWeight: 500,
//                 }}
//               >
//                 Forgot password?
//               </Button>
//             </div>

//             {/* Submit Button */}
//             <Form.Item style={{ marginBottom: 0 }}>
//               <Button
//                 type="primary"
//                 htmlType="submit"
//                 loading={isLoading}
//                 block
//                 style={{
//                   height: "48px",
//                   borderRadius: "8px",
//                   backgroundColor: "#059669",
//                   borderColor: "#059669",
//                   fontSize: "16px",
//                   fontWeight: 500,
//                 }}
//                 className="hover:opacity-90"
//               >
//                 {isLoading ? "Signing in..." : "Sign In"}
//               </Button>
//             </Form.Item>
//           </Form>

//           {/* Registration Link - Inline */}
//           <div
//             className="text-center"
//             style={{
//               paddingTop: "24px",
//               borderTop: "1px solid #e5e7eb",
//               marginTop: "24px",
//             }}
//           >
//             <Space>
//               <span style={{ color: "#6b7280", fontSize: "0.875rem" }}>
//                 New to platform?
//               </span>
//               <Button
//                 type="link"
//                 onClick={() => navigate("/register")}
//                 style={{
//                   color: "#059669",
//                   fontWeight: 500,
//                   padding: "0 0.25rem",
//                   height: "auto",
//                   fontSize: "0.875rem",
//                 }}
//               >
//                 Create admin account
//               </Button>
//             </Space>
//           </div>
//         </div>
//       </Card>
//     </div>
//   );
// };

import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { loginStart, loginSuccess } from "../../redux/authSlice";
import { useDispatch } from "react-redux";
import { validateLoginForm } from "../../utils/validator";
import { tenantLogin } from "../../hooks/auth/useAuth";
import { Form, Input, Button, Alert, Typography } from "antd";
import { MailOutlined, LockOutlined, ArrowRightOutlined } from "@ant-design/icons";

const { Title } = Typography;

const QUOTES = [
  {
    text: "The secret of getting ahead is getting started.",
    author: "Mark Twain",
  },
  {
    text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    author: "Winston Churchill",
  },
  {
    text: "Your work is going to fill a large part of your life, and the only way to be truly satisfied is to do what you believe is great work.",
    author: "Steve Jobs",
  },
  {
    text: "The best way to predict the future is to create it.",
    author: "Peter Drucker",
  },
];

const SELECTED_QUOTE = QUOTES[Math.floor(Math.random() * QUOTES.length)];

// Floating orb component (rendered as inline style divs)
const Orb = ({ style }) => (
  <div
    style={{
      position: "absolute",
      borderRadius: "50%",
      filter: "blur(60px)",
      opacity: 0.15, // Reduced opacity for a cleaner look
      ...style,
    }}
  />
);

const AdminLogin = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [form] = Form.useForm();
  const [fieldErrors, setFieldErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [focused, setFocused] = useState(null);

  const initialValues = {
    email: location.state?.email || "",
    password: location.state?.password || "",
  };

  const handleChange = (changedValues) => {
    const fieldName = Object.keys(changedValues)[0];
    if (fieldErrors[fieldName]) setFieldErrors((prev) => ({ ...prev, [fieldName]: "" }));
    if (apiError) setApiError("");
  };

  const handleSubmit = async (values) => {
    dispatch(loginStart());
    const formErrors = validateLoginForm(values);
    if (Object.keys(formErrors).length > 0) { setFieldErrors(formErrors); return; }
    setIsLoading(true);
    setApiError("");
    try {
      const response = await tenantLogin({ email: values.email, password: values.password });
      dispatch(loginSuccess(response));
      navigate("/");
    } catch (err) {
      const displayMessage =
        err.userMessage ||
        (err.status === 401 ? "Invalid credentials" : err.status === 403 ? "Account not approved" : "Login failed");
      setApiError(displayMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,300;0,400;1,300;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');

        .al-root { font-family: 'DM Sans', sans-serif; }

        .al-left {
          position: relative;
          /* Changed from a dark solid green to a fresh, standard modern gradient */
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 3rem;
          min-height: 100vh;
          flex: 1.1;
        }

        .al-right {
          flex: 0.9;
          background: #f8faf9;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 3rem 2.5rem;
          min-height: 100vh;
          position: relative;
        }

        .al-grid-lines {
          position: absolute;
          inset: 0;
          /* Made the grid lines white and subtle so they look clean against the lighter background */
          background-image:
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px);
          background-size: 48px 48px;
          pointer-events: none;
        }

        .al-brand-dot {
          width: 10px; height: 10px;
          border-radius: 50%;
          background: #ffffff;
          display: inline-block;
          margin-right: 8px;
          box-shadow: 0 0 12px rgba(255,255,255,0.5);
        }

        .al-tagline {
          font-family: 'Fraunces', serif;
          font-style: italic;
          font-weight: 300;
          font-size: clamp(2rem, 3.5vw, 2.8rem);
          line-height: 1.25;
          color: #ffffff;
          margin: 0 0 1.5rem 0;
        }

        .al-tagline em {
          font-style: normal;
          color: #d1fae5; /* Soft mint color for better contrast on vibrant green */
        }

        .al-quote-block {
          border-left: 2px solid rgba(255,255,255,0.5);
          padding-left: 1.25rem;
          margin-bottom: 2rem;
        }

        .al-quote-text {
          font-family: 'Fraunces', serif;
          font-weight: 300;
          font-size: 1.05rem;
          color: rgba(255,255,255,0.9);
          line-height: 1.65;
          margin: 0 0 0.5rem 0;
        }

        .al-quote-author {
          font-family: 'DM Sans', sans-serif;
          font-size: 0.78rem;
          color: #a7f3d0; /* Soft mint color */
          letter-spacing: 0.1em;
          text-transform: uppercase;
          font-weight: 600;
          margin: 0;
        }

        .al-form-wrap {
          width: 100%;
          max-width: 400px;
        }

        .al-welcome {
          font-family: 'Fraunces', serif;
          font-weight: 400;
          font-size: 2rem;
          color: #111827;
          margin: 0 0 0.25rem 0;
          line-height: 1.2;
        }

        .al-sub {
          font-size: 0.875rem;
          color: #6b7280;
          margin: 0 0 2.25rem 0;
          font-weight: 400;
        }

        .al-label {
          font-size: 0.78rem;
          font-weight: 600;
          color: #374151;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          display: block;
          margin-bottom: 6px;
        }

        .al-input-wrap {
          position: relative;
          margin-bottom: 1.25rem;
        }

        .al-input-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #9ca3af;
          font-size: 15px;
          z-index: 1;
          pointer-events: none;
          transition: color 0.2s;
        }

        .al-input-wrap.focused .al-input-icon {
          color: #059669;
        }

        .al-input {
          width: 100%;
          height: 48px;
          border: 1.5px solid #e5e7eb;
          border-radius: 10px;
          padding: 0 14px 0 40px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.9rem;
          color: #111827;
          background: #fff;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          box-sizing: border-box;
        }

        .al-input:focus {
          border-color: #059669;
          box-shadow: 0 0 0 3px rgba(5,150,105,0.12);
        }

        .al-input.error { border-color: #ef4444; }

        .al-error-text {
          font-size: 0.75rem;
          color: #ef4444;
          margin-top: 4px;
        }

        .al-divider-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.5rem;
        }

        .al-forgot {
          font-size: 0.8rem;
          color: #059669;
          font-weight: 500;
          cursor: pointer;
          background: none;
          border: none;
          padding: 0;
          font-family: 'DM Sans', sans-serif;
          transition: opacity 0.15s;
        }
        .al-forgot:hover { opacity: 0.7; }

        .al-btn {
          width: 100%;
          height: 50px;
          background: #059669;
          color: #fff;
          border: none;
          border-radius: 10px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.95rem;
          font-weight: 600;
          letter-spacing: 0.03em;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
          box-shadow: 0 4px 20px rgba(5,150,105,0.3);
          position: relative;
          overflow: hidden;
        }

        .al-btn:hover:not(:disabled) {
          background: #047857;
          box-shadow: 0 6px 24px rgba(5,150,105,0.4);
          transform: translateY(-1px);
        }
        .al-btn:active:not(:disabled) { transform: translateY(0); }
        .al-btn:disabled { opacity: 0.7; cursor: not-allowed; }

        .al-btn-shine {
          position: absolute;
          top: 0; left: -100%;
          width: 60%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
          animation: al-shine 2.5s infinite;
        }

        @keyframes al-shine {
          0% { left: -100%; }
          60%, 100% { left: 150%; }
        }

        .al-register-row {
          text-align: center;
          margin-top: 1.75rem;
          padding-top: 1.5rem;
          border-top: 1px solid #e5e7eb;
          font-size: 0.84rem;
          color: #9ca3af;
        }

        .al-register-link {
          color: #059669;
          font-weight: 600;
          cursor: pointer;
          background: none;
          border: none;
          padding: 0;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.84rem;
          margin-left: 4px;
          transition: opacity 0.15s;
        }
        .al-register-link:hover { opacity: 0.7; }

        .al-alert {
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 8px;
          padding: 10px 14px;
          font-size: 0.84rem;
          color: #dc2626;
          margin-bottom: 1.25rem;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .al-spinner {
          width: 18px; height: 18px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: al-spin 0.7s linear infinite;
          flex-shrink: 0;
        }

        @keyframes al-spin { to { transform: rotate(360deg); } }

        /* Right panel decoration dots */
        .al-dots {
          position: absolute;
          top: 2rem; right: 2rem;
          display: grid;
          grid-template-columns: repeat(5, 8px);
          grid-template-rows: repeat(5, 8px);
          gap: 6px;
          opacity: 0.15;
        }
        .al-dot {
          width: 3px; height: 3px;
          border-radius: 50%;
          background: #059669;
        }

        @media (max-width: 768px) {
          .al-left { display: none; }
          .al-right { flex: 1; min-height: 100vh; }
        }

        .al-fade-in {
          animation: alFadeUp 0.5s ease both;
        }
        @keyframes alFadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="al-root" style={{ display: "flex", minHeight: "100vh" }}>

        {/* ── LEFT PANEL ── */}
        <div className="al-left">
          <div className="al-grid-lines" />

          {/* Orbs - Updated to soft whites/lights to create a glowing effect rather than dark spots */}
          <Orb style={{ width: 400, height: 400, background: "#ffffff", top: -100, right: -100 }} />
          <Orb style={{ width: 300, height: 300, background: "#ffffff", bottom: 50, left: -80 }} />
          <Orb style={{ width: 200, height: 200, background: "#d1fae5", bottom: 200, right: 80, opacity: 0.2 }} />

          {/* Brand */}
          <div style={{ position: "relative", zIndex: 1 }}>

            <div style={{ display: "flex", alignItems: "baseline", gap: 0 }}>
              <span style={{
                fontFamily: "'Fraunces', serif",
                fontWeight: 400,
                fontSize: "1.85rem",
                color: "#ffffff",
                letterSpacing: "-0.01em",
                lineHeight: 1,
              }}>Hostel</span>
              <span style={{
                fontFamily: "'Fraunces', serif",
                fontStyle: "italic",
                fontWeight: 300,
                fontSize: "1.85rem",
                color: "#a7f3d0", /* Soft mint */
                letterSpacing: "-0.01em",
                lineHeight: 1,
              }}>Xpert</span>
              <span style={{
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 600,
                fontSize: "0.7rem",
                color: "rgba(255,255,255,0.8)",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                marginLeft: 8,
                alignSelf: "center",
                marginBottom: 2,
              }}>Business</span>
            </div>
          </div>

          {/* Center content */}
          <div style={{ position: "relative", zIndex: 1 }}>
            <h1 className="al-tagline">
              Manage smarter,<br />
              grow <em>faster.</em>
            </h1>

            <div className="al-quote-block">
              <p className="al-quote-text">"{SELECTED_QUOTE.text}"</p>
              <p className="al-quote-author">— {SELECTED_QUOTE.author}</p>
            </div>
          </div>

          {/* Footer */}
          <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
            <p style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "0.72rem",
              color: "rgba(255,255,255,0.6)",
              margin: 0,
              letterSpacing: "0.04em",
            }}>© 2026 HostelXpert Business. All rights reserved.</p>
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="al-right">
          {/* Decorative dots */}
          <div className="al-dots">
            {Array.from({ length: 25 }).map((_, i) => <div key={i} className="al-dot" />)}
          </div>

          <div className="al-form-wrap al-fade-in">
            <h2 className="al-welcome">Welcome back</h2>
            <p className="al-sub">Sign in to continue to your dashboard</p>

            {apiError && (
              <div className="al-alert">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {apiError}
              </div>
            )}

            {/* Email */}
            <div>
              <label className="al-label">Email Address</label>
              <div className={`al-input-wrap${focused === "email" ? " focused" : ""}`}>
                <MailOutlined className="al-input-icon" />
                <input
                  className={`al-input${fieldErrors.email ? " error" : ""}`}
                  type="email"
                  placeholder="official@company.com"
                  defaultValue={initialValues.email}
                  onFocus={() => setFocused("email")}
                  onBlur={() => setFocused(null)}
                  onChange={(e) => {
                    if (fieldErrors.email) setFieldErrors(p => ({ ...p, email: "" }));
                    if (apiError) setApiError("");
                  }}
                  id="al-email"
                />
              </div>
              {fieldErrors.email && <div className="al-error-text">{fieldErrors.email}</div>}
            </div>

            {/* Password */}
            <div>
              <div className="al-divider-row" style={{ marginBottom: 6 }}>
                <label className="al-label" style={{ margin: 0 }}>Password</label>
                <button className="al-forgot" onClick={() => navigate("/forgot-password")}>
                  Forgot password?
                </button>
              </div>
              <div className={`al-input-wrap${focused === "password" ? " focused" : ""}`}>
                <LockOutlined className="al-input-icon" />
                <input
                  className={`al-input${fieldErrors.password ? " error" : ""}`}
                  type="password"
                  placeholder="Enter your password"
                  defaultValue={initialValues.password}
                  onFocus={() => setFocused("password")}
                  onBlur={() => setFocused(null)}
                  onChange={() => {
                    if (fieldErrors.password) setFieldErrors(p => ({ ...p, password: "" }));
                    if (apiError) setApiError("");
                  }}
                  id="al-password"
                />
              </div>
              {fieldErrors.password && <div className="al-error-text">{fieldErrors.password}</div>}
            </div>

            <div style={{ marginTop: "1.5rem" }}>
              <button
                className="al-btn"
                disabled={isLoading}
                onClick={async () => {
                  const email = document.getElementById("al-email").value;
                  const password = document.getElementById("al-password").value;
                  await handleSubmit({ email, password });
                }}
              >
                {!isLoading && <div className="al-btn-shine" />}
                {isLoading ? (
                  <><div className="al-spinner" /> Signing in...</>
                ) : (
                  <> Sign In <ArrowRightOutlined /></>
                )}
              </button>
            </div>

            <div className="al-register-row">
              New to the platform?
              <button className="al-register-link" onClick={() => navigate("/register")}>
                Create admin account
              </button>
            </div>
          </div>
        </div>

      </div>
    </>
  );
};

export default AdminLogin;