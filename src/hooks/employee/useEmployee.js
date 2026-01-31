import apiClient from "../../utils/apiClient";

export const addStaff = async (staffData) => {
  console.log(staffData);
  try {
    const res = await apiClient.post(`/staff/add`, staffData);
    return res.data;
  } catch (err) {
    console.error(`Error creating staff:`, err);
    throw new Error(err.response?.data?.message || "Failed to create staff");
  }
};

export const editStaff = async (staffId, updatedStaffData) => {
  try {
    console.log("updatedStaffData", updatedStaffData);
    const res = await apiClient.put(
      `/property/staff/update/${staffId}`,
      updatedStaffData
    );
    return res.data;
  } catch (err) {
    console.error(`Error editing staff:`, err);
    throw new Error(err.response?.data?.message || "Failed to edit staff");
  }
};
export const deleteStaff = async (staffId) => {
  try {
    const res = await apiClient.delete(`/property/staff/delete/${staffId}`);
    return res.data;
  } catch (err) {
    console.error(`Error deleting staff:`, err);
    throw new Error(err.response?.data?.message || "Failed to delete staff");
  }
};
export const changeStaffStatus = async (staffId) => {
  try {
    const res = await apiClient.put(`/staff/status/${staffId}`);
    return res.data;
  } catch (err) {
    console.error(`Error changing staff status:`, err);
    throw new Error(
      err.response?.data?.message || "Failed to change staff status"
    );
  }
};
export const getStaffById = async (staffId) => {
  try {
    const res = await apiClient.get(`/staff/${staffId}`);
    return res.data.data;
  } catch (err) {
    console.error(`Error creating staff:`, err);
    throw new Error(err.response?.data?.message || "Failed to create staff");
  }
};

export const addManager = async (managerData) => {
  console.log(managerData);
  try {
    const res = await apiClient.post(`/client/manager/register`, managerData);
    return res.data;
  } catch (err) {
    console.error(`Error creating manager:`, err);
    throw new Error(err.response?.data?.message || "Failed to create manager");
  }
};

export const editManager = async (managerId, managerData) => {
  try {
    const res = await apiClient.put(
      `/client/manager/edit/${managerId}`,
      managerData
    );
    return res.data;
  } catch (err) {
    console.error(`Error editing manager:`, err);
    throw new Error(err.response?.data?.message || "Failed to edit manager");
  }
};
export const deleteManager = async (managerId) => {
  try {
    const res = await apiClient.delete(`/client/manager/delete/${managerId}`);
    return res.data;
  } catch (err) {
    console.error(`Error deleting manager:`, err);
    throw new Error(err.response?.data?.message || "Failed to delete manager");
  }
};

export const getManagerById = async (managerId) => {
  try {
    const res = await apiClient.get(`/client/manager/${managerId}`);
    return res.data.data;
  } catch (err) {
    console.error(`Error getting manager:`, err);
    throw new Error(err.response?.data?.message || "Failed to get manager");
  }
};

export const getAllManagers = async (propertyId) => {
  try {
    console.log(propertyId);
    const res = await apiClient.get(`/client/manager`, {
      params: propertyId ? {propertyId} : {},
    });
    return res.data.data;
  } catch (err) {
    console.error(`Error getting manager:`, err);
    throw new Error(err.response?.data?.message || "Failed to get manager");
  }
};

export const changeManagerStatus = async (managerId) => {
  try {
    const res = await apiClient.put(`/client/manager/status/${managerId}`);
    return res.data;
  } catch (err) {
    console.error(`Error changing manager status:`, err);
    throw new Error(
      err.response?.data?.message || "Failed to change manager status"
    );
  }
};

export const getAllRoles = async () => {
  try {
    const res = await apiClient.get(`/auth/role`);
    console.log("data", res.data.data);
    return res.data.data;
  } catch (err) {
    console.error(`Error fetching roles:`, err);
    throw new Error(err.response?.data?.message || "Failed to fetch roles");
  }
};

export const getRoleById = async (roleId) => {
  try {
    const res = await apiClient.get(`/auth/role/${roleId}`);
    console.log("data", res.data.data);
    return res.data.data;
  } catch (err) {
    console.error(`Error fetching roles:`, err);
    throw new Error(err.response?.data?.message || "Failed to fetch roles");
  }
};

export const addRoles = async (roleData) => {
  try {
    const res = await apiClient.post(`/auth/role`, roleData);
    return res.data.data;
  } catch (err) {
    console.error(`Error adding roles:`, err);
    throw new Error(err.response?.data?.message || "Failed to add roles");
  }
};

export const editRoles = async (roleId, updatedRoleData) => {
  try {
    const res = await apiClient.put(`/auth/role/${roleId}`, updatedRoleData);
    return res.data.data;
  } catch (err) {
    console.error(`Error editing roles:`, err);
    throw new Error(err.response?.data?.message || "Failed to edit roles");
  }
};

export const deleteRoles = async (roleId) => {
  try {
    const res = await apiClient.delete(`/auth/role/${roleId}`);
    console.log("data", res.data);
    return res.data;
  } catch (err) {
    console.error(`Error deleting roles:`, err);
    throw new Error(err.response?.data?.message || "Failed to delete roles");
  }
};

export const getAllEventPermissions = async () => {
  try {
    const res = await apiClient.get(`/internalSocket`);
    console.log("data", res.data);
    return res.data.data;
  } catch (err) {
    console.error(`Error fetching event permissions:`, err);
    throw new Error(
      err.response?.data?.message || "Failed to fetch event permissions"
    );
  }
};
export const addEventPermissions = async (eventData) => {
  try {
    const res = await apiClient.post(`/internalSocket`, eventData);
    console.log("data", res.data);
    return res.data;
  } catch (err) {
    console.error(`Error adding event permissions:`, err);
    throw new Error(
      err.response?.data?.message || "Failed to add event permissions"
    );
  }
};
export const getEventPermissionsById = async (eventId) => {
  try {
    const res = await apiClient.get(`/internalSocket/${eventId}`);
    console.log("data", res.data);
    return res.data;
  } catch (err) {
    console.error(`Error fetching event permissions:`, err);
    throw new Error(
      err.response?.data?.message || "Failed to fetch event permissions"
    );
  }
};
export const editEventPermissions = async (eventId, eventData) => {
  try {
    const res = await apiClient.put(`/internalSocket/${eventId}`, eventData);
    console.log("data", res.data);
    return res.data;
  } catch (err) {
    console.error(`Error editing event permissions:`, err);
    throw new Error(
      err.response?.data?.message || "Failed to edit event permissions"
    );
  }
};
export const deleteEventPermissions = async (eventId) => {
  try {
    const res = await apiClient.delete(`/internalSocket/${eventId}`);
    console.log("data", res.data);
    return res.data;
  } catch (err) {
    console.error(`Error deleting event permissions:`, err);
    throw new Error(
      err.response?.data?.message || "Failed to delete event permissions"
    );
  }
};
