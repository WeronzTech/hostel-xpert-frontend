import {useMutation, useQueryClient} from "@tanstack/react-query";
import {maintenanceApiService} from "./maintenanceApiService";
import {message} from "antd";
import apiClient from "../../utils/apiClient";

export const getStaffByPropertyId = async (propertyId) => {
  try {
    const res = await apiClient.get(`/staff/by-property/${propertyId}`);
    return res.data.staff || [];
  } catch (err) {
    console.error(`Error fetching staff:`, err);
    throw new Error(err.response?.data?.message || "Failed to fetch staff");
  }
};

export const useAssignStaff = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({maintenanceId, staffId, timeNeeded}) =>
      maintenanceApiService.assignStaffToMaintenance({
        maintenanceId,
        staffId,
        timeNeeded,
      }),
    onSuccess: (data, variables) => {
      message.success("Staff assigned successfully!");
      queryClient.invalidateQueries(["maintenance"]);
      queryClient.invalidateQueries(["maintenanceCount"]);
      queryClient.invalidateQueries([
        "maintenanceDetail",
        variables.maintenanceId,
      ]);

      queryClient.setQueryData(
        ["maintenance", variables.propertyId, "Pending"],
        (oldData) =>
          oldData
            ? {
                ...oldData,
                data: oldData.data.filter(
                  (record) => record._id !== variables.maintenanceId
                ),
              }
            : oldData
      );
    },
    onError: (error) => {
      message.error(error.message || "Failed to assign staff");
    },
  });

  return {
    assignStaff: mutation.mutate,
    isLoading: mutation.isLoading,
    getStaffByPropertyId,
  };
};
