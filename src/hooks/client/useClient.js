import apiClient from "../../utils/apiClient";

export const registerClient = async (clientData) => {
  try {
    console.debug("Registering client:", clientData); // Debug log
    const response = await apiClient.post(
      "/client/api/client/register",
      clientData
    );
    console.debug("Registration successful:", response.data);
    return response.data;
  } catch (error) {
    console.error("Registration failed:", error);

    // Create consistent error object
    const apiError = {
      message: error.response?.data?.message || "Registration failed",
      details:
        error.response?.data?.errors || error.response?.data || error.message,
      status: error.response?.status,
    };

    throw apiError;
  }
};

export const getAllAgencies = async () => {
  try {
    // Direct GET request without params
    const response = await apiClient.get("client/agency/");

    console.debug("Agencies fetched successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("Get all agencies failed:", error);

    const apiError = {
      message: error.response?.data?.message || "Failed to fetch agencies",
      details:
        error.response?.data?.errors ||
        error.response?.data ||
        error.message,
      status: error.response?.status,
    };

    throw apiError;
  }
};