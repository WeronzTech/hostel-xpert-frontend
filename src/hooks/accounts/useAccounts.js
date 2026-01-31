import apiClient from "../../utils/apiClient";

//Dashboard Apis

export const getAccountDashboardDataForIncomeSection = async (propertyId) => {
  try {
    // console.log("Fetching :", propertyId);

    const response = await apiClient.get("/feePayments/dashboard/income", {
      params: propertyId ? {propertyId} : {},
    });

    console.debug("Fetched data:", response.data);
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

export const getAccountDashboardDataForExpenseSection = async (propertyId) => {
  try {
    // console.log("Fetching :", propertyId);

    const response = await apiClient.get("/feePayments/dashboard/expense", {
      params: propertyId ? {propertyId} : {},
    });

    console.debug("Fetched data:", response.data);
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

export const getAccountDashboardDataForDepositSection = async (propertyId) => {
  try {
    // console.log("Fetching :", propertyId);

    const response = await apiClient.get("/feePayments/dashboard/deposit", {
      params: propertyId ? {propertyId} : {},
    });

    console.debug("Fetched data:", response.data);
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

// Expense Apis

export const addExpense = async (data) => {
  try {
    // console.log("Adding expense:", data);

    const formData = new FormData();

    // Define all possible fields
    const fields = [
      "title",
      "type",
      "category",
      "amount",
      "date",
      "description",
      "paymentMethod",
      "transactionId",
      "handledBy",
      "pettyCashType",
      "kitchenId",
      "actionPerformedBy",
      "createdBy",
      "fromVoucher",
      "voucherId",
    ];

    // Append simple fields
    fields.forEach((field) => {
      if (
        data[field] !== undefined &&
        data[field] !== null &&
        data[field] !== ""
      ) {
        formData.append(field, data[field]);
      }
    });

    // Append complex objects as JSON
    if (data.property) {
      formData.append("property", JSON.stringify(data.property));
    }

    // Append file
    if (data.billImage && data.billImage instanceof File) {
      formData.append("billImage", data.billImage);
    } else if (data.billImage && typeof data.billImage === "object") {
      // Handle case where it might be an upload file object
      formData.append(
        "billImage",
        data.billImage.originFileObj || data.billImage
      );
    }
    const response = await apiClient.post("/expense/add", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    console.debug("Expense added:", response.data);
    return response.data;
  } catch (error) {
    console.error("Add expense failed:", error);

    const apiError = {
      message: error.response?.data?.message || "Failed to add expense",
      details:
        error.response?.data?.errors || error.response?.data || error.message,
      status: error.response?.status,
    };

    throw apiError;
  }
};

export const getAllExpenses = async (filters = {}) => {
  try {
    const response = await apiClient.get("/expense/all", {
      params: filters,
    });

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

// Expense Category Apis

export const addExpenseCategory = async (data) => {
  try {
    // console.log("Adding expense category:", data);

    const response = await apiClient.post("/expense/add-category", data);

    console.debug("Expense category added:", response.data);
    return response.data;
  } catch (error) {
    console.error("Add expense category failed:", error);

    const apiError = {
      message:
        error.response?.data?.message || "Failed to add expense category",
      details:
        error.response?.data?.errors || error.response?.data || error.message,
      status: error.response?.status,
    };

    throw apiError;
  }
};

export const getExpenseAnalytics = async (propertyId, year) => {
  try {
    const params = {};

    if (propertyId) params.propertyId = propertyId;
    if (year) params.year = year;

    const response = await apiClient.get("/expense/analytics", {params});

    console.debug("Fetched data:", response.data);
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

export const getCategoryByMainCategory = async (mainCategory) => {
  try {
    // console.log("Fetching categories for mainCategory:", mainCategory);

    const response = await apiClient.get("/expense/categories/by-main", {
      params: mainCategory,
    });

    // console.log("Fetched categories:", response.data);
    return response.data;
  } catch (error) {
    console.error("Fetching categories by mainCategory failed:", error);

    const apiError = {
      message:
        error.response?.data?.message ||
        "Failed to fetch categories by main category",
      details:
        error.response?.data?.errors || error.response?.data || error.message,
      status: error.response?.status,
    };

    throw apiError;
  }
};

export const deleteCategory = async (categoryId) => {
  try {
    // console.log("Deleting category with ID:", categoryId);

    const response = await apiClient.delete(
      `/expense/categories/${categoryId}`
    );

    console.debug("Category deleted:", response.data);
    return response.data;
  } catch (error) {
    console.error("Delete category failed:", error);

    const apiError = {
      message: error.response?.data?.message || "Failed to delete category",
      details:
        error.response?.data?.errors || error.response?.data || error.message,
      status: error.response?.status,
    };

    throw apiError;
  }
};

// PettyCash Apis

export const addPettyCash = async (data) => {
  console.log(data);
  try {
    const res = await apiClient.post(`/client/pettyCash/add`, data);
    return res.data;
  } catch (err) {
    console.error(`Error creating staff:`, err);
    throw new Error(err.response?.data?.message || "Failed to create staff");
  }
};

export const getPettyCashByManagerId = async (managerId) => {
  try {
    const res = await apiClient.get(`/client/pettyCash/${managerId}`);
    return res.data.data;
  } catch (err) {
    console.error(`Error getting petty cash:`, err);
    throw new Error(
      err.response?.data?.message || "Failed to fetch petty cash"
    );
  }
};

export const getAllPettyCashes = async (filters = {}) => {
  try {
    let params = {};

    // ✅ Backward compatibility
    if (typeof filters === "string") {
      params.propertyId = filters; // old usage: getAllPettyCashes("propertyId")
    } else if (typeof filters === "object" && filters !== null) {
      const {propertyId, managerId} = filters;
      if (propertyId) params.propertyId = propertyId;
      if (managerId) params.managerId = managerId;
    }

    const res = await apiClient.get(`/client/pettyCash`, {params});
    return res.data.data;
  } catch (err) {
    console.error(`Error getting petty cash:`, err);
    throw new Error(
      err.response?.data?.message || "Failed to fetch petty cash"
    );
  }
};

export const getPettyCashPaymentsByManager = async (managerId) => {
  try {
    const res = await apiClient.get(`/expense/pettycash-manager`, {
      params: {managerId},
    });

    return res.data; // contains { success, status, message, data }
  } catch (err) {
    console.error("Error fetching Petty Cash Payments by Manager:", err);
    throw new Error(
      err.response?.data?.message || "Failed to fetch petty cash payments"
    );
  }
};

// Agency

export const addAgency = async (data) => {
  // console.log(data);
  try {
    const res = await apiClient.post(`/client/agency`, data);
    return res.data;
  } catch (err) {
    console.error(`Error creating agency:`, err);
    throw new Error(err.response?.data?.message || "Failed to create agency");
  }
};

export const getAllAgencies = async () => {
  try {
    const res = await apiClient.get(`/client/agency`);
    return res.data.data;
  } catch (err) {
    console.error(`Error getting Agencies:`, err);
    throw new Error(err.response?.data?.message || "Failed to fetch Agencies");
  }
};

export const getUsersByAgencyId = async (agencyId) => {
  try {
    console.log(agencyId);

    const res = await apiClient.get(`/user/byAgency`, {
      params: {agent: agencyId},
    });

    return res.data || []; // Adjust based on your API response structure
  } catch (error) {
    console.error("Error fetching Users:", error);
    throw new Error(error.response?.data?.message || "Failed to fetch users");
  }
};

// Commissions

export const addCommission = async (data) => {
  try {
    const response = await apiClient.post("/commission/", data);

    console.debug("Commission successfully added:", response.data);
    return response.data;
  } catch (error) {
    console.error("Add commission failed:", error);

    const apiError = {
      message: error.response?.data?.message || "Failed to add commission",
      details:
        error.response?.data?.errors || error.response?.data || error.message,
      status: error.response?.status,
    };

    throw apiError;
  }
};

export const getAllCommissions = async (filters = {}) => {
  try {
    // Make GET request with query parameters
    const response = await apiClient.get("/commission/", {params: filters});

    console.debug("Commissions fetched successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("Get all commissions failed:", error);

    const apiError = {
      message: error.response?.data?.message || "Failed to fetch commissions",
      details:
        error.response?.data?.errors || error.response?.data || error.message,
      status: error.response?.status,
    };

    throw apiError;
  }
};

export const getCommissionData = async (filters = {}) => {
  try {
    const res = await apiClient.get(`/commission`, {
      params: filters,
    });

    return res.data || 0;
  } catch (error) {
    console.error("Error fetching available cash:", error);
    throw new Error(
      error.response?.data?.message || "Failed to fetch available cash"
    );
  }
};

export const getAllAccountsPayments = async () => {
  try {
    const res = await apiClient.get(`/feePayments/get_all_payments`);
    return res.data.data; // contains { payments, expenses, commissions }
  } catch (err) {
    console.error("Error fetching Accounts Payments:", err);
    throw new Error(
      err.response?.data?.message || "Failed to fetch Accounts Payments"
    );
  }
};

export const getWaveOffPayments = async (filters = {}) => {
  try {
    const res = await apiClient.get(`/feePayments/waveOff`, {
      params: filters,
    });

    return res.data || 0;
  } catch (error) {
    console.error("Error fetching available cash:", error);
    throw new Error(
      error.response?.data?.message || "Failed to fetch available cash"
    );
  }
};

export const getAvailableCash = async (propertyId) => {
  try {
    const params = {};
    if (propertyId) params.propertyId = propertyId;

    const res = await apiClient.get(`/feePayments/cashPayments`, {params});

    return res.data?.netCash || 0;
  } catch (error) {
    console.error("Error fetching available cash:", error);
    throw new Error(
      error.response?.data?.message || "Failed to fetch available cash"
    );
  }
};

//Voucher

export const addVoucher = async (data) => {
  try {
    // console.log("Adding voucher:", data);

    const response = await apiClient.post("/voucher/add", data);

    console.debug("Voucher added:", response.data);
    return response.data;
  } catch (error) {
    console.error("Add voucher failed:", error);

    const apiError = {
      message: error.response?.data?.message || "Failed to add voucher",
      details:
        error.response?.data?.errors || error.response?.data || error.message,
      status: error.response?.status,
    };

    throw apiError;
  }
};

export const getVoucherData = async (filters = {}) => {
  try {
    const res = await apiClient.get(`/voucher/by-property`, {
      params: filters,
    });

    return res.data || 0;
  } catch (error) {
    console.error("Error fetching available cash:", error);
    throw new Error(
      error.response?.data?.message || "Failed to fetch available cash"
    );
  }
};

//Fee Payments

export const makeFeePayment = async (data) => {
  try {
    console.log("Adding fee payment :", data);

    const response = await apiClient.post("/feePayments/record-manual", data);

    console.debug("Fee Payment added:", response.data);
    return response.data;
  } catch (error) {
    console.error("Add Fee Payment failed:", error);

    const apiError = {
      message: error.response?.data?.message || "Failed to add Fee Payment",
      details:
        error.response?.data?.errors || error.response?.data || error.message,
      status: error.response?.status,
    };

    throw apiError;
  }
};

export const getAllFeePayments = async (filters = {}) => {
  try {
    const response = await apiClient.get("/feePayments/", {
      params: filters,
    });

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

export const getPendingFees = async (filters = {}) => {
  try {
    const response = await apiClient.get("/user/pending-payments", {
      params: filters,
    });
    console.log(response.data);
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

export const getPaymentAnalytics = async (propertyId, rentType, year) => {
  try {
    const params = {};

    if (propertyId) params.propertyId = propertyId;
    if (rentType) params.rentType = rentType;
    if (year) params.year = year;

    const response = await apiClient.get("/feePayments/analytics", {params});

    console.debug("Fetched data:", response.data);
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

//Deposit Payments

export const makeDepositPayment = async (data) => {
  try {
    console.log("Adding deposit payment :", data);

    const response = await apiClient.post(
      "/depositPayments/record-manual",
      data
    );

    console.debug("Deposit Payment added:", response.data);
    return response.data;
  } catch (error) {
    console.error("Add Deposit Payment failed:", error);

    const apiError = {
      message: error.response?.data?.message || "Failed to add Deposit Payment",
      details:
        error.response?.data?.errors || error.response?.data || error.message,
      status: error.response?.status,
    };

    throw apiError;
  }
};

export const getAllDepositPayments = async (filters = {}) => {
  try {
    const response = await apiClient.get("/depositPayments/", {
      params: filters,
    });

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

export const getPendingDeposits = async (filters = {}) => {
  try {
    const response = await apiClient.get("/user/pending-deposits", {
      params: filters,
    });

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

export const makeRefundPayment = async (data) => {
  try {
    console.log("Adding refund payment :", data);

    const response = await apiClient.post(
      "/depositPayments/record-refund",
      data
    );

    console.debug("Refund Payment added:", response.data);
    return response.data;
  } catch (error) {
    console.error("Add Refund Payment failed:", error);

    const apiError = {
      message: error.response?.data?.message || "Failed to add Refund Payment",
      details:
        error.response?.data?.errors || error.response?.data || error.message,
      status: error.response?.status,
    };

    throw apiError;
  }
};

export const getLatestFeePaymentByUserId = async (userId) => {
  try {
    // console.log("Fetching userId:", userId);

    const response = await apiClient.get(
      `/feePayments/latestPayment/${userId}`
    );

    console.debug("Fetched data:", response.data);
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

// Main Dashboard

export const getMonthlyIncomeExpenseSummary = async (propertyId, year) => {
  try {
    const params = {};

    if (propertyId) params.propertyId = propertyId;
    if (year) params.year = year;

    const response = await apiClient.get("/feePayments/dashboard/summary", {
      params,
    });

    console.debug("Fetched data:", response.data);
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

export const getStaffSalaryData = async (filters = {}) => {
  try {
    const res = await apiClient.get("/staff-salary", {
      params: filters,
    });

    console.log("Salary Records:", res.data?.data);

    return res.data || [];
  } catch (error) {
    console.error("Error fetching staff salary data:", error);
    throw new Error(
      error.response?.data?.message || "Failed to fetch staff salary data"
    );
  }
};

/**
 * Get GST report data and optionally export as Excel or PDF
 * @param {Object} options - Optional parameters
 * @param {string} options.format - 'excel' | 'pdf' | undefined
 * @param {string|number} options.month - Month (1–12)
 * @param {string|number} options.year - Year (e.g., 2025)
 * @returns {Promise<Object>} - GST report data
 */
export const getGstReport = async ({format, month, year} = {}) => {
  try {
    // Build query params
    const params = {};
    if (format) params.format = format;
    if (month) params.month = month;
    if (year) params.year = year;

    // Call backend API
    const res = await apiClient.get("/feePayments/dashboard/gst-report", {
      params,
    });

    // Log for debugging
    console.log("GST Report Response:", res.data);

    return res.data?.data || [];
  } catch (error) {
    console.error("Error fetching GST report data:", error);
    throw new Error(
      error.response?.data?.message || "Failed to fetch GST report data"
    );
  }
};

export const getAccountsLogData = async (filter) => {
  try {
    const res = await apiClient.get("/accounts-log", {
      params: filter,
    });

    // Log the records if you want to inspect
    console.log("Accounts Log Records:", res.data?.data);

    // Return only the array of salary records
    return res.data || [];
  } catch (error) {
    console.error("Error fetching accounts log data:", error);
    throw new Error(
      error.response?.data?.message || "Failed to fetch accounts log data"
    );
  }
};

export const staffManualPayment = async (data) => {
  try {
    console.log("Adding staff payment :", data);

    const response = await apiClient.post("/staff-salary", data);

    console.debug("Staff Payment added:", response.data);
    return response.data;
  } catch (error) {
    console.error("Add Staff Payment failed:", error);

    const apiError = {
      message: error.response?.data?.message || "Failed to Staff Payment",
      details:
        error.response?.data?.errors || error.response?.data || error.message,
      status: error.response?.status,
    };

    throw apiError;
  }
};

export const getAccounts = async (filters = {}) => {
  try {
    const res = await apiClient.get("/chart-of-accounts/account", {
      params: filters,
    });

    // Log the records if you want to inspect
    // console.log("Accounts Records:", res.data);

    // Return only the array of salary records
    return res.data || [];
  } catch (error) {
    console.error("Error fetching accounts data:", error);
    throw new Error(
      error.response?.data?.message || "Failed to fetch accounts data"
    );
  }
};

export const getJournalEntries = async (filters = {}) => {
  try {
    // ✅ Safely construct query params
    const params = {};

    // Property filter
    if (filters.propertyId && filters.propertyId !== "all") {
      params.propertyId = filters.propertyId;
    }

    // Account filter
    if (filters.accountId && filters.accountId !== "all") {
      params.accountId = filters.accountId;
    }

    // Search filter
    if (filters.search && filters.search.trim() !== "") {
      params.search = filters.search.trim();
    }

    // ✅ Date range filter (converted to consistent format)
    if (Array.isArray(filters.dateRange) && filters.dateRange.length === 2) {
      params["dateRange[]"] = filters.dateRange; // sends as array
      // Example serialized by axios: ?dateRange[]=2025-11-12T00:00:00Z&dateRange[]=2025-11-20T23:59:59Z
    }

    // console.log("📤 Sending GET /accounting with params:", params);

    const res = await apiClient.get("/accounting", {params});

    return res.data || [];
  } catch (error) {
    console.error("❌ Error fetching journal entries:", error);
    throw new Error(
      error.response?.data?.message || "Failed to fetch journal entries"
    );
  }
};

export const updateSalaryStatus = async (salaryId, data) => {
  try {
    console.log("Updating salary status:", {salaryId, data});

    const response = await apiClient.patch(
      `/staff-salary/${salaryId}/status`,
      data
    );

    console.debug("Salary status updated:", response.data);
    return response.data;
  } catch (error) {
    console.error("Update salary status failed:", error);

    const apiError = {
      message:
        error.response?.data?.message || "Failed to update salary status",
      details:
        error.response?.data?.errors || error.response?.data || error.message,
      status: error.response?.status,
    };

    throw apiError;
  }
};

export const createChartOfAccount = async (data) => {
  try {
    console.log("Adding account :", data);

    const response = await apiClient.post("/chart-of-accounts/account", data);

    console.debug("Account added:", response.data);
    return response.data;
  } catch (error) {
    console.error("Account adding failed:", error);

    const apiError = {
      message: error.response?.data?.message || "Failed to add account",
      details:
        error.response?.data?.errors || error.response?.data || error.message,
      status: error.response?.status,
    };

    throw apiError;
  }
};

export const createAccountCategory = async (data) => {
  try {
    console.log("Adding category :", data);

    const response = await apiClient.post("/chart-of-accounts/category", data);

    console.debug("Category added:", response.data);
    return response.data;
  } catch (error) {
    console.error("Category adding failed:", error);

    const apiError = {
      message: error.response?.data?.message || "Failed to add category",
      details:
        error.response?.data?.errors || error.response?.data || error.message,
      status: error.response?.status,
    };

    throw apiError;
  }
};

export const getAccountCategories = async (filters = {}) => {
  try {
    const res = await apiClient.get("/chart-of-accounts/category", {
      params: filters,
    });

    // Log the records if you want to inspect
    console.log("Accounts category records:", res.data);

    // Return only the array of salary records
    return res.data || [];
  } catch (error) {
    console.error("Error fetching accounts categories data:", error);
    throw new Error(
      error.response?.data?.message || "Failed to fetch account categories data"
    );
  }
};

export const createManualJournalEntry = async (data) => {
  try {
    console.log("Adding JournalEntry:", data);

    const response = await apiClient.post("/accounting/journal-entry", data);

    console.debug("JournalEntry added:", response.data);
    return response.data;
  } catch (error) {
    console.error("JournalEntry adding failed:", error);

    const apiError = {
      message: error.response?.data?.message || "Failed to add JournalEntry",
      details:
        error.response?.data?.errors || error.response?.data || error.message,
      status: error.response?.status,
    };

    throw apiError;
  }
};

export const getTransactionDetails = async (ledgerId) => {
  try {
    const res = await apiClient.get(`/accounting/${ledgerId}`);

    // Log the records if you want to inspect
    console.log("ledger details:", res.data);

    // Return only the array of salary records
    return res.data || [];
  } catch (error) {
    console.error("Error fetching ledget data:", error);
    throw new Error(
      error.response?.data?.message || "Failed to fetch ledger data"
    );
  }
};

export const getSystemNames = async () => {
  try {
    const res = await apiClient.get("/account-settings/system-names");
    return res.data || [];
  } catch (error) {
    console.error("❌ Error fetching names:", error);
    throw new Error(error.response?.data?.message || "Failed to fetch names");
  }
};

export const setAccountMapping = async (data) => {
  try {
    console.log("Adding settings:", data);

    const response = await apiClient.post("/account-settings", data);

    console.debug("settings added:", response.data);
    return response.data;
  } catch (error) {
    console.error("settings adding failed:", error);

    const apiError = {
      message: error.response?.data?.message || "Failed to add settings",
      details:
        error.response?.data?.errors || error.response?.data || error.message,
      status: error.response?.status,
    };

    throw apiError;
  }
};

export const getAccountMappings = async () => {
  try {
    const response = await apiClient.get("/account-settings");

    console.log("settings connection:", response.data);
    return response.data;
  } catch (error) {
    console.error("get connection failed:", error);

    const apiError = {
      message:
        error.response?.data?.message || "Failed to get settings connection",
      details:
        error.response?.data?.errors || error.response?.data || error.message,
      status: error.response?.status,
    };

    throw apiError;
  }
};

//Bus Fee

export const makeBusFeePayment = async (data) => {
  try {
    console.log("Adding bus payment :", data);

    const response = await apiClient.post("/busPayments/record-manual", data);

    console.debug("Bus Payment added:", response.data);
    return response.data;
  } catch (error) {
    console.error("Add bus Payment failed:", error);

    const apiError = {
      message: error.response?.data?.message || "Failed to add Bus Payment",
      details:
        error.response?.data?.errors || error.response?.data || error.message,
      status: error.response?.status,
    };

    throw apiError;
  }
};

export const deleteExpense = async (expenseId) => {
  try {
    console.log("Deleting expense with ID:", expenseId);

    const response = await apiClient.delete(`/expense/delete/${expenseId}`);

    console.debug("expense deleted:", response.data);
    return response.data;
  } catch (error) {
    console.error("Delete expense failed:", error);

    const apiError = {
      message: error.response?.data?.message || "Failed to delete expense",
      details:
        error.response?.data?.errors || error.response?.data || error.message,
      status: error.response?.status,
    };

    throw apiError;
  }
};
