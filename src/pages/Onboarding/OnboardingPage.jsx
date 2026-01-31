import {useState} from "react";
import {useSelector} from "react-redux";
import {ErrorState, PageHeader} from "../../components/index.js";
import OnboardingCard from "../../components/onboarding/OnboardingCard.jsx";
import {useQuery} from "@tanstack/react-query";
import {getUnapprovedHeavensResidents} from "../../hooks/users/useUser.js";
import LoadingSpinner from "../../ui/loadingSpinner/LoadingSpinner.jsx";
import {Empty, Pagination} from "antd";

function OnboardingPage() {
  // Selected property id from redux
  const {selectedProperty} = useSelector((state) => state.properties);

  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12; // Cards per page

  // Fetch the unapproved requests using tanstack query
  const {
    data: requests,
    error,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["unapprovedResidents", selectedProperty?.id],
    queryFn: () => getUnapprovedHeavensResidents(selectedProperty.id),
  });

  // Loading state
  if (isLoading) return <LoadingSpinner />;

  // Error state
  if (isError) {
    const msg = error?.message || "Something went wrong";
    return (
      <ErrorState
        message="Failed to load Maintenance Records"
        description={msg}
        onAction={() => refetch()}
        actionText="Try Again"
      />
    );
  }

  // Transformed requests
  const transformedRequests = (requests?.data || []).map((req) => {
    const isMessOnly = req.userType?.toLowerCase() === "messonly";
    return {
      name: req.name,
      email: req.email,
      phone: req.contact,
      accommodation: isMessOnly
        ? req.kitchenName || req.messDetails?.kitchenName || "Unknown Kitchen"
        : req.propertyName || req.stayDetails?.hostelName || "Unknown Property",
      sharingType: isMessOnly ? null : req.sharingType || "N/A",
      date: new Date(req.createdAt).toLocaleDateString(),
      type: req.userType,
      residentId: req._id,
      isColiving: req.isColiving,
    };
  });

  const hasRequests = transformedRequests.length > 0;

  // Pagination logic - slice requests for the current page
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedRequests = transformedRequests.slice(
    startIndex,
    startIndex + pageSize
  );

  return (
    <div className="min-h-screen bg-gray-50 px-4 pt-4 pb-8 xl:px-12 lg:px-6">
      <PageHeader
        title="Onboarding Page"
        subtitle="Review and manage pending onboarding requests"
      />

      {hasRequests ? (
        <>
          {/* Cards */}
          <div className="mt-6 grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {paginatedRequests.map((req, index) => (
              <OnboardingCard key={index} {...req} />
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center mt-8">
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={transformedRequests.length}
              onChange={(page) => setCurrentPage(page)}
              showSizeChanger={false}
            />
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center mt-20 text-center text-gray-500">
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
          <p className="text-lg font-medium">No pending requests</p>
          <p className="text-sm text-gray-400">
            All residents have been onboarded
          </p>
        </div>
      )}
    </div>
  );
}

export default OnboardingPage;
