import {useEffect, useState} from "react";
import {useLocation, useNavigate, useParams} from "react-router-dom";
import {useSelector} from "react-redux";
import {useQuery, useMutation, useQueryClient} from "@tanstack/react-query";
import {getAvailableRoomsByProperty} from "../../hooks/property/useProperty.js";
import {
  getResidentById,
  approveResident,
  rejectResident,
  rejoinUser,
} from "../../hooks/users/useUser.js";
import PageHeader from "../../components/common/PageHeader.jsx";
import Timeline from "../../components/users/Timeline.jsx";
import {ConfirmationStep} from "../../components/users/onboardingComponents/ConfirmationStep.jsx";
import {PaymentTermsStep} from "../../components/users/onboardingComponents/PaymentTermsStep.jsx";
import {RoomAssignmentStep} from "../../components/users/onboardingComponents/RoomAssignmentStep.jsx";
import {PropertySelectionStep} from "../../components/users/onboardingComponents/PropertySelectionStep.jsx";
import {ApplicantDetailsStep} from "../../components/users/onboardingComponents/ApplicantDetailsStep.jsx";
import KitchenSelectionStep from "../../components/users/onboardingComponents/KitchenSelectionStep.jsx";
import {Button, ConfigProvider, Divider, message, Modal, Space} from "antd";
import {greenButton, purpleButton} from "../../data/common/color.js";
import {
  FiCheck,
  FiChevronRight,
  FiChevronLeft,
} from "../../../src/icons/index.js";

const OnboardingApprovalPage = () => {
  const {user} = useSelector((state) => state.auth);
  const adminName = user.name;
  const {properties} = useSelector((state) => state.properties);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const navigate = useNavigate();
  const {id} = useParams();
  const location = useLocation();

  // Determine if this is a rejoin request
  const isRejoin = location.pathname.includes("/rejoin/");

  const queryClient = useQueryClient();

  const [messageApi, contextHolder] = message.useMessage();

  const [activeStep, setActiveStep] = useState(1);
  const [formData, setFormData] = useState({});
  const [availableRooms, setAvailableRooms] = useState([]);
  const [sharingTypes, setSharingTypes] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [pricing, setPricing] = useState({});
  const [originalSharingType, setOriginalSharingType] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMessOnly, setIsMessOnly] = useState(false);
  const [isDailyRent, setIsDailyRent] = useState(false);

  // TanStack Query hooks
  const {
    data: residentData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["resident", id],
    queryFn: () => getResidentById(id),
    enabled: !!id,
  });

  useEffect(() => {
    // console.log(residentData);
    if (residentData) {
      const stayDetails = residentData.stayDetails || {};
      const messDetails = residentData.messDetails || {};
      const financialDetails = residentData.financialDetails || {};
      const userType = residentData.userType?.toLowerCase();
      const isMessOnlyUser = userType === "messonly";
      const isDailyRentUser = userType === "dailyrent";

      setIsMessOnly(isMessOnlyUser);
      setIsDailyRent(isDailyRentUser);

      const initialFormData = {
        name: residentData.name || "",
        email: residentData.email || "",
        contact: residentData.contact || "",
        userType: residentData.userType || "student",
        rentType: residentData.rentType || "monthly",

        // Common fields
        refundableDeposit: financialDetails.refundableDeposit || 0,
        nonRefundableDeposit: financialDetails.nonRefundableDeposit || 0,

        // Conditional fields based on user type
        ...(isMessOnlyUser
          ? {
              kitchenId: messDetails.kitchenId || "",
              kitchen: messDetails.kitchenName || "",
              messDetails: {
                rent: messDetails.rent || 0,
                messStartDate:
                  messDetails.messStartDate ||
                  new Date().toISOString().split("T")[0],
                messEndDate: messDetails.messEndDate || "",
                noOfDays: messDetails.noOfDays || 0,
                mealType: messDetails.mealType,
              },
              financialDetails: {
                totalAmount: financialDetails.totalAmount || 0,
              },
            }
          : isDailyRentUser
            ? {
                property: stayDetails.propertyName || "",
                propertyId: stayDetails.propertyId || "",
                sharingType: stayDetails.sharingType || "",
                roomId: stayDetails.roomId || "",
                roomNumber: stayDetails.roomNumber || "",
                stayDetails: {
                  dailyRent: stayDetails.dailyRent || 0,
                  checkInDate:
                    stayDetails.checkInDate ||
                    new Date().toISOString().split("T")[0],
                  checkOutDate:
                    stayDetails.extendedDays || stayDetails.checkOutDate || "",
                  noOfDays: stayDetails.noOfDays || 0,
                },
                financialDetails: {
                  totalAmount: financialDetails.totalAmount || 0,
                },
              }
            : {
                property: stayDetails.propertyName || "",
                propertyId: stayDetails.propertyId || "",
                sharingType: stayDetails.sharingType || "",
                roomId: stayDetails.roomId || "",
                roomNumber: stayDetails.roomNumber || "",
                rentAmount: stayDetails.rent || 0,
                joinDate: stayDetails.joinDate
                  ? new Date(stayDetails.joinDate).toISOString().split("T")[0]
                  : new Date().toISOString().split("T")[0],
              }),
      };
      setFormData(initialFormData);
      setOriginalSharingType(stayDetails.sharingType || "");

      if (!isMessOnlyUser && stayDetails.propertyId) {
        fetchRoomsAndPricing(stayDetails.propertyId, stayDetails.sharingType);
      }
    }
  }, [residentData]);

  useEffect(() => {
    if (isError) {
      console.error("Error fetching resident:", error);
      messageApi.error("Failed to load resident data");
    }
  }, [isError, error]);

  const approveMutation = useMutation({
    mutationFn: (approvalData) =>
      isRejoin
        ? rejoinUser(id, approvalData)
        : approveResident(id, approvalData),
    onSuccess: () => {
      messageApi.success({
        content: isRejoin
          ? "Resident rejoined successfully!"
          : "Resident approved successfully!",
        duration: 3,
      });
      queryClient.invalidateQueries(["residents"]);
      setTimeout(() => navigate("/"), 1500);
    },
    onError: (error) => {
      console.error("Action failed:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        (isRejoin ? "Failed to rejoin resident" : "Failed to approve resident");
      messageApi.error({
        content: errorMessage,
        duration: 3,
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({id, adminName}) => rejectResident(id, adminName),
    onSuccess: () => {
      messageApi.success({
        content: "Resident request rejected successfully!",
        duration: 3,
      });
      queryClient.invalidateQueries(["reject-resident"]);
      setTimeout(() => navigate("/"), 1500);
    },
    onError: (error) => {
      console.error("Rejection failed:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to reject student";
      messageApi.error({
        content: errorMessage,
        duration: 3,
      });
    },
  });

  const fetchRoomsAndPricing = async (
    propertyId,
    preferredSharingType = "",
  ) => {
    try {
      const {rooms, pricing} = await getAvailableRoomsByProperty(propertyId);
      const formattedRooms = rooms.map((room) => ({
        ...room,
        _id: room._id || room.id,
        roomNo: room.roomNo || room.roomNumber,
      }));

      setAvailableRooms(formattedRooms);
      setPricing(pricing);

      const types = [
        ...new Set(formattedRooms.map((room) => room.sharingType)),
      ];
      setSharingTypes(types);

      const selectedProperty = properties.find((p) => p._id === propertyId);
      const propertyName = selectedProperty?.name || "";

      let sharingType = "";
      if (preferredSharingType && types.includes(preferredSharingType)) {
        sharingType = preferredSharingType;
      } else if (originalSharingType && types.includes(originalSharingType)) {
        sharingType = originalSharingType;
      } else {
        sharingType = types[0] || "";
      }
      const filtered = formattedRooms.filter(
        (room) => room.sharingType === sharingType,
      );
      setFilteredRooms(filtered);
      setFormData((prev) => ({
        ...prev,
        propertyId,
        property: propertyName,
        sharingType,
        roomId: "",
        roomNumber: "",
        rentAmount: pricing?.sharingPrices?.[sharingType] || 0,
        refundableDeposit: pricing?.deposit?.refundable || 0,
        nonRefundableDeposit: pricing?.deposit?.nonRefundable || 0,
      }));
    } catch (error) {
      console.error("Error fetching rooms:", error);
      setAvailableRooms([]);
      setSharingTypes([]);
      setFilteredRooms([]);
    }
  };

  const handlePropertyChange = async (e) => {
    const propertyName = e.target.value;
    const selectedProperty = properties.find((p) => p.name === propertyName);

    if (selectedProperty) {
      setFormData((prev) => ({
        ...prev,
        property: selectedProperty.name,
        propertyId: selectedProperty._id,
      }));

      await fetchRoomsAndPricing(selectedProperty._id, originalSharingType);
    }
  };

  const handleSharingTypeChange = (e) => {
    const sharingType = e.target.value;
    const filtered = availableRooms.filter(
      (room) => room.sharingType === sharingType,
    );
    setFilteredRooms(filtered);

    setOriginalSharingType(sharingType);
    setFormData((prev) => ({
      ...prev,
      sharingType,
      roomId: "",
      roomNumber: "",
      rentAmount: pricing?.sharingPrices?.[sharingType] || 0,
    }));
  };

  const handleChange = (e) => {
    const {name, value} = e.target;

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else if (name === "roomId") {
      const selectedRoom = filteredRooms.find((room) => room._id === value);
      setFormData((prev) => ({
        ...prev,
        roomId: value,
        roomNumber: selectedRoom?.roomNo || "",
      }));
    } else {
      setFormData((prev) => ({...prev, [name]: value}));
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      let approvalData = {
        name: formData.name,
        email: formData.email,
        contact: formData.contact,
        userType: formData.userType,
        rentType: formData.rentType,
        refundableDeposit: formData.refundableDeposit,
        nonRefundableDeposit: formData.nonRefundableDeposit,
        updatedBy: user.name,
      };

      if (formData.busRequired) {
        approvalData.busRequired = formData.busRequired; // Keep this for reference if needed

        if (formData.busRequired === "yes") {
          approvalData.busFee = {
            required: true,
            yearlyAmount: Number(formData.busYearlyAmount) || 0,
            amountPaid: 0, // Initially no amount paid
            dueAmount: Number(formData.busYearlyAmount) || 0, // Full amount is due initially
            status: "pending",
            validityStartDate: formData.busValidityStartDate,
            validityEndDate: formData.busValidityEndDate,
          };
        } else {
          // If bus not required, set required to false
          approvalData.busFee = {
            required: false,
            yearlyAmount: 0,
            amountPaid: 0,
            dueAmount: 0,
            status: "pending",
          };
        }
      }

      if (isMessOnly) {
        approvalData = {
          ...approvalData,
          kitchenId: formData.kitchenId,
          kitchenName: formData.kitchen,
          messDetails: formData.messDetails,
          financialDetails: formData.financialDetails,
        };
      } else if (isDailyRent) {
        approvalData = {
          ...approvalData,
          propertyId: formData.propertyId,
          roomId: formData.roomId,
          propertyName: formData.property,
          stayDetails: formData.stayDetails,
          financialDetails: formData.financialDetails,
        };
      } else {
        const selectedRoom = availableRooms.find(
          (room) => room._id === formData.roomId,
        );

        if (!selectedRoom && !isDailyRent) {
          throw new Error("Selected room not found");
        }

        approvalData = {
          ...approvalData,
          propertyId: formData.propertyId,
          propertyName: formData.property,
          roomId: formData.roomId,
          monthlyRent: formData.rentAmount,
          joinDate: formData.joinDate,
        };
      }
      // console.log(approvalData);
      await approveMutation.mutateAsync(approvalData);
    } catch (error) {
      console.error("Approval failed:", error);
      // showNotification(error.message, "error");
      messageApi.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = () => {
    setIsRejectModalOpen(true);
  };

  const handleRejectConfirm = () => {
    rejectMutation.mutate({id, adminName});
    setIsRejectModalOpen(false);
  };
  const steps = isMessOnly
    ? [
        {id: 1, name: "Applicant Details"},
        {id: 2, name: "Kitchen Selection"},
        {id: 3, name: "Payment Terms"},
        {id: 4, name: "Confirmation"},
      ]
    : isDailyRent
      ? [
          {id: 1, name: "Applicant Details"},
          {id: 2, name: "Property Selection"},
          {id: 3, name: "Room Assignment"},
          {id: 4, name: "Payment Terms"},
          {id: 5, name: "Confirmation"},
        ]
      : [
          {id: 1, name: "Applicant Details"},
          {id: 2, name: "Property Selection"},
          {id: 3, name: "Room Assignment"},
          {id: 4, name: "Payment Terms"},
          {id: 5, name: "Confirmation"},
        ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#059669]"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">Failed to load resident data</p>
          <button
            onClick={() => queryClient.refetchQueries(["resident", id])}
            className="px-4 py-2 bg-[#059669] text-white rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!residentData) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        Request not found
      </div>
    );
  }

  return (
    <>
      {contextHolder}
      <div className="min-h-screen bg-gray-50 xl:px-12 lg:px-4 lg:pt-6 lg:pb-12 px-4 pt-4 pb-8">
        {/* Header */}
        <PageHeader
          title={isRejoin ? "Rejoin Process" : "Onboarding Approval"}
          subtitle={
            isRejoin
              ? `Complete the rejoining process for ${residentData.name}`
              : `Complete the onboarding process for ${residentData.name}`
          }
        />

        <Timeline steps={steps} activeStep={activeStep} />

        {/* Form Sections */}
        <div className="max-w-[825px] sm:mx-auto px-0 sm:px-6 lg:px-8">
          <div className="p-0 sm:p-6 mt-4 sm:mt-0">
            {activeStep === 1 && (
              <ApplicantDetailsStep
                formData={formData}
                handleChange={handleChange}
                handleReject={handleReject}
                isRejoin={isRejoin}
              />
            )}
            {activeStep === 2 &&
              (isMessOnly ? (
                <KitchenSelectionStep
                  formData={formData}
                  handleChange={handleChange}
                  handleReject={handleReject}
                  isRejoin={isRejoin}
                />
              ) : (
                <PropertySelectionStep
                  formData={formData}
                  properties={properties}
                  handlePropertyChange={handlePropertyChange}
                  handleReject={handleReject}
                  isRejoin={isRejoin}
                />
              ))}
            {!isMessOnly && activeStep === 3 && (
              <RoomAssignmentStep
                formData={formData}
                sharingTypes={sharingTypes}
                filteredRooms={filteredRooms}
                handleSharingTypeChange={handleSharingTypeChange}
                handleChange={handleChange}
                handleReject={handleReject}
                isRejoin={isRejoin}
              />
            )}
            {activeStep === (isMessOnly ? 3 : isDailyRent ? 4 : 4) && (
              <PaymentTermsStep
                formData={formData}
                handleChange={handleChange}
                handleReject={handleReject}
                isRejoin={isRejoin}
              />
            )}

            {activeStep === (isMessOnly ? 4 : isDailyRent ? 5 : 5) && (
              <ConfirmationStep
                formData={formData}
                handleReject={handleReject}
                isMessOnly={isMessOnly}
                isDailyRent={isDailyRent}
                isRejoin={isRejoin}
              />
            )}
            {/* Navigation Buttons */}
            <Divider style={{margin: "24px 0 16px 0"}} />
            <Space
              style={{
                display: "flex",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <div>
                {activeStep > 1 && (
                  <ConfigProvider theme={purpleButton}>
                    <Button
                      onClick={() => setActiveStep(activeStep - 1)}
                      type="primary"
                      icon={<FiChevronLeft />}
                    >
                      Previous
                    </Button>
                  </ConfigProvider>
                )}
              </div>
              <Space>
                {activeStep < steps.length ? (
                  <ConfigProvider theme={purpleButton}>
                    <Button
                      onClick={() => setActiveStep(activeStep + 1)}
                      disabled={
                        (activeStep === 2 &&
                          !isMessOnly &&
                          !formData.propertyId) ||
                        (activeStep === 2 &&
                          isMessOnly &&
                          !formData.kitchenId) ||
                        (activeStep === 3 && !isMessOnly && !formData.roomId)
                      }
                      type="primary"
                      icon={<FiChevronRight />}
                    >
                      Next
                    </Button>
                  </ConfigProvider>
                ) : (
                  <ConfigProvider theme={greenButton}>
                    <Button
                      onClick={handleSubmit}
                      disabled={isSubmitting || approveMutation.isPending}
                      type="primary"
                      icon={<FiCheck />}
                    >
                      {isRejoin
                        ? "Complete Rejoin Process"
                        : "Complete Onboarding"}
                    </Button>
                  </ConfigProvider>
                )}
              </Space>
            </Space>
          </div>
        </div>
        <Modal
          title={`Reject Onboarding Request for ${formData.name}?`}
          open={isRejectModalOpen}
          onOk={handleRejectConfirm}
          onCancel={() => setIsRejectModalOpen(false)}
          okText="Reject"
          okType="danger"
          cancelText="Cancel"
          centered
        >
          <p>
            Are you sure you want to reject this applicant's request? This
            action cannot be undone.
          </p>
        </Modal>
      </div>
    </>
  );
};

export default OnboardingApprovalPage;
