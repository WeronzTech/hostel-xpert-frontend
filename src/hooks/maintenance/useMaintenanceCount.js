import {useQuery} from "@tanstack/react-query";
import {useSelector} from "react-redux";
import {maintenanceApiService} from "./maintenanceApiService";

export const useMaintenanceCount = () => {
  const selectedPropertyId = useSelector(
    (state) => state.properties.selectedProperty.id
  );

  const fetchCountByStatus = async (status, propertyId) => {
    const response = await maintenanceApiService.getMaintenanceByPropertyId({
      propertyId,
      status,
      page: 1,
      limit: 1,
    });
    return response?.pagination?.total || 0;
  };

  const {data: pendingCount = 0} = useQuery({
    queryKey: ["maintenanceCount", selectedPropertyId, "Pending"],
    queryFn: () => fetchCountByStatus("Pending", selectedPropertyId),
    // refetchInterval: 30000,
  });

  return pendingCount;
};
