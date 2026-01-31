import {useState} from "react";
import {
  Collapse,
  Typography,
  Pagination,
  Flex,
  Avatar,
  Space,
  Tooltip,
  Descriptions,
  Tag,
  Dropdown,
  Radio,
  message,
  Button,
  Grid,
} from "antd";

import {
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  UserOutlined,
  LoginOutlined,
  LogoutOutlined,
  ArrowRightOutlined,
  IoFilter,
} from "../../icons/index.js";

import {useQuery, useQueryClient} from "@tanstack/react-query";
import Search from "antd/es/transfer/search.js";

import {
  ActionButton,
  ErrorState,
  RequestResponseModal,
} from "../../components/index.js";
import {greenButton, redButton} from "../../data/common/color.js";
import {offboardingApiService} from "../../hooks/offboarding/offBoardingapiService.js";
import LoadingSpinner from "../../ui/loadingSpinner/LoadingSpinner.jsx";
import {useSelector} from "react-redux";
import {useNavigate} from "react-router-dom";
import {formatDate, formatLabel} from "../../utils/formatUtils.js";

const {Title, Text} = Typography;
const {useBreakpoint} = Grid;

/**
 * Returns Requests types
 */
const getRequestTypeDetails = (type) => {
  switch (type) {
    case "checked_in":
      return {icon: <LoginOutlined />, color: "blue", label: "Check In"};
    case "checked_out":
      return {icon: <LogoutOutlined />, color: "red", label: "Check Out"};
    case "on_leave":
      return {icon: <ArrowRightOutlined />, color: "orange", label: "Leave"};
    default:
      return {icon: <UserOutlined />, color: "default", label: "Unknown"};
  }
};

const RequestsTab = () => {
  const {user} = useSelector((state) => state.auth);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [requestType, setRequestType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [activePanelKey, setActivePanelKey] = useState(null);

  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();
  const screens = useBreakpoint();

  const queryClient = useQueryClient();

  const [modalOpen, setModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);

  // Currently selected Property ID from Redux
  const selectedPropertyId = useSelector(
    (state) => state.properties.selectedProperty.id
  );

  // Function to handle open modal
  const openModal = (e, action, request) => {
    e?.stopPropagation();
    setModalOpen(true);
    setModalAction(action); // "approved" or "rejected"
    setSelectedRequest(request);
  };

  // Function to handle modal submit
  const handleModalSubmit = async ({status, comment}) => {
    if (!selectedRequest) return;

    try {
      const response = await offboardingApiService.respondToUserRequest(
        selectedRequest._id,
        selectedRequest.request._id,
        {
          status,
          comment,
          adminName: user.name,
        }
      );
      const successMessage =
        response?.data?.message ||
        `Request ${
          status === "approved" ? "accepted" : "rejected"
        } successfully`;

      messageApi.success(successMessage);
      // messageApi.success(
      //   `Request ${
      //     status === "approved" ? "accepted" : "rejected"
      //   } successfully`
      // );
      setModalOpen(false);
      setSelectedRequest(null);
      refetch(); // refresh list
      queryClient.invalidateQueries(["pendingRequests"]);
      queryClient.invalidateQueries(["requestCount"]);
    } catch (err) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Something went wrong";

      messageApi.error(errorMessage);
      console.error("Error responding to request", err);
    }
  };

  const actualRequestType = requestType === "all" ? undefined : requestType;
  const actualPropertyId = selectedPropertyId || undefined;

  // Fetch User Requests using Tanstack query
  const {data, isLoading, isError, error, refetch} = useQuery({
    queryKey: ["pendingRequests", actualPropertyId, actualRequestType],
    queryFn: () =>
      offboardingApiService.getPendingRequest(
        actualPropertyId,
        actualRequestType
      ),
  });

  const request = data?.data || [];
  console.log(request);
  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when search is updated
  };

  // Filter dropdown content
  const filterDropdownContent = (
    <div className="p-4 w-64 space-y-4 bg-white rounded shadow-[0px_4px_24px_4px_rgba(0,_0,_0,_0.1)]">
      <div>
        <p className="font-semibold mb-1 text-gray-700">Request Type</p>
        <Radio.Group
          onChange={(e) => setRequestType(e.target.value)}
          value={requestType}
        >
          <Space direction="vertical">
            <Radio value="all">All</Radio>
            <Radio value="checked_in">Check In</Radio>
            <Radio value="checked_out">Check Out</Radio>
            <Radio value="on_leave">Leave</Radio>
          </Space>
        </Radio.Group>
      </div>
    </div>
  );

  // --- Action Handlers --- //
  const handleViewDetails = (e, request) => {
    e?.stopPropagation();
    navigate(`/resident/${request._id}`);
  };

  const handlePageChange = (page, size) => {
    setCurrentPage(page);
    setPageSize(size);
  };

  const handlePanelChange = (key) => {
    setActivePanelKey(key[0] || null);
  };

  // Apply search filter
  const filteredRequests = request.filter((req) =>
    req.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Paginate the filtered list
  const paginatedRequests = filteredRequests.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Loading State
  if (isLoading) return <LoadingSpinner />;

  // Error state
  if (isError) {
    const msg = error?.message || "Something went wrong";
    return (
      <ErrorState
        message="Failed to load User requests"
        description={msg}
        onAction={() => refetch()}
        actionText="Try Again"
      />
    );
  }

  // --- Renders the header for each panel --- //
  // --- Renders the header for each panel --- //
  const renderPanelHeader = (request) => {
    const req = request.request || {};
    const typeDetails = getRequestTypeDetails(req.type);

    // Build base label
    const typeLabel = typeDetails.label;
    let extraInfo = "";
    let simplifiedExtraInfo = "";

    const now = new Date();

    // Handle Check Out requests
    if (req.type === "checked_out") {
      if (req.isInstantCheckout) {
        if (!req.requestedAt) {
          extraInfo =
            "— <strong>Instant</strong> Checkout (effective from today onwards)";
          simplifiedExtraInfo = "— <strong>Instant</strong> Checkout";
        } else {
          const requestDate = new Date(req.requestedAt);
          if (isNaN(requestDate.getTime())) {
            extraInfo =
              "— <strong>Instant</strong> Checkout (effective from today onwards)";
            simplifiedExtraInfo = "— <strong>Instant</strong> Checkout";
          } else {
            // Calculate days passed in UTC
            const nowUTC = new Date(
              Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())
            );
            const requestUTC = new Date(
              Date.UTC(
                requestDate.getFullYear(),
                requestDate.getMonth(),
                requestDate.getDate()
              )
            );

            const diffTime = nowUTC.getTime() - requestUTC.getTime();
            const daysPassed = Math.floor(diffTime / (1000 * 60 * 60 * 24));

            if (daysPassed === 0) {
              extraInfo =
                "— <strong>Instant</strong> Checkout (effective from today onwards)";
              simplifiedExtraInfo = "— <strong>Instant</strong> Checkout";
            } else {
              extraInfo = `— <strong>Instant</strong> Checkout (it's been ${daysPassed} day${
                daysPassed > 1 ? "s" : ""
              } since the request)`;
              simplifiedExtraInfo = "— <strong>Instant</strong> Checkout";
            }
          }
        }
      } else if (req.effectiveDate) {
        const effectiveDate = new Date(req.effectiveDate);
        const diffTime = effectiveDate.getTime() - now.getTime();
        const remainingDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const formattedDate = effectiveDate.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
        const formattedTime = effectiveDate.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });

        if (remainingDays > 0) {
          extraInfo = `— <strong>Scheduled</strong> Checkout (Effective in ${remainingDays} day${
            remainingDays !== 1 ? "s" : ""
          }, on ${formattedDate} at ${formattedTime})`;
          simplifiedExtraInfo = "— <strong>Scheduled</strong> Checkout";
        } else {
          const daysSinceEffective = Math.abs(
            Math.floor(diffTime / (1000 * 60 * 60 * 24))
          );
          extraInfo = `— <strong>Scheduled</strong> Checkout (effective date passed ${daysSinceEffective} day${
            daysSinceEffective !== 1 ? "s" : ""
          } ago, eligible for refund)`;
          simplifiedExtraInfo = "— <strong>Scheduled</strong> Checkout";
        }
      }
    }
    // Handle Check In requests
    else if (req.type === "checked_in") {
      if (req.requestedAt) {
        const requestDate = new Date(req.requestedAt);
        const formattedDate = requestDate.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
        const formattedTime = requestDate.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });
        extraInfo = `— Requested on ${formattedDate} at ${formattedTime}`;
        simplifiedExtraInfo = `— Requested on ${formattedDate} at ${formattedTime}`;
      } else {
        extraInfo = "— Check In Request";
        simplifiedExtraInfo = "— Check In Request";
      }
    }
    // Handle Leave requests
    else if (req.type === "on_leave") {
      if (req.requestedAt) {
        const requestDate = new Date(req.requestedAt);
        const formattedDate = requestDate.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
        const formattedTime = requestDate.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });
        extraInfo = `— Requested on ${formattedDate} at ${formattedTime}`;
        simplifiedExtraInfo = `— Requested on ${formattedDate} at ${formattedTime}`;
      } else {
        extraInfo = "— Leave Request";
        simplifiedExtraInfo = "— Leave Request";
      }
    }

    // Use simplified text for mobile, full text for desktop
    const displayExtraInfo = screens.md ? extraInfo : simplifiedExtraInfo;

    return (
      <Flex align="center" justify="space-between" className="w-full">
        <Flex align="center" gap="middle" className="flex-1 min-w-0">
          <Avatar src={request.profileImage} icon={<UserOutlined />} />
          <div className="min-w-0 flex-1">
            <Text className="block truncate">
              <Text strong style={{color: typeDetails.color}}>
                {typeLabel}
              </Text>
              {" request from "}
              <Text strong>{request.name}</Text>
            </Text>
            {displayExtraInfo && (
              <Text type="secondary" className="block truncate text-xs mt-1">
                <span dangerouslySetInnerHTML={{__html: displayExtraInfo}} />
              </Text>
            )}
          </div>
        </Flex>

        {/* Show action buttons only on larger screens */}
        {screens.md && (
          <Space>
            <Tooltip title="View Details">
              <ActionButton
                shape="circle"
                icon={<EyeOutlined />}
                onClick={(e) => handleViewDetails(e, request)}
              />
            </Tooltip>
            <Tooltip title="Accept">
              <ActionButton
                customTheme={greenButton}
                shape="circle"
                icon={<CheckCircleOutlined />}
                onClick={(e) => openModal(e, "approved", request)}
                className="bg-green-500 hover:!bg-green-600"
              />
            </Tooltip>
            <Tooltip title="Reject">
              <ActionButton
                type="primary"
                customTheme={redButton}
                shape="circle"
                icon={<CloseCircleOutlined />}
                onClick={(e) => openModal(e, "rejected", request)}
              />
            </Tooltip>
          </Space>
        )}
      </Flex>
    );
  };

  // Render mobile action buttons inside collapse content
  const renderMobileActions = (request) => (
    <div className="mt-4 pt-4 border-t border-gray-200">
      <Flex justify="space-between" gap="small">
        <Button
          icon={<EyeOutlined />}
          onClick={() => handleViewDetails(null, request)}
          block
        >
          View Details
        </Button>
        <Button
          type="primary"
          icon={<CheckCircleOutlined />}
          onClick={() => openModal(null, "approved", request)}
          className="bg-green-500 hover:!bg-green-600 border-green-500"
          block
        >
          Accept
        </Button>
        <Button
          danger
          icon={<CloseCircleOutlined />}
          onClick={() => openModal(null, "rejected", request)}
          block
        >
          Reject
        </Button>
      </Flex>
    </div>
  );

  return (
    <>
      {contextHolder}
      <div className="py-4">
        {/* Top Controls */}
        <div className="flex flex-wrap justify-between items-center gap-y-4 mb-6">
          <div className="flex items-center gap-2">
            <Search
              placeholder="Search by Resident Name"
              allowClear
              value={searchTerm}
              onChange={handleSearch}
              className="w-80"
            />
            <Dropdown
              popupRender={() => filterDropdownContent}
              trigger={["click"]}
              placement="bottomLeft"
            >
              <ActionButton
                type="default"
                icon={<IoFilter className="text-lg mt-1" />}
              >
                Filters
              </ActionButton>
            </Dropdown>
          </div>
        </div>

        {request.length === 0 ? (
          <div className="text-center p-10 rounded-lg">
            <Title level={4}>No Pending Requests</Title>
            <Text type="secondary">All user requests have been processed.</Text>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="text-center p-10 bg-gray-100 rounded-lg">
            <Title level={4}>No Requests Found</Title>
            <Text type="secondary">No requests match the applied filters.</Text>
          </div>
        ) : (
          <Collapse
            accordion
            activeKey={activePanelKey}
            onChange={handlePanelChange}
            className="bg-white"
            items={paginatedRequests.map((req) => {
              const isCheckoutRequest = req.request?.type === "checked_out";
              const isInstantCheckout = req.request?.isInstantCheckout;
              const effectiveDate = req.request?.effectiveDate;

              // Calculate refund eligibility for scheduled checkout
              let refundEligible = false;
              if (isCheckoutRequest && !isInstantCheckout && effectiveDate) {
                const now = new Date();
                const effective = new Date(effectiveDate);
                refundEligible = effective.getTime() <= now.getTime();
              }

              return {
                key: req._id,
                label: renderPanelHeader(req),
                children: (
                  <div>
                    <Descriptions
                      bordered
                      column={1}
                      size="small"
                      styles={{label: {width: "200px"}}}
                    >
                      <Descriptions.Item label="Requested Date">
                        {formatDate(req.request?.requestedAt)}
                      </Descriptions.Item>

                      {/* Refund Eligibility Information */}
                      {isCheckoutRequest && (
                        <Descriptions.Item label="Refund Eligibility">
                          {isInstantCheckout ? (
                            <Tag color="red">Not Eligible for Refund</Tag>
                          ) : refundEligible ? (
                            <Tag color="green">Eligible for Refund</Tag>
                          ) : (
                            <Tag color="orange">
                              Eligible after
                              <strong> {formatDate(effectiveDate)}</strong>
                            </Tag>
                          )}
                        </Descriptions.Item>
                      )}
                      <Descriptions.Item label="Payment Due">
                        <Tag color={req.paymentDue ? "volcano" : "success"}>
                          {req.paymentDue ? "Yes" : "No"}
                        </Tag>
                      </Descriptions.Item>
                      <Descriptions.Item label="Reason">
                        {req.request.reason}
                      </Descriptions.Item>
                    </Descriptions>

                    {/* Show action buttons only on mobile screens inside collapse */}
                    {!screens.md && renderMobileActions(req)}
                  </div>
                ),
              };
            })}
          />
        )}

        <div className="mt-6">
          <Flex justify="center" className="mt-8">
            {filteredRequests.length > 0 && (
              <div className="mt-6">
                <Flex justify="center" className="mt-8">
                  <Pagination
                    current={currentPage}
                    pageSize={pageSize}
                    total={filteredRequests.length}
                    onChange={handlePageChange}
                    showSizeChanger={false}
                    hideOnSinglePage
                    responsive
                  />
                </Flex>
              </div>
            )}
          </Flex>
        </div>

        <RequestResponseModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onSubmit={handleModalSubmit}
          action={modalAction}
          request={selectedRequest}
        />
      </div>
    </>
  );
};

export default RequestsTab;
