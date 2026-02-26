import {useQuery} from "@tanstack/react-query";
import {Row, Col, Spin, message} from "antd";
import {FiAlertTriangle, FiArrowRight} from "../../icons/index.js";
import {getTodayCheckouts} from "../../hooks/users/useUser.js";
import {useMemo} from "react";
import {useSelector} from "react-redux";
import CheckoutCard from "../checkout/CheckoutCard.jsx";
import {useNavigate} from "react-router-dom";

const TodaysCheckoutsSection = () => {
  const {selectedProperty} = useSelector((state) => state.properties);
  const propertyId = selectedProperty.id;
  const [messageApi, contextHolder] = message.useMessage();

  const navigate = useNavigate();

  // Fetch both types of checkouts in a single query
  const {data, isLoading, isError, error} = useQuery({
    queryKey: ["todayCheckouts", propertyId],
    queryFn: () => getTodayCheckouts({propertyId}),
    staleTime: 5 * 60 * 1000,
  });

  // Transform data with proper error handling
  const combinedCheckouts = useMemo(() => {
    try {
      if (!data?.data) return [];

      // Combine both dailyRent and messOnly arrays
      const dailyResidents =
        data.data.dailyRent?.map((resident) => ({
          ...resident,
          type: "dailyRent",
          displayRoom: resident.roomNumber || "N/A",
          displayDate: resident.checkInDate || null,
          displayAmount: resident.totalAmount || 0,
          pendingAmount: resident.pendingAmount || 0,
          paymentStatus: resident.paymentStatus || "pending",
          noOfDays: resident.noOfDays || 0,
        })) || [];

      const messResidents =
        data.data.messOnly?.map((resident) => ({
          ...resident,
          type: "mess",
          displayRoom: resident.kitchenName || "N/A",
          checkInDate: resident.messStartDate || null,
          checkOutDate: resident.messEndDate || null,
          noOfDays: resident.noOfDays || 0,
          displayAmount: resident.totalAmount || 0,
          pendingAmount: resident.pendingAmount || 0,
          paymentStatus: resident.paymentStatus || "pending",
        })) || [];

      return [...dailyResidents, ...messResidents];
    } catch (e) {
      console.error("Error transforming checkout data:", e);
      return [];
    }
  }, [data]);

  // Get only first 4 checkouts for display
  const displayedCheckouts = combinedCheckouts.slice(0, 4);

  if (isLoading) {
    return (
      <div className="flex justify-center p-6">
        <Spin size="large" />
      </div>
    );
  }

  if (isError) {
    messageApi.error({
      content: error?.message || "Failed to load checkouts",
      duration: 3,
    });
    return null;
  }

  if (!combinedCheckouts.length) {
    return null;
  }

  return (
    <>
      {contextHolder}
      <div className="mb-6 bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="border-l-4 border-amber-500 bg-amber-50 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FiAlertTriangle className="text-amber-600 text-xl" />
              <h3 className="font-semibold text-amber-800">
                Checkout Alerts ({combinedCheckouts.length})
              </h3>
            </div>
            <button
              className="cursor-pointer text-amber-800 hover:text-amber-900 text-sm font-medium flex items-center gap-1"
              onClick={() => navigate("/todays-checkout")}
            >
              View All <FiArrowRight className="w-4 h-4" />
            </button>
          </div>

          <Row gutter={[16, 16]} className="mt-3">
            {displayedCheckouts.map((resident) => (
              <Col
                xs={24}
                sm={12}
                lg={8}
                xl={6}
                key={`${resident.type}-${resident._id}`}
              >
                <CheckoutCard
                  id={resident._id}
                  userData={resident}
                  type={resident.type}
                  name={resident.name}
                  userType={resident.userType}
                  roomNumber={resident.roomNumber}
                  sharingType={resident.sharingType}
                  kitchenName={resident.kitchenName}
                  checkInDate={resident.checkInDate}
                  checkOutDate={resident.checkOutDate}
                  extendDate={resident.extendDate}
                  paymentStatus={resident.paymentStatus}
                  pendingAmount={resident.pendingAmount}
                  rent={resident.rent}
                  phone={resident.contact}
                  onViewDetails={() => navigate(`/resident/${resident._id}`)}
                />
              </Col>
            ))}
          </Row>
        </div>
      </div>
    </>
  );
};

export default TodaysCheckoutsSection;
