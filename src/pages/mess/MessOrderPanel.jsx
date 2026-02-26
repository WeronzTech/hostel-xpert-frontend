// import {useQuery} from "@tanstack/react-query";
// import StatsGrid from "../../components/common/StatsGrid";
// import {OrderDetailsTable} from "../../components/index.js";
// import {MdRestaurantMenu} from "../../icons/index.js";
// import {Button, Select, Input, Row, Col, DatePicker, Switch, Space} from "antd";
// import {getMessOrderByPropertyId} from "../../hooks/inventory/useInventory.js";
// import {useSelector} from "react-redux";
// import ManualBookingModal from "../../modals/mess/ManualBookingModal.jsx";
// import {MdCheckCircle, MdPendingActions} from "react-icons/md";
// import {FiSearch, FiCalendar} from "../../icons/index.js";
// import {useState} from "react";
// import usePersistentState from "../../hooks/usePersistentState.js";

// const {Option} = Select;

// // Search and Filters Component for Mess Orders
// const MessSearchFilters = ({
//   onSearch,
//   onMealTypeChange,
//   onStatusChange,
//   onDateChange,
//   onTodayOnlyChange,
//   searchTerm = "",
//   selectedMealType = "all",
//   selectedStatus = "all",
//   selectedDate = null,
//   todayOnly = false,
//   onAddBooking,
// }) => {
//   return (
//     <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
//       <Row gutter={[16, 16]} justify="space-between" align="middle">
//         {/* Search Input - Left side */}
//         <Col xs={24} md={12} lg={8}>
//           <Input
//             placeholder="Search by name and order ID"
//             prefix={<FiSearch />}
//             onChange={(e) => onSearch(e.target.value)}
//             value={searchTerm}
//             allowClear
//             size="middle"
//           />
//         </Col>

//         {/* Filters and Button - Right side */}
//         <Col xs={24} md={12} lg={16}>
//           <Row gutter={[16, 16]} justify="end" align="middle">
//             {/* Meal Type Filter - Always visible */}
//             <Col xs={12} sm={8} md={6} lg={5}>
//               <Select
//                 value={selectedMealType}
//                 onChange={onMealTypeChange}
//                 style={{width: "100%"}}
//                 size="middle"
//                 placeholder="Meal Type"
//               >
//                 <Option value="all">All Meals</Option>
//                 <Option value="Breakfast">Breakfast</Option>
//                 <Option value="Lunch">Lunch</Option>
//                 <Option value="Snacks">Snacks</Option>
//                 <Option value="Dinner">Dinner</Option>
//               </Select>
//             </Col>

//             {/* Status Filter - Always visible */}
//             <Col xs={12} sm={8} md={6} lg={5}>
//               <Select
//                 value={selectedStatus}
//                 onChange={onStatusChange}
//                 style={{width: "100%"}}
//                 size="middle"
//                 placeholder="Status"
//               >
//                 <Option value="all">All Status</Option>
//                 <Option value="Pending">Pending</Option>
//                 <Option value="Delivered">Delivered</Option>
//               </Select>
//             </Col>

//             {/* Date Filter - Only show when todayOnly is false */}
//             {!todayOnly && (
//               <Col xs={12} sm={8} md={6} lg={5}>
//                 <DatePicker
//                   placeholder="Booking Date"
//                   onChange={onDateChange}
//                   value={selectedDate}
//                   allowClear
//                   format="DD/MM/YYYY"
//                   suffixIcon={<FiCalendar className="text-lg" />}
//                   style={{width: "100%"}}
//                   size="middle"
//                 />
//               </Col>
//             )}

//             {/* Today Only Toggle - Always visible, takes date filter's space when enabled */}
//             <Col xs={12} sm={8} md={6} lg={4}>
//               <div className="flex items-center justify-center h-full">
//                 <Space className="w-full justify-center">
//                   <Switch
//                     checked={todayOnly}
//                     onChange={onTodayOnlyChange}
//                     checkedChildren="Today"
//                     unCheckedChildren="All Dates"
//                   />
//                 </Space>
//               </div>
//             </Col>

//             {/* Add Booking Button - Always visible */}
//             <Col xs={12} sm={8} md={6} lg={4}>
//               <Button
//                 type="primary"
//                 style={{width: "100%"}}
//                 onClick={onAddBooking}
//               >
//                 Add Booking
//               </Button>
//             </Col>
//           </Row>
//         </Col>
//       </Row>
//     </div>
//   );
// };

// function MessOrderPanel() {
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const selectedProperty = useSelector(
//     (state) => state.properties.selectedProperty,
//   );

//   // Use persistent state for all filter states
//   const [searchTerm, setSearchTerm] = usePersistentState(
//     "mess-order-search",
//     "",
//   );
//   const [selectedMealType, setSelectedMealType] = usePersistentState(
//     "mess-order-meal-type",
//     "all",
//   );
//   const [selectedStatus, setSelectedStatus] = usePersistentState(
//     "mess-order-status",
//     "all",
//   );
//   const [selectedDate, setSelectedDate] = usePersistentState(
//     "mess-order-date",
//     null,
//   );
//   const [todayOnly, setTodayOnly] = usePersistentState(
//     "mess-order-today-only",
//     false,
//   );

//   // Build filter object for API call
//   const buildApiFilter = () => {
//     const apiFilter = {};

//     // Always include propertyId if selected
//     if (selectedProperty?.id) {
//       apiFilter.propertyId = selectedProperty.id;
//     }

//     // Add search term
//     if (searchTerm) {
//       apiFilter.search = searchTerm;
//     }

//     // Add meal type filter (skip if "all")
//     if (selectedMealType !== "all") {
//       apiFilter.mealType = selectedMealType;
//     }

//     // Add status filter (skip if "all")
//     if (selectedStatus !== "all") {
//       apiFilter.status = selectedStatus;
//     }

//     // Add todayOnly filter
//     if (todayOnly) {
//       apiFilter.todayOnly = true;
//     } else if (selectedDate) {
//       // Only add date filter when todayOnly is false
//       apiFilter.bookingDate = selectedDate.format("YYYY-MM-DD");
//     }

//     return apiFilter;
//   };

//   // Fetch mess orders with filters
//   const {data: messOrderData, isLoading: messOrderLoading} = useQuery({
//     queryKey: ["mess-order-list", buildApiFilter()],
//     queryFn: () => getMessOrderByPropertyId(buildApiFilter()),
//     enabled: true,
//   });

//   const today = new Date();
//   const formattedDate = `${String(today.getDate()).padStart(2, "0")}/${String(
//     today.getMonth() + 1,
//   ).padStart(2, "0")}/${today.getFullYear()}`;

//   const breakfastCount =
//     messOrderData?.data?.filter((i) => i.mealType === "Breakfast").length ?? 0;
//   const lunchCount =
//     messOrderData?.data?.filter((i) => i.mealType === "Lunch").length ?? 0;
//   const snacksCount =
//     messOrderData?.data?.filter((i) => i.mealType === "Snacks").length ?? 0;
//   const dinnerCount =
//     messOrderData?.data?.filter((i) => i.mealType === "Dinner").length ?? 0;

//   // Build stats array - only show date in title when todayOnly is true or a date is selected
//   const stats = [
//     {
//       title: `All Meals Count${
//         todayOnly || selectedDate
//           ? ` (${
//               todayOnly ? formattedDate : selectedDate.format("DD/MM/YYYY")
//             })`
//           : ""
//       }`,
//       value: `BF: ${breakfastCount} | L: ${lunchCount} | S: ${snacksCount} | D: ${dinnerCount}`,
//       icon: <MdRestaurantMenu className="text-xl" />,
//       color: "bg-blue-100 text-blue-700",
//     },
//     {
//       title: `Delivered Orders${
//         todayOnly || selectedDate
//           ? ` (${
//               todayOnly ? formattedDate : selectedDate.format("DD/MM/YYYY")
//             })`
//           : ""
//       }`,
//       value:
//         messOrderData?.data?.filter((item) => item.status === "Delivered")
//           ?.length || 0,
//       icon: <MdCheckCircle className="text-xl" />,
//       color: "bg-green-100 text-green-700",
//     },
//     {
//       title: `Pending Orders${
//         todayOnly || selectedDate
//           ? ` (${
//               todayOnly ? formattedDate : selectedDate.format("DD/MM/YYYY")
//             })`
//           : ""
//       }`,
//       value:
//         messOrderData?.data?.filter((item) => item.status === "Pending")
//           ?.length || 0,
//       icon: <MdPendingActions className="text-xl" />,
//       color: "bg-amber-100 text-amber-700",
//     },
//   ];

//   // Handle search and filter changes
//   const handleSearch = (value) => {
//     setSearchTerm(value);
//   };

//   const handleMealTypeChange = (value) => {
//     setSelectedMealType(value);
//   };

//   const handleStatusChange = (value) => {
//     setSelectedStatus(value);
//   };

//   const handleDateChange = (date) => {
//     setSelectedDate(date);
//   };

//   const handleTodayOnlyChange = (checked) => {
//     setTodayOnly(checked);
//     // Clear date filter when enabling todayOnly
//     if (checked) {
//       setSelectedDate(null);
//     }
//   };

//   const handleAddBooking = () => {
//     setIsModalOpen(true);
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 xl:px-12 lg:px-4 lg:pt-6 lg:pb-12 px-4 pt-4 pb-8">
//       {/* Stats card */}
//       <StatsGrid stats={stats} />

//       {/* Search and Filters */}
//       <MessSearchFilters
//         onSearch={handleSearch}
//         onMealTypeChange={handleMealTypeChange}
//         onStatusChange={handleStatusChange}
//         onDateChange={handleDateChange}
//         onTodayOnlyChange={handleTodayOnlyChange}
//         onAddBooking={handleAddBooking}
//         searchTerm={searchTerm}
//         selectedMealType={selectedMealType}
//         selectedStatus={selectedStatus}
//         selectedDate={selectedDate}
//         todayOnly={todayOnly}
//       />

//       {/* Single Table with data from backend (already filtered) */}
//       <div className="bg-white rounded-lg shadow-sm">
//         <OrderDetailsTable
//           data={messOrderData?.data || []}
//           loading={messOrderLoading}
//         />
//       </div>

//       {/* Manual Booking Modal */}
//       <ManualBookingModal
//         open={isModalOpen}
//         onClose={() => setIsModalOpen(false)}
//         selectedProperty={selectedProperty}
//       />
//     </div>
//   );
// }

// export default MessOrderPanel;
import {useQuery} from "@tanstack/react-query";
import StatsGrid from "../../components/common/StatsGrid";
import {OrderDetailsTable} from "../../components/index.js";
import {MdRestaurantMenu} from "../../icons/index.js";
import {
  Button,
  Select,
  Input,
  Row,
  Col,
  DatePicker,
  Switch,
  Space,
  Tooltip,
} from "antd";
import {getMessOrderByPropertyId} from "../../hooks/inventory/useInventory.js";
import {useSelector} from "react-redux";
import ManualBookingModal from "../../modals/mess/ManualBookingModal.jsx";
import {MdCheckCircle} from "react-icons/md";
import {FiSearch} from "../../icons/index.js";
import {FiLayers} from "react-icons/fi";
import {useState, useMemo} from "react";
import usePersistentState from "../../hooks/usePersistentState.js";

const {Option} = Select;

const MessSearchFilters = ({
  onSearch,
  onMealTypeChange,
  onStatusChange,
  onDateChange,
  onTodayOnlyChange,
  searchTerm = "",
  selectedMealType = "all",
  selectedStatus = "all",
  selectedDate = null,
  todayOnly = false,
  onAddBooking,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
      <Row gutter={[16, 16]} justify="space-between" align="middle">
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

        <Col xs={24} md={12} lg={16}>
          <Row gutter={[16, 16]} justify="end" align="middle">
            <Col xs={12} sm={8} md={6} lg={5}>
              <Select
                value={selectedMealType}
                onChange={onMealTypeChange}
                style={{width: "100%"}}
                size="middle"
              >
                <Option value="all">All Meals</Option>
                <Option value="Breakfast">Breakfast</Option>
                <Option value="Lunch">Lunch</Option>
                <Option value="Snacks">Snacks</Option>
                <Option value="Dinner">Dinner</Option>
              </Select>
            </Col>

            <Col xs={12} sm={8} md={6} lg={5}>
              <Select
                value={selectedStatus}
                onChange={onStatusChange}
                style={{width: "100%"}}
                size="middle"
              >
                <Option value="all">All Status</Option>
                <Option value="Pending">Pending</Option>
                <Option value="Delivered">Delivered</Option>
              </Select>
            </Col>

            {!todayOnly && (
              <Col xs={12} sm={8} md={6} lg={5}>
                <DatePicker
                  placeholder="Booking Date"
                  onChange={onDateChange}
                  value={selectedDate}
                  allowClear
                  format="DD/MM/YYYY"
                  style={{width: "100%"}}
                  size="middle"
                />
              </Col>
            )}

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

            <Col xs={12} sm={8} md={6} lg={4}>
              <Button
                type="primary"
                style={{width: "100%"}}
                onClick={onAddBooking}
              >
                Add Booking
              </Button>
            </Col>
          </Row>
        </Col>
      </Row>
    </div>
  );
};

function MessOrderPanel() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tokenOnlyFilter, setTokenOnlyFilter] = useState(false);
  const selectedProperty = useSelector(
    (state) => state.properties.selectedProperty,
  );

  const [searchTerm, setSearchTerm] = usePersistentState(
    "mess-order-search",
    "",
  );
  const [selectedMealType, setSelectedMealType] = usePersistentState(
    "mess-order-meal-type",
    "all",
  );
  const [selectedStatus, setSelectedStatus] = usePersistentState(
    "mess-order-status",
    "all",
  );
  const [selectedDate, setSelectedDate] = usePersistentState(
    "mess-order-date",
    null,
  );
  const [todayOnly, setTodayOnly] = usePersistentState(
    "mess-order-today-only",
    false,
  );

  const buildApiFilter = () => {
    const apiFilter = {};
    if (selectedProperty?.id) apiFilter.propertyId = selectedProperty.id;
    if (searchTerm) apiFilter.search = searchTerm;
    if (selectedMealType !== "all") apiFilter.mealType = selectedMealType;
    if (selectedStatus !== "all") apiFilter.status = selectedStatus;
    if (todayOnly) {
      apiFilter.todayOnly = true;
    } else if (selectedDate) {
      apiFilter.bookingDate = selectedDate.format("YYYY-MM-DD");
    }
    return apiFilter;
  };

  const {data: rawResponse, isLoading: messOrderLoading} = useQuery({
    queryKey: ["mess-order-list", buildApiFilter()],
    queryFn: () => getMessOrderByPropertyId(buildApiFilter()),
    enabled: true,
  });

  const messOrderData = rawResponse?.data?.data || rawResponse?.data || [];

  const filteredTableData = useMemo(() => {
    if (tokenOnlyFilter) {
      return messOrderData.filter((item) => item.token === true);
    }
    return messOrderData;
  }, [messOrderData, tokenOnlyFilter]);

  const today = new Date();
  const formattedDate = `${String(today.getDate()).padStart(2, "0")}/${String(today.getMonth() + 1).padStart(2, "0")}/${today.getFullYear()}`;

  const breakfastCount = messOrderData.filter(
    (i) => i.mealType === "Breakfast",
  ).length;
  const lunchCount = messOrderData.filter((i) => i.mealType === "Lunch").length;
  const snacksCount = messOrderData.filter(
    (i) => i.mealType === "Snacks",
  ).length;
  const dinnerCount = messOrderData.filter(
    (i) => i.mealType === "Dinner",
  ).length;

  const deliveredCount = messOrderData.filter(
    (item) => item.status === "Delivered",
  ).length;
  const pendingCount = messOrderData.filter(
    (item) => item.status === "Pending",
  ).length;

  const issuedTokens = messOrderData.filter(
    (item) => item.token === true,
  ).length;
  const collectedTokens = messOrderData.filter(
    (item) => item.token === true && item.status === "Delivered",
  ).length;

  const stats = [
    {
      title: `All Meals Count${todayOnly || selectedDate ? ` (${todayOnly ? formattedDate : selectedDate.format("DD/MM/YYYY")})` : ""}`,
      value: `BF: ${breakfastCount} | L: ${lunchCount} | S: ${snacksCount} | D: ${dinnerCount}`,
      icon: <MdRestaurantMenu className="text-xl" />,
      color: "bg-blue-100 text-blue-700",
    },
    {
      title: "",
      value: (
        <span className="flex flex-col items-center justify-center w-full py-1 md:pl-8">
          <span className="text-sm font-bold text-slate-700 uppercase tracking-widest mb-3 flex items-center gap-2 text-center">
            Orders{" "}
            {todayOnly && (
              <span className="text-[10px] lowercase font-normal text-slate-400">
                ({formattedDate})
              </span>
            )}
          </span>
          <span className="flex items-center justify-center w-full flex-wrap gap-y-2">
            <span className="flex flex-col items-center px-4">
              <span className="text-[10px] font-semibold text-slate-400 uppercase leading-none">
                Delivered
              </span>
              <span className="text-xl font-bold text-emerald-600 mt-1 leading-none">
                {deliveredCount}
              </span>
            </span>
            <span className="hidden sm:block w-[1px] h-7 bg-slate-200" />
            <span className="flex flex-col items-center px-4">
              <span className="text-[10px] font-semibold text-slate-400 uppercase leading-none">
                Pending
              </span>
              <span className="text-xl font-bold text-amber-600 mt-1 leading-none">
                {pendingCount}
              </span>
            </span>
          </span>
        </span>
      ),
      icon: <MdCheckCircle className="text-xl" />,
      color: "bg-slate-50 text-slate-600",
    },
    {
      title: "",
      value: (
        <span className="flex items-center w-full py-1 md:pl-6 lg:pl-10">
          {/* Main Content Area */}
          <span className="flex-1 flex flex-col items-center justify-center">
            <span className="text-sm font-bold text-slate-700 uppercase tracking-widest mb-3 text-center">
              Token
            </span>
            <span className="flex items-center justify-center w-full flex-wrap gap-y-2">
              <span className="flex flex-col items-center px-4">
                <span className="text-[10px] font-semibold text-slate-400 uppercase leading-none">
                  Issued
                </span>
                <span className="text-xl font-bold text-slate-800 mt-1 leading-none">
                  {issuedTokens}
                </span>
              </span>
              <span className="hidden sm:block w-[1px] h-7 bg-slate-200" />
              <span className="flex flex-col items-center px-4">
                <span className="text-[10px] font-semibold text-slate-400 uppercase leading-none">
                  Collected
                </span>
                <span className="text-xl font-bold text-blue-600 mt-1 leading-none">
                  {collectedTokens}
                </span>
              </span>
            </span>
          </span>

          {/* Toggle Button - Pinned to the right end */}
          <span className="flex items-center justify-end pl-2">
            <Tooltip
              title={tokenOnlyFilter ? "Showing Token Only" : "Filter by Token"}
            >
              <Switch
                size="small"
                checked={tokenOnlyFilter}
                onChange={(checked) => setTokenOnlyFilter(checked)}
                className={tokenOnlyFilter ? "bg-blue-600" : "bg-gray-300"}
              />
            </Tooltip>
          </span>
        </span>
      ),
      icon: <FiLayers className="text-xl" />,
      color: "bg-slate-50 text-slate-600",
    },
  ];

  const handleSearch = (value) => setSearchTerm(value);
  const handleMealTypeChange = (value) => setSelectedMealType(value);
  const handleStatusChange = (value) => setSelectedStatus(value);
  const handleDateChange = (date) => setSelectedDate(date);
  const handleTodayOnlyChange = (checked) => {
    setTodayOnly(checked);
    if (checked) setSelectedDate(null);
  };
  const handleAddBooking = () => setIsModalOpen(true);

  return (
    <div className="min-h-screen bg-gray-50 xl:px-12 lg:px-4 lg:pt-6 lg:pb-12 px-4 pt-4 pb-8">
      <StatsGrid stats={stats} />

      <MessSearchFilters
        onSearch={handleSearch}
        onMealTypeChange={handleMealTypeChange}
        onStatusChange={handleStatusChange}
        onDateChange={handleDateChange}
        onTodayOnlyChange={handleTodayOnlyChange}
        onAddBooking={handleAddBooking}
        searchTerm={searchTerm}
        selectedMealType={selectedMealType}
        selectedStatus={selectedStatus}
        selectedDate={selectedDate}
        todayOnly={todayOnly}
      />

      <div className="bg-white rounded-lg shadow-sm">
        <OrderDetailsTable
          data={filteredTableData}
          loading={messOrderLoading}
        />
      </div>

      <ManualBookingModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedProperty={selectedProperty}
      />
    </div>
  );
}

export default MessOrderPanel;
