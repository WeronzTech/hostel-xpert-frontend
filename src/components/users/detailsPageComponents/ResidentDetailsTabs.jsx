import {useState} from "react";
import {
  FiUser,
  FiCalendar,
  FiHome,
  FiMail,
  FiPhone,
  FiCreditCard,
  FiBriefcase,
  FiTool,
  FiMapPin,
  HiOutlineBuildingOffice2,
  FiFile,
  FiUsers,
} from "../../../icons/index";
import {Image} from "antd";
import {FaRupeeSign, FaRegIdCard, FaHistory} from "react-icons/fa";
import {
  HiOutlineCake,
  HiOutlineDocumentText,
  HiOutlineOfficeBuilding,
} from "../../../icons/index";
import {
  DetailCard,
  DetailItem,
  SectionHeader,
} from "../../users/DetailComponents";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import TransactionHistoryModal from "./TransactionHistoryModal";
import {useSelector} from "react-redux";
import RentCollectionModal from "../../../modals/accounts/RentCollectionModal";
import {useQueryClient} from "@tanstack/react-query";

const ResidentDetailsTabs = ({resident}) => {
  const {selectedProperty} = useSelector((state) => state.properties);

  const [transactionModalVisible, setTransactionModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [residentForPayment, setResidentForPayment] = useState(null);
  dayjs.extend(relativeTime);
  const queryClient = useQueryClient();

  // Define tabs based on userType
  const getTabs = () => {
    let tabs = [];

    switch (resident.userType) {
      case "worker":
        tabs = [
          {id: "personal", label: "Personal", icon: <FiUser />},
          {id: "employment", label: "Employment", icon: <FiTool />},
          {id: "financial", label: "Financial", icon: <FaRupeeSign />},
        ];
        break;

      case "dailyRent":
      case "messOnly":
        tabs = [
          {id: "personal", label: "Personal", icon: <FiUser />},
          {id: "financial", label: "Financial", icon: <FaRupeeSign />},
        ];
        break;

      default: // student
        tabs = [
          {id: "personal", label: "Personal", icon: <FiUser />},
          {id: "academic", label: "Academic", icon: <HiOutlineDocumentText />},
          {id: "guardian", label: "Guardian", icon: <FiUser />},
          {id: "financial", label: "Financial", icon: <FaRupeeSign />},
        ];
        break;
    }

    // ✅ Add Coliving Partner tab if applicable
    if (resident.isColiving) {
      tabs.splice(1, 0, {
        id: "colivingPartner",
        label: "Coliving Partner",
        icon: <FiUsers />,
      });
    }

    return tabs;
  };

  const tabs = getTabs();

  const handlePaymentModalClose = () => {
    setShowPaymentModal(false);
    setResidentForPayment(null);
  };

  const handlePaymentSuccess = () => {
    // Refresh the residents data after successful payment
    queryClient.invalidateQueries(["residents"]);
    setShowPaymentModal(false);
    setResidentForPayment(null);
  };

  const handlePaymentClick = (resident) => {
    setResidentForPayment(resident);
    setShowPaymentModal(true);
  };

  // Calculate payment due information
  const nextDueDateRaw = resident.financialDetails?.nextDueDate;
  const nextDueDate = nextDueDateRaw ? dayjs(nextDueDateRaw) : null;
  const today = dayjs();
  const daysRemaining = nextDueDate ? nextDueDate.diff(today, "day") : null;
  const formattedDate = nextDueDate
    ? nextDueDate.format("MMMM D, YYYY")
    : "N/A";
  const dueMessage =
    daysRemaining !== null
      ? `${Math.abs(daysRemaining)} day${
          Math.abs(daysRemaining) !== 1 ? "s" : ""
        } ${daysRemaining >= 0 ? "remaining" : "overdue"}`
      : "No due date";

  const status = resident.stayDetails?.depositStatus; // <-- no default "Pending"

  const isPending = status?.toLowerCase() === "pending";

  const depositStatusLabel = isPending
    ? `Pending - ₹${
        (resident.stayDetails?.refundableDeposit || 0) +
        (resident.stayDetails?.nonRefundableDeposit || 0) -
        (resident.stayDetails?.depositAmountPaid || 0)
      }`
    : (status ?? ""); // if null, show empty string

  return (
    <div className="lg:col-span-8">
      <DetailCard>
        <div className="w-full overflow-x-auto text-center">
          <div className="inline-flex space-x-1 mx-auto px-4 py-2 md:py-0 md:px-0 w-max">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`cursor-pointer flex-shrink-0 flex items-center px-6 py-3 text-sm font-medium border-b-2 ${
                  activeTab === tab.id
                    ? "border-[#059669] text-[#059669]"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-[9px] xl:h-[459px] lg:h-[485px]">
          {/* Personal Information Tab (shown for all user types) */}
          {activeTab === "personal" && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <DetailItem
                    label="Date of Birth"
                    value={
                      resident.personalDetails?.dob
                        ? dayjs(resident.personalDetails.dob).format(
                            "DD MMMM, YYYY",
                          )
                        : "Not Provided"
                    }
                    icon={<HiOutlineCake />}
                  />
                  <DetailItem
                    label="Gender"
                    value={resident.personalDetails?.gender ?? "Not Provided"}
                    icon={<FiUser />}
                  />
                </div>
                <div className="space-y-4">
                  <DetailItem
                    label="Address"
                    value={resident.personalDetails?.address ?? "Not Provided"}
                    icon={<FiHome />}
                  />
                </div>
              </div>

              <SectionHeader
                title="Identity Documents"
                icon={<FaRegIdCard />}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {/* Aadhar Front */}
                <div
                  className={`border border-gray-200 rounded-lg p-4 h-68 flex flex-col ${
                    resident.personalDetails?.aadharFront
                      ? "cursor-pointer"
                      : "cursor-default"
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Aadhar Card (Front)
                    </span>
                  </div>
                  <div className="flex-grow relative flex items-center justify-center bg-gray-50 rounded">
                    {resident.personalDetails?.aadharFront ? (
                      <Image
                        src={resident.personalDetails.aadharFront}
                        alt="Aadhar Front"
                        width="100%"
                        height={150}
                        style={{objectFit: "contain"}}
                        className="rounded"
                        preview={{
                          mask: <span className="text-white">View</span>,
                        }}
                        fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
                      />
                    ) : (
                      <div className="text-gray-400 text-sm flex flex-col items-center">
                        <FiFile className="text-2xl mb-1" />
                        <span>No document provided</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Aadhar Back */}
                <div
                  className={`border border-gray-200 rounded-lg p-4 h-68 flex flex-col ${
                    resident.personalDetails?.aadharBack
                      ? "cursor-pointer"
                      : "cursor-default"
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Aadhar Card (Back)
                    </span>
                  </div>
                  <div className="flex-grow relative flex items-center justify-center bg-gray-50 rounded">
                    {resident.personalDetails?.aadharBack ? (
                      <Image
                        src={resident.personalDetails.aadharBack}
                        alt="Aadhar Back"
                        width="100%"
                        height={150}
                        style={{objectFit: "contain"}}
                        className="rounded"
                        preview={{
                          mask: <span className="text-white">View</span>,
                        }}
                        fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
                      />
                    ) : (
                      <div className="text-gray-400 text-sm flex flex-col items-center">
                        <FiFile className="text-2xl mb-1" />
                        <span>No document provided</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Coliving Partner Details Tab (if applicable) */}
          {activeTab === "colivingPartner" &&
            resident.isColiving &&
            resident.colivingPartner && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <DetailItem
                      label="Name"
                      value={resident.colivingPartner?.name ?? "Not Provided"}
                      icon={<FiUser />}
                    />
                    <DetailItem
                      label="Contact"
                      value={
                        resident.colivingPartner?.contact ?? "Not Provided"
                      }
                      icon={<FiPhone />}
                    />
                  </div>
                  <div className="space-y-4">
                    <DetailItem
                      label="Email"
                      value={resident.colivingPartner?.email ?? "Not Provided"}
                      icon={<FiMail />}
                    />
                    <DetailItem
                      label="Relation"
                      value={
                        resident.colivingPartner?.relation ?? "Not Provided"
                      }
                      icon={<FiUsers />}
                    />
                  </div>
                </div>

                <SectionHeader
                  title="Identity Documents"
                  icon={<FaRegIdCard />}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {/* Aadhar Front */}
                  <div
                    className={`border border-gray-200 rounded-lg p-4 h-68 flex flex-col ${
                      resident.colivingPartner?.aadharFront
                        ? "cursor-pointer"
                        : "cursor-default"
                    }`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        Aadhar Card (Front)
                      </span>
                    </div>
                    <div className="flex-grow relative flex items-center justify-center bg-gray-50 rounded">
                      {resident.colivingPartner?.aadharFront ? (
                        <Image
                          src={resident.colivingPartner.aadharFront}
                          alt="Aadhar Front"
                          width="100%"
                          height={150}
                          style={{objectFit: "contain"}}
                          className="rounded"
                          preview={{
                            mask: <span className="text-white">View</span>,
                          }}
                          fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
                        />
                      ) : (
                        <div className="text-gray-400 text-sm flex flex-col items-center">
                          <FiFile className="text-2xl mb-1" />
                          <span>No document provided</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Aadhar Back */}
                  <div
                    className={`border border-gray-200 rounded-lg p-4 h-68 flex flex-col ${
                      resident.colivingPartner?.aadharBack
                        ? "cursor-pointer"
                        : "cursor-default"
                    }`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        Aadhar Card (Back)
                      </span>
                    </div>
                    <div className="flex-grow relative flex items-center justify-center bg-gray-50 rounded">
                      {resident.colivingPartner?.aadharBack ? (
                        <Image
                          src={resident.colivingPartner.aadharBack}
                          alt="Aadhar Back"
                          width="100%"
                          height={150}
                          style={{objectFit: "contain"}}
                          className="rounded"
                          preview={{
                            mask: <span className="text-white">View</span>,
                          }}
                          fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
                        />
                      ) : (
                        <div className="text-gray-400 text-sm flex flex-col items-center">
                          <FiFile className="text-2xl mb-1" />
                          <span>No document provided</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}

          {/* Academic Details Tab (only for students) */}
          {activeTab === "academic" && resident.userType === "student" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <DetailItem
                  label="Course"
                  value={resident.studyDetails?.course ?? "Not Provided"}
                  icon={<HiOutlineDocumentText />}
                />
                <DetailItem
                  label="Year of Study"
                  value={resident.studyDetails?.yearOfStudy ?? "Not Provided"}
                  icon={<FiCalendar />}
                />
              </div>
              <div className="space-y-4">
                <DetailItem
                  label="Institution"
                  value={resident.studyDetails?.institution ?? "Not Provided"}
                  icon={<HiOutlineOfficeBuilding />}
                />
              </div>
            </div>
          )}

          {/* Guardian Details Tab (only for students) */}
          {activeTab === "guardian" && resident.userType === "student" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <DetailItem
                  label="Name"
                  value={resident.parentsDetails?.name ?? "Not Provided"}
                  icon={<FiUser />}
                />
                <DetailItem
                  label="Contact"
                  value={resident.parentsDetails?.contact ?? "Not Provided"}
                  icon={<FiPhone />}
                />
              </div>
              <div className="space-y-4">
                <DetailItem
                  label="Email"
                  value={resident.parentsDetails?.email ?? "Not Provided"}
                  icon={<FiMail />}
                />
                <DetailItem
                  label="Occupation"
                  value={resident.parentsDetails?.occupation ?? "Not Provided"}
                  icon={<FiBriefcase />}
                />
              </div>
            </div>
          )}

          {/* Employment Details Tab (only for workers) */}
          {activeTab === "employment" && resident.userType === "worker" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <DetailItem
                  label="Job Title"
                  value={resident.workingDetails?.jobTitle ?? "Not Provided"}
                  icon={<FiBriefcase />}
                />
                <DetailItem
                  label="Location"
                  value={resident.workingDetails?.location ?? "Not Provided"}
                  icon={<FiMapPin />}
                />
              </div>
              <div className="space-y-4">
                <DetailItem
                  label="Company Name"
                  value={resident.workingDetails?.companyName ?? "Not Provided"}
                  icon={<HiOutlineBuildingOffice2 />}
                />
                <DetailItem
                  label="Emergency Contact"
                  value={
                    resident.workingDetails?.emergencyContact ?? "Not Provided"
                  }
                  icon={<FiPhone />}
                />
              </div>
            </div>
          )}

          {/* Financial Information Tab */}
          {activeTab === "financial" && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  {/* Rent-related field */}
                  {["student", "worker"].includes(resident.userType) && (
                    <DetailItem
                      label="Monthly Rent"
                      value={
                        resident.stayDetails?.monthlyRent ?? "Not Provided"
                      }
                      icon={<FaRupeeSign />}
                      isCurrency
                    />
                  )}

                  {resident.userType === "dailyRent" && (
                    <DetailItem
                      label="Rent / Day"
                      value={resident.stayDetails?.dailyRent ?? "Not Provided"}
                      icon={<FaRupeeSign />}
                      isCurrency
                    />
                  )}

                  {resident.userType === "messOnly" && (
                    <DetailItem
                      label="Rate / Day"
                      value={resident.messDetails?.rent ?? "Not Provided"}
                      icon={<FaRupeeSign />}
                      isCurrency
                    />
                  )}

                  {/* Pending amount / rent */}
                  {["student", "worker"].includes(resident.userType) ? (
                    <DetailItem
                      label="Pending Rent"
                      value={
                        resident.financialDetails?.pendingRent ?? "Not Provided"
                      }
                      icon={<FaRupeeSign />}
                      isCurrency
                    />
                  ) : (
                    <DetailItem
                      label="Pending Amount"
                      value={
                        resident.financialDetails?.pendingAmount ??
                        "Not Provided"
                      }
                      icon={<FaRupeeSign />}
                      isCurrency
                    />
                  )}

                  {/* Payment Status */}
                  <DetailItem
                    label="Payment Status"
                    value={resident.paymentStatus}
                    icon={<FiCreditCard />}
                    isStatus
                  />
                </div>

                <div className="space-y-4">
                  {/* Account Balance / Total Amount */}
                  {["student", "worker"].includes(resident.userType) ? (
                    <DetailItem
                      label="Account Balance"
                      value={
                        resident.financialDetails?.accountBalance ??
                        "Not Provided"
                      }
                      icon={<FaRupeeSign />}
                      isCurrency
                    />
                  ) : (
                    <DetailItem
                      label="Total Amount"
                      value={
                        resident.financialDetails?.totalAmount ?? "Not Provided"
                      }
                      icon={<FaRupeeSign />}
                      isCurrency
                    />
                  )}

                  {/* Deposit fields: only for student / worker */}
                  {["student", "worker"].includes(resident.userType) && (
                    <>
                      <DetailItem
                        label="Deposit Amount"
                        value={
                          (resident.stayDetails?.nonRefundableDeposit || 0) +
                          (resident.stayDetails?.refundableDeposit || 0)
                        }
                        icon={<FaRupeeSign />}
                        isCurrency
                      />
                      <DetailItem
                        label="Deposit Status"
                        value={depositStatusLabel}
                        icon={<FiCreditCard />}
                        isStatus
                      />
                    </>
                  )}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100">
                <div
                  className="
      flex flex-col sm:flex-row 
      sm:items-center sm:justify-between
      gap-3
    "
                >
                  {/* LEFT side → Transaction + Payment */}
                  <div className="flex items-center space-x-2">
                    {/* Transaction History */}
                    <button
                      className="cursor-pointer inline-flex items-center px-4 py-2 bg-[#059669] hover:bg-[#059669] text-white text-sm font-medium rounded-md shadow-sm transition-colors"
                      onClick={() => setTransactionModalVisible(true)}
                    >
                      <FaHistory className="mr-2" />
                      Transaction History
                    </button>

                    {/* Make Payment */}
                    <button
                      className="cursor-pointer inline-flex items-center px-4 py-2 bg-[#059669] hover:bg-[#059669] text-white text-sm font-medium rounded-md shadow-sm transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePaymentClick(resident);
                      }}
                    >
                      <FaRupeeSign className="mr-2" />
                      Make Payment
                    </button>
                  </div>

                  {/* RIGHT side → Next Payment Due (only for monthly) */}
                  {resident.rentType === "monthly" && (
                    <div className="sm:text-right">
                      <h4 className="text-sm font-medium text-gray-700">
                        Next Payment Due
                      </h4>
                      <p className="text-sm text-gray-500">
                        {dueMessage} ({formattedDate})
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </DetailCard>
      <TransactionHistoryModal
        userId={resident._id}
        visible={transactionModalVisible}
        onClose={() => setTransactionModalVisible(false)}
      />

      {showPaymentModal && residentForPayment && (
        <RentCollectionModal
          visible={showPaymentModal}
          onCancel={handlePaymentModalClose}
          onSuccess={handlePaymentSuccess}
          preSelectedUser={residentForPayment}
          preSelectedProperty={selectedProperty}
          selectedOption={resident.rentType}
        />
      )}
    </div>
  );
};

export default ResidentDetailsTabs;
