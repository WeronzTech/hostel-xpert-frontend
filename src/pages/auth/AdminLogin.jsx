import {useState} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import {FiMail, FiLock, FiEye, FiEyeOff} from "react-icons/fi";
import {loginStart, loginSuccess} from "../../redux/authSlice";
import {useDispatch} from "react-redux";
import {validateLoginForm} from "../../utils/validator";
import {tenantLogin} from "../../hooks/auth/useAuth";

const AdminLogin = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    email: location.state?.email ,
    password: location.state?.password ,
    roleName: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const {name, value} = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear field-specific error
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({...prev, [name]: ""}));
    }

    // Clear general API error
    if (apiError) setApiError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(loginStart());

    const formErrors = validateLoginForm(formData);
    if (Object.keys(formErrors).length > 0) {
      setFieldErrors(formErrors);
      return;
    }

    setIsLoading(true);
    setApiError("");
    try {
      const response = await tenantLogin({
        email: formData.email,
        password: formData.password,
        roleName: formData.roleName,
      });

      console.log("Login Success:", response);

      dispatch(loginSuccess(response));

      navigate("/");
    } catch (err) {
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
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#4d44b5] to-[#3a32a0] p-6 text-white text-center">
          <h1 className="text-2xl font-bold">Admin Portal</h1>
          <p className="text-indigo-100 mt-1">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8">
          {apiError && (
            <div className="text-center mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">
              {apiError}
            </div>
          )}

          {/* Email Field */}
          <div className="mb-5">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email Address *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiMail className="text-gray-400" />
              </div>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`pl-10 w-full px-4 py-2 border ${
                  fieldErrors.email ? "border-red-300" : "border-gray-300"
                } rounded-lg focus:ring-[#4d44b5] focus:border-[#4d44b5]`}
                placeholder="official@company.com"
              />
            </div>
            {fieldErrors.email && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.email}</p>
            )}
          </div>

          {/* Password Field */}
          <div className="mb-6">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiLock className="text-gray-400" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`pl-10 w-full px-4 py-2 border ${
                  fieldErrors.password ? "border-red-300" : "border-gray-300"
                } rounded-lg focus:ring-[#4d44b5] focus:border-[#4d44b5]`}
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="cursor-pointer absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
            {fieldErrors.password && (
              <p className="mt-1 text-sm text-red-600">
                {fieldErrors.password}
              </p>
            )}
          </div>

          {/* Role Selection */}
          <div className="mb-6">
            <label
              htmlFor="role"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Role *
            </label>
            <select
              id="roleName"
              required
              name="roleName"
              value={formData.roleName}
              onChange={handleChange}
              className={`w-full px-4 py-2 border ${
                fieldErrors.role ? "border-red-300" : "border-gray-300"
              } rounded-lg focus:ring-[#4d44b5] focus:border-[#4d44b5]`}
            >
              <option value="">Select role</option>{" "}
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
            </select>
            {fieldErrors.role && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.role}</p>
            )}
          </div>

          {/* Remember & Forgot */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="cursor-pointer h-4 w-4 text-[#4d44b5] focus:ring-[#4d44b5] border-gray-300 rounded"
              />
              <label
                htmlFor="remember-me"
                className="ml-2 block text-sm text-gray-700"
              >
                Remember me
              </label>
            </div>
            <div className="text-sm">
              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
                className="cursor-pointer font-medium text-[#4d44b5] hover:text-[#3a32a0]"
              >
                Forgot password?
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`cursor-pointer w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-white bg-[#4d44b5] hover:bg-[#3a32a0] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4d44b5] ${
              isLoading ? "opacity-75 cursor-not-allowed" : ""
            }`}
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </button>

          {/* Registration Link */}
          <div className="mt-6 text-center text-sm text-gray-600">
            <p>
              New to platform?{" "}
              <button
                type="button"
                onClick={() => navigate("/register")}
                className="font-medium text-[#4d44b5] hover:text-[#3a32a0]"
              >
                Create admin account
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
