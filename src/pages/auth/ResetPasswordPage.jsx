import {useState} from "react";
import {useSearchParams, useNavigate} from "react-router-dom";
import {useMutation} from "@tanstack/react-query";
import {
  FiEye,
  FiEyeOff,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
} from "react-icons/fi";
import {resetPassword} from "../../hooks/auth/useAuth";

const ResetPasswordPage = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Get token from URL
  const token = searchParams.get("token");

  // TanStack Query mutation for reset password
  const resetPasswordMutation = useMutation({
    mutationFn: resetPassword,
    onSuccess: (result) => {
      if (result.success) {
        // Success is handled in the component logic
      } else {
        setError(result.message || "Failed to reset password");
      }
    },
    onError: (error) => {
      console.error("Reset password error:", error);
      setError("Something went wrong. Please try again.");
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("Invalid or missing reset token");
      return;
    }

    // Validation
    if (!password || !confirmPassword) {
      setError("Please fill in both fields.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;

    if (!passwordRegex.test(password)) {
      setError(
        "Password must contain at least 6 characters, including uppercase, lowercase, number, and special character."
      );
      return;
    }

    // Use TanStack Query mutation
    resetPasswordMutation.mutate({token, password});
  };

  // Check if mutation was successful
  const isSuccess =
    resetPasswordMutation.isSuccess && resetPasswordMutation.data?.success;
  const isError =
    resetPasswordMutation.isError ||
    (resetPasswordMutation.data && !resetPasswordMutation.data.success);
  const isLoading = resetPasswordMutation.isPending;

  if (isError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white px-6 py-8 text-center font-['Inter',_sans-serif]">
        <div className="mx-auto w-full max-w-md">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-red-100">
            <FiXCircle className="h-12 w-12 text-red-600" />
          </div>
          <h1 className="mt-8 text-3xl font-bold tracking-tight text-gray-900">
            Invalid Reset Link
          </h1>
          <p className="mt-3 text-sm text-gray-600 whitespace-nowrap">
            This password reset link is invalid or has expired.
          </p>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white px-6 py-8 text-center font-['Inter',_sans-serif]">
        <div className="mx-auto w-full max-w-md">
          {/* Success Icon */}
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-green-100">
            <FiCheckCircle className="h-12 w-12 text-green-600" />
          </div>

          {/* Success Headings */}
          <h1 className="mt-8 text-3xl font-bold tracking-tight text-gray-900">
            Password Reset Successfully!
          </h1>
          <p className="mt-3 text-sm text-gray-600 whitespace-nowrap">
            You can now log in with your new password.
          </p>
        </div>
      </div>
    );
  }

  // Form View: The main password reset form
  return (
    <div className="flex min-h-screen flex-col bg-white px-6 py-8 font-['Inter',_sans-serif]">
      <div className="mx-auto w-full max-w-md">
        {/* Header Icon */}
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gray-100">
          <FiAlertCircle className="h-12 w-12 text-gray-600" />
        </div>

        {/* Headings */}
        <h1 className="mt-8 text-center text-3xl font-bold tracking-tight text-gray-900">
          Set New Password
        </h1>
        <p className="mt-3 text-center text-sm text-gray-600">
          Create a new, secure password for your account.
        </p>

        {/* Form */}
        <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
          {/* New Password Field */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-bold leading-6 text-gray-800"
            >
              New Password
            </label>
            <div className="relative mt-2 bg-gray-100 rounded-xl">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-xl bg-transparent px-4 py-4 text-gray-900 placeholder:text-gray-400 sm:text-sm sm:leading-6 focus:outline-none focus:ring-2 focus:ring-[#98264A] focus:ring-offset-2 focus:border-transparent"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-4 bg-transparent border-none focus:outline-none"
              >
                {showPassword ? (
                  <FiEyeOff className="h-5 w-5 text-gray-500" />
                ) : (
                  <FiEye className="h-5 w-5 text-gray-500" />
                )}
              </button>
            </div>
          </div>

          {/* Confirm Password Field */}
          <div>
            <label
              htmlFor="confirm-password"
              className="block text-sm font-bold leading-6 text-gray-800"
            >
              Confirm Password
            </label>
            <div className="relative mt-2 bg-gray-100 rounded-xl">
              <input
                id="confirm-password"
                name="confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="block w-full rounded-xl bg-transparent px-4 py-4 text-gray-900 placeholder:text-gray-400 sm:text-sm sm:leading-6 focus:outline-none focus:ring-2 focus:ring-[#98264A] focus:ring-offset-2 focus:border-transparent"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-4 bg-transparent border-none focus:outline-none"
              >
                {showConfirmPassword ? (
                  <FiEyeOff className="h-5 w-5 text-gray-500" />
                ) : (
                  <FiEye className="h-5 w-5 text-gray-500" />
                )}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-lg bg-red-50 p-4">
              <p className="text-sm text-red-800 text-center">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full justify-center rounded-xl bg-[#98264A] px-4 py-4 text-base font-semibold text-white shadow-sm hover:bg-[#892243] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#98264A] disabled:opacity-50"
            >
              {isLoading ? (
                <svg
                  className="animate-spin h-5 w-5 text-white"
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
              ) : (
                "Reset Password"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
