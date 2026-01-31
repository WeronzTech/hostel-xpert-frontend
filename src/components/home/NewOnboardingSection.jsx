import {FiArrowRight, FiAlertTriangle} from "../../icons/index.js";

import {Button, Col, Result, Row, Typography} from "antd";
import {useSelector} from "react-redux";
import {getUnapprovedHeavensResidents} from "../../hooks/users/useUser";
import {useQuery} from "@tanstack/react-query";
import {useNavigate} from "react-router-dom";
import {OnboardingCard} from "../index.js";

const NewOnboardingSection = () => {
  const navigate = useNavigate();
  const {selectedProperty} = useSelector((state) => state.properties);
  // Using TanStack Query for data fetching
  const {data: requests, error} = useQuery({
    queryKey: ["unapprovedResidents", selectedProperty.id],
    queryFn: () => getUnapprovedHeavensResidents(selectedProperty.id),
    // enabled: !!selectedProperty.id,
  });

  // Transform API data to match component expectations
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
      date: req.createdAt,
      type: req.userType,
      residentId: req._id,
    };
  });
  // console.log(transformedRequests); // debug log

  const latestRequests = transformedRequests.slice(0, 4);

  // If there's an error, show error message
  if (error) {
    return (
      <div className="mb-6 bg-white rounded-lg shadow-sm p-2 flex items-center justify-center">
        <Result
          status="error"
          title={
            <h4 className="text-base font-semibold text-gray-800">
              Failed to load onboarding requests
            </h4>
          }
          subTitle={
            <p className="text-sm text-gray-500 max-w-md">{error.message}</p>
          }
          icon={
            <div className="flex items-center justify-center w-16 h-16 bg-red-50 rounded-full mx-auto">
              <FiAlertTriangle className="text-red-500 text-2xl" />
            </div>
          }
          extra={<Button>Go to Onboarding Page</Button>}
        />
      </div>
    );
  }

  // If no requests, return null (display nothing)
  if (transformedRequests.length === 0) {
    return null;
  }

  // Otherwise, show the requests
  return (
    <div className="mb-6 bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="border-l-4 border-[#4d44b5] bg-indigo-50 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FiAlertTriangle className="text-[#4d44b5] text-xl" />
            <h3 className="font-semibold text-[#4d44b5]">
              Onboarding Requests ({transformedRequests.length})
            </h3>
          </div>
          <button
            className="cursor-pointer text-[#4d44b5] hover:text-[#3a32a0] text-sm font-medium flex items-center gap-1"
            onClick={() => navigate("/onboarding")}
          >
            View All <FiArrowRight className="w-4 h-4" />
          </button>
        </div>

        <Row gutter={[16, 16]} className="mt-3">
          {latestRequests.map((req) => (
            <Col xs={24} sm={12} lg={8} xl={6} key={req.id}>
              <OnboardingCard {...req} />
            </Col>
          ))}
        </Row>
      </div>
    </div>
  );
};

export default NewOnboardingSection;
