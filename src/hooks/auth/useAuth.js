import apiClient from "../../utils/apiClient";

export const tenantLogin = async (credentials) => {
  try {
    const sanitizedCredentials = {
      email: credentials.email.toLowerCase().trim(),
      password: credentials.password.trim(),
      roleName: credentials?.roleName || "admin",
    };

    const response = await apiClient.post(
      "/auth/tenant-login",
      sanitizedCredentials
    );

    return response.data;
  } catch (error) {
    // Enhanced error parsing
    const backendError = error.response?.data || {};

    const apiError = {
      // User-friendly message
      userMessage: backendError.message || "Login failed. Please try again.",

      // Technical details
      technicalMessage: backendError.error || error.message,

      // Status information
      status: error.response?.status,
      code: backendError.code,

      // Additional details
      details: backendError.details,

      // Full error for debugging
      fullError: error.response?.data,
    };

    console.error("Login failed:", apiError);
    throw apiError;
  }
};

export const resetPassword = async ({token, password}) => {
  try {
    console.debug("reset password:", password, token);
    const response = await apiClient.post(`/auth/reset-password`, {
      token,
      password,
    });
    console.debug("Password reset successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("Password reset failed:", error);

    const apiError = {
      message: error.response?.data?.message || "Password reset failed",
      details:
        error.response?.data?.errors || error.response?.data || error.message,
      status: error.response?.status,
    };

    throw apiError;
  }
};
