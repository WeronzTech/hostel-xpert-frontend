import {useState, useEffect, useMemo, useRef, useCallback} from "react";
import {Table, Button, Tag, message, Tooltip, Spin} from "antd";
import {useNavigate} from "react-router-dom";
import ConfirmModal from "../../modals/common/ConfirmModal";
import {FaRupeeSign, FaSignOutAlt} from "../../icons/index.js";
import {FiLock} from "react-icons/fi";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {vacateResident} from "../../hooks/users/useUser.js";
import {useSelector} from "react-redux";

// Import your payment modal component
import RentCollectionModal from "../../modals/accounts/RentCollectionModal.jsx";

const ResidentsTable = ({
  residents = [],
  isLoading = false,
  pagination: propPagination = {page: 1, limit: 10},
  total = 0,
  onPaginationChange,
  rentType = "monthly",
}) => {
  const {user} = useSelector((state) => state.auth);
  const {selectedProperty} = useSelector((state) => state.properties);
  const {selectedKitchen} = useSelector((state) => state.kitchens);

  const [selectedResident, setSelectedResident] = useState(null);
  const [showVacateModal, setShowVacateModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [residentForPayment, setResidentForPayment] = useState(null);
  const [allResidents, setAllResidents] = useState([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const tableContainerRef = useRef(null);

  // Simple data management - reset on page 1, append on subsequent pages
  useEffect(() => {
    if (propPagination.page === 1) {
      setAllResidents(residents);
    } else {
      setAllResidents((prev) => [...prev, ...residents]);
    }
  }, [residents, propPagination.page]);

  // Calculate hasMore based on current state
  useEffect(() => {
    const totalLoaded = allResidents.length;
    setHasMore(totalLoaded < total);
  }, [allResidents.length, total]);

  // Handle window scroll event for infinite scroll
  const handleScroll = useCallback(() => {
    if (loadingMore || !hasMore || isLoading) return;

    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;

    // Load more when 80% scrolled
    if (scrollTop + windowHeight >= documentHeight * 0.8) {
      loadMoreData();
    }
  }, [loadingMore, hasMore, isLoading]);

  const loadMoreData = () => {
    if (!hasMore) return;

    setLoadingMore(true);
    const nextPage = propPagination.page + 1;

    if (onPaginationChange) {
      onPaginationChange({
        page: nextPage,
        limit: propPagination.limit,
      });
    }

    setTimeout(() => setLoadingMore(false), 500);
  };

  const [messageApi, contextHolder] = message.useMessage();

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const vacateMutation = useMutation({
    mutationFn: ({id, adminName}) => vacateResident({id, adminName}),
    onSuccess: () => {
      messageApi.success({
        content: "Resident vacated successfully!",
        duration: 3,
      });
      queryClient.invalidateQueries(["residents"]);
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

  const handleVacateClick = (resident) => {
    setSelectedResident(resident);
    setShowVacateModal(true);
  };

  const handlePaymentClick = (resident) => {
    setResidentForPayment(resident);
    setShowPaymentModal(true);
  };

  const confirmVacate = () => {
    vacateMutation.mutate({id: selectedResident._id, adminName: user.name});
    setShowVacateModal(false);
    setSelectedResident(null);
  };

  const cancelVacate = () => {
    setShowVacateModal(false);
    setSelectedResident(null);
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

  // Memoize table data transformation
  const tableData = useMemo(() => {
    return allResidents.map((resident, index) => {
      const isDaily = rentType === "daily";
      const isMessOnly = rentType === "mess";

      let rent = 0;
      if (isDaily) {
        rent = resident.rent || 0;
      } else if (isMessOnly) {
        rent = resident.rent || 0;
      } else {
        rent = resident.monthlyRent || 0;
      }

      // Mess-only date parsing/fallback
      const messStartRaw = resident.messStartDate;
      const messEndRaw = resident.messEndDate;
      const messStart = messStartRaw ? new Date(messStartRaw) : null;
      const messEnd = messEndRaw ? new Date(messEndRaw) : null;

      const computedNoOfDaysMessOnly =
        resident.noOfDaysForMessOnly ??
        (messStart && messEnd
          ? Math.ceil(
              (messEnd.getTime() - messStart.getTime()) / (1000 * 60 * 60 * 24),
            )
          : "N/A");

      return {
        key: `${resident._id}-${index}`,
        id: resident._id,
        name: resident.name || "N/A",
        rentType: resident.rentType || "N/A",
        userType: resident.userType || "N/A",
        room: `${
          resident.stayDetails?.roomNumber || resident.roomNumber || "N/A"
        }`,
        sharingType:
          resident.stayDetails?.sharingTyperesident.sharingType || "N/A",
        rent: rent,
        pendingRent: resident.pendingRent || "N/A",
        status: resident.paymentStatus === "paid" ? "Paid" : "Pending",
        paymentDate:
          resident.financialDetails?.nextDueDate || resident.nextDueDate
            ? new Date(
                resident.financialDetails?.nextDueDate || resident.nextDueDate,
              ).toLocaleDateString()
            : "N/A",
        contact: resident.contact || "N/A",
        joinedDate: resident.joinedDate
          ? new Date(resident.joinedDate).toLocaleDateString()
          : "N/A",
        checkedIn:
          resident.stayDetails?.checkInDate || resident.checkInDate
            ? new Date(
                resident.stayDetails?.checkInDate || resident.checkInDate,
              ).toLocaleDateString()
            : "N/A",
        ...(isDaily && {
          checkedOut: resident?.extendDate
            ? new Date(resident?.extendDate).toLocaleDateString()
            : resident?.checkOutDate
              ? new Date(resident?.checkOutDate).toLocaleDateString()
              : "N/A",

          daysStayed:
            resident.stayDetails?.noOfDays || resident.noOfDays || "N/A",

          totalRent: resident.totalAmount || "N/A",
          pendingAmount: resident.pendingAmount || "N/A",
        }),
        ...(isMessOnly && {
          messStartDate: messStart ? messStart.toLocaleDateString() : "N/A",
          messEndDate: messEnd ? messEnd.toLocaleDateString() : "N/A",
          noOfDaysMessOnly: computedNoOfDaysMessOnly,
          totalRent: resident.totalAmount || "N/A",
          pendingAmount: resident.pendingAmount || "N/A",
        }),
        originalData: resident,
        className: resident.isBlocked ? "blocked-row" : "",
      };
    });
  }, [allResidents, rentType]);

  // Add scroll event listener to window
  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const columns = useMemo(() => {
    const baseColumns = [
      {
        title: "#",
        dataIndex: "index",
        key: "index",
        align: "center",
        width: 50,
        fixed: "left",
        render: (_, __, index) => index + 1,
      },
      {
        title: "Resident",
        dataIndex: "name",
        key: "name",
        width: 150,
        render: (name, record) => (
          <div className="flex items-center">
            <span
              className={record.originalData.isBlocked ? "text-red-500" : ""}
            >
              {name}
            </span>
            {record.originalData.isBlocked && (
              <Tooltip title="This resident is blocked">
                <FiLock className="ml-2 text-red-500 animate-pulse" />
              </Tooltip>
            )}
          </div>
        ),
      },
      {
        title: "User Type",
        dataIndex: "userType",
        key: "userType",
        align: "center",
        width: 140,
        render: (value) => {
          const key =
            value === null || value === undefined
              ? ""
              : String(value).trim().toLowerCase();

          const displayMap = {
            student: "Student",
            worker: "Worker",
            dailyrent: "Daily Rent",
            messonly: "Mess Only",
          };

          // AntD accepts preset color names or hex values
          const tagColorMap = {
            student: "blue",
            worker: "purple",
            dailyrent: "orange",
            messonly: "orange",
          };

          const text =
            displayMap[key] ??
            (key ? key.charAt(0).toUpperCase() + key.slice(1) : "-");
          const tagColor = tagColorMap[key] ?? "default";

          return (
            <Tag color={tagColor} style={{fontWeight: 600}}>
              {text}
            </Tag>
          );
        },
      },
      {
        title: "Contact",
        dataIndex: "contact",
        key: "contact",
        align: "center",
        width: 120,
      },
    ];

    if (rentType !== "mess") {
      baseColumns.push({
        title: "Room",
        dataIndex: "room",
        key: "room",
        align: "center",
        width: 120,
      });
    }

    let midColumns = [];

    if (rentType === "daily") {
      midColumns = [
        {
          title: "Check-In",
          dataIndex: "checkedIn",
          key: "checkedIn",
          align: "center",
          width: 120,
        },
        {
          title: "Check-Out",
          dataIndex: "checkedOut",
          key: "checkedOut",
          align: "center",
          width: 120,
        },
        {
          title: "Days",
          dataIndex: "daysStayed",
          key: "daysStayed",
          align: "center",
          width: 80,
        },
        {
          title: "Daily Rent",
          dataIndex: "rent",
          key: "rent",
          align: "center",
          width: 120,
          render: (rent) => (
            <div className="flex items-center justify-center">
              <FaRupeeSign className="mr-1" />
              {typeof rent === "number" ? rent.toLocaleString("en-IN") : rent}
            </div>
          ),
        },
        {
          title: "Total Rent",
          dataIndex: "totalRent",
          key: "totalRent",
          align: "center",
          width: 120,
          render: (totalRent) => (
            <div className="flex items-center justify-center">
              <FaRupeeSign className="mr-1" />
              {typeof totalRent === "number"
                ? totalRent.toLocaleString("en-IN")
                : totalRent}
            </div>
          ),
        },
      ];
    } else if (rentType === "mess") {
      midColumns = [
        {
          title: "Mess Start",
          dataIndex: "messStartDate",
          key: "messStartDate",
          align: "center",
          width: 120,
        },
        {
          title: "Mess End",
          dataIndex: "messEndDate",
          key: "messEndDate",
          align: "center",
          width: 120,
        },
        {
          title: "Days",
          dataIndex: "noOfDaysMessOnly",
          key: "noOfDaysMessOnly",
          align: "center",
          width: 80,
        },
        {
          title: "Mess Rate/Day",
          dataIndex: "rent",
          key: "rent",
          align: "center",
          width: 120,
          render: (rent) => (
            <div className="flex items-center justify-center">
              <FaRupeeSign className="mr-1" />
              {typeof rent === "number" ? rent.toLocaleString("en-IN") : rent}
            </div>
          ),
        },
        {
          title: "Total Amount",
          dataIndex: "totalRent",
          key: "totalRent",
          align: "center",
          width: 120,
          render: (totalRent) => (
            <div className="flex items-center justify-center">
              <FaRupeeSign className="mr-1" />
              {typeof totalRent === "number"
                ? totalRent.toLocaleString("en-IN")
                : totalRent}
            </div>
          ),
        },
      ];
    } else {
      midColumns = [
        {
          title: "Join Date",
          dataIndex: "joinedDate",
          key: "joinedDate",
          align: "center",
          width: 120,
        },
        {
          title: "Monthly Rent",
          dataIndex: "rent",
          key: "rent",
          align: "center",
          width: 120,
          render: (rent) => (
            <div className="flex items-center justify-center">
              <FaRupeeSign className="mr-1" />
              {typeof rent === "number" ? rent.toLocaleString("en-IN") : rent}
            </div>
          ),
        },
      ];
    }

    const finalColumns = [
      ...baseColumns,
      ...midColumns,
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        align: "center",
        width: 100,
        render: (status, record) => {
          const isPending = status === "Pending";

          // Select value based on rentType
          const pendingValue =
            record.rentType === "monthly"
              ? record.pendingRent
              : record.pendingAmount;

          const displayText = isPending
            ? `Pending - ${pendingValue || 0}`
            : status;

          return (
            <div className="flex flex-col items-center">
              <Tag
                color={status === "Paid" ? "green" : "red"}
                style={{fontSize: "12px", padding: "2px 8px"}}
              >
                {displayText}
              </Tag>
            </div>
          );
        },
      },
      {
        title: "Actions",
        key: "actions",
        align: "center",
        width: 100,
        render: (_, record) => (
          <div className="flex justify-center items-center space-x-3">
            <Button
              shape="circle"
              title="Initiate Payment"
              onClick={(e) => {
                e.stopPropagation();
                handlePaymentClick(record.originalData);
              }}
              style={{backgroundColor: "#059669", border: "none"}}
              icon={<FaRupeeSign color="white" />}
            />
            <Button
              shape="circle"
              title="Vacate"
              onClick={(e) => {
                e.stopPropagation();
                handleVacateClick(record.originalData);
              }}
              style={{backgroundColor: "#e3342f", border: "none"}}
              icon={<FaSignOutAlt color="white" />}
            />
          </div>
        ),
      },
    ];

    return finalColumns;
  }, [rentType]);

  return (
    <>
      {contextHolder}
      <style>
        {`
          .blocked-row {
            background-color: rgba(254, 226, 226, 0.3) !important;
            border-left: 3px solid #ef4444;
          }
          .blocked-row:hover td {
            background-color: rgba(254, 226, 226, 0.4) !important;
          }
        `}
      </style>
      <div ref={tableContainerRef}>
        <Table
          columns={columns}
          dataSource={tableData}
          rowKey="key"
          scroll={{x: "max-content"}}
          loading={isLoading && propPagination.page === 1}
          pagination={false}
          onRow={(record) => ({
            onClick: () => navigate(`/resident/${record.id}`),
            className: "cursor-pointer",
          })}
        />
        {/* Loading indicator for infinite scroll */}
        {(loadingMore || (isLoading && propPagination.page > 1)) && (
          <div style={{textAlign: "center", padding: "20px"}}>
            <Spin />
          </div>
        )}
      </div>
      {/* Vacate Confirmation Modal */}
      <ConfirmModal
        isOpen={showVacateModal}
        title="Confirm Vacate"
        residentName={selectedResident?.name}
        onConfirm={confirmVacate}
        onCancel={cancelVacate}
      />

      {/* In ResidentsTable, update the PaymentModal usage: */}
      {showPaymentModal && residentForPayment && (
        <RentCollectionModal
          visible={showPaymentModal}
          onCancel={handlePaymentModalClose}
          onSuccess={handlePaymentSuccess}
          preSelectedUser={residentForPayment}
          preSelectedProperty={selectedProperty}
          preSelectedKitchen={selectedKitchen}
          selectedOption={rentType}
        />
      )}
    </>
  );
};

export default ResidentsTable;
