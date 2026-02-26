import {message, Tag} from "antd";
import {
  FiCalendar,
  FiLogOut,
  FiPlus,
  GoPeople,
  MdOutlineBedroomParent,
  MdOutlineFoodBank,
  PhoneOutlined,
} from "../../icons/index.js";
import {ActionButton} from "../../components/index.js";
import {greenButton} from "../../data/common/color.js";
import {formatDate, formatLabel} from "../../utils/formatUtils.js";
import {useState} from "react";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {vacateResident} from "../../hooks/users/useUser.js";
import ConfirmModal from "../../modals/common/ConfirmModal.jsx";
import {RentUpdateModal} from "./RentUpdateModal.jsx";

export default function CheckoutCard({
  id,
  userData,
  type,
  name,
  userType,
  roomNumber,
  sharingType,
  kitchenName,
  checkInDate,
  rent,
  checkOutDate,
  extendDate,
  paymentStatus,
  pendingAmount,
  phone,
  onViewDetails,
}) {
  const [extendModalVisible, setExtendModalVisible] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [messageApi, contextHolder] = message.useMessage();

  const queryClient = useQueryClient();

  const vacateMutation = useMutation({
    mutationFn: (id) => vacateResident(id),
    onSuccess: () => {
      messageApi.success({
        content: "Resident vacated successfully!",
        duration: 3,
      });
      queryClient.invalidateQueries(["residents"]);
      queryClient.invalidateQueries(["todayCheckouts"]);
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to vacate resident";
      messageApi.error({
        content: errorMessage,
        duration: 3,
      });
      console.error("Vacate failed:", error);
    },
  });

  const confirmVacate = () => {
    vacateMutation.mutate(id);
    setShowModal(false);
    setSelectedResident(null);
  };

  const cancelVacate = () => {
    setShowModal(false);
    setSelectedResident(null);
  };

  return (
    <>
      {contextHolder}
      <div
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-col gap-3 w-full max-w-sm cursor-pointer"
        onClick={onViewDetails}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold truncate">{name}</h2>
          <Tag
            color="orange"
            bordered={false}
            style={{borderRadius: "12px", padding: "0 10px"}}
          >
            {formatLabel(type)}
          </Tag>
        </div>

        {/* Accommodation / Kitchen info */}
        <div className="text-sm flex gap-6">
          {type === "dailyRent" ? (
            <>
              <div className="flex items-center gap-1 min-w-0">
                <MdOutlineBedroomParent className="text-gray-500 text-xl" />
                <span className="truncate max-w-[140px] text-gray-500">
                  {roomNumber}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <GoPeople className="text-gray-500 text-lg" />
                <span className="text-md text-gray-500">{sharingType}</span>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-1 min-w-0">
              <MdOutlineFoodBank className="text-gray-400 text-2xl" />
              <span className="truncate max-w-[140px] text-gray-500">
                {kitchenName}
              </span>
            </div>
          )}
        </div>

        {/* Phone + Check-in Date */}
        <div className="flex items-center gap-4 text-sm text-gray-600">
          {phone && (
            <div className="flex items-center gap-1">
              <PhoneOutlined className="text-gray-400" />
              <span>{phone}</span>
            </div>
          )}
          {(checkInDate || extendDate || checkOutDate) && (
            <div className="flex items-center gap-1">
              <FiCalendar />
              <span>
                {checkInDate && `${formatDate(checkInDate)}`}
                {checkInDate && (extendDate || checkOutDate) && " - "}
                {extendDate
                  ? formatDate(extendDate)
                  : checkOutDate && formatDate(checkOutDate)}
              </span>
            </div>
          )}
        </div>

        {/* Payment Status */}
        <div className="flex items-center gap-2 text-sm">
          <Tag color={paymentStatus === "paid" ? "green" : "red"}>
            {paymentStatus === "paid"
              ? "Paid"
              : `Pending ₹${pendingAmount || 0}`}
          </Tag>
        </div>

        {/* Divider */}
        <div
          className="h-px w-full"
          style={{
            background: "linear-gradient(to right, white, gray, white)",
          }}
        />

        {/* Footer Buttons */}
        <div className="flex gap-2 items-center justify-between">
          <ActionButton
            variant="outlined"
            color="danger"
            className="lg:w-[53%]"
            icon={<FiLogOut className="text-lg mt-1" />}
            onClick={(e) => {
              e.stopPropagation();
              setShowModal(true);
            }}
          >
            Checkout
          </ActionButton>
          <ActionButton
            icon={<FiPlus className="text-lg mt-1" />}
            customTheme={greenButton}
            onClick={(e) => {
              e.stopPropagation();
              setExtendModalVisible(true);
            }}
          >
            Extend Stay
          </ActionButton>
        </div>
      </div>

      <RentUpdateModal
        visible={extendModalVisible}
        onCancel={() => setExtendModalVisible(false)}
        userData={userData}
      />

      <ConfirmModal
        isOpen={showModal}
        title="Confirm Vacate"
        residentName={name}
        onConfirm={confirmVacate}
        onCancel={cancelVacate}
      />
    </>
  );
}
