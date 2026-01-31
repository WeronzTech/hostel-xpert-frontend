import { useState } from "react";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiLock,
  FiHome,
  FiMapPin,
  FiEyeOff,
  FiEye,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { validateRegistrationForm } from "../../utils/validator.js";
import { registerClient } from "../../hooks/client/useClient.js";

const AdminRegistration = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [formData, setFormData] = useState({
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
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      if (name.includes(".")) {
        const [parent, child] = name.split(".");
        return {
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: value,
          },
        };
      }
      return { ...prev, [name]: value };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(""); // Clear previous errors
    setLoading(true);

    // Frontend validation
    const validationErrors = validateRegistrationForm(formData);
    if (validationErrors.length > 0) {
      setErrorMsg(validationErrors.join("\n")); // Separate errors with newlines
      setLoading(false);
      return;
    }

    try {
      const response = await registerClient(formData);
      console.log("Registration Success:", response);
      console.log(response.success);

      // Handle successful registration
      if (response.success) {
        navigate("/login", {
          state: {
            email: formData.primaryAdmin.email,
            password: formData.primaryAdmin.password,
          },
        });
        // Option 2: Show success message then redirect
        // setSuccessMsg('Registration successful! Redirecting...');
        // setTimeout(() => navigate('/'), 2000);
      } else {
        setErrorMsg(response.message || "Registration completed with warnings");
      }
    } catch (err) {
      console.error("Registration Error:", err);

      let errorMessage = "Registration failed. Please try again.";

      if (err.details) {
        // Handle structured error from apiClient
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

      setErrorMsg(errorMessage);

      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-[#4d44b5] to-[#3a32a0] p-6 text-white">
          <h1 className="text-2xl font-bold">Admin Registration</h1>
          <p className="text-indigo-100">
            Create your organization's admin account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8">
          {/* Error Message */}
          {errorMsg && (
            <p className="text-red-600 mb-4 text-center">{errorMsg}</p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Company Information */}
            <div className="md:col-span-2">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
                Company Information
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company Name *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiHome className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleChange}
                      required
                      className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#4d44b5] focus:border-[#4d44b5]"
                      placeholder="Enter company/organization name"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Primary Admin */}
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
                Primary Admin
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiUser className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="primaryAdmin.name"
                      value={formData.primaryAdmin.name}
                      onChange={handleChange}
                      required
                      className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#4d44b5] focus:border-[#4d44b5]"
                      placeholder="Admin's full name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiMail className="text-gray-400" />
                    </div>
                    <input
                      type="email"
                      name="primaryAdmin.email"
                      value={formData.primaryAdmin.email}
                      onChange={handleChange}
                      required
                      className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#4d44b5] focus:border-[#4d44b5]"
                      placeholder="official@company.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiPhone className="text-gray-400" />
                    </div>
                    <input
                      type="tel"
                      name="primaryAdmin.phone"
                      value={formData.primaryAdmin.phone}
                      onChange={handleChange}
                      required
                      className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#4d44b5] focus:border-[#4d44b5]"
                      placeholder="Phone with country code"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiLock className="text-gray-400" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="primaryAdmin.password"
                      value={formData.primaryAdmin.password}
                      onChange={handleChange}
                      required
                      minLength="6"
                      className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#4d44b5] focus:border-[#4d44b5]"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="cursor-pointer absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Min 6 chars, incl. 1 number, uppercase & special character
                  </p>
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
                Company Address
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Street *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiMapPin className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="address.street"
                      value={formData.address.street}
                      onChange={handleChange}
                      required
                      className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#4d44b5] focus:border-[#4d44b5]"
                      placeholder="Street address"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      name="address.city"
                      value={formData.address.city}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#4d44b5] focus:border-[#4d44b5]"
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State *
                    </label>
                    <input
                      type="text"
                      name="address.state"
                      value={formData.address.state}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#4d44b5] focus:border-[#4d44b5]"
                      placeholder="State/Province"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Country *
                    </label>
                    <select
                      name="address.country"
                      value={formData.address.country}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#4d44b5] focus:border-[#4d44b5]"
                    >
                      <option value="India">India</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ZIP Code *
                    </label>
                    <input
                      type="text"
                      name="address.zipCode"
                      value={formData.address.zipCode}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#4d44b5] focus:border-[#4d44b5]"
                      placeholder="Postal/ZIP code"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="mt-8 flex flex-col-reverse sm:flex-row sm:justify-between items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <p className="text-sm text-gray-600 text-center sm:text-left mt-4 sm:mt-0">
              Already have an account?{" "}
              <span
                onClick={() => navigate("/login")}
                className="text-[#4d44b5] font-medium hover:underline cursor-pointer"
              >
                Login
              </span>
            </p>

            <button
              type="submit"
              disabled={loading}
              className={`cursor-pointer w-full sm:w-auto px-6 py-2 bg-[#4d44b5] text-white rounded-lg hover:bg-[#3a32a0] focus:outline-none focus:ring-2 focus:ring-[#4d44b5] focus:ring-offset-2 disabled:opacity-50 ${
                loading ? "opacity-75 cursor-not-allowed" : ""
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin h-5 w-5 mr-2 text-white"
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
                  Registering...
                </span>
              ) : (
                "Register"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminRegistration;
