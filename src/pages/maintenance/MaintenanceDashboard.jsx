import {useEffect, useState} from "react";
import {
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
  FiPlus,
  GiAutoRepair,
} from "../../icons/index.js";
import {Tabs, message, Button} from "antd";
import PageHeader from "../../components/common/PageHeader";
import {useSelector} from "react-redux";
import {useQuery, useQueryClient} from "@tanstack/react-query";
import {maintenanceApiService} from "../../hooks/maintenance/maintenanceApiService.js";
import ErrorState from "../../components/common/ErrorState.jsx";
import MaintenanceTable from "../../components/maintenance/MaintenanceTable.jsx";
import {MaintenanceDetailModal, StatsGrid} from "../../components/index.js";
import {useSocket} from "../../context/SocketContext.jsx";
import AddMaintenanceModal from "../../components/maintenance/AddMaintenanceModal.jsx";

const MaintenanceDashboard = () => {
  const [activeTab, setActiveTab] = useState("Pending");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasNotified, setHasNotified] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const {socket} = useSocket();
  const [messageApi, contextHolder] = message.useMessage();
  const queryClient = useQueryClient();

  // State for Maintenance ID
  const [selectedMaintenanceId, setSelectedMaintenanceId] = useState(null);

  // Currently selected Property ID from Redux
  const selectedPropertyId = useSelector(
    (state) => state.properties.selectedProperty.id
  );

  // Fetch Maintenance record using tanstack-query
  const {
    data: maintenanceData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["maintenance", selectedPropertyId, activeTab, currentPage],
    queryFn: () =>
      maintenanceApiService.getMaintenanceByPropertyId({
        propertyId: selectedPropertyId,
        status: activeTab,
        page: currentPage,
        limit: pageSize,
      }),
    keepPreviousData: true,
    refetchOnWindowFocus: false,
  });

  // Fetch Maintenance Detail for selected row using Tanstack query
  const {
    data: maintenanceDetailData,
    isLoading: isDetailLoading,
    error: detailError,
  } = useQuery({
    queryKey: ["maintenanceDetail", selectedMaintenanceId],
    queryFn: () =>
      maintenanceApiService.getMaintenancebyId(selectedMaintenanceId),
    enabled: !!selectedMaintenanceId,
  });

  // Function for row click
  const handleRowClick = (record) => {
    setSelectedMaintenanceId(record._id);
    // setSelectedMaintenanceId(record._d);
    setIsModalOpen(true);
  };

  // Fetch the count of the maintenance records based on status
  const fetchCountByStatus = async (status, propertyId) => {
    const response = await maintenanceApiService.getMaintenanceByPropertyId({
      propertyId,
      status,
      page: 1,
      limit: 1,
    });

    return response?.pagination?.total || 0;
  };

  const {data: pendingCount = 0} = useQuery({
    queryKey: ["maintenanceCount", selectedPropertyId, "Pending"],
    queryFn: () => fetchCountByStatus("Pending", selectedPropertyId),
  });

  const {data: ongoingCount = 0} = useQuery({
    queryKey: ["maintenanceCount", selectedPropertyId, "Ongoing"],
    queryFn: () => fetchCountByStatus("Ongoing", selectedPropertyId),
  });

  const {data: resolvedCount = 0} = useQuery({
    queryKey: ["maintenanceCount", selectedPropertyId, "Resolved"],
    queryFn: () => fetchCountByStatus("Resolved", selectedPropertyId),
  });

  const totalCount = pendingCount + ongoingCount + resolvedCount;

  socket.on("new-maintenance", (data) => {
    console.log("maintenance_data", data);
  });

  useEffect(() => {
    if (!socket) return;

    const handleMaintenanceUpdate = () => {
      // Invalidate and refetch the count query
      queryClient.invalidateQueries({
        queryKey: ["maintenanceCount", selectedPropertyId, "Pending"],
      });
    };

    // Listen for various maintenance events
    socket.on("new-maintenance", handleMaintenanceUpdate);
    socket.on("maintenance-updated", handleMaintenanceUpdate);
    socket.on("maintenance-resolved", handleMaintenanceUpdate);

    return () => {
      socket.off("new-maintenance", handleMaintenanceUpdate);
      socket.off("maintenance-updated", handleMaintenanceUpdate);
      socket.off("maintenance-resolved", handleMaintenanceUpdate);
    };
  }, [socket, queryClient, selectedPropertyId]);

  // Stats for card
  const stats = [
    {
      title: "Total Maintenance",
      value: totalCount,
      icon: <GiAutoRepair className="text-xl" />,
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Pending Maintenance",
      value: pendingCount,
      icon: <FiAlertCircle className="text-xl" />,
      color: "bg-red-100 text-red-600",
    },
    {
      title: "Ongoing Maintenance",
      value: ongoingCount,
      icon: <FiClock className="text-xl" />,
      color: "bg-yellow-100 text-yellow-600",
    },
    {
      title: "Resolved Maintenance",
      value: resolvedCount,
      icon: <FiCheckCircle className="text-xl" />,
      color: "bg-green-100 text-green-600",
    },
  ];

  // Show toast message
  useEffect(() => {
    if (isError && !hasNotified) {
      const errorMsg = error?.message || "Failed to load maintenance records.";
      messageApi.error(errorMsg);
    } else if (!isLoading && maintenanceData?.data && !hasNotified) {
      setHasNotified(true);
    }
  }, [
    error?.message,
    hasNotified,
    isError,
    isLoading,
    maintenanceData,
    messageApi,
  ]);

  // Add this useEffect to your MaintenanceDashboard component

  useEffect(() => {
    if (!socket) return;

    const handleNewMaintenance = (newMaintenanceData) => {
      console.log("New maintenance record received:", newMaintenanceData);
      messageApi.info("A new maintenance request has been submitted!");

      // Update the cache for the 'Pending' tab's data list
      queryClient.setQueryData(
        ["maintenance", selectedPropertyId, "Pending", 1],
        (oldData) => {
          // If there's no old data, create a new structure
          if (!oldData) {
            return {
              data: [newMaintenanceData],
              pagination: {total: 1},
            };
          }
          // Prepend the new item to the existing list
          const updatedRecords = [newMaintenanceData, ...oldData.data];
          return {
            ...oldData,
            data: updatedRecords,
            pagination: {
              ...oldData.pagination,
              total: oldData.pagination.total + 1,
            },
          };
        }
      );

      // Update the cache for the 'Pending' count
      queryClient.setQueryData(
        ["maintenanceCount", selectedPropertyId, "Pending"],
        (oldCount) => (oldCount ? oldCount + 1 : 1)
      );
    };

    socket.on("new-maintenance", handleNewMaintenance);

    // Cleanup: remove the listener when the component unmounts
    return () => {
      socket.off("new-maintenance", handleNewMaintenance);
    };
  }, [socket, queryClient, selectedPropertyId, messageApi]);

  // Show toat messages when the property changes
  useEffect(() => {
    setHasNotified(false);
  }, [selectedPropertyId]);

  // Show Error toast message if an error occurs while fetching details
  useEffect(() => {
    if (detailError) {
      const detailErrorMsg =
        detailError?.message || "Failed to load maintenance detail.";
      messageApi.error(detailErrorMsg);
    }
  }, [detailError, messageApi]);

  // If no property is selected
  // if (!selectedPropertyId) {
  //   return (
  //     <ErrorState
  //       message="No Property Selected"
  //       description="Please select a property from the navbar to view the maintenance"
  //     />
  //   );
  // }

  // Handle Error
  if (isError) {
    const msg = error?.message || "something went wrong";

    return (
      <ErrorState
        message="Failed to load Maintenance Records"
        description={msg}
        onAction={() => refetch()}
        actionText="Try Again"
      />
    );
  }

  const handleTabChange = (key) => {
    setActiveTab(key); // update tab/status
    setCurrentPage(1); // reset to page 1 when tab changes
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleAddMaintenanceClick = () => {
    setIsAddModalOpen(true);
  };

  // Extract records and pagination safely
  const records = maintenanceData?.data || [];
  const pagination = maintenanceData?.pagination || {};

  // Define tab items with colored labels
  const tabItems = [
    {
      key: "Pending",
      label: (
        <span
          className={`flex items-center gap-2 font-medium ${
            activeTab === "Pending" ? "text-red-600" : "text-gray-500"
          }`}
        >
          <FiAlertCircle />
          Pending
        </span>
      ),
    },
    {
      key: "Ongoing",
      label: (
        <span
          className={`flex items-center gap-2 font-medium ${
            activeTab === "Ongoing" ? "text-yellow-500" : "text-gray-500"
          }`}
        >
          <FiClock />
          Ongoing
        </span>
      ),
    },
    {
      key: "Resolved",
      label: (
        <span
          className={`flex items-center gap-2 font-medium ${
            activeTab === "Resolved" ? "text-green-600" : "text-gray-500"
          }`}
        >
          <FiCheckCircle />
          Resolved
        </span>
      ),
    },
  ];

  return (
    <>
      {contextHolder}
      <div className="min-h-screen bg-gray-50 px-4 pt-4 pb-8 xl:px-12 lg:px-6">
        {/* Page Header */}
        <PageHeader
          title="Maintenance Dashboard"
          subtitle="Track and manage all maintenance requests"
        />

        {/* Stats Grid */}
        <StatsGrid stats={stats} />

        {/* Tabs and Button Container */}
        <div className="mb-6">
          {/* Stack on mobile, row on larger screens */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Tabs - full width on mobile, auto on larger screens */}
            <div className="w-full lg:w-auto">
              <Tabs
                activeKey={activeTab}
                onChange={handleTabChange}
                type="card"
                items={tabItems}
                className="custom-tabs"
              />
            </div>

            {/* Add Maintenance Button - full width on mobile, auto on larger screens */}
            <div className="w-full lg:w-auto">
              <Button
                type="primary"
                icon={<FiPlus />}
                onClick={handleAddMaintenanceClick}
                className="w-full lg:w-auto"
                size="medium"
              >
                Add Maintenance
              </Button>
            </div>
          </div>
        </div>

        {/* Maintenance Table */}
        <MaintenanceTable
          data={records}
          status={activeTab}
          currentPage={currentPage}
          pageSize={pageSize}
          total={pagination.total || 0}
          onPageChange={handlePageChange}
          onRowClick={handleRowClick}
          loading={isLoading}
          onAssignConfirm={(record, values) => {
            console.log("Assign confirmed:", record, values);
          }}
        />

        {/* Maintenance Detail modal */}
        <MaintenanceDetailModal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          data={maintenanceDetailData}
          loading={isDetailLoading}
        />

        <AddMaintenanceModal
          open={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
        />
      </div>
    </>
  );
};

export default MaintenanceDashboard;
