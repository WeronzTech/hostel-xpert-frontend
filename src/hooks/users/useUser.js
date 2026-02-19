import apiClient from "../../utils/apiClient";

export const registerResident = async (registerData) => {
  try {
    console.debug("registering resident:", registerData);
    const response = await apiClient.post(
      `/user/registerFromPanel`,
      registerData,
    );
    console.debug("Resident registration successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("Approval failed:", error);

    const apiError = {
      message: error.response?.data?.message || "registration failed",
      details:
        error.response?.data?.errors || error.response?.data || error.message,
      status: error.response?.status,
    };

    throw apiError;
  }
};

export const getUnapprovedHeavensResidents = async (propertyId) => {
  try {
    console.log("fetched heavens residents:", propertyId); // Debug log
    const response = await apiClient.get("/user/pending-approvals", {
      params: {propertyId},
    });
    console.debug("fetched heavens residents(get):", response.data);
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

export const getResidentById = async (id) => {
  try {
    console.debug("fetched heavens resident:", id); // Debug log
    const response = await apiClient.get(`/user/${id}`);
    console.log("API Response Data:", response.data);
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

export const approveResident = async (id, approvalData) => {
  try {
    console.debug("Approving resident:", id, approvalData);
    const response = await apiClient.put(`/user/${id}/approve`, approvalData);
    console.debug("Resident approved successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("Approval failed:", error);

    const apiError = {
      message: error.response?.data?.message || "Approval failed",
      details:
        error.response?.data?.errors || error.response?.data || error.message,
      status: error.response?.status,
    };

    throw apiError;
  }
};

export const getUsers = async ({
  rentType,
  propertyId,
  page = 1,
  limit = 100,
  search,
  status,
  joinDate,
  all,
}) => {
  try {
    const response = await apiClient.get("/user", {
      params: {
        rentType,
        propertyId,
        page,
        limit,
        search,
        status,
        joinDate,
        all,
      },
      paramsSerializer: (params) => {
        return Object.entries(params)
          .filter(([_, value]) => value !== undefined)
          .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
          .join("&");
      },
    });
    return response.data;
  } catch (error) {
    console.error("Fetching users failed:", error);

    const apiError = {
      message: error.response?.data?.message || "Fetching users failed",
      details:
        error.response?.data?.errors || error.response?.data || error.message,
      status: error.response?.status,
    };

    throw apiError;
  }
};

export const updateResidentByAdmin = async (id, formData) => {
  try {
    for (let [key, value] of formData.entries()) {
      console.log(key, value);
    }

    const response = await apiClient.put(`/user/${id}`, formData);

    console.debug("Resident updated by admin successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("Admin update failed:", error);

    const apiError = {
      message: error.response?.data?.message || "Admin update failed",
      details:
        error.response?.data?.errors || error.response?.data || error.message,
      status: error.response?.status,
    };

    throw apiError;
  }
};

export const rejectResident = async (id, adminName) => {
  console.log(adminName);
  try {
    console.log("Rejecting resident:", id);
    const response = await apiClient.delete(`/user/${id}/reject`, {
      params: {updatedBy: adminName},
    });
    console.debug("Resident rejected successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("Rejection failed:", error);

    const apiError = {
      message: error.response?.data?.message || "Rejection failed",
      details:
        error.response?.data?.errors || error.response?.data || error.message,
      status: error.response?.status,
    };

    throw apiError;
  }
};

export const vacateResident = async ({id, adminName}) => {
  try {
    console.debug("Vacating resident:", id);
    const response = await apiClient.put(
      `/user/${id}/vacate`,
      {},
      {
        params: {adminName},
      },
    );
    console.debug("Resident vacated successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("Vacating failed:", error);

    const apiError = {
      message: error.response?.data?.message || "Vacating failed",
      details:
        error.response?.data?.errors || error.response?.data || error.message,
      status: error.response?.status,
    };

    throw apiError;
  }
};

export const getTodayCheckouts = async ({type, propertyId} = {}) => {
  try {
    console.debug("Fetching today checkouts:", {type, propertyId});

    const response = await apiClient.get("/user/checkouts", {
      params: {type, propertyId},
      paramsSerializer: (params) =>
        Object.entries(params)
          .filter(([_, value]) => value !== undefined && value !== null)
          .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
          .join("&"),
    });

    console.debug("Fetched today checkouts:", response.data);
    return response.data;
  } catch (error) {
    console.error("Fetching today checkouts failed:", error);

    const apiError = {
      message:
        error.response?.data?.message || "Fetching today checkouts failed",
      details:
        error.response?.data?.errors || error.response?.data || error.message,
      status: error.response?.status,
    };

    throw apiError;
  }
};

export const extendUserDays = async (id, extendData) => {
  try {
    console.debug("Extending stay for user:", id, extendData);
    const response = await apiClient.put(`/user/${id}/extend`, extendData);
    console.debug("Stay extended successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("Extending stay failed:", error);

    const apiError = {
      message: error.response?.data?.message || "Extending stay failed",
      details:
        error.response?.data?.errors || error.response?.data || error.message,
      status: error.response?.status,
    };

    throw apiError;
  }
};

export const getUserStatusRequests = async (id, {type, status} = {}) => {
  try {
    console.debug("Fetching user status requests:", {id, type, status});

    const response = await apiClient.get(`/user/${id}/status-requests`, {
      params: {type, status},
      paramsSerializer: (params) =>
        Object.entries(params)
          .filter(([_, value]) => value !== undefined && value !== null)
          .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
          .join("&"),
    });

    console.debug("Fetched user status requests:", response.data);
    return response.data;
  } catch (error) {
    console.error("Fetching user status requests failed:", error);

    const apiError = {
      message:
        error.response?.data?.message || "Fetching user status requests failed",
      details:
        error.response?.data?.errors || error.response?.data || error.message,
      status: error.response?.status,
    };

    throw apiError;
  }
};

export const handleBlockStatus = async (
  id,
  {action, extendDate, adminName} = {},
) => {
  try {
    console.debug("Updating block status for user:", id, {action, extendDate});

    const response = await apiClient.put(`/user/${id}/block-status`, {
      action,
      extendDate,
      adminName,
    });

    console.debug("Block status updated successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("Updating block status failed:", error);

    const apiError = {
      message: error.response?.data?.message || "Updating block status failed",
      details:
        error.response?.data?.errors || error.response?.data || error.message,
      status: error.response?.status,
    };

    throw apiError;
  }
};

export const rejoinUser = async (id, rejoinData) => {
  try {
    console.log("Rejoining user:", id, rejoinData);

    const response = await apiClient.put(`/user/${id}/rejoin`, rejoinData);

    console.debug("User rejoined successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("Rejoining user failed:", error);

    const apiError = {
      message: error.response?.data?.message || "Rejoining user failed",
      details:
        error.response?.data?.errors || error.response?.data || error.message,
      status: error.response?.status,
    };

    throw apiError;
  }
};

export const getActivityLogs = async ({
  propertyId,
  page = 1,
  limit = 10,
  startDate,
  endDate,
} = {}) => {
  try {
    const response = await apiClient.get(`/user/logs/activityLogs`, {
      params: {
        propertyId,
        page,
        limit,
        startDate,
        endDate,
        sort: "-createdAt", // Add this to sort by newest first
      },
      paramsSerializer: (params) =>
        Object.entries(params)
          .filter(([_, value]) => value !== undefined && value !== null)
          .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
          .join("&"),
    });

    return {
      data: response.data.data,
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

export const createNote = async (noteData) => {
  try {
    console.log("Creating note:", noteData);
    const response = await apiClient.post("/reminder", noteData);
    console.debug("Note created successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("Creating note failed:", error);

    const apiError = {
      message: error.response?.data?.message || "Creating note failed",
      details:
        error.response?.data?.errors || error.response?.data || error.message,
      status: error.response?.status,
    };

    throw apiError;
  }
};

// Get all notes for a specific user
export const getUserNotes = async (userId) => {
  try {
    console.debug("Fetching notes for user:", userId);
    const response = await apiClient.get(`/reminder/${userId}`);
    console.log("Notes fetched successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("Fetching notes failed:", error);

    const apiError = {
      message: error.response?.data?.message || "Fetching notes failed",
      details:
        error.response?.data?.errors || error.response?.data || error.message,
      status: error.response?.status,
    };

    throw apiError;
  }
};

// Get all active reminders (for dashboard)
export const getActiveReminders = async (propertyId) => {
  try {
    // console.log("Fetching active reminders", propertyId);
    const response = await apiClient.get("/reminder/active/reminders", {
      params: propertyId ? {propertyId} : {},
    });
    console.debug("Active reminders fetched successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("Fetching active reminders failed:", error);

    const apiError = {
      message:
        error.response?.data?.message || "Fetching active reminders failed",
      details:
        error.response?.data?.errors || error.response?.data || error.message,
      status: error.response?.status,
    };

    throw apiError;
  }
};

// Update a note (mainly for content updates)
export const updateNote = async (noteId, content) => {
  try {
    console.debug("Updating note:", noteId, content);
    const response = await apiClient.put(`/reminder/${noteId}`, {
      content,
    });
    console.debug("Note updated successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("Updating note failed:", error);

    const apiError = {
      message: error.response?.data?.message || "Updating note failed",
      details:
        error.response?.data?.errors || error.response?.data || error.message,
      status: error.response?.status,
    };

    throw apiError;
  }
};

// Mark reminder as completed
export const completeReminder = async (takenBy, noteId, actionNotes) => {
  try {
    console.debug("Completing reminder:", noteId, actionNotes);
    const response = await apiClient.patch(`/reminder/${noteId}/complete`, {
      takenBy,
      actionNotes,
    });
    console.debug("Reminder marked as completed successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("Completing reminder failed:", error);

    const apiError = {
      message: error.response?.data?.message || "Completing reminder failed",
      details:
        error.response?.data?.errors || error.response?.data || error.message,
      status: error.response?.status,
    };

    throw apiError;
  }
};

// Snooze a reminder
export const snoozeReminder = async (takenBy, noteId, newDate, reason) => {
  try {
    console.debug("Snoozing reminder:", noteId, newDate, reason);
    const response = await apiClient.patch(`/reminder/${noteId}/snooze`, {
      takenBy,
      newDate,
      reason,
    });
    console.debug("Reminder snoozed successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("Snoozing reminder failed:", error);

    const apiError = {
      message: error.response?.data?.message || "Snoozing reminder failed",
      details:
        error.response?.data?.errors || error.response?.data || error.message,
      status: error.response?.status,
    };

    throw apiError;
  }
};

// Delete a note
export const deleteNote = async (noteId) => {
  try {
    console.debug("Deleting note:", noteId);
    const response = await apiClient.delete(`/reminder/${noteId}`);
    console.debug("Note deleted successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("Deleting note failed:", error);

    const apiError = {
      message: error.response?.data?.message || "Deleting note failed",
      details:
        error.response?.data?.errors || error.response?.data || error.message,
      status: error.response?.status,
    };

    throw apiError;
  }
};

// Mark overdue reminders (for admin/scheduled tasks)
export const markOverdueReminders = async () => {
  try {
    console.debug("Marking overdue reminders");
    const response = await apiClient.post("/reminder/mark-overdue");
    console.debug("Overdue reminders marked successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("Marking overdue reminders failed:", error);

    const apiError = {
      message:
        error.response?.data?.message || "Marking overdue reminders failed",
      details:
        error.response?.data?.errors || error.response?.data || error.message,
      status: error.response?.status,
    };

    throw apiError;
  }
};

export const getUserTransactionHistory = async (userId) => {
  try {
    console.debug("Fetching transactions for user:", userId);
    const response = await apiClient.get(
      `/feePayments/transactionHistory/${userId}`,
    );
    console.debug("transactions fetched successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("Fetching transactions failed:", error);

    const apiError = {
      message: error.response?.data?.message || "Fetching transactions failed",
      details:
        error.response?.data?.errors || error.response?.data || error.message,
      status: error.response?.status,
    };

    throw apiError;
  }
};

export const getUserDepositTransactionHistory = async (userId) => {
  try {
    console.debug("Fetching transactions for user:", userId);
    const response = await apiClient.get(
      `/depositPayments/transactionHistory/${userId}`,
    );
    console.debug("transactions fetched successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("Fetching transactions failed:", error);

    const apiError = {
      message: error.response?.data?.message || "Fetching transactions failed",
      details:
        error.response?.data?.errors || error.response?.data || error.message,
      status: error.response?.status,
    };

    throw apiError;
  }
};

export const getUserBusFeeTransactionHistory = async (userId) => {
  try {
    console.debug("Fetching transactions for user:", userId);
    const response = await apiClient.get(
      `/busPayments/transactionHistory/${userId}`,
    );
    console.debug("transactions fetched successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("Fetching transactions failed:", error);

    const apiError = {
      message: error.response?.data?.message || "Fetching transactions failed",
      details:
        error.response?.data?.errors || error.response?.data || error.message,
      status: error.response?.status,
    };

    throw apiError;
  }
};

export const allocateUsersToAgent = async (agentId, userIds) => {
  try {
    console.debug("allocation data:", agentId, userIds);
    const response = await apiClient.post("/user/allocateUsersToAgent", {
      agentId,
      userIds,
    });

    console.debug("Allocation successful:", response.data);
    return response.data;
  } catch (error) {
    console.error("Allocation failed:", error);

    const apiError = {
      message: error.response?.data?.message || "Allocation failed",
      details:
        error.response?.data?.errors || error.response?.data || error.message,
      status: error.response?.status,
    };

    throw apiError;
  }
};

export const getReferralSettings = async () => {
  try {
    const response = await apiClient.get("/referral/settings");
    console.debug("Referral settings fetched successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("Fetching settings details failed:", error);

    const apiError = {
      message:
        error.response?.data?.message || "Fetching settings details failed",
      details:
        error.response?.data?.errors || error.response?.data || error.message,
      status: error.response?.status,
    };

    throw apiError;
  }
};

/**
 * Update referral settings via backend API
 * @param {Object} data - Referral settings data
 * @returns {Promise<Object>} - API response
 */
export const updateReferralSettings = async (data) => {
  try {
    const response = await apiClient.put("/referral/settings", data);
    console.debug("Referral settings updated successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("Updating referral settings failed:", error);

    const apiError = {
      message:
        error.response?.data?.message || "Updating referral settings failed",
      details:
        error.response?.data?.errors || error.response?.data || error.message,
      status: error.response?.status,
    };

    throw apiError;
  }
};

export const createGameItem = async (formData) => {
  try {
    const response = await apiClient.post("/gaming/items", formData, {
      headers: {"Content-Type": "multipart/form-data"},
    });
    console.debug("Item created successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("Creating Item failed:", error);
    const apiError = {
      message: error.response?.data?.message || "Creating Item failed",
      details:
        error.response?.data?.errors || error.response?.data || error.message,
      status: error.response?.status,
    };
    throw apiError;
  }
};

// ✅ Get all gaming items
export const getAllGameItems = async () => {
  try {
    const response = await apiClient.get("/gaming/items");
    return response.data.data; // because backend returns { success, status, data: [...] }
  } catch (error) {
    console.error("Fetching items failed:", error);
    throw error;
  }
};

export const updateGamingItem = async (itemId, formData) => {
  try {
    const response = await apiClient.patch(
      `/gaming/items/${itemId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateGamingItemStatus = async (itemId, status) => {
  try {
    const response = await apiClient.patch(`/gaming/items/status/${itemId}`, {
      status,
    });
    console.debug("✅ Item status updated successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Updating item status failed:", error);
    const apiError = {
      message: error.response?.data?.message || "Updating item status failed",
      details: error.response?.data?.errors || error.response?.data,
      status: error.response?.status,
    };
    throw apiError;
  }
};

export const deleteGamingItem = async (itemId) => {
  try {
    const response = await apiClient.delete(`/gaming/items/${itemId}`);
    console.debug("✅ Item deleted successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Deleting Gaming Item failed:", error);
    const apiError = {
      message: error.response?.data?.message || "Deleting item failed",
      details: error.response?.data?.errors || error.response?.data,
      status: error.response?.status,
    };
    throw apiError;
  }
};

export const updateGameActiveStatusForAllUsers = async (status) => {
  try {
    const response = await apiClient.post("/gaming/status/active", {
      status,
    });
    console.debug(
      "✅ Game active status updated for all users:",
      response.data,
    );
    return response.data;
  } catch (error) {
    console.error(
      "❌ Updating game active status for all users failed:",
      error,
    );
    const apiError = {
      message:
        error.response?.data?.message ||
        "Failed to update game active status for all users",
      details: error.response?.data?.errors || error.response?.data,
      status: error.response?.status,
    };
    throw apiError;
  }
};

export const getAllAttendanceByDate = async ({
  date,
  search,
  roomId,
  status,
  propertyId,
}) => {
  try {
    console.log({date, search, propertyId});
    const response = await apiClient.get("/user/attendance/all", {
      params: {
        date,
        search,
        roomId,
        status,
        propertyId,
      },
      paramsSerializer: (params) => {
        return Object.entries(params)
          .filter(([_, value]) => value !== undefined && value !== "")
          .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
          .join("&");
      },
    });

    return response.data;
  } catch (error) {
    console.error("Fetching attendance failed:", error);

    throw {
      message: error.response?.data?.message || "Fetching attendance failed",
      details:
        error.response?.data?.errors || error.response?.data || error.message,
      status: error.response?.status,
    };
  }
};

export const markAttendance = async ({
  userId,
  status,
  markedBy,
  remarks,
  date,
}) => {
  try {
    const response = await apiClient.post("/user/attendance/mark", {
      userId,
      status,
      markedBy,
      remarks,
      date,
    });

    return response.data;
  } catch (error) {
    console.error("Mark attendance failed:", error);

    throw {
      message: error.response?.data?.message || "Mark attendance failed",
      details:
        error.response?.data?.errors || error.response?.data || error.message,
      status: error.response?.status,
    };
  }
};

export const getUserAttendance = async ({userId, startDate, endDate}) => {
  try {
    const response = await apiClient.get(`/user/attendance/user/${userId}`, {
      params: {
        userId,
        startDate,
        endDate,
      },
      paramsSerializer: (params) => {
        return Object.entries(params)
          .filter(([_, value]) => value !== undefined && value !== "")
          .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
          .join("&");
      },
    });

    return response.data;
  } catch (error) {
    console.error("Fetching user attendance failed:", error);

    throw {
      message:
        error.response?.data?.message || "Fetching user attendance failed",
      details:
        error.response?.data?.errors || error.response?.data || error.message,
      status: error.response?.status,
    };
  }
};

export const getRoomsByDate = async ({search, propertyId}) => {
  try {
    const response = await apiClient.get("/user/attendance/rooms-by-date", {
      params: {search, propertyId},
      paramsSerializer: (params) => {
        return Object.entries(params)
          .filter(([_, value]) => value !== undefined && value !== "")
          .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
          .join("&");
      },
    });

    return response.data;
  } catch (error) {
    console.error("Fetching rooms failed:", error);

    throw {
      message: error.response?.data?.message || "Fetching rooms failed",
      details:
        error.response?.data?.errors || error.response?.data || error.message,
      status: error.response?.status,
    };
  }
};

export const bulkMarkAttendance = async ({
  userIds,
  status,
  markedBy,
  remarks,
  date,
  roomId,
  roomNumber,
}) => {
  try {
    const response = await apiClient.post("/user/attendance/bulk-mark", {
      userIds,
      status,
      markedBy,
      remarks,
      date,
      roomId,
      roomNumber,
    });

    return response.data;
  } catch (error) {
    console.error("Bulk mark attendance failed:", error);

    throw {
      message: error.response?.data?.message || "Bulk mark attendance failed",
      details:
        error.response?.data?.errors || error.response?.data || error.message,
      status: error.response?.status,
    };
  }
};

export const createLeaveCategory = async ({name, autoApprove, propertyId}) => {
  try {
    const response = await apiClient.post("/user/leave-category/create", {
      name,
      autoApprove,
      propertyId,
    });

    return response.data;
  } catch (error) {
    console.error("Create leave category failed:", error);

    throw {
      message: error.response?.data?.message || "Create leave category failed",
      details:
        error.response?.data?.errors || error.response?.data || error.message,
      status: error.response?.status,
    };
  }
};

export const getAllLeaveCategories = async () => {
  try {
    const response = await apiClient.get("/user/leave-category/all");

    return response.data;
  } catch (error) {
    console.error("Fetch leave categories failed:", error);

    throw {
      message:
        error.response?.data?.message || "Failed to fetch leave categories",
      details:
        error.response?.data?.errors || error.response?.data || error.message,
      status: error.response?.status,
    };
  }
};

export const deleteLeaveCategory = async (id) => {
  try {
    const response = await apiClient.delete(
      `/user/leave-category/delete/${id}`,
    );

    return response.data;
  } catch (error) {
    console.error("Delete leave category failed:", error);

    throw {
      message:
        error.response?.data?.message || "Failed to delete leave category",
      details:
        error.response?.data?.errors || error.response?.data || error.message,
      status: error.response?.status,
    };
  }
};

export const getAllLeaveRequests = async ({
  propertyId,
  search,
  status,
  fromDate,
  toDate,
}) => {
  try {
    const response = await apiClient.get(`/user/leave/all`, {
      params: {
        propertyId,
        search,
        status,
        fromDate,
        toDate,
      },
      paramsSerializer: (params) => {
        return Object.entries(params)
          .filter(([_, value]) => value !== undefined && value !== "")
          .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
          .join("&");
      },
    });

    return response.data;
  } catch (error) {
    console.error("Fetching user attendance failed:", error);

    throw {
      message:
        error.response?.data?.message || "Fetching user attendance failed",
      details:
        error.response?.data?.errors || error.response?.data || error.message,
      status: error.response?.status,
    };
  }
};

export const respondToLeave = async ({
  leaveId,
  status,
  adminComment,
  reviewedBy,
  adminName,
}) => {
  try {
    const response = await apiClient.patch("/user/leave/respond", {
      leaveId,
      status,
      adminComment,
      reviewedBy,
      adminName,
    });

    return response.data;
  } catch (error) {
    console.error("Respond to leave failed:", error);

    throw {
      message:
        error.response?.data?.message || "Failed to respond to leave request",
      details:
        error.response?.data?.errors || error.response?.data || error.message,
      status: error.response?.status,
    };
  }
};

export const getUserLeaves = async (userId) => {
  try {
    const response = await apiClient.get(`/user/leave/my-history/${userId}`);

    return response.data;
  } catch (error) {
    console.error("Fetch user leaves failed:", error);

    throw {
      message: error.response?.data?.message || "Failed to fetch user leaves",
      details:
        error.response?.data?.errors || error.response?.data || error.message,
      status: error.response?.status,
    };
  }
};

export const getAllGatePassRequests = async ({
  propertyId,
  clientId,
  search,
  status,
  date,
}) => {
  try {
    const response = await apiClient.get("/user/gatePass/all", {
      params: {
        propertyId,
        clientId,
        search,
        status,
        date,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Fetch gate pass requests failed:", error);

    throw {
      message:
        error.response?.data?.message || "Failed to fetch gate pass requests",
      details:
        error.response?.data?.errors || error.response?.data || error.message,
      status: error.response?.status,
    };
  }
};

export const respondToGatePass = async (payload) => {
  try {
    const response = await apiClient.patch("/user/gatePass/respond", payload);

    return response.data;
  } catch (error) {
    console.error("Respond to gate pass failed:", error);

    throw {
      message:
        error.response?.data?.message || "Failed to respond to gate pass",
      details:
        error.response?.data?.errors || error.response?.data || error.message,
      status: error.response?.status,
    };
  }
};
