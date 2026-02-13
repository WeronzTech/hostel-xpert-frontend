import {
  Dropdown,
  Menu,
  Progress,
  Tag,
  Modal,
  Form,
  Input,
  DatePicker,
  Button,
  message,
  Image,
} from "antd";
import {
  FiEdit,
  FiPhone,
  FiMail,
  FiHome,
  FiCalendar,
  FiShare2,
  FiDownload,
  HiOutlineOfficeBuilding,
  FiMoreVertical,
  CheckOutlined,
  ExclamationCircleOutlined,
  FiUser,
  FiLock,
  FaRupeeSign,
  FiClock,
  FiFileText,
} from "../../../icons/index";
import {DetailItem} from "../../users/DetailComponents";
import dayjs from "dayjs";
import {useNavigate} from "react-router-dom";
import {useEffect, useState} from "react";
import StatusTimelineModal from "./StatusTimelineModal";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {handleBlockStatus} from "../../../hooks/users/useUser";
import DownloadOptionsModal from "./DownloadOptionsModal";
import ShareModal from "./ShareModal";
import {useSelector} from "react-redux";
import NotesModal from "./NotesModal";
import TransactionHistoryModal from "./TransactionHistoryModal";
import RentCollectionModal from "../../../modals/accounts/RentCollectionModal";

const ProfileSummary = ({resident}) => {
  const {user} = useSelector((state) => state.auth);
  const {selectedProperty} = useSelector((state) => state.properties);

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [residentForPayment, setResidentForPayment] = useState(null);
  const [timelineModalVisible, setTimelineModalVisible] = useState(false);
  const [transactionModalVisible, setTransactionModalVisible] = useState(false);
  const [blockModalVisible, setBlockModalVisible] = useState(false);
  const [unblockModalVisible, setUnblockModalVisible] = useState(false);
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [notesModalVisible, setNotesModalVisible] = useState(false);
  const [downloadModalVisible, setDownloadModalVisible] = useState(false);
  const [showPrimary, setShowPrimary] = useState(true);

  const [form] = Form.useForm();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [messageApi, contextHolder] = message.useMessage();

  // Mutation for blocking/unblocking
  const blockMutation = useMutation({
    mutationFn: ({id, action, extendDate}) =>
      handleBlockStatus(id, {action, extendDate, adminName: user.name}),
    onSuccess: () => {
      queryClient.invalidateQueries(["resident", resident._id]);
      messageApi.success({
        content: `User ${
          resident.isBlocked ? "unblocked" : "blocked"
        } successfully`,
        duration: 3,
      });
      setUnblockModalVisible(false);
      setBlockModalVisible(false);
    },
    onError: (error) => {
      messageApi.error({
        content: error.message || "Failed to update block status",
        duration: 3,
      });
    },
  });

  const profileImg = resident.personalDetails?.profileImg?.trim();
  const partnerImg =
    resident.isColiving && resident.colivingPartner?.profileImg?.trim();
  const hasImage = !!profileImg;
  const hasPartnerImage = !!partnerImg;
  const hasAnyImage = hasImage || hasPartnerImage;

  useEffect(() => {
    if (hasPartnerImage) {
      const interval = setInterval(() => {
        setShowPrimary((prev) => !prev);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [hasPartnerImage]);

  const getReadableStatus = (status) => {
    const map = {
      checked_in: "Checked In",
      on_leave: "On Leave",
      checked_out: "Checked Out",
      paid: "Paid",
      pending: "Pending",
      student: "Student",
      worker: "Worker",
      dailyRent: "Daily Rent",
      messOnly: "Mess Only",
    };

    return map[status] || "Unknown";
  };

  const getTagColor = (status) => {
    const colorMap = {
      checked_in: "processing",
      on_leave: "warning",
      checked_out: "red",
      paid: "success",
      pending: "red",
      overdue: "error",
      student: "blue",
      worker: "purple",
      dailyRent: "orange",
      messOnly: "cyan",
      staff: "geekblue",
      guest: "gold",
    };
    return colorMap[status] || "gray";
  };

  const handleEditClick = (id) => {
    navigate(`/resident/${id}/edit`, {state: {resident}});
  };

  const handleMenuClick = (e) => {
    switch (e.key) {
      case "stay_details":
        setTimelineModalVisible(true);
        break;
      case "transactions":
        setTransactionModalVisible(true);
        break;
      case "block_access":
        if (resident.isBlocked) {
          setUnblockModalVisible(true);
        } else {
          setBlockModalVisible(true);
        }
        break;
      default:
        break;
    }
  };

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
  const handleBlock = () => {
    blockMutation.mutate({
      id: resident._id,
      action: "block",
    });
  };

  const handleUnblock = () => {
    form.validateFields().then((values) => {
      // Send the date to API but keep days display in UI
      blockMutation.mutate({
        id: resident._id,
        action: "unblock",
        extendDate: values?.extendDate?.format("YYYY-MM-DD"), // Send date
      });
    });
  };
  const menu = (
    <Menu onClick={handleMenuClick}>
      <Menu.Item key="stay_details" icon={<FiClock className="mr-2" />}>
        Check-In / Out Log
      </Menu.Item>
      <Menu.Item key="transactions" icon={<FaRupeeSign className="mr-2" />}>
        Transaction History
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item
        key="block_access"
        icon={<FiLock className="mr-2" />}
        style={{
          color: resident.isBlocked ? "#16a34a" : "#dd1818ff",
          transition: "all 0.2s",
        }}
        className={
          resident.isBlocked
            ? "hover:!bg-green-600 hover:!text-white"
            : "hover:!bg-red-600 hover:!text-white"
        }
      >
        {resident.isBlocked ? "Unblock Access" : "Block Access"}
      </Menu.Item>
    </Menu>
  );

  return (
    <>
      {contextHolder}
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-[#059669] p-6 text-white">
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0">
                <div className="relative">
                  {hasAnyImage ? (
                    <Image.PreviewGroup
                      items={[
                        ...(hasImage ? [profileImg] : []),
                        ...(hasPartnerImage ? [partnerImg] : []),
                      ]}
                    >
                      <div className="relative w-24 h-24">
                        {/* Primary (Resident) Image */}
                        {hasImage && (
                          <div
                            className="absolute inset-0 transition-opacity duration-700"
                            style={{opacity: showPrimary ? 1 : 0}}
                          >
                            <Image
                              src={profileImg}
                              alt={resident.name || "Resident"}
                              preview={{
                                mask: <span className="text-white">View</span>,
                              }}
                              width={96}
                              height={96}
                              style={{
                                objectFit: "cover",
                                borderRadius: "8px",
                                border: "4px solid rgba(255,255,255,0.3)",
                              }}
                              fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
                            />
                          </div>
                        )}

                        {/* Partner (Coliving) Image */}
                        {hasPartnerImage && (
                          <div
                            className="absolute inset-0 transition-opacity duration-700"
                            style={{opacity: showPrimary ? 0 : 1}}
                          >
                            <Image
                              src={partnerImg}
                              alt={
                                resident.colivingPartner?.name ||
                                "Co-living Partner"
                              }
                              preview={{
                                mask: <span className="text-white">View</span>,
                              }}
                              width={96}
                              height={96}
                              style={{
                                objectFit: "cover",
                                borderRadius: "8px",
                                border: "4px solid rgba(255,255,255,0.3)",
                              }}
                              fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
                            />
                          </div>
                        )}
                      </div>
                    </Image.PreviewGroup>
                  ) : (
                    <div className="w-24 h-24 rounded-lg border-4 border-white border-opacity-30 bg-gray-100 flex flex-col items-center justify-center">
                      <FiUser className="text-gray-400 text-3xl mb-1" />
                      <span className="text-gray-400 text-sm">No profile</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h2 className={`text-2xl font-semibold`}>
                    {resident.name}
                    {resident.isBlocked && (
                      <span className="ml-2 text-xs bg-red-600 text-white px-2 py-0.5 rounded-md animate-pulse">
                        BLOCKED
                      </span>
                    )}
                  </h2>
                  <div className="flex items-center gap-2">
                    {/* Make Payment - Primary Action */}
                    <button
                      onClick={() => handlePaymentClick(resident)}
                      title="Make Payment"
                      className="flex items-center gap-1 cursor-pointer bg-green-500 hover:bg-green-600 text-white px-2.5 py-1 rounded transition-colors"
                    >
                      <FaRupeeSign className="w-3.5 h-3.5" />
                      <span className="text-xs font-medium">Pay</span>
                    </button>

                    {/* Edit Button */}
                    <button
                      className="cursor-pointer text-white/70 hover:text-white rounded transition-colors"
                      onClick={() => handleEditClick(resident._id)}
                      title="Edit"
                    >
                      <FiEdit className="w-[20px] h-[20px] ml-2" />
                    </button>

                    {/* More Options */}
                    <Dropdown
                      overlay={menu}
                      trigger={["click"]}
                      placement="bottomRight"
                    >
                      <button
                        className="cursor-pointer text-white/70 hover:text-white rounded transition-colors"
                        title="More Options"
                      >
                        <FiMoreVertical className="w-[20px] h-[20px]" />
                      </button>
                    </Dropdown>
                  </div>
                </div>

                <p className="text-sm opacity-90 mt-1 text-white">
                  {resident.residentId}
                </p>

                <div className="flex flex-wrap mt-3 items-center">
                  {/* User Type */}
                  <Tag color={getTagColor(resident.userType)}>
                    {getReadableStatus(resident.userType)}
                  </Tag>

                  {/* Current Status */}
                  <Tag color={getTagColor(resident.currentStatus)}>
                    {getReadableStatus(resident.currentStatus)}
                  </Tag>

                  {/* Payment Status */}
                  <Tag color={getTagColor(resident.paymentStatus)}>
                    {getReadableStatus(resident.paymentStatus)}
                  </Tag>

                  {/* Profile Completion */}
                  <Progress
                    type="circle"
                    percent={resident.profileCompletion}
                    width={40}
                    strokeColor={
                      resident.profileCompletion === 100
                        ? "#52c41a"
                        : resident.profileCompletion >= 75
                          ? "#1890ff"
                          : resident.profileCompletion >= 50
                            ? "#faad14"
                            : "#f5222d"
                    }
                    format={(percent) => (
                      <span style={{color: "white", fontWeight: 600}}>
                        {percent}%
                      </span>
                    )}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="p-6">
            {/* Email with verification status */}
            <div className="flex items-center gap-2">
              <DetailItem
                label="Email"
                value={resident.email}
                icon={<FiMail />}
              />
              {resident.isVerified ? (
                <Tag icon={<CheckOutlined />} color="success">
                  Verified
                </Tag>
              ) : (
                <Tag icon={<ExclamationCircleOutlined />} color="warning">
                  Unverified
                </Tag>
              )}
            </div>

            <DetailItem
              label="Phone"
              value={resident.contact}
              icon={<FiPhone />}
            />

            {resident.userType === "messOnly" ? (
              <DetailItem
                label="Kitchen"
                value={resident.messDetails?.kitchenName ?? "Not Provided"}
                icon={<HiOutlineOfficeBuilding />}
              />
            ) : (
              <DetailItem
                label="Property"
                value={resident.stayDetails?.propertyName ?? "Not Provided"}
                icon={<HiOutlineOfficeBuilding />}
              />
            )}

            {resident.userType !== "messOnly" && (
              <DetailItem
                label="Room"
                value={
                  <div className="flex items-center gap-2">
                    {resident.stayDetails?.roomNumber &&
                    resident.stayDetails?.sharingType ? (
                      <>
                        {`${resident.stayDetails.roomNumber} (${resident.stayDetails.sharingType})`}
                        {/* {resident.isColiving && (
                          <Tag
                            color="purple"
                            bordered={false}
                            style={{borderRadius: "8px"}}
                          >
                            Coliving
                          </Tag>
                        )} */}
                      </>
                    ) : resident.isColiving ? (
                      <Tag
                        color="purple"
                        bordered={false}
                        style={{borderRadius: "8px"}}
                      >
                        Coliving
                      </Tag>
                    ) : (
                      "Not Provided"
                    )}
                  </div>
                }
                icon={<FiHome />}
              />
            )}

            {/* Date Fields */}
            {resident.userType === "dailyRent" ? (
              <>
                <DetailItem
                  label="Check-in Date"
                  value={
                    resident.stayDetails?.checkInDate
                      ? dayjs(resident.stayDetails.checkInDate).format(
                          "DD MMMM, YYYY",
                        )
                      : "Not Provided"
                  }
                  icon={<FiCalendar />}
                />

                {/* Check-out / Extend Date */}
                <DetailItem
                  label="Check-out Date"
                  value={
                    resident.stayDetails?.extendDate
                      ? `${dayjs(resident.stayDetails.extendDate).format(
                          "DD MMMM, YYYY",
                        )} 
             (Extended from ${dayjs(resident.stayDetails.checkOutDate).format(
               "DD MMMM, YYYY",
             )})`
                      : resident.stayDetails?.checkOutDate
                        ? `${dayjs(resident.stayDetails.checkOutDate).format(
                            "DD MMMM, YYYY",
                          )} 
             (${resident.stayDetails?.noOfDays || 0} days)`
                        : "Not Provided"
                  }
                  icon={<FiCalendar />}
                />
              </>
            ) : resident.userType === "messOnly" ? (
              <>
                <DetailItem
                  label="Mess Start Date"
                  value={
                    resident.messDetails?.messStartDate
                      ? dayjs(resident.messDetails.messStartDate).format(
                          "DD MMMM, YYYY",
                        )
                      : "Not Provided"
                  }
                  icon={<FiCalendar />}
                />
                <DetailItem
                  label="Mess End Date"
                  value={
                    resident.messDetails?.messEndDate
                      ? `${dayjs(resident.messDetails.messEndDate).format(
                          "DD MMMM, YYYY",
                        )} (${resident.messDetails?.noOfDays || 0} days)`
                      : "Not Provided"
                  }
                  icon={<FiCalendar />}
                />
              </>
            ) : (
              <DetailItem
                label="Join Date"
                value={
                  resident.stayDetails?.joinDate
                    ? dayjs(resident.stayDetails.joinDate).format(
                        "DD MMMM, YYYY",
                      )
                    : "Not Provided"
                }
                icon={<FiCalendar />}
              />
            )}

            <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between">
              {/* LEFT SIDE: Download + Payment */}
              <div className="flex space-x-2">
                {/* Download button */}
                <button
                  className="cursor-pointer inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#059669] hover:bg-[#059669]"
                  onClick={() => setDownloadModalVisible(true)}
                >
                  <FiDownload className="mr-2" />
                  Download
                </button>
              </div>

              {/* RIGHT SIDE: Share + Notes */}
              <div className="flex space-x-2">
                {/* Share button */}
                <button
                  className="cursor-pointer inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
                  onClick={() => setShareModalVisible(true)}
                >
                  <FiShare2 className="mr-2" />
                  Share
                </button>

                {/* Notes button */}
                <button
                  className="cursor-pointer inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
                  onClick={() => setNotesModalVisible(true)}
                >
                  <FiFileText className="mr-2" />
                  Notes
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Block Confirmation Modal */}
        <Modal
          title="Confirm Block Access"
          visible={blockModalVisible}
          centered
          onCancel={() => setBlockModalVisible(false)}
          footer={[
            <Button key="cancel" onClick={() => setBlockModalVisible(false)}>
              Cancel
            </Button>,
            <Button
              key="block"
              type="primary"
              danger
              loading={blockMutation.isLoading}
              onClick={handleBlock}
            >
              Confirm Block
            </Button>,
          ]}
        >
          <p>Are you sure you want to block access for {resident.name}?</p>
          <p className="text-red-500">
            This will immediately revoke their access to the system.
          </p>
        </Modal>

        {/* Unblock Modal with Date Extension */}
        <Modal
          title="Unblock User with Date Extension"
          visible={unblockModalVisible}
          centered
          onCancel={() => setUnblockModalVisible(false)}
          footer={[
            <Button key="cancel" onClick={() => setUnblockModalVisible(false)}>
              Cancel
            </Button>,
            <Button
              key="unblock"
              type="primary"
              loading={blockMutation.isLoading}
              onClick={handleUnblock}
            >
              Confirm Unblock
            </Button>,
          ]}
        >
          <Form form={form} layout="vertical">
            <Form.Item
              label="Extend Access Until"
              name="extendDate"
              rules={[
                {
                  required: true,
                  message: "Please select extend date",
                  validator: (_, value) => {
                    if (value && value < dayjs().endOf("day")) {
                      return Promise.reject("Date must be in the future");
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <DatePicker
                style={{width: "100%"}}
                disabledDate={(current) =>
                  current && current < dayjs().endOf("day")
                }
                onChange={(date) => {
                  if (date) {
                    const days = dayjs(date).diff(dayjs(), "day") + 1;
                    form.setFieldsValue({daysExtended: days});
                  }
                }}
              />
            </Form.Item>

            <Form.Item label="Days Extended" name="daysExtended">
              <Input disabled addonAfter="days" />
            </Form.Item>
          </Form>
        </Modal>

        <StatusTimelineModal
          residentId={resident._id}
          visible={timelineModalVisible}
          onClose={() => setTimelineModalVisible(false)}
        />
        <TransactionHistoryModal
          userId={resident._id}
          visible={transactionModalVisible}
          onClose={() => setTransactionModalVisible(false)}
        />
        <ShareModal
          visible={shareModalVisible}
          onCancel={() => setShareModalVisible(false)}
          resident={resident}
        />
        <NotesModal
          name={resident.name}
          userId={resident._id}
          propertyId={resident?.stayDetails?.propertyId}
          isVisible={notesModalVisible}
          onClose={() => setNotesModalVisible(false)}
        />
      </div>
      <DownloadOptionsModal
        resident={resident}
        visible={downloadModalVisible}
        onCancel={() => setDownloadModalVisible(false)}
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
    </>
  );
};

export default ProfileSummary;
