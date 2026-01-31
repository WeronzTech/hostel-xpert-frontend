import {useQuery} from "@tanstack/react-query";
import {useSelector} from "react-redux";
import {offboardingApiService} from "./offBoardingapiService";

export const useRequestCount = () => {
  const selectedPropertyId = useSelector(
    (state) => state.properties.selectedProperty.id
  );

  const fetchCountByStatus = async (propertyId) => {
    const response = await offboardingApiService.getPendingRequest(propertyId);
    return response?.total || 0;
  };
  const {data: pendingCount = 0} = useQuery({
    queryKey: ["requestCount", selectedPropertyId],
    queryFn: () => fetchCountByStatus(selectedPropertyId),
  });

  return pendingCount;
};
