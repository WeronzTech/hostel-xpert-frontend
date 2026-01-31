import apiClient from "../../utils/apiClient.js";

class NotificationService {
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
   * Fetches all push notifications from the backend.
   *
   * @async
   * @param {Object} [params={}] - Query parameters (e.g., filters).
   * @returns {Promise<Object[]>} - An array of push notification objects.
   * @throws {Error} - Throws a formatted error if the API request fails.
   */
  async getPushNotifications(params = {}) {
    try {
      const response = await apiClient.get("/notification/push-notification", {
        params,
      });
      //   console.log(`Notification response from API service: `, response.data); // debug log
      return response.data.data;
    } catch (error) {
      throw this.#handleApiError(error);
    }
  }

  /**
   * Creates a new push notification in the backend.
   *
   * @async
   * @param {FormData} payload - FormData containing notification data (e.g., title, body, image).
   * @returns {Promise<Object>} - The created notification object from the API.
   * @throws {Error} - Throws a formatted error if the API request fails.
   */
  async createPushNotification(payload) {
    try {
      // payload is already FormData from PushNotificationPage
      const res = await apiClient.post(
        "/notification/push-notification/add",
        payload,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      // console.log("[NotificationService] API response:", res.data); // debug log
      return res.data;
    } catch (error) {
      throw this.#handleApiError(error);
    }
  }

  /**
   * Deletes a specific push notification from the backend.
   *
   * @async
   * @param {string} pushNotificationId - The unique identifier of the push notification to delete.
   * @returns {Promise<Object>} - The API response after deletion, typically containing a success message or status.
   * @throws {Error} - Throws a formatted error if the API request fails.
   */
  async deletePushNotification(pushNotificationId) {
    try {
      const response = await apiClient.delete(
        `/notification/push-notification/${pushNotificationId}`
      );

      // console.log(`Delete push notification API response: `, response); // debug log
      return response.data;
    } catch (error) {
      throw this.#handleApiError(error);
    }
  }
  /**
   * Sends a specific push notification to its targeted audience.
   *
   * @async
   * @param {string} pushNotificationId - The unique identifier of the push notification to send.
   * @returns {Promise<Object>} - The API response containing the status of the send operation.
   * @throws {Error} - Throws a formatted error if the API request fails.
   */
  async sendPushNotification(pushNotificationId) {
    try {
      const response = await apiClient.post(
        `/notification/push-notification/send/${pushNotificationId}`
      );

      // console.log(`Delete push notification API response: `, response); // debug log
      return response.data;
    } catch (error) {
      throw this.#handleApiError(error);
    }
  }
  async getAlertNotifications(params = {}) {
    try {
      const response = await apiClient.get("/notification/alert-notification", {
        params,
      });
      //   console.log(`Notification response from API service: `, response.data); // debug log
      return response.data.data;
    } catch (error) {
      throw this.#handleApiError(error);
    }
  }
  /**
 * Creates a new alert notification in the backend.
 *
 * @async
 * @param {FormData} payload - FormData containing alert notification data (e.g., title, description, userId, image file).
 * @returns {Promise<Object>} - The created alert notification object from the API.
 * @throws {Error} - Throws a formatted error if the API request fails.
 */
async addAlertNotification(payload) {
  try {
    // payload should be a FormData instance
    const res = await apiClient.post(
      "/notification/alert-Notification/add",
     payload,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return res.data;
  } catch (error) {
    throw this.#handleApiError(error);
  }
}
async getAlertNotification() {
  try {
    // payload should be a FormData instance
    const res = await apiClient.get(
      "/notification/alert-notification/",
      {}
    );
    return res.data;
  } catch (error) {
    throw this.#handleApiError(error);
  }
}
async deleteAlertNotification(id) {
  try {
    const response = await apiClient.delete(`/notification/alert-notification/${id}`);
    return response.data;
  } catch (error) {
    throw this.#handleApiError(error);
  }
}

async getNotificationLogs(userId) {
  try {
    const params = userId ? { userId } : {};
    const res = await apiClient.get("/notification", { params });
    return res.data?.data?.notificationLogs || [];
  } catch (error) {
    throw this.#handleApiError(error);
  }
}
}


export const notificationService = new NotificationService();
