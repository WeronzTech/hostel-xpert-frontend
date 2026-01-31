import apiClient from "../../utils/apiClient";

export const addStaff = async (staffData) => {
  try {
    console.debug("staff Adding:", staffData); // Debug log
    const response = await apiClient.post("property/staff/add", staffData);
    console.debug("Staff added successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("Fetching failed:", error);

    // Create consistent error object
    const apiError = {
      message: error.response?.data?.message || "Fetching failed",
      details:
        error.response?.data?.errors || error.response?.data || error.message,
      status: error.response?.status,
    };

    throw apiError;
  }
};

export const getAllStaff = async () => {
  try {
    const response = await apiClient.get("/staff/getAll");
    console.log("Fetched available staff:", response.data.staff);
    return response.data?.staff || [];
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

// Attendance

export const markAttendance = async (attendanceData) => {
  try {
    const response = await apiClient.post("/attendance", attendanceData);
    return response.data; // { success, status, message, data }
  } catch (error) {
    console.error("Mark attendance failed:", error);

    const apiError = {
      message: error.response?.data?.message || "Mark attendance failed",
      details:
        error.response?.data?.errors || error.response?.data || error.message,
      status: error.response?.status || 500,
    };

    throw apiError;
  }
};

export const getAllStaffForAttendance = async (filter = {}) => {
  try {
    console.log("hererere");
    const res = await apiClient.get(`/staff/attendance/getAll`, {
      params: filter,
    });
    console.log(res?.data);
    return res.data;
  } catch (err) {
    console.error(`Error fetching staff:`, err);
    throw new Error(err.response?.data?.message || "Failed to fetch staff");
  }
};

export const getAllAttendance = async (params = {}) => {
  try {
    const response = await apiClient.get("/attendance", {params});
    return response.data;
  } catch (error) {
    console.error("Get attendance overview failed:", error);
    throw {
      message:
        error.response?.data?.message || "Failed to fetch attendance overview",
      status: error.response?.status || 500,
    };
  }
};

export const updateAttendance = async (updateData) => {
  try {
    console.log(updateData);
    const response = await apiClient.put("/attendance/update", updateData);
    return response.data;
  } catch (error) {
    console.error("Update attendance failed:", error);
    throw {
      message: error.response?.data?.message || "Failed to update attendance",
      status: error.response?.status || 500,
    };
  }
};

export const getAttendanceSummary = async (params = {}) => {
  try {
    console.log(params);
    const response = await apiClient.get("/attendance/summary", {params});
    return response.data;
  } catch (error) {
    console.error("Get attendance overview failed:", error);
    throw {
      message:
        error.response?.data?.message || "Failed to fetch attendance overview",
      status: error.response?.status || 500,
    };
  }
};

export const getAvailableAttendanceDates = async (employeeId) => {
  try {
    console.log("Fetching available dates for employee:", employeeId);
    const response = await apiClient.get(
      `/attendance/availableDates/${employeeId}`
    );
    return response?.data?.data;
  } catch (error) {
    console.error("Get available attendance dates failed:", error);
    throw {
      message:
        error.response?.data?.message ||
        "Failed to fetch available attendance dates",
      status: error.response?.status || 500,
    };
  }
};
