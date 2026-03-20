import apiClient from "../../utils/apiClient";

export const getAllSubscriptions = async () => {
  try {
    const response = await apiClient.get("/client/subscriptions", {
      params: { isActive: true },
    });
    return response.data;
  } catch (error) {
    throw {
      message: error.response?.data?.message || "Failed to fetch subscriptions",
      status: error.response?.status,
    };
  }
};

export const createSubscriptionPayment = async (paymentData) => {
  try {
    const response = await apiClient.post(
      "/client/subscription-payments",
      paymentData,
    );
    return response.data;
  } catch (error) {
    throw {
      message: error.response?.data?.message || "Failed to process payment",
      status: error.response?.status,
    };
  }
};

export const getMyPaymentHistory = async (clientId) => {
  try {
    const response = await apiClient.get("/client/subscription-payments", {
      params: { clientId },
    });
    return response.data;
  } catch (error) {
    throw {
      message:
        error.response?.data?.message || "Failed to fetch payment history",
      status: error.response?.status,
    };
  }
};

export const getMonthlyOverviews = async (clientId, month, year) => {
  try {
    const response = await apiClient.get(
      "/client/subscription-payments/monthly-overviews",
      {
        params: { clientId, month, year }, // 🔹 ADDED: month and year
      },
    );
    return response.data;
  } catch (error) {
    throw {
      message:
        error.response?.data?.message || "Failed to fetch monthly overviews",
      status: error.response?.status,
    };
  }
};

export const paySubscriptionBill = async (billId, paymentData) => {
  try {
    const response = await apiClient.post(
      `/client/subscription-payments/${billId}/pay`,
      paymentData,
    );
    return response.data;
  } catch (error) {
    throw {
      message: error.response?.data?.message || "Failed to submit payment",
      status: error.response?.status,
    };
  }
};
