import apiClient from "../../utils/apiClient";

/*----------- Offboarding API Service -------------*/

class OffboardingApiService {
  /**
   * Helper method to handle API errors in a consistent way.
   * @private
   * @param {Error} error - The error object thrown
   * @returns {Error} - Custom formatted error object
   */
  #handleApiError(error) {
    const fallbackMsg = error?.response?.data?.message || error.message;
    const details = error?.response?.data?.errors || [];

    //console.error("API Error Response:", error.response?.data); // debug log

    const errorObj = new Error(fallbackMsg);
    errorObj.details = details;

    return errorObj;
  }
  /**
   * Fetch pending status requests with optional filters.
   * @param {string} [propertyId] - Optional property ID to filter by
   * @param {string} [type] - Optional type filter (e.g., "check_in")
   * @returns {Promise<Object>} - Response data from the API
   */
  async getPendingRequest(propertyId, type) {
    try {
      const params = {};
      if (propertyId) params.propertyId = propertyId;
      if (type && type !== "all" && type !== "room_change") params.type = type;

      let combinedData = [];

      // Only fetch status-requests if type is not room_change
      if (!type || type === "all" || type !== "room_change") {
        const response = await apiClient.get("/user/status-requests/pending", {
          params,
        });
        if (response.data?.data) {
          combinedData = [...combinedData, ...response.data.data];
        }
      }

      // Only fetch room-change-requests if type is all or room_change
      if (!type || type === "all" || type === "room_change") {
        try {
          const paramsRoomChange = {};
          if (propertyId) paramsRoomChange.propertyId = propertyId;
          const responseRoomChange = await apiClient.get("/user/room-change-requests/pending", {
            params: paramsRoomChange,
          });
          if (responseRoomChange.data?.data) {
            combinedData = [...combinedData, ...responseRoomChange.data.data];
          }
        } catch (err) {
          console.error("Failed to fetch room change requests:", err);
        }
      }

      // Sort by requestedAt descending
      combinedData.sort((a, b) => {
        const dateA = new Date(a.request?.requestedAt || 0);
        const dateB = new Date(b.request?.requestedAt || 0);
        return dateB - dateA;
      });

      return {
        success: true,
        data: combinedData,
      };
    } catch (error) {
      throw this.#handleApiError(error);
    }
  }
  /**
   * Respond to a user status request (accept or reject)
   * @param {string} userId - ID of the user
   * @param {string} requestId - ID of the status request
   * @param {Object} payload - Response data
   * @param {boolean} [isRoomChange=false] - Whether it is a room change request
   * @returns {Promise<Object>} - Response data from the API
   */

  async respondToUserRequest(userId, requestId, payload, isRoomChange = false) {
    try {
      const endpoint = isRoomChange
        ? `/user/${userId}/room-change-requests/${requestId}/respond`
        : `/user/${userId}/status-requests/${requestId}/respond`;
      const response = await apiClient.put(endpoint, payload);
      return response.data;
    } catch (error) {
      throw this.#handleApiError(error);
    }
  }
  /**
   * Fetch offboarded users with optional filters.
   * @param {Object} options - Filter and pagination options
   * @param {string} options.rentType - Rent type (e.g., "mess")
   * @param {string} options.propertyId - Property ID to filter by
   * @param {number} [options.page=1] - Page number for pagination
   * @param {number} [options.limit=10] - Number of records per page
   * @returns {Promise<Object>} - Response data from the API
   */
  async fetchOffboardedUsers({
    rentType,
    propertyId,
    page = 1,
    limit = 10,
    search,
  }) {
    try {
      const params = {
        rentType,
        propertyId,
        page,
        limit,
      };

      if (search) {
        params.search = search;
      }

      if (propertyId) {
        params.propertyId = propertyId;
      }

      const response = await apiClient.get("/user/offBoarding", { params });

      // console.log(`Response from the API Service`, response); // debug log
      return response.data;
    } catch (error) {
      throw this.#handleApiError(error);
    }
  }
}

export const offboardingApiService = new OffboardingApiService();
