import apiClient from "../../utils/apiClient";

export const createWebsitePropertyContent = async (formData) => {
  try {
    for (let [key, value] of formData.entries()) {
      console.log(key, value);
    }

    const response = await apiClient.post(`/website`, formData);

    console.debug("website content added successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("website content added  failed:", error);

    const apiError = {
      message: error.response?.data?.message || "website content added  failed",
      details:
        error.response?.data?.errors || error.response?.data || error.message,
      status: error.response?.status,
    };

    throw apiError;
  }
};

export const getAllWebsitePropertyContents = async () => {
  try {
    const response = await apiClient.get(`/website`);
    console.log(
      "getAllWebsitePropertyContents fetched successfully:",
      response.data
    );
    return response?.data?.data;
  } catch (error) {
    console.error("Fetching getAllWebsitePropertyContents failed:", error);

    const apiError = {
      message:
        error.response?.data?.message ||
        "Fetching getAllWebsitePropertyContents failed",
      details:
        error.response?.data?.errors || error.response?.data || error.message,
      status: error.response?.status,
    };

    throw apiError;
  }
};

export const updateWebsitePropertyContent = async (contentId, formData) => {
  try {
    // Debugging: log FormData key-value pairs
    for (let [key, value] of formData.entries()) {
      console.log(key, value);
    }

    const response = await apiClient.put(`/website/${contentId}`, formData);

    console.debug("✅ Website content updated successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Website content update failed:", error);

    const apiError = {
      message: error.response?.data?.message || "Website content update failed",
      details:
        error.response?.data?.errors || error.response?.data || error.message,
      status: error.response?.status,
    };

    throw apiError;
  }
};

export const getWebsitePropertyContentById = async (id) => {
  try {
    const response = await apiClient.get(`/website/${id}`);
    console.log(
      "getWebsitePropertyContentById fetched successfully:",
      response.data
    );
    return response?.data?.data;
  } catch (error) {
    console.error("Fetching getWebsitePropertyContentById failed:", error);

    const apiError = {
      message:
        error.response?.data?.message ||
        "Fetching getWebsitePropertyContentById failed",
      details:
        error.response?.data?.errors || error.response?.data || error.message,
      status: error.response?.status,
    };

    throw apiError;
  }
};

export const addCommonMediaContent = async (formData) => {
  try {
    // Debug: Log FormData contents
    console.log("FormData contents:");
    for (let [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(key, value.name, value.type, value.size);
      } else {
        console.log(key, value);
      }
    }

    const response = await apiClient.post(`/website/common`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    console.debug("Common website content added successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("Common website content added failed:", error);

    const apiError = {
      message:
        error.response?.data?.message || "Common website content added failed",
      details:
        error.response?.data?.errors || error.response?.data || error.message,
      status: error.response?.status,
    };

    throw apiError;
  }
};

export const getAllCommonMedia = async () => {
  try {
    const response = await apiClient.get(`/website/common`);
    console.log("getAllCommonMedia fetched successfully:", response.data);
    return response?.data?.data;
  } catch (error) {
    console.error("Fetching getAllCommonMedia failed:", error);

    const apiError = {
      message:
        error.response?.data?.message || "Fetching getAllCommonMedia failed",
      details:
        error.response?.data?.errors || error.response?.data || error.message,
      status: error.response?.status,
    };

    throw apiError;
  }
};

export const getCommonMediaById = async (id) => {
  try {
    const response = await apiClient.get(`/website/common/${id}`);
    console.log("getCommonMediaById fetched successfully:", response.data);
    return response?.data?.data;
  } catch (error) {
    console.error("Fetching getCommonMediaById failed:", error);

    const apiError = {
      message:
        error.response?.data?.message || "Fetching getCommonMediaById failed",
      details:
        error.response?.data?.errors || error.response?.data || error.message,
      status: error.response?.status,
    };

    throw apiError;
  }
};

export const deleteCommonMediaItems = async (id, payload) => {
  try {
    console.log("🗑️ Deleting Common Media Items:", {id, payload});

    const response = await apiClient.delete(`/website/common/${id}`, {
      data: payload,
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.debug("✅ Common media items deleted successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Failed to delete common media items:", error);

    const apiError = {
      message:
        error.response?.data?.message || "Failed to delete common media items",
      details:
        error.response?.data?.errors || error.response?.data || error.message,
      status: error.response?.status,
    };

    throw apiError;
  }
};
