// import {useState} from "react";
// import StatsGrid from "../../components/common/StatsGrid";
// import SearchFilters from "../../components/common/SearchFilters";
// import PageHeader from "../../components/common/PageHeader";
// import ResidentsTable from "../../components/users/ResidentsTable";
// import {useSelector} from "react-redux";
// import {useQuery} from "@tanstack/react-query";
// import {getUsers} from "../../hooks/users/useUser";
// import {FiUser, FaRupeeSign, FiCheckCircle} from "../../../src/icons/index.js";

// const DailyRentManagement = () => {
//   const {selectedProperty} = useSelector((state) => state.properties);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [statusFilter, setStatusFilter] = useState("All");
//   const [joinDateFilter, setJoinDateFilter] = useState(null);
//   const [pagination, setPagination] = useState({
//     page: 1,
//     limit: 10,
//   });

//   // Fetch users using TanStack Query
//   const {
//     data: usersData = {},
//     isLoading,
//     isError,
//     error,
//   } = useQuery({
//     queryKey: [
//       "dailyRentUsers",
//       selectedProperty?.id,
//       pagination.page,
//       pagination.limit,
//       searchTerm,
//       statusFilter,
//       joinDateFilter?.format("YYYY-MM-DD"),
//     ],
//     queryFn: () =>
//       getUsers({
//         rentType: "daily",
//         propertyId: selectedProperty?.id,
//         page: pagination.page,
//         limit: pagination.limit,
//         search: searchTerm,
//         status: statusFilter !== "All" ? statusFilter : undefined,
//       }),
//     keepPreviousData: true,
//   });
//   console.log(usersData);

//   const stats = [
//     {
//       title: "Total Residents",
//       value: usersData?.summary?.totalResidents || 0,
//       icon: <FiUser className="text-xl" />,
//       color: "bg-indigo-100 text-indigo-600",
//     },
//     {
//       title: "Pending Payments",
//       value: usersData.summary?.totalPending || 0,
//       icon: <FaRupeeSign className="text-xl" />,
//       color: "bg-red-100 text-red-600",
//     },
//     {
//       title: "Completed Payments",
//       value: usersData.summary?.totalPaid || 0,
//       icon: <FiCheckCircle className="text-xl" />,
//       color: "bg-green-100 text-green-600",
//     },
//   ];

//   return (
//     <div className="min-h-screen bg-gray-50 xl:px-12 lg:px-4 lg:pt-6 lg:pb-12 px-4 pt-4 pb-8">
//       {/* Header */}
//       <PageHeader
//         title="Daily Rent Overview"
//         subtitle="Manage all daily rent residents and payments"
//       />

//       {/* Stats Cards */}
//       <StatsGrid stats={stats} />

//       {/* Filters and Search */}
//       <SearchFilters
//         onSearch={setSearchTerm}
//         onStatusChange={setStatusFilter}
//         onJoinDateChange={setJoinDateFilter}
//         selectedStatus={statusFilter}
//         selectedDate={joinDateFilter}
//         rentType="daily"
//       />

//       {/* Residents Table */}

//       <ResidentsTable
//         residents={usersData.data || []}
//         pagination={pagination}
//         total={usersData.pagination?.total || 0}
//         onPaginationChange={setPagination}
//         isLoading={isLoading}
//         rentType="daily"
//       />
//     </div>
//   );
// };

// export default DailyRentManagement;
import {useEffect} from "react";
import StatsGrid from "../../components/common/StatsGrid";
import SearchFilters from "../../components/common/SearchFilters";
import PageHeader from "../../components/common/PageHeader";
import ResidentsTable from "../../components/users/ResidentsTable";
import {useSelector} from "react-redux";
import {useQuery} from "@tanstack/react-query";
import {getUsers} from "../../hooks/users/useUser";
import {FiUser, FaRupeeSign, FiCheckCircle} from "../../../src/icons/index.js";
import usePersistentState from "../../hooks/usePersistentState";
import dayjs from "dayjs";

const DailyRentManagement = () => {
  const {selectedProperty} = useSelector((state) => state.properties);

  // Use persistent state for filters
  const [searchTerm, setSearchTerm] = usePersistentState(
    "dailyRent_searchTerm",
    ""
  );
  const [statusFilter, setStatusFilter] = usePersistentState(
    "dailyRent_statusFilter",
    "All"
  );
  const [joinDateFilter, setJoinDateFilter] = usePersistentState(
    "dailyRent_joinDateFilter",
    null
  );
  const [pagination, setPagination] = usePersistentState(
    "dailyRent_pagination",
    {
      page: 1,
      limit: 10,
    }
  );

  // Convert joinDateFilter to Day.js object if it's a string/object from localStorage
  const normalizedJoinDateFilter =
    joinDateFilter && dayjs.isDayjs(joinDateFilter)
      ? joinDateFilter
      : joinDateFilter
      ? dayjs(joinDateFilter)
      : null;

  // Reset pagination to page 1 whenever filters change (except pagination itself)
  useEffect(() => {
    setPagination((prev) => ({...prev, page: 1}));
  }, [
    searchTerm,
    statusFilter,
    normalizedJoinDateFilter,
    selectedProperty?.id,
  ]);

  // Fetch users using TanStack Query
  const {data: usersData = {}, isLoading} = useQuery({
    queryKey: [
      "dailyRentUsers",
      selectedProperty?.id,
      pagination.page,
      pagination.limit,
      searchTerm,
      statusFilter,
      normalizedJoinDateFilter?.format("YYYY-MM-DD"),
    ],
    queryFn: () =>
      getUsers({
        rentType: "daily",
        propertyId: selectedProperty?.id,
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm,
        status: statusFilter !== "All" ? statusFilter : undefined,
        joinDate: normalizedJoinDateFilter
          ? normalizedJoinDateFilter.format("YYYY-MM-DD")
          : undefined,
      }),
    keepPreviousData: true,
  });

  // Clear all filters function
  const clearAllFilters = () => {
    setSearchTerm("");
    setStatusFilter("All");
    setJoinDateFilter(null);
    setPagination({page: 1, limit: 10});
  };

  // Handle date changes properly
  const handleJoinDateChange = (date) => {
    setJoinDateFilter(date);
  };

  console.log(usersData);

  const stats = [
    {
      title: "Total Residents",
      value: usersData?.summary?.totalResidents || 0,
      icon: <FiUser className="text-xl" />,
      color: "bg-indigo-100 text-indigo-600",
    },
    {
      title: "Pending Payments",
      value: usersData.summary?.totalPending || 0,
      icon: <FaRupeeSign className="text-xl" />,
      color: "bg-red-100 text-red-600",
    },
    {
      title: "Completed Payments",
      value: usersData.summary?.totalPaid || 0,
      icon: <FiCheckCircle className="text-xl" />,
      color: "bg-green-100 text-green-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 xl:px-12 lg:px-4 lg:pt-6 lg:pb-12 px-4 pt-4 pb-8">
      {/* Header */}
      <PageHeader
        title="Daily Rent Overview"
        subtitle="Manage all daily rent residents and payments"
      />

      {/* Stats Cards */}
      <StatsGrid stats={stats} />

      {/* Filters and Search */}
      <SearchFilters
        onSearch={setSearchTerm}
        onStatusChange={setStatusFilter}
        onJoinDateChange={handleJoinDateChange}
        selectedStatus={statusFilter}
        selectedDate={normalizedJoinDateFilter}
        searchTerm={searchTerm}
        onClearAll={clearAllFilters}
        hasActiveFilters={
          searchTerm || statusFilter !== "All" || normalizedJoinDateFilter
        }
        rentType="daily"
      />

      {/* Residents Table */}
      <div className="bg-white rounded-lg shadow-sm">
        <ResidentsTable
          residents={usersData.data || []}
          pagination={pagination}
          total={usersData.pagination?.total || 0}
          onPaginationChange={setPagination}
          isLoading={isLoading}
          rentType="daily"
        />
      </div>
    </div>
  );
};

export default DailyRentManagement;
