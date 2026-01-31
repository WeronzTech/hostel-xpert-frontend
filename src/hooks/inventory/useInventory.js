import {useMutation, useQueryClient} from "@tanstack/react-query";
import apiClient from "../../utils/apiClient.js";

export const getInventory = async ({page, limit, search, kitchenId}) => {
  try {
    console.log(kitchenId);
    const params = {
      page,
      limit,
      search,
      kitchenId,
    };
    const res = await apiClient.get(`/inventory`, {params});
    return res.data.data;
  } catch (err) {
    console.error(`Error in fetching inventory: ${err}`);
    throw new Error(err.response?.data?.message || "Failed to fetch inventory");
  }
};

export const createInventoryItem = async (newData) => {
  try {
    const res = await apiClient.post(`/inventory/add`, newData);
    return res.data;
  } catch (err) {
    console.error(`Error adding inventory item:`, err);
    throw new Error(
      err.response?.data?.message || "Failed to add inventory item"
    );
  }
};

export const editInventoryItem = async (itemId, updatedData) => {
  try {
    const res = await apiClient.put(`/inventory/update/${itemId}`, updatedData);
    return res.data;
  } catch (err) {
    console.error(`Error updating inventory item ${itemId}:`, err);
    throw new Error(
      err.response?.data?.message || "Failed to update inventory item"
    );
  }
};

export const getCategoriesByProperty = async (propertyId) => {
  try {
    const res = await apiClient.get(`/inventory/category/get-by-property`, {
      params: {propertyId},
    });
    return res.data.data || [];
  } catch (err) {
    console.error(`Error fetching categories for property ${propertyId}:`, err);

    throw new Error(
      err.response?.data?.message || "Failed to fetch categories"
    );
  }
};

export const getKitchens = async (filters = {}) => {
  try {
    const res = await apiClient.get(`/inventory/kitchen`, {params: filters});
    console.log(res.data.data);
    return res.data.data || [];
  } catch (err) {
    console.error(`Error fetching kitchens:`, err);

    throw new Error(err.response?.data?.message || "Failed to fetch kitchens");
  }
};

export const getKitchensForDropDown = async (propertyId) => {
  try {
    // const res = await apiClient.get(`/inventory/kitchen/getKitchens`);
    const res = await apiClient.get(`/inventory/kitchen/getKitchens`, {
      params: propertyId ? {propertyId} : {},
    });
    return res.data.data || [];
  } catch (err) {
    console.error(`Error fetching kitchens:`, err);
    throw new Error(err.response?.data?.message || "Failed to fetch kitchens");
  }
};

export const getKitchenById = async (kitchenId) => {
  try {
    const res = await apiClient.get(`/inventory/kitchen/${kitchenId}`);
    return res.data.data || [];
  } catch (err) {
    console.error(`Error fetching kitchens:`, err);

    throw new Error(err.response?.data?.message || "Failed to fetch kitchens");
  }
};

export const addCategory = async (categoryData) => {
  console.log("CategoryData in addCategory:", categoryData);
  try {
    const res = await apiClient.post(`/inventory/category`, categoryData);
    return res.data;
  } catch (err) {
    console.error(`Error adding category:`, err);
    throw new Error(err.response?.data?.message || "Failed to add category");
  }
};

export const addKitchen = async (kitchenData) => {
  console.log("KitchenData in addKitchen:", kitchenData);
  try {
    const res = await apiClient.post(`/inventory/kitchen`, kitchenData);
    return res.data;
  } catch (err) {
    console.error(`Error adding kitchen:`, err);
    throw new Error(err.response?.data?.message || "Failed to add kitchen");
  }
};

export const updateKitchen = async (kitchenData) => {
  console.log("KitchenData in updateKitchen:", kitchenData);
  try {
    const res = await apiClient.put(
      `/inventory/kitchen/${kitchenData.id}`,
      kitchenData
    );
    return res.data;
  } catch (err) {
    console.error(`Error updating kitchen:`, err);
    throw new Error(err.response?.data?.message || "Failed to update kitchen");
  }
};

export const deleteKitchen = async (kitchenId) => {
  try {
    const res = await apiClient.delete(`/inventory/kitchen/${kitchenId}`);
    return res.data;
  } catch (err) {
    console.error(`Error deleting kitchen:`, err);
    throw new Error(err.response?.data?.message || "Failed to delete kitchen");
  }
};

export const dailyStockUsage = async (inventoryId, usageData) => {
  try {
    const res = await apiClient.post(
      `/inventory/remove-stock/${inventoryId}`,
      usageData
    );
    return res.data;
  } catch (err) {
    console.error(`Error in daily stock usage:`, err);
    throw new Error(
      err.response?.data?.message || "Failed to record daily usage"
    );
  }
};

export const updateStockUsage = async (inventoryId, stockData) => {
  try {
    const res = await apiClient.post(
      `/inventory/add-stock/${inventoryId}`,
      stockData
    );
    return res.data;
  } catch (err) {
    console.error(`Error in updating stock:`, err);
    throw new Error(err.response?.data?.message || "Failed to update stock");
  }
};

export const addDeadStock = async (inventoryId, deadStockData) => {
  try {
    const res = await apiClient.post(
      `/inventory/dead-stock/${inventoryId}`,
      deadStockData
    );
    return res.data;
  } catch (err) {
    console.error(`Error in adding dead stock:`, err);
    throw new Error(err.response?.data?.message || "Failed to log dead stock");
  }
};

export const getDeadStockLogs = async (filters = {}) => {
  try {
    const res = await apiClient.get(`/inventory/dead-stock`, {
      params: filters,
    });
    return res.data || [];
  } catch (err) {
    console.error(`Error fetching dead stock logs:`, err);
    throw new Error(
      err.response?.data?.message || "Failed to fetch dead stock logs"
    );
  }
};

export const downloadDeadStockReport = async (filters = {}) => {
  try {
    const res = await apiClient.get(`/inventory/dead-stock-report`, {
      params: filters,
      responseType: "blob",
    });
    return res.data;
  } catch (err) {
    console.error(`Error downloading dead stock logs:`, err);
    throw new Error(
      err.response?.data?.message || "Failed to download dead stock logs"
    );
  }
};

export const downloadWeeklyUsageReport = async (filters = {}) => {
  try {
    const res = await apiClient.get(`/inventory/weekly-usage-report`, {
      params: filters,
      responseType: "blob",
    });
    return res.data;
  } catch (err) {
    console.error(`Error downloading dead stock logs:`, err);
    throw new Error(
      err.response?.data?.message || "Failed to download dead stock logs"
    );
  }
};

export const getRecipeCategoryByKitchenId = async (kitchenId) => {
  try {
    const res = await apiClient.get(
      `/inventory/category/recipe-category/${kitchenId}`
    );
    return res.data.data || [];
  } catch (err) {
    console.error(`Error fetching recipe category:`, err);
    throw new Error(
      err.response?.data?.message || "Failed to fetch recipe category"
    );
  }
};

export const getRecipeCategoryById = async (recipeCategoryId) => {
  try {
    const res = await apiClient.get(
      `/inventory/category/recipe-category-id/${recipeCategoryId}`
    );
    return res.data || [];
  } catch (err) {
    console.error(`Error fetching recipe category:`, err);
    throw new Error(
      err.response?.data?.message || "Failed to fetch recipe category"
    );
  }
};

export const addRecipeCategory = async (recipeCategoryData) => {
  try {
    const res = await apiClient.post(
      `/inventory/category/recipe-category`,
      recipeCategoryData
    );
    return res.data;
  } catch (err) {
    console.error(`Error adding recipe category:`, err);
    throw new Error(
      err.response?.data?.message || "Failed to add recipe category"
    );
  }
};

export const editRecipeCategory = async (recipeCategoryData) => {
  try {
    const res = await apiClient.put(
      `/inventory/category/recipe-category/${recipeCategoryData.id}`,
      recipeCategoryData
    );
    return res.data;
  } catch (err) {
    console.error(`Error editing recipe category:`, err);
    throw new Error(
      err.response?.data?.message || "Failed to edit recipe category"
    );
  }
};

export const deleteRecipeCategory = async (recipeCategoryId) => {
  try {
    const res = await apiClient.delete(
      `/inventory/category/recipe-category/${recipeCategoryId}`
    );
    return res.data;
  } catch (err) {
    console.error(`Error deleting recipe category:`, err);
    throw new Error(
      err.response?.data?.message || "Failed to delete recipe category"
    );
  }
};

export const getAllRecipe = async (filter = {}) => {
  // console.log("Filter", filter);
  try {
    const res = await apiClient.get(`/inventory/kitchen/recipes`, {
      params: filter,
    });
    // console.log("data", res.data);
    return res.data.data;
  } catch (err) {
    console.error(`Error fetching recipes:`, err);
    throw new Error(err.response?.data?.message || "Failed to fetch recipes");
  }
};

export const createRecipe = async (recipeData) => {
  try {
    const res = await apiClient.post(`/inventory/kitchen/recipes`, recipeData);
    return res.data;
  } catch (err) {
    console.error(`Error creating recipe:`, err);
    throw new Error(err.response?.data?.message || "Failed to create recipe");
  }
};

export const updateRecipe = async (recipeId, recipeData) => {
  try {
    const res = await apiClient.put(
      `/inventory/kitchen/recipes/${recipeId}`,
      recipeData
    );
    return res.data;
  } catch (err) {
    console.error(`Error updating recipe:`, err);
    throw new Error(err.response?.data?.message || "Failed to update recipe");
  }
};

export const deleteRecipe = async (recipeId) => {
  try {
    const res = await apiClient.delete(
      `/inventory/kitchen/recipes/${recipeId}`
    );
    return res.data;
  } catch (err) {
    console.error(`Error deleting recipe:`, err);
    throw new Error(err.response?.data?.message || "Failed to delete recipe");
  }
};

export const getStaffAccordingToKitchenId = async (filter = {}) => {
  try {
    console.log(filter);
    const res = await apiClient.get(`/staff/getAll`, {
      params: filter,
    });
    return res.data;
  } catch (err) {
    console.error(`Error fetching staff:`, err);
    throw new Error(err.response?.data?.message || "Failed to fetch staff");
  }
};

export const getMessOrderByPropertyId = async (filter = {}) => {
  try {
    console.log("Filter", filter);
    const res = await apiClient.get(`/inventory/mess-booking/property`, {
      params: filter,
    });
    console.log(res.data?.data);
    return res.data?.data;
  } catch (err) {
    console.error(`Error fetching mess order:`, err);
    throw new Error(
      err.response?.data?.message || "Failed to fetch mess order"
    );
  }
};

export const getAddonOrderByPropertyId = async (filter = {}) => {
  try {
    console.log("Filter xxxxxxxxx", filter);
    const res = await apiClient.get(`/inventory/addon-booking/property`, {
      params: filter,
    });
    console.log(res.data);

    return res.data.data;
  } catch (err) {
    console.error(`Error fetching mess order:`, err);
    throw new Error(
      err.response?.data?.message || "Failed to fetch mess order"
    );
  }
};

export const getInventoryLogs = async (params = {}) => {
  try {
    const res = await apiClient.get(`/inventory/inventorylogs/get`, {
      params,
    });
    return res.data.data;
  } catch (err) {
    console.error("Error fetching inventory logs:", err);
    throw new Error(
      err.response?.data?.message || "Failed to fetch inventory logs"
    );
  }
};

export const updateAddonBookingStatus = async ({bookingId, status}) => {
  try {
    console.log({bookingId, status});
    const res = await apiClient.patch(
      `/inventory/addon-booking/${bookingId}/status`,
      {
        status,
      }
    );
    return res.data.data;
  } catch (err) {
    console.error(`Error updating addon booking status:`, err);
    throw new Error(
      err.response?.data?.message || "Failed to update addon booking status"
    );
  }
};

export const useUpdateAddonBookingStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateAddonBookingStatus,
    onSuccess: () => {
      // Invalidate ALL queries that start with "addon-order-list"
      queryClient.invalidateQueries({queryKey: ["addon-order-list"]});
    },
    onError: (error) => {
      console.error("Failed to update booking status:", error);
    },
  });
};
