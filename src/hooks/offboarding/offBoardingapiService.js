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
      if (type) params.type = type;

      const response = await apiClient.get("/user/status-requests/pending", {
        params,
      });
      //   console.log(`Response from Ofbboarding API Serivce:`, response); // debug log
      return response.data;
    } catch (error) {
      throw this.#handleApiError(error);
    }
  }
  /**
   * Respond to a user status request (accept or reject)
   * @param {string} userId - ID of the user
   * @param {string} requestId - ID of the status request
   * @returns {Promise<Object>} - Response data from the API
   */

  async respondToUserRequest(userId, requestId, payload) {
    // console.log(`Request to the api service: `, payload); // debug log
    try {
      const response = await apiClient.put(
        `/user/${userId}/status-requests/${requestId}/respond`,
        payload
      );

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

      const response = await apiClient.get("/user/offboarding", {params});

      // console.log(`Response from the API Service`, response); // debug log
      return response.data;
    } catch (error) {
      throw this.#handleApiError(error);
    }
  }
}

export const offboardingApiService = new OffboardingApiService();
