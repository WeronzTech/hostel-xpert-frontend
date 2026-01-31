import apiClient from "../../utils/apiClient.js";

/*----------- Mess API Service -------------*/
class MessApiService {
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
   * Fetches the weekly mess menu for a given property.
   * @returns {Promise<Object>} The mess menu data
   * @throws {Error} If property ID is missing or API call fails
   */
  async getMessMenu(kitchenId) {
    console.log(`Mess API Service: ${kitchenId}`); // Debug log

    try {
      const response = await apiClient.get(`inventory/mess/weekly-menu`, {
        params: {
          kitchenId,
        },
      });
      // const response = await apiClient.get(`/mess/weekly-menu/685d403355481a50def3e77`);

      if (response.data?.statusCode || response.data?.success) {
        return response.data;
      }

      const message = response.data?.message || "Failed to fetch mess menu.";
      throw new Error(message);
    } catch (error) {
      throw this.#handleApiError(error);
    }
  }

  /**
   * Creates or updates the weekly mess menu for a given property.
   * @param {string} propertyId - The selected property's ID
   * @param {Object} menuData - The weekly menu data to be saved
   * @returns {Promise<Object>} The API response
   * @throws {Error} If property ID is missing or API call fails
   */
  async createMessMenu(menuData) {
    // Check if propertyId is provided
    try {
      //console.log("Sending menuData to backend:", menuData); // debug log
      const response = await apiClient.post(
        `/inventory/mess/weekly-menu`,
        menuData
      );

      if (response.data?.statusCode || response.data?.success) {
        return response.data;
      }
      const message = response.data?.message || "Failed to create mess menu.";
      throw new Error(message);
    } catch (error) {
      throw this.#handleApiError(error);
    }
  }

  /**
   * Updates an existing weekly mess menu for a property.
   * @param {string} propertyId - The property ID whose menu is being updated
   * @param {Object} updatedMenuData - Partial or full updated menu object
   * @returns {Promise<Object>} API response
   * @throws {Error} If property ID is missing or API call fails
   */
  async updatedMenuData(updatedMenuData) {
    try {
      //console.log("Sending menuData to backend:", updatedMenuData); // debug log
      console.log("Update menu", updatedMenuData);
      const response = await apiClient.patch(
        `/inventory/mess/weekly-menu`,
        updatedMenuData
      );

      if (response.data?.statusCode || response.data?.success) {
        return response.data;
      }

      const message = response.data?.message || "Failed to create mess menu.";
      throw new Error(message);
    } catch (error) {
      throw this.#handleApiError(error);
    }
  }
  /**
   * Creates manual meal bookings.
   * @param {Object} bookingData - Object containing count, propertyId, kitchenId, mealType, bookingDate, menuId
   */
  async createManualMealBookings(bookingData) {
    try {
      const response = await apiClient.post(
        `/inventory/mess-booking/manual`,
        bookingData
      );

      if (response.data?.statusCode || response.data?.success) {
        return response.data;
      }

      throw new Error(
        response.data?.message || "Failed to create manual meal bookings."
      );
    } catch (error) {
      throw this.#handleApiError(error);
    }
  }

  async getDailyMessNeeds(date) {
    try {
      const response = await apiClient.get(`inventory/mess-booking/get-usage`, {
        params: {
          date,
        },
      });

      if (response.data?.statusCode || response.data?.success) {
        return response.data;
      }

      const message =
        response.data?.message || "Failed to fetch mess stock data.";
      throw new Error(message);
    } catch (error) {
      throw this.#handleApiError(error);
    }
  }

  async getDailyRequirements(kitchenId, date) {
    try {
      const response = await apiClient.get(`inventory/daily-requirement/get`, {
        params: {kitchenId, date},
      });
      console.log(response.data);

      if (response.data?.statusCode || response.data?.success) {
        return response.data;
      }
      const message =
        response.data?.message || "Failed to fetch mess stock data.";
      throw new Error(message);
    } catch (error) {
      throw this.#handleApiError(error);
    }
  }

  async getInventoryItemsForRequirements(kitchenId, requirementId) {
    try {
      const response = await apiClient.get(
        `inventory/daily-requirement/inventory-items`,
        {
          params: {
            kitchenId,
            requirementId,
          },
        }
      );
      console.log(response.data);

      if (response.data?.statusCode || response.data?.success) {
        return response.data;
      }
      const message = response.data?.message || "Failed to fetch inventory .";
      throw new Error(message);
    } catch (error) {
      throw this.#handleApiError(error);
    }
  }

  async addItemToRequirement(
    requirementId,
    inventoryId,
    quantityRequired,
    unit
  ) {
    try {
      const response = await apiClient.post(
        `inventory/daily-requirement/${requirementId}`,
        {
          inventoryId,
          quantityRequired,
          unit,
        }
      );

      if (response.data?.success) {
        return response.data;
      }
      const message = response.data?.message || "Failed to add item";
      throw new Error(message);
    } catch (error) {
      throw this.#handleApiError(error);
    }
  }

  async updateDailyRequirements(requirementId, items) {
    try {
      const response = await apiClient.put(
        `inventory/daily-requirement/${requirementId}`,
        {
          items,
        }
      );

      if (response.data?.success) {
        return response.data;
      }
      const message = response.data?.message || "Failed to update requirements";
      throw new Error(message);
    } catch (error) {
      throw this.#handleApiError(error);
    }
  }

  async removeItemFromRequirement(requirementId, inventoryId) {
    try {
      const response = await apiClient.delete(
        `inventory/daily-requirement/remove/${requirementId}`,
        {
          data: {inventoryId},
        }
      );

      if (response.data?.success) {
        return response.data;
      }
      const message = response.data?.message || "Failed to remove item";
      throw new Error(message);
    } catch (error) {
      throw this.#handleApiError(error);
    }
  }

  async confirmDailyRequirements(requirementId) {
    try {
      const response = await apiClient.put(
        `inventory/daily-requirement/${requirementId}/approve`
      );

      if (response.data?.success) {
        return response.data;
      }
      const message =
        response.data?.message || "Failed to confirm requirements";
      throw new Error(message);
    } catch (error) {
      throw this.#handleApiError(error);
    }
  }
}

export const messApiService = new MessApiService();
