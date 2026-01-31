import apiClient from "../../utils/apiClient";

export const registerProperty = async (propertyData) => {
  try {
    console.debug("Registering Property:", propertyData);
    const response = await apiClient.post("/property/register", propertyData);
    console.debug("Registration successful:", response.data);
    return response.data;
  } catch (error) {
    console.error("Registration failed:", error);

    const apiError = {
      message: error.response?.data?.message || "Registration failed",
      details:
        error.response?.data?.errors || error.response?.data || error.message,
      status: error.response?.status,
    };

    throw apiError;
  }
};

export const getAllHeavensProperties = async (propertyId) => {
  try {
    console.log("Fetching heavens property:", propertyId); // Debug log

    const response = await apiClient.get("/property/heavens-properties", {
      params: propertyId ? { propertyId } : {}, // ✅ pass query only if provided
    });

    console.debug("Fetched heavens property(get):", response.data);
    return response.data.data;
  } catch (error) {
    console.error("Fetching failed:", error);

    const apiError = {
      message: error.response?.data?.message || "Fetching failed",
      details:
        error.response?.data?.errors || error.response?.data || error.message,
      status: error.response?.status,
    };

    throw apiError;
  }
};

export const addRoom = async (roomData) => {
  try {
    console.debug("Room Added:", roomData); // Debug log
    const response = await apiClient.post("/property/room/add", roomData);
    console.debug("Room added successfully:", response.data);
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

export const getAllHeavensRooms = async (heavensRoomData) => {
  try {
    console.debug("fetched heavens heavens Room Data:", heavensRoomData);
    const response = await apiClient.get("/property/room/heavens-rooms", {
      params: {
        propertyId: heavensRoomData?.propertyId || null, // Use the parameter passed in
      },
    });
    console.debug("fetched heavens rooms(get):", response.data);
    return response.data;
  } catch (error) {
    console.error("Fetching failed:", error);

    const apiError = {
      message: error.response?.data?.message || "Fetching failed",
      details:
        error.response?.data?.errors || error.response?.data || error.message,
      status: error.response?.status,
    };

    throw apiError;
  }
};

export const getAvailableRoomsByProperty = async (propertyId) => {
  try {
    const response = await apiClient.get("/property/room/availableRooms", {
      params: { propertyId },
    });
    console.log("Fetched available rooms:", response.data);

    console.debug("Fetched available rooms:", response.data);
    return {
      rooms: response.data?.rooms || [],
      pricing: response.data?.pricing || {},
    };
  } catch (error) {
    console.error("Fetching failed:", error);

    const apiError = {
      message: error.response?.data?.message || "Fetching failed",
      details:
        error.response?.data?.errors || error.response?.data || error.message,
      status: error.response?.status,
    };

    throw apiError;
  }
};

export const updateRooms = async (roomId, updatedData) => {
  try {
    // Use template literal to insert the actual roomId
    const response = await apiClient.put(
      `/property/room/update/${roomId}`,
      updatedData
    );
    console.log("room updated successfully:", response.data);

    return {
      rooms: response.data?.data || [],
    };
  } catch (error) {
    console.error("Update failed:", error);

    const apiError = {
      message: error.response?.data?.message || "Update failed",
      details:
        error.response?.data?.errors || error.response?.data || error.message,
      status: error.response?.status,
    };

    throw apiError;
  }
};

export const deleteRooms = async ({ roomId, adminName }) => {
  try {
    const response = await apiClient.delete(`/property/room/delete/${roomId}`, {
      params: { adminName }, // Pass as query
    });
    console.log("API Delete response data", response.data);
    return response.data; // or adapt based on API
  } catch (error) {
    console.error("API Delete error:", error);
    throw error;
  }
};

export const getRoomOccupants = async (roomId) => {
  try {
    const response = await apiClient.get(`/property/room/occupants/${roomId}`);
    console.log("Users fetched successfully:", response.data);

    return {
      roomId: response.data.roomId,
      occupantCount: response.data.occupantCount,
      occupants: response.data.occupants || [],
    };
  } catch (error) {
    console.error("Fetching failed:", error);

    const apiError = {
      message: error.response?.data?.message || "Fetch failed",
      details:
        error.response?.data?.errors || error.response?.data || error.message,
      status: error.response?.status || 500,
    };

    throw apiError;
  }
};

export const updateProperty = async (propertyId, propertyData) => {
  try {
    console.debug("Updating Property:", propertyData);
    const response = await apiClient.put(
      `/property/edit/${propertyId}`,
      propertyData
    );
    console.debug("Update successful:", response.data);
    return response.data.data;
  } catch (error) {
    console.error("Update failed:", error);

    const apiError = {
      message: error.response?.data?.message || "Update failed",
      details:
        error.response?.data?.errors || error.response?.data || error.message,
      status: error.response?.status,
    };

    throw apiError;
  }
};

export const getPropertyDetails = async (propertyId) => {
  try {
    const response = await apiClient.get(`/property/${propertyId}`);
    // Adjust the URL route to match your back-end
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

export const getPropertyActivityLogs = async ({
  propertyId,
  page = 1,
  limit = 10,
  startDate,
  endDate,
  category,
} = {}) => {
  try {
    const response = await apiClient.get(`/property/logs/get`, {
      params: {
        propertyId,
        page,
        limit,
        startDate,
        endDate,
        sort: "-createdAt", // Add this to sort by newest first
        category,
      },
      paramsSerializer: (params) =>
        Object.entries(params)
          .filter(([_, value]) => value !== undefined && value !== null)
          .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
          .join("&"),
    });

    return {
      data: response.data.logs,
      pagination: {
        page: response.data.pagination?.page || parseInt(page),
        limit: response.data.pagination?.limit || parseInt(limit),
        total: response.data.pagination?.total || 0,
        totalPages:
          response.data.pagination?.totalPages ||
          Math.ceil((response.data.pagination?.total || 0) / limit),
      },
    };
  } catch (error) {
    console.error("Error fetching activity logs:", error);

    const apiError = {
      message: error.response?.data?.message || "Failed to fetch activity logs",
      details: error.response?.data?.errors || error.message,
      status: error.response?.status,
    };

    throw apiError;
  }
};

export const getDashboardStats = async (propertyId) => {
  try {
    const response = await apiClient.get(`/property/dashboard/stats`, {
      params: propertyId ? { propertyId } : {},
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);

    const apiError = {
      message:
        error.response?.data?.message || "Failed to fetch dashboard stats",
      details: error.response?.data?.errors || error.message,
      status: error.response?.status,
    };

    throw apiError;
  }
};

export const createMaintenance = async (formData) => {
  try {
    // Debugging - log form data before sending
    console.log("Creating maintenance with:", formData);

    const response = await apiClient.post(
      `/property/maintenance/create`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error creating maintenance record:", error);
    throw new Error(
      error.response?.data?.message || "Failed to create maintenance record"
    );
  }
};

export const markMaintenanceAsResolved = async (
  maintenanceId,
  remarks = null
) => {
  try {
    const response = await apiClient.patch(
      `/property/maintenance/resolve/${maintenanceId}`,
      {
        remarks,
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error marking maintenance as resolved:", error);

    const apiError = {
      message:
        error.response?.data?.message || "Failed to resolve maintenance record",
      details: error.response?.data?.errors || error.message,
      status: error.response?.status,
    };

    throw apiError;
  }
};

export const addCarousel = async (data) => {
  try {
    const response = await apiClient.post("/property/carousel/add", data);

    console.debug("Carousel successfully added:", response.data);
    return response.data;
  } catch (error) {
    console.error("Add Carousel failed:", error);

    const apiError = {
      message: error.response?.data?.message || "Failed to add carousel",
      details:
        error.response?.data?.errors || error.response?.data || error.message,
      status: error.response?.status,
    };

    throw apiError;
  }
};

export const updateCarousel = async (data, carouseId) => {
  try {
    const response = await apiClient.put(
      `/property/carousel/update/${carouseId}`,
      data
    );

    console.debug("Carousel successfully updated:", response.data);
    return response.data;
  } catch (error) {
    console.error("update Carousel failed:", error);

    const apiError = {
      message: error.response?.data?.message || "Failed to update carousel",
      details:
        error.response?.data?.errors || error.response?.data || error.message,
      status: error.response?.status,
    };

    throw apiError;
  }
};

export const deleteCarousel = async (carouseId) => {
  try {
    const response = await apiClient.delete(
      `/property/carousel/delete/${carouseId}`
    );

    console.debug("Carousel successfully deleted:", response.data);
    return response.data;
  } catch (error) {
    console.error("delete Carousel failed:", error);

    const apiError = {
      message: error.response?.data?.message || "Failed to delete carousel",
      details:
        error.response?.data?.errors || error.response?.data || error.message,
      status: error.response?.status,
    };

    throw apiError;
  }
};

export const getAllCarousel = async () => {
  try {
    const response = await apiClient.get("/property/carousel/get");
    console.debug("Carousel successfully fetched:", response.data);
    return response.data;
  } catch (error) {
    console.error("Fetching of all Carousel failed:", error);
    const apiError = {
      message: error.response?.data?.message || "Failed to fetch all carousels",
      details:
        error.response?.data?.errors || error.response?.data || error.message,
      status: error.response?.status,
    };
    throw apiError;
  }
};

export const getFloorsByPropertyId = async (propertyId) => {
  try {
    // Send propertyId as a query parameter
    const response = await apiClient.get(`/property/floor`, {
      params: { propertyId },
    });

    console.debug("Floors successfully fetched:", response.data);
    return response.data;
  } catch (error) {
    console.error("Fetching floors failed:", error);
    const apiError = {
      message: error.response?.data?.message || "Failed to fetch floors",
      details:
        error.response?.data?.errors || error.response?.data || error.message,
      status: error.response?.status,
    };
    throw apiError;
  }
};

/**
 * Get all rooms for a given floor
 * @param {string} floorId
 * @returns {Promise<Object>} Response data from API
 */
export const getRoomsByFloorId = async (floorId) => {
  if (!floorId) {
    throw {
      message: "floorId is required to fetch rooms",
    };
  }

  try {
    const response = await apiClient.get(
      "/property/room/by-floor",
      {
        params: { floorId },
      }
    );

    console.debug("✅ Rooms by Floor fetched:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Failed to fetch rooms by floor:", error);
    throw {
      message: error.response?.data?.message || "Failed to fetch rooms by floor",
      details: error.response?.data || error.message,
      status: error.response?.status,
    };
  }
};

export const addFloor = async (data) => {
  try {
    const response = await apiClient.post("/property/floor/", data);

    return response.data;
  } catch (error) {
    console.error("Add floor failed:", error);

    const apiError = {
      message: error.response?.data?.message || "Failed to add floor",
      details:
        error.response?.data?.errors || error.response?.data || error.message,
      status: error.response?.status,
    };

    throw apiError;
  }
};

export const updateFloor = async (data, floorId) => {
  try {
    const response = await apiClient.put(
      `/property/floor/${floorId}`,
      data
    );

    //console.debug("floor successfully updated:", response.data);
    return response.data;
  } catch (error) {
    console.error("update floor failed:", error);

    const apiError = {
      message: error.response?.data?.message || "Failed to update floor",
      details:
        error.response?.data?.errors || error.response?.data || error.message,
      status: error.response?.status,
    };

    throw apiError;
  }
};

export const deleteFloor = async (floorId) => {
  try {
    const response = await apiClient.delete(
      `/property/floor/${floorId}`
    );

    console.debug("floor successfully deleted:", response.data);
    return response.data;
  } catch (error) {
    console.error("delete floor failed:", error);

    const apiError = {
      message: error.response?.data?.message || "Failed to delete floor",
      details:
        error.response?.data?.errors || error.response?.data || error.message,
      status: error.response?.status,
    };

    throw apiError;
  }
};

export const addAsset = async (data) => {
  try {
    const response = await apiClient.post("property/asset", data);

    return response.data;
  } catch (error) {
    console.error("Add Asset failed:", error);

    const apiError = {
      message: error.response?.data?.message || "Failed to add Asset",
      details:
        error.response?.data?.errors || error.response?.data || error.message,
      status: error.response?.status,
    };

    throw apiError;
  }
};

export const addMultipleAsset = async (data) => {
  try {
    const response = await apiClient.post("property/asset/bulk", data);

    return response.data;
  } catch (error) {
    console.error("Add Bulk Asset failed:", error);

    const apiError = {
      message: error.response?.data?.message || "Failed to add Bulk Asset",
      details:
        error.response?.data?.errors || error.response?.data || error.message,
      status: error.response?.status,
    };

    throw apiError;
  }
};

export const createAssetCategory = async (data) => {
  try {
    const response = await apiClient.post("property/asset/category", data);

    return response.data;
  } catch (error) {
    console.error("Add Asset Category failed:", error);

    const apiError = {
      message: error.response?.data?.message || "Failed to add Asset Category",
      details:
        error.response?.data?.errors || error.response?.data || error.message,
      status: error.response?.status,
    };

    throw apiError;
  }
};

export const getAssetCategory = async () => {
  try {
    const response = await apiClient.get("property/asset/category");

    return response.data;
  } catch (error) {
    console.error("fetch Asset Category failed:", error);

    const apiError = {
      message: error.response?.data?.message || "Failed to fetch Asset Category",
      details:
        error.response?.data?.errors || error.response?.data || error.message,
      status: error.response?.status,
    };

    throw apiError;
  }
};

export const updateAssetCategory = async (data, categoryId) => {
  try {
    const response = await apiClient.put(
      `/property/asset/category/${categoryId}`,
      data
    );

    //console.debug("floor successfully updated:", response.data);
    return response.data;
  } catch (error) {
    console.error("update Asset Category failed:", error);

    const apiError = {
      message: error.response?.data?.message || "Failed to update Asset Category",
      details:
        error.response?.data?.errors || error.response?.data || error.message,
      status: error.response?.status,
    };

    throw apiError;
  }
};

export const deleteAssetCategory = async (categoryId) => {
  try {
    const response = await apiClient.delete(
      `property/asset/category/${categoryId}`
    );

    console.debug("Asset Category successfully deleted:", response.data);
    return response.data;
  } catch (error) {
    console.error("delete Asset Category failed:", error);

    const apiError = {
      message: error.response?.data?.message || "Failed to Asset Category floor",
      details:
        error.response?.data?.errors || error.response?.data || error.message,
      status: error.response?.status,
    };

    throw apiError;
  }
};

export const getAllAssets = async (filters = {}) => {
  try {
    const params = {};

    if (filters.propertyId) params.propertyId = filters.propertyId;
    if (filters.floorId) params.floorId = filters.floorId;
    if (filters.roomId) params.roomId = filters.roomId;
    if (filters.categoryId) params.categoryId = filters.categoryId;
    if (filters.status) params.status = filters.status;

    const response = await apiClient.get("/property/asset", { params });

    console.debug("Assets fetched successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("Fetching assets failed:", error);

    const apiError = {
      message: error.response?.data?.message || "Failed to fetch assets",
      details:
        error.response?.data?.errors || error.response?.data || error.message,
      status: error.response?.status,
    };

    throw apiError;
  }
};

export const updateAssetStatus = async (data) => {
  try {
    const { id, status, soldDetails } = data;

    const payload = { status };
    if (status === "Sold" && soldDetails) {
      payload.soldDetails = soldDetails;
    }

    const response = await apiClient.patch(`/property/asset/status/${id}`, payload);

    console.debug("Asset status updated successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("Updating asset status failed:", error);

    const apiError = {
      message: error.response?.data?.message || "Failed to update asset status",
      details:
        error.response?.data?.errors || error.response?.data || error.message,
      status: error.response?.status,
    };

    throw apiError;
  }
};


export const updateAsset = async (data, assetId) => {
  try {
    const response = await apiClient.put(
      `/property/asset/${assetId}`,
      data
    );

    console.debug("asset successfully updated:", response.data);
    return response.data;
  } catch (error) {
    console.error("update asset failed:", error);

    const apiError = {
      message: error.response?.data?.message || "Failed to update asset",
      details:
        error.response?.data?.errors || error.response?.data || error.message,
      status: error.response?.status,
    };

    throw apiError;
  }
};

export const deleteAsset = async (assetId) => {
  try {
    const response = await apiClient.delete(
      `/property/asset/${assetId}`
    );

    console.debug("Asset  successfully deleted:", response.data);
    return response.data;
  } catch (error) {
    console.error("delete Asset  failed:", error);

    const apiError = {
      message: error.response?.data?.message || "Failed to Asset  floor",
      details:
        error.response?.data?.errors || error.response?.data || error.message,
      status: error.response?.status,
    };

    throw apiError;
  }
};
export const getAssetLabelsPDF = async (filters = {}) => {
  try {
    const response = await apiClient.get("/property/asset/download-labels", {
      params: filters,
      responseType: 'blob' // Important: tell axios to handle binary data
    });
    return response;
  } catch (error) {
    console.error("Error fetching Asset Labels PDF:", error);
    throw error;
  }
};