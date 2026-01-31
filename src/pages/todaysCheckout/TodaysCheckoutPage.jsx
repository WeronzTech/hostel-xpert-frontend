import {PageHeader, CheckoutCard, ErrorState} from "../../components/index.js";
import {useSelector} from "react-redux";
import {useQuery} from "@tanstack/react-query";
import {getTodayCheckouts} from "../../hooks/users/useUser.js";
import LoadingSpinner from "../../ui/loadingSpinner/LoadingSpinner.jsx";
import {useNavigate} from "react-router-dom";
import {Empty, Pagination} from "antd";
import {useState} from "react";

function TodaysCheckoutPage() {
  const navigate = useNavigate();
  const {selectedProperty} = useSelector((state) => state.properties);
  const propertyId = selectedProperty.id;

  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12; // Cards per page

  // Fetch all the todays checkout using tanstack query
  const {data, isLoading, isError, error, refetch} = useQuery({
    queryKey: ["todayCheckouts", propertyId],
    queryFn: () => getTodayCheckouts({propertyId}),
    staleTime: 5 * 60 * 1000,
  });

  //   Loading State
  if (isLoading) return <LoadingSpinner />;

  // Error state
  if (isError) {
    const msg = error?.message || "Something went wrong";
    return (
      <ErrorState
        message="Failed to load Todays Checkout Records"
        description={msg}
        onAction={() => refetch()}
        actionText="Try Again"
      />
    );
  }

  const apiData = data?.data || {dailyRent: [], messOnly: []};

  //   console.log(`API Data for todays checkout`, apiData) // debug log

  // normalize into a single array
  const combined = [
    ...apiData.dailyRent.map((d) => ({
      ...d,
      type: "dailyRent",
      checkInDate: d.checkInDate || null,
      displayRoom: d.roomNumber,
    })),
    ...apiData.messOnly.map((m) => ({
      ...m,
      type: "messOnly",
      checkInDate: m.messStartDate || null,
      displayRoom: m.kitchenName,
    })),
  ];

  const hasRequests = combined.length > 0;

  // Pagination logic - slice requests for the current page
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedRequests = combined.slice(startIndex, startIndex + pageSize);

  return (
    <div className="min-h-screen bg-gray-50 px-4 pt-4 pb-8 xl:px-12 lg:px-6">
      <PageHeader
        title="Today's Checkouts"
        subtitle="View and manage all checkouts made today"
      />

      {hasRequests ? (
        <>
          {/* Card section */}
          <div className="mt-6 grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 ">
            {paginatedRequests.map((item) => (
              <CheckoutCard
                key={item._id}
                id={item._id}
                type={item.type}
                name={item.name}
                roomNumber={item.displayRoom}
                sharingType={item.sharingType}
                kitchenName={item.kitchenName}
                checkInDate={item.checkInDate}
                checkOutDate={item.checkOutDate}
                extendDate={item.extendDate}
                paymentStatus={item.paymentStatus}
                rent={item.rent}
                pendingAmount={item.pendingAmount}
                phone={item.contact}
                onViewDetails={() => navigate(`/resident/${item._id}`)}
              />
            ))}
          </div>
          {/* Pagination */}
          <div className="flex justify-center mt-6">
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={combined.length}
              onChange={(page) => setCurrentPage(page)}
              showSizeChanger={false}
            />
          </div>
        </>
      ) : (
        // Empty state
        <div className="flex flex-col items-center justify-center mt-20 text-center text-gray-500">
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
          <p className="text-lg font-medium">No checkouts for today</p>
          <p className="text-sm text-gray-400">
            No resident is checking out today
          </p>
        </div>
      )}
    </div>
  );
}

export default TodaysCheckoutPage;
