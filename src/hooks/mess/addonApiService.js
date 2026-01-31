/*----------- Addon API Service -------------*/

import apiClient from "../../utils/apiClient";

class AddonApiService {
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
   * Fetches the addons for a given kitchen.
   * @param {Object} options - Request parameters
   * @param {string} options.kitchenId - Unique ID of the kitchen
   * @param {string} [options.mealType] - Optional filter: meal type (e.g., "breakfast", "lunch")
   * @param {boolean} [options.isAvailable] - Optional filter: only fetch addons that are available
   * @returns {Promise<Object>} - A promise resolving to the fetched addon data
   * @throws {Error} - Throws a formatted error if the API request fails
   */
  async getAddonsForKitchen({kitchenId, mealType, isAvailable}) {
    try {
      const params = new URLSearchParams();

      if (kitchenId) params.append("kitchenId", kitchenId);

      if (Array.isArray(mealType) && mealType.length > 0) {
        mealType.forEach((type) => params.append("mealType", type));
      }

      if (isAvailable !== null && isAvailable !== undefined) {
        params.append("isAvailable", String(isAvailable));
      }

      const response = await apiClient.get("/inventory/addon/kitchen", {
        params,
      });

      // console.log(`Addon API service response: `, response.data); // debug log
      return response.data;
    } catch (error) {
      throw this.#handleApiError(error);
    }
  }

  /**
   * Creates a new addon for a specific kitchen.
   * @param {Object} addonData - The payload for creating the addon
   * @returns {Promise<Object>} - A promise resolving to the created addon data
   * @throws {Error} - Throws a formatted error if the API request fails
   */
  async createAddon(addonData) {
    try {
      const response = await apiClient.post(
        "/inventory/addon/kitchen",
        addonData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // console.log(`Addon created succesfully: `, response.data); // debug log

      return response.data;
    } catch (error) {
      throw this.#handleApiError(error);
    }
  }

  /**
   * Updates the availability of a specific addon.
   * @param {Object} options - Parameters for updating availability
   * @param {string} options.addonId - Unique ID of the addon
   * @param {boolean} options.isAvailable - The new availability state (true = available, false = unavailable)
   * @returns {Promise<Object>} - A promise resolving to the updated addon data
   * @throws {Error} - Throws a formatted error if the API request fails
   */
  async updateAddonAvailability({addonId, isAvailable}) {
    try {
      const response = await apiClient.patch(
        `/inventory/addon/availability/${addonId}`,
        {isAvailable}
      );
      // console.log(`Addon availability updated succesfully: `, response.data); // debug log
      return response.data;
    } catch (error) {
      throw this.#handleApiError(error);
    }
  }

  /**
   * Delete an existing addon by ID.
   * @param {Object} options - Parameters for deleteing the addon
   * @param {string} options.addonId - Unique ID of the addon to be updated
   * @returns {Promise<Object>} - A promise resolving to the deleted addon data
   * @throws {Error} - Throws a formatted error if the API request fails
   */
  async deleteAddon(addonId) {
    try {
      const response = await apiClient.delete(`/inventory/addon/${addonId}`);

      // console.log(`Addon deleted succesfully: `, response.data); // debug log
      return response.data;
    } catch (error) {
      throw this.#handleApiError(error);
    }
  }

  /**
   * Updates an existing addon by ID.
   * @param {Object} options - Parameters for updating the addon
   * @param {string} options.addonId - Unique ID of the addon to be updated
   * @param {Object} options.updateData - The fields to update (can include text fields and image)
   * @returns {Promise<Object>} - A promise resolving to the updated addon data
   * @throws {Error} - Throws a formatted error if the API request fails
   */
  async updateAddon({addonId, data}) {
    try {
      const response = await apiClient.patch(
        `/inventory/addon/${addonId}`,
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data", // support file upload if itemImage is included
          },
        }
      );

      console.log(`Addon updated successfully: `, response.data); // debug log
      return response.data;
    } catch (error) {
      throw this.#handleApiError(error);
    }
  }
}

export const addonApiService = new AddonApiService();
