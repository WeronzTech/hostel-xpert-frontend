import {useState} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import {loginStart, loginSuccess} from "../../redux/authSlice";
import {useDispatch} from "react-redux";
import {validateLoginForm} from "../../utils/validator";
import {tenantLogin} from "../../hooks/auth/useAuth";
import {Card, Form, Input, Button, Alert, Typography, Space} from "antd";
import {MailOutlined, LockOutlined} from "@ant-design/icons";

const {Title, Paragraph} = Typography;

const AdminLogin = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [form] = Form.useForm();
  const [fieldErrors, setFieldErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const initialValues = {
    email: location.state?.email || "",
    password: location.state?.password || "",
  };

  const handleChange = (changedValues) => {
    const fieldName = Object.keys(changedValues)[0];

    // Clear field-specific error
    if (fieldErrors[fieldName]) {
      setFieldErrors((prev) => ({...prev, [fieldName]: ""}));
    }

    // Clear general API error
    if (apiError) setApiError("");
  };

  const handleSubmit = async (values) => {
    dispatch(loginStart());

    const formErrors = validateLoginForm(values);
    if (Object.keys(formErrors).length > 0) {
      setFieldErrors(formErrors);
      return;
    }

    setIsLoading(true);
    setApiError("");
    try {
      const response = await tenantLogin({
        email: values.email,
        password: values.password,
      });

      console.log("Login Success:", response);
      dispatch(loginSuccess(response));
      navigate("/");
    } catch (err) {
      console.log(err.data);
      const displayMessage =
        err.userMessage ||
        (err.status === 401
          ? "Invalid credentials"
          : err.status === 403
            ? "Account not approved"
            : "Login failed");

      setApiError(displayMessage);

      if (err.details) {
        console.log("Additional error details:", err.details);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card
        className="w-full max-w-md shadow-lg rounded-2xl overflow-hidden"
        bordered={false}
        styles={{
          body: {padding: 0},
        }}
      >
        {/* Header */}
        <div
          className="bg-gradient-to-r from-[#059669] to-[#059669] p-6 text-white text-center"
          style={{
            background: "linear-gradient(to right, #059669, #059669)",
            padding: "1.5rem",
          }}
        >
          <Title level={3} style={{color: "white", margin: 0}}>
            Admin Portal
          </Title>
          <Paragraph style={{color: "#e0e7ff", margin: "0.25rem 0 0 0"}}>
            Sign in to your account
          </Paragraph>
        </div>

        <div className="p-6 sm:p-8">
          <Form
            form={form}
            name="login-form"
            initialValues={initialValues}
            onFinish={handleSubmit}
            onValuesChange={handleChange}
            layout="vertical"
            size="large"
          >
            {apiError && (
              <Alert
                message={apiError}
                type="error"
                showIcon
                style={{marginBottom: "16px", borderRadius: "8px"}}
                closable
                onClose={() => setApiError("")}
              />
            )}

            {/* Email Field */}
            <Form.Item
              label="Email Address"
              name="email"
              validateStatus={fieldErrors.email ? "error" : ""}
              help={fieldErrors.email}
              rules={[
                {required: true, message: "Please enter your email"},
                {type: "email", message: "Please enter a valid email"},
              ]}
              style={{marginBottom: "16px"}}
            >
              <Input
                prefix={<MailOutlined style={{color: "#9ca3af"}} />}
                placeholder="official@company.com"
                style={{borderRadius: "8px"}}
              />
            </Form.Item>

            {/* Password Field */}
            <Form.Item
              label="Password"
              name="password"
              validateStatus={fieldErrors.password ? "error" : ""}
              help={fieldErrors.password}
              rules={[{required: true, message: "Please enter your password"}]}
              style={{marginBottom: "8px"}}
            >
              <Input.Password
                prefix={<LockOutlined style={{color: "#9ca3af"}} />}
                placeholder="Enter your password"
                style={{borderRadius: "8px"}}
              />
            </Form.Item>

            {/* Forgot Password Link */}
            <div className="flex justify-end" style={{marginBottom: "14px"}}>
              <Button
                type="link"
                onClick={() => navigate("/forgot-password")}
                style={{
                  color: "#059669",
                  padding: 0,
                  height: "auto",
                  fontWeight: 500,
                }}
              >
                Forgot password?
              </Button>
            </div>

            {/* Submit Button */}
            <Form.Item style={{marginBottom: 0}}>
              <Button
                type="primary"
                htmlType="submit"
                loading={isLoading}
                block
                style={{
                  height: "48px",
                  borderRadius: "8px",
                  backgroundColor: "#059669",
                  borderColor: "#059669",
                  fontSize: "16px",
                  fontWeight: 500,
                }}
                className="hover:opacity-90"
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </Form.Item>
          </Form>

          {/* Registration Link - Inline */}
          <div
            className="text-center"
            style={{
              paddingTop: "24px",
              borderTop: "1px solid #e5e7eb",
              marginTop: "24px",
            }}
          >
            <Space>
              <span style={{color: "#6b7280", fontSize: "0.875rem"}}>
                New to platform?
              </span>
              <Button
                type="link"
                onClick={() => navigate("/register")}
                style={{
                  color: "#059669",
                  fontWeight: 500,
                  padding: "0 0.25rem",
                  height: "auto",
                  fontSize: "0.875rem",
                }}
              >
                Create admin account
              </Button>
            </Space>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AdminLogin;
