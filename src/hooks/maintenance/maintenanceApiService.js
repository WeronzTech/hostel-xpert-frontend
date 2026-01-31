import apiClient from "../../utils/apiClient.js";

/*----------- Maintenance API Service -------------*/
class MaintenanceApiService {
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
   * Fetches all maintenance records for a given property ID.
   *
   * @param {string} propertyId - The ID of the property
   * @returns {Promise<Array>} An array of maintenance records
   * @throws {Error} Throws a formatted error if the API request fails
   */
  async getMaintenanceByPropertyId({propertyId, status, page = 1, limit = 10}) {
    try {
      const response = await apiClient.get(
        `/property/maintenance/by-property/${propertyId}`,
        {
          params: {status, page, limit},
        }
      );
      // console.log(`Response from maintenance api:`, response); // debug log
      return response.data.data;
    } catch (error) {
      throw this.#handleApiError(error);
    }
  }
  async assignStaffToMaintenance({maintenanceId, staffId, timeNeeded}) {
    try {
      const response = await apiClient.patch(
        `/property/maintenance/assign-staff/${maintenanceId}`,
        {staffId, timeNeeded}
      );
      return response.data.data;
    } catch (error) {
      throw this.#handleApiError(error);
    }
  }

  async getMaintenancebyId(maintenanceId) {
    try {
      const response = await apiClient.get(
        `/property/maintenance/${maintenanceId}`
      );
      // console.log(`Response from maintenance api: `, response.data); // debug log
      return response.data;
    } catch (error) {
      throw this.#handleApiError(error);
    }
  }
}

export const maintenanceApiService = new MaintenanceApiService();
