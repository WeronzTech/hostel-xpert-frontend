import {useQuery} from "@tanstack/react-query";
import {AddonDetailsTable, StatsGrid} from "../../components/index.js";
import {IoFastFoodOutline} from "../../icons/index.js";
import {Select, Input, Row, Col, DatePicker, Switch, Space} from "antd";
import {
  getAddonOrderByPropertyId,
  useUpdateAddonBookingStatus,
} from "../../hooks/inventory/useInventory.js";
import {useSelector} from "react-redux";
import {MdOutlinePendingActions, MdOutlineFreeBreakfast} from "react-icons/md";
import {FiSearch, FiCalendar} from "../../icons/index.js";
import usePersistentState from "../../hooks/usePersistentState.js";
import {PiCurrencyInrBold} from "react-icons/pi";

const {Option} = Select;

// Search and Filters Component for Addon Orders
const AddonSearchFilters = ({
  onSearch,
  onStatusChange,
  onDateChange,
  onTodayOnlyChange,
  onPaymentStatusChange,
  searchTerm = "",
  selectedStatus = "all",
  selectedPaymentStatus = "all",
  selectedDate = null,
  todayOnly = false,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
      <Row gutter={[16, 16]} justify="space-between" align="middle">
        {/* Search Input - Left side */}
        <Col xs={24} md={12} lg={8}>
          <Input
            placeholder="Search by name and order ID"
            prefix={<FiSearch />}
            onChange={(e) => onSearch(e.target.value)}
            value={searchTerm}
            allowClear
            size="middle"
          />
        </Col>

        {/* Filters and Button - Right side */}
        <Col xs={24} md={12} lg={16}>
          <Row gutter={[16, 16]} justify="end" align="middle">
            {/* Status Filter - Always visible */}
            <Col xs={12} sm={8} md={6} lg={5}>
              <Select
                value={selectedStatus}
                onChange={onStatusChange}
                style={{width: "100%"}}
                size="middle"
                placeholder="Status"
              >
                <Option value="all">All Status</Option>
                <Option value="Pending">Pending</Option>
                <Option value="Delivered">Delivered</Option>
              </Select>
            </Col>

            {/* Payment Status Filter - Always visible */}
            <Col xs={12} sm={8} md={6} lg={5}>
              <Select
                value={selectedPaymentStatus}
                onChange={onPaymentStatusChange}
                style={{width: "100%"}}
                size="middle"
                placeholder="Payment Status"
              >
                <Option value="all">All Payment</Option>
                <Option value="Paid">Paid</Option>
                <Option value="Pending">Pending</Option>
              </Select>
            </Col>

            {/* Date Filter - Only show when todayOnly is false */}
            {!todayOnly && (
              <Col xs={12} sm={8} md={6} lg={5}>
                <DatePicker
                  placeholder="Booking Date"
                  onChange={onDateChange}
                  value={selectedDate}
                  allowClear
                  format="DD/MM/YYYY"
                  suffixIcon={<FiCalendar className="text-lg" />}
                  style={{width: "100%"}}
                  size="middle"
                />
              </Col>
            )}

            {/* Today Only Toggle - Always visible */}
            <Col xs={12} sm={8} md={6} lg={4}>
              <div className="flex items-center justify-center h-full">
                <Space className="w-full justify-center">
                  <Switch
                    checked={todayOnly}
                    onChange={onTodayOnlyChange}
                    checkedChildren="Today"
                    unCheckedChildren="All Dates"
                  />
                </Space>
              </div>
            </Col>
          </Row>
        </Col>
      </Row>
    </div>
  );
};

function AddonOrderPanel() {
  const {
    mutate: updateStatus,
    isLoading: isUpdatingStatus,
    error: updateError,
  } = useUpdateAddonBookingStatus();

  const selectedProperty = useSelector(
    (state) => state.properties.selectedProperty
  );

  // Use persistent state for all filter states
  const [searchTerm, setSearchTerm] = usePersistentState(
    "addon-order-search",
    ""
  );
  const [selectedMealType, setSelectedMealType] = usePersistentState(
    "addon-order-meal-type",
    "all"
  );
  const [selectedStatus, setSelectedStatus] = usePersistentState(
    "addon-order-status",
    "all"
  );
  const [selectedPaymentStatus, setSelectedPaymentStatus] = usePersistentState(
    "addon-order-payment-status",
    "all"
  );
  const [selectedDate, setSelectedDate] = usePersistentState(
    "addon-order-date",
    null
  );
  const [todayOnly, setTodayOnly] = usePersistentState(
    "addon-order-today-only",
    false
  );

  // Helper function to format date for API
  const formatDateForApi = (dateValue) => {
    if (!dateValue) return null;

    // If it's already a moment object
    if (dateValue.format && typeof dateValue.format === "function") {
      return dateValue.format("YYYY-MM-DD");
    }

    // If it's a string (from localStorage)
    if (typeof dateValue === "string") {
      // Parse the string back to a date
      const date = new Date(dateValue);
      if (!isNaN(date.getTime())) {
        // Format as YYYY-MM-DD
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      }
    }

    return null;
  };

  // Helper function to get date display text
  const getDateDisplayText = () => {
    if (todayOnly) {
      const today = new Date();
      return `${String(today.getDate()).padStart(2, "0")}/${String(
        today.getMonth() + 1
      ).padStart(2, "0")}/${today.getFullYear()}`;
    } else if (selectedDate) {
      // Handle different date formats
      if (selectedDate.format && typeof selectedDate.format === "function") {
        return selectedDate.format("DD/MM/YYYY");
      } else if (typeof selectedDate === "string") {
        const date = new Date(selectedDate);
        if (!isNaN(date.getTime())) {
          return `${String(date.getDate()).padStart(2, "0")}/${String(
            date.getMonth() + 1
          ).padStart(2, "0")}/${date.getFullYear()}`;
        }
      }
    }
    return null;
  };

  // Build filter object for API call
  const buildApiFilter = () => {
    const apiFilter = {};

    // Always include propertyId if selected
    if (selectedProperty?.id) {
      apiFilter.propertyId = selectedProperty.id;
    }

    // Add search term
    if (searchTerm) {
      apiFilter.search = searchTerm;
    }

    // Add meal type filter (skip if "all")
    if (selectedMealType !== "all") {
      apiFilter.mealType = selectedMealType;
    }

    // Add status filter (skip if "all")
    if (selectedStatus !== "all") {
      apiFilter.status = selectedStatus;
    }

    // Add payment status filter (skip if "all")
    if (selectedPaymentStatus !== "all") {
      apiFilter.paymentStatus = selectedPaymentStatus;
    }

    // Add todayOnly filter
    if (todayOnly) {
      apiFilter.todayOnly = true;
    } else {
      // Only add date filter when todayOnly is false
      const formattedDate = formatDateForApi(selectedDate);
      if (formattedDate) {
        apiFilter.bookingDate = formattedDate;
      }
    }

    return apiFilter;
  };

  // Fetch addon orders with filters
  const {data: addonOrderData, isLoading: addonOrderLoading} = useQuery({
    queryKey: ["addon-order-list", buildApiFilter()],
    queryFn: () => getAddonOrderByPropertyId(buildApiFilter()),
    enabled: true,
    keepPreviousData: true,
  });

  const handleStatusUpdate = async (bookingId, status) => {
    console.log("Attempting to update status:", {bookingId, status});

    try {
      // This should trigger the mutation
      await updateStatus({bookingId, status});
    } catch (error) {
      console.error("Error in handleStatusUpdate:", error);
      throw error;
    }
  };

  const dateDisplayText = getDateDisplayText();

  // Calculate stats from allData
  const calculateStats = () => {
    const data = addonOrderData?.data || [];

    const totalBookings = data.length;

    const pendingCount = data.filter(
      (item) => item.status === "Pending"
    ).length;

    const deliveredCount = data.filter(
      (item) => item.status === "Delivered"
    ).length;

    const deliveredTotal = data
      .filter((item) => item.status === "Delivered")
      .reduce((sum, item) => sum + Number(item.grandTotalPrice || 0), 0);

    return {
      totalBookings,
      pendingCount,
      deliveredCount,
      deliveredTotal,
    };
  };

  const statsData = calculateStats();

  // Build stats array with conditional date display
  const stats = [
    {
      title: `Total Bookings${dateDisplayText ? ` (${dateDisplayText})` : ""}`,
      value: statsData?.totalBookings || 0,
      icon: <MdOutlineFreeBreakfast className="text-xl" />,
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: `Pending Orders${dateDisplayText ? ` (${dateDisplayText})` : ""}`,
      value: statsData?.pendingCount || 0,
      icon: <MdOutlinePendingActions className="text-xl" />,
      color: "bg-yellow-100 text-yellow-600",
    },
    {
      title: `Delivered Orders${
        dateDisplayText ? ` (${dateDisplayText})` : ""
      }`,
      value: statsData?.deliveredCount || 0,
      icon: <IoFastFoodOutline className="text-xl" />,
      color: "bg-green-100 text-green-600",
    },
    {
      title: `Total Amount${dateDisplayText ? ` (${dateDisplayText})` : ""}`,
      value: `₹${statsData?.deliveredTotal?.toLocaleString() || 0}`,
      icon: <PiCurrencyInrBold className="text-xl" />,
      color: "bg-purple-100 text-purple-600",
    },
  ];

  // Handle search and filter changes
  const handleSearch = (value) => {
    setSearchTerm(value);
  };

  const handleMealTypeChange = (value) => {
    setSelectedMealType(value);
  };

  const handleStatusChange = (value) => {
    setSelectedStatus(value);
  };

  const handlePaymentStatusChange = (value) => {
    setSelectedPaymentStatus(value);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const handleTodayOnlyChange = (checked) => {
    setTodayOnly(checked);
    // Clear date filter when enabling todayOnly
    if (checked) {
      setSelectedDate(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 xl:px-12 lg:px-4 lg:pt-6 lg:pb-12 px-4 pt-4 pb-8">
      {/* Stats card */}
      <StatsGrid stats={stats} />

      {/* Search and Filters */}
      <AddonSearchFilters
        onSearch={handleSearch}
        onMealTypeChange={handleMealTypeChange}
        onStatusChange={handleStatusChange}
        onPaymentStatusChange={handlePaymentStatusChange}
        onDateChange={handleDateChange}
        onTodayOnlyChange={handleTodayOnlyChange}
        searchTerm={searchTerm}
        selectedMealType={selectedMealType}
        selectedStatus={selectedStatus}
        selectedPaymentStatus={selectedPaymentStatus}
        selectedDate={selectedDate}
        todayOnly={todayOnly}
      />

      {/* Single Table with data from backend (already filtered) */}
      <div className="bg-white rounded-lg shadow-sm">
        <AddonDetailsTable
          bookings={addonOrderData?.data || []}
          loading={addonOrderLoading}
          onStatusUpdate={handleStatusUpdate}
        />
      </div>
    </div>
  );
}

export default AddonOrderPanel;
