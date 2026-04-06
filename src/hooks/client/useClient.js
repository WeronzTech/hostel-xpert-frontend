import apiClient from "../../utils/apiClient";

export const registerClient = async (clientData) => {
  try {
    console.debug("Registering client:", clientData); // Debug log
    const response = await apiClient.post(
      "/client/register-client",
      clientData,
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
        error.response?.data?.errors || error.response?.data || error.message,
      status: error.response?.status,
    };

    throw apiError;
  }
};

export const getClientByEmail = async (data) => {
  try {
    // Direct GET request without params
    const response = await apiClient.post("client/getClientByEmail", {
      email: data,
    });

    console.debug("Client fetched successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("Get client by email failed:", error);

    const apiError = {
      message: error.response?.data?.message || "Failed to fetch client",
      details:
        error.response?.data?.errors || error.response?.data || error.message,
      status: error.response?.status,
    };

    throw apiError;
  }
};

export const updateClientProfile = async (profileData) => {
  try {
    const response = await apiClient.put("/client/profile", profileData);
    return response.data;
  } catch (error) {
    throw {
      message: error.response?.data?.message || "Failed to update profile",
      status: error.response?.status,
    };
  }
};

export const setBillingConfig = async ({billingDay, graceDays}) => {
  try {
    const response = await apiClient.post("client/billingConfig/set", {
      billingDay,
      graceDays,
    });

    console.debug("config successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("Set Config failed:", error);

    const apiError = {
      message: error.response?.data?.message || "Failed to set config",
      details:
        error.response?.data?.errors || error.response?.data || error.message,
      status: error.response?.status,
    };

    throw apiError;
  }
};

export const getBillingConfig = async () => {
  try {
    const response = await apiClient.get("client/billingConfig/get", {});

    console.debug("get config successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("get Config failed:", error);

    const apiError = {
      message: error.response?.data?.message || "Failed to get config",
      details:
        error.response?.data?.errors || error.response?.data || error.message,
      status: error.response?.status,
    };

    throw apiError;
  }
};
