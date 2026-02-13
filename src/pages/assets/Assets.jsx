import React, {useState, useEffect} from "react";
import {
  FiSearch,
  FiPlus,
  FiFilter,
  FiEdit,
  FiTrash2,
  FiChevronDown,
  FiDownload,
} from "react-icons/fi";
import PageHeader from "../../components/common/PageHeader";
import AddAsset from "../../modals/property/AddAsset";
import UpdateAsset from "../../modals/property/UpdateAsset";
import ConfirmModal from "../../modals/common/ConfirmModal";
import {useQuery, useMutation, useQueryClient} from "@tanstack/react-query";
import {
  getAllAssets,
  updateAssetStatus,
  deleteAsset,
  getAssetLabelsPDF,
  getFloorsByPropertyId,
  getRoomsByFloorId,
  getAssetCategory,
} from "../../hooks/property/useProperty.js";
import {Image, Select, Button, message, Modal} from "antd";
import {EyeOutlined, DownloadOutlined} from "@ant-design/icons";
import {useSelector} from "react-redux";

const {Option} = Select;

const Assets = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState(null);
  const [downloadModalOpen, setDownloadModalOpen] = useState(false);
  const [downloadFilters, setDownloadFilters] = useState({
    propertyId: "",
    floorId: "",
    roomId: "",
  });
  const [selectedFloorId, setSelectedFloorId] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [floorFilter, setFloorFilter] = useState("");
  const [roomFilter, setRoomFilter] = useState("");
  const [selectedFloorForRoomFilter, setSelectedFloorForRoomFilter] =
    useState("");

  const queryClient = useQueryClient();

  // Get selected property from Redux
  const selectedProperty = useSelector((state) => {
    return (
      state?.property?.selectedProperty ||
      state?.selectedProperty ||
      state?.properties?.selectedProperty ||
      null
    );
  });

  // Fetch assets using React Query - filter by selected property if available
  const {
    data: assetsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["assets", selectedProperty?.id],
    queryFn: () =>
      getAllAssets(
        selectedProperty?.id ? {propertyId: selectedProperty.id} : {},
      ),
  });

  // Fetch categories
  const {data: categoriesData, isLoading: loadingCategories} = useQuery({
    queryKey: ["assetCategories"],
    queryFn: async () => {
      const response = await getAssetCategory();
      return response?.data || response || [];
    },
  });

  // Fetch floors for the selected property
  const {data: floors = [], isLoading: loadingFloors} = useQuery({
    queryKey: ["floors", selectedProperty?.id],
    queryFn: async () => {
      if (!selectedProperty?.id) return [];
      const response = await getFloorsByPropertyId(selectedProperty.id);
      return response?.data || response || [];
    },
    enabled: !!selectedProperty?.id,
  });

  // Fetch rooms for the selected floor (for room filter)
  const {data: roomsForFilter = [], isLoading: loadingRoomsForFilter} =
    useQuery({
      queryKey: ["roomsForFilter", selectedFloorForRoomFilter],
      queryFn: async () => {
        if (!selectedFloorForRoomFilter) return [];
        const response = await getRoomsByFloorId(selectedFloorForRoomFilter);
        return response?.data || response || [];
      },
      enabled: !!selectedFloorForRoomFilter,
    });

  // Fetch rooms for assets table display (keep this for display logic)
  const {data: rooms = [], isLoading: loadingRooms} = useQuery({
    queryKey: ["rooms", selectedFloorId],
    queryFn: async () => {
      if (!selectedFloorId) return [];
      const response = await getRoomsByFloorId(selectedFloorId);
      return response?.data || response || [];
    },
    enabled: !!selectedFloorId,
  });

  // Create a floor map for quick lookup
  const floorMap = React.useMemo(() => {
    const map = {};
    floors.forEach((floor) => {
      map[floor._id] = floor.floorName;
      map[floor.id] = floor.floorName;
    });
    return map;
  }, [floors]);

  // Create a room map for quick lookup (for all rooms across all floors)
  const roomMap = React.useMemo(() => {
    const map = {};
    assetsData?.data?.forEach((asset) => {
      if (asset.roomId?._id) {
        map[asset.roomId._id] = asset.roomId.roomNo;
      } else if (asset.roomId && typeof asset.roomId === "string") {
        // If roomId is a string, we might not have the room name
        // We'll use the ID as a fallback until we have proper room data
        if (!map[asset.roomId]) {
          map[asset.roomId] = `Room ${asset.roomId}`;
        }
      }
    });
    return map;
  }, [assetsData?.data]);

  // Create a category map for quick lookup
  const categoryMap = React.useMemo(() => {
    const map = {};
    categoriesData?.forEach((cat) => {
      map[cat._id] = cat.name;
      map[cat.id] = cat.name;
    });
    return map;
  }, [categoriesData]);

  // Mutation for downloading labels
  const downloadLabelsMutation = useMutation({
    mutationFn: async (filters) => {
      console.log("Starting PDF download with filters:", filters);
      const response = await getAssetLabelsPDF(filters);
      return response;
    },
    onSuccess: (response) => {
      try {
        console.log("PDF download successful, creating blob...");

        // Create blob from the response data
        const blob = new Blob([response.data], {type: "application/pdf"});
        const url = window.URL.createObjectURL(blob);

        // Create download link
        const link = document.createElement("a");
        link.href = url;
        link.download = `asset-labels-${new Date().getTime()}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Clean up
        window.URL.revokeObjectURL(url);

        message.success("Asset labels downloaded successfully!");
        setDownloadModalOpen(false);
        setDownloadFilters({propertyId: "", floorId: "", roomId: ""});
        setSelectedFloorId(null);
      } catch (error) {
        console.error("Error processing download:", error);
        message.error("Failed to process downloaded file");
      }
    },
    onError: (error) => {
      console.error("Failed to download labels:", error);
      message.error(error.message || "Failed to download asset labels");
    },
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".status-dropdown")) {
        setOpenDropdownId(null);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Reset floor selection when property changes
  useEffect(() => {
    setSelectedFloorId(null);
    setDownloadFilters((prev) => ({
      ...prev,
      floorId: "",
      roomId: "",
    }));
    // Also reset floor and room filters
    setFloorFilter("");
    setRoomFilter("");
    setSelectedFloorForRoomFilter("");
  }, [selectedProperty?.id]);

  // Handle floor filter change for room filter
  const handleFloorFilterChange = (value) => {
    setFloorFilter(value);
    setSelectedFloorForRoomFilter(value);
    // When floor changes, reset room filter
    setRoomFilter("");
  };

  const handleStatusClick = (assetId) => {
    setOpenDropdownId((prevId) => (prevId === assetId ? null : assetId));
  };

  const handleStatusChange = (assetId, newStatus) => {
    setOpenDropdownId(null);
    updateStatusMutation.mutate({assetId, newStatus});
  };

  // Handle edit asset
  const handleEditAsset = (asset) => {
    setSelectedAsset(asset);
    setIsUpdateModalOpen(true);
  };

  // Handle delete asset click
  const handleDeleteClick = (asset) => {
    setAssetToDelete(asset);
    setDeleteModalOpen(true);
  };

  // Confirm delete asset
  const handleConfirmDelete = () => {
    if (assetToDelete) {
      deleteAssetMutation.mutate(assetToDelete._id);
    }
  };

  // Cancel delete
  const handleCancelDelete = () => {
    setDeleteModalOpen(false);
    setAssetToDelete(null);
  };

  // Handle download labels
  const handleDownloadLabels = () => {
    // If a property is selected in Redux, use it as default filter
    const filters = {...downloadFilters};

    // Ensure we have at least one filter criteria
    if (!filters.propertyId && !filters.floorId && !filters.roomId) {
      if (selectedProperty?.id) {
        filters.propertyId = selectedProperty.id;
      } else {
        message.warning("Please select at least one filter criteria");
        return;
      }
    }

    console.log("Downloading labels with final filters:", filters);
    downloadLabelsMutation.mutate(filters);
  };

  // Open download modal
  const handleOpenDownloadModal = () => {
    // Pre-populate with selected property if available
    const initialFilters = {propertyId: "", floorId: "", roomId: ""};
    if (selectedProperty?.id) {
      initialFilters.propertyId = selectedProperty.id;
    }
    setDownloadFilters(initialFilters);
    setDownloadModalOpen(true);
  };

  // Close download modal
  const handleCloseDownloadModal = () => {
    setDownloadModalOpen(false);
    setDownloadFilters({propertyId: "", floorId: "", roomId: ""});
    setSelectedFloorId(null);
  };

  // Handle filter change for download modal
  const handleFilterChange = (key, value) => {
    if (key === "propertyId") {
      // Reset floor and room when property changes
      setDownloadFilters((prev) => ({
        ...prev,
        propertyId: value,
        floorId: "",
        roomId: "",
      }));
      setSelectedFloorId(null);
    } else if (key === "floorId") {
      setDownloadFilters((prev) => ({
        ...prev,
        floorId: value,
        roomId: "",
      }));
      setSelectedFloorId(value);
    } else {
      setDownloadFilters((prev) => ({
        ...prev,
        [key]: value,
      }));
    }
  };

  // Get available floors for the selected property in download modal
  const {data: downloadFloors = []} = useQuery({
    queryKey: ["downloadFloors", downloadFilters.propertyId],
    queryFn: async () => {
      if (!downloadFilters.propertyId) return [];
      const response = await getFloorsByPropertyId(downloadFilters.propertyId);
      return response?.data || response || [];
    },
    enabled: !!downloadFilters.propertyId,
  });

  // Get available rooms for the selected floor in download modal
  const {data: downloadRooms = []} = useQuery({
    queryKey: ["downloadRooms", downloadFilters.floorId],
    queryFn: async () => {
      if (!downloadFilters.floorId) return [];
      const response = await getRoomsByFloorId(downloadFilters.floorId);
      return response?.data || response || [];
    },
    enabled: !!downloadFilters.floorId,
  });

  // Helper function to get floor name from floorId
  const getFloorName = (asset) => {
    // First check if floorId is a populated object
    if (asset.floorId?.floorName) {
      return asset.floorId.floorName;
    }

    // If floorId is just an ID string or object with _id
    const floorId = asset.floorId?._id || asset.floorId;
    if (floorId && floorMap[floorId]) {
      return floorMap[floorId];
    }

    return "N/A";
  };

  // Helper function to get room number
  const getRoomNo = (asset) => {
    // First check if roomId is a populated object
    if (asset.roomId?.roomNo) {
      return asset.roomId.roomNo;
    }

    // If roomId is just an ID string or object with _id
    const roomId = asset.roomId?._id || asset.roomId;
    if (roomId && roomMap[roomId]) {
      return roomMap[roomId];
    }

    return "N/A";
  };

  // Helper function to get category name
  const getCategoryName = (asset) => {
    // First check if categoryId is a populated object
    if (asset.categoryId?.name) {
      return asset.categoryId.name;
    }

    // If categoryId is just an ID string or object with _id
    const categoryId = asset.categoryId?._id || asset.categoryId;
    if (categoryId && categoryMap[categoryId]) {
      return categoryMap[categoryId];
    }

    return "N/A";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800 border border-green-200";
      case "In-Repair":
        return "bg-yellow-100 text-yellow-800 border border-yellow-200";
      case "Retired":
        return "bg-red-100 text-red-800 border border-red-200";
      case "Sold":
        return "bg-blue-100 text-blue-800 border border-blue-200";
      case "In Inventory":
        return "bg-gray-100 text-gray-800 border border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  const handleAddAsset = () => {
    setIsAddModalOpen(true);
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSearchTerm("");
    setCategoryFilter("");
    setStatusFilter("");
    setFloorFilter("");
    setRoomFilter("");
    setSelectedFloorForRoomFilter("");
    setSortBy("name");
  };

  // Check if any filter is active
  const isAnyFilterActive = () => {
    return (
      searchTerm || categoryFilter || statusFilter || floorFilter || roomFilter
    );
  };

  // Mutation for updating asset status
  const updateStatusMutation = useMutation({
    mutationFn: ({assetId, newStatus}) =>
      updateAssetStatus({
        id: assetId,
        status: newStatus,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(["assets"]);
      setOpenDropdownId(null);
      message.success("Asset status updated successfully");
    },
    onError: (error) => {
      console.error("Failed to update asset status:", error);
      message.error("Failed to update asset status");
    },
  });

  // Mutation for deleting asset
  const deleteAssetMutation = useMutation({
    mutationFn: deleteAsset,
    onSuccess: () => {
      queryClient.invalidateQueries(["assets"]);
      setDeleteModalOpen(false);
      setAssetToDelete(null);
      message.success("Asset deleted successfully");
    },
    onError: (error) => {
      console.error("Failed to delete asset:", error);
      message.error("Failed to delete asset");
    },
  });

  // Filter and sort assets
  const filteredAndSortedAssets = React.useMemo(() => {
    if (!assetsData?.data) return [];

    let filtered = assetsData.data;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (asset) =>
          asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          asset.assetId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          getRoomNo(asset).toLowerCase().includes(searchTerm.toLowerCase()) ||
          getFloorName(asset)
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          getCategoryName(asset)
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          asset.propertyId?.propertyName
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          asset.purchaseDetails?.vendor
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()),
      );
    }

    // Apply category filter
    if (categoryFilter) {
      const categoryId = categoryFilter;
      filtered = filtered.filter(
        (asset) =>
          asset.categoryId?._id === categoryId ||
          asset.categoryId === categoryId,
      );
    }

    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter((asset) => asset.status === statusFilter);
    }

    // Apply floor filter
    if (floorFilter) {
      filtered = filtered.filter((asset) => {
        const assetFloorId = asset.floorId?._id || asset.floorId;
        return assetFloorId === floorFilter;
      });
    }

    // Apply room filter
    if (roomFilter) {
      filtered = filtered.filter((asset) => {
        const assetRoomId = asset.roomId?._id || asset.roomId;
        return assetRoomId === roomFilter;
      });
    }

    // Apply sorting
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "date_added":
          return new Date(b.createdAt) - new Date(a.createdAt);
        case "room":
          return getRoomNo(a).localeCompare(getRoomNo(b));
        case "floor":
          return getFloorName(a).localeCompare(getFloorName(b));
        case "price_high_low":
          return (
            (b.purchaseDetails?.price || 0) - (a.purchaseDetails?.price || 0)
          );
        case "price_low_high":
          return (
            (a.purchaseDetails?.price || 0) - (b.purchaseDetails?.price || 0)
          );
        case "warranty_ends":
          return (
            new Date(a.warrantyDetails?.expiryDate || 0) -
            new Date(b.warrantyDetails?.expiryDate || 0)
          );
        default:
          return 0;
      }
    });
  }, [
    assetsData?.data,
    searchTerm,
    categoryFilter,
    statusFilter,
    floorFilter,
    roomFilter,
    sortBy,
    floorMap,
    roomMap,
    categoryMap,
  ]);

  // Calculate total amount
  const calculateTotalAmount = React.useCallback(() => {
    if (!filteredAndSortedAssets.length) return 0;

    return filteredAndSortedAssets.reduce((total, asset) => {
      const price = asset.purchaseDetails?.price || 0;
      return total + price;
    }, 0);
  }, [filteredAndSortedAssets]);

  const totalAmount = calculateTotalAmount();
  const originalTotalAmount =
    assetsData?.data?.reduce(
      (total, asset) => total + (asset.purchaseDetails?.price || 0),
      0,
    ) || 0;

  // Get unique categories for filter dropdown
  const uniqueCategories = React.useMemo(() => {
    const categories = new Set();
    const categoryList = [];

    assetsData?.data?.forEach((asset) => {
      const categoryId = asset.categoryId?._id || asset.categoryId;
      const categoryName = getCategoryName(asset);

      if (categoryId && categoryName && !categories.has(categoryId)) {
        categories.add(categoryId);
        categoryList.push({
          id: categoryId,
          name: categoryName,
        });
      }
    });

    return categoryList.sort((a, b) => a.name.localeCompare(b.name));
  }, [assetsData?.data, categoryMap]);

  // Get unique floors for filter dropdown
  const uniqueFloors = React.useMemo(() => {
    const floorIds = new Set();
    const floorList = [];

    assetsData?.data?.forEach((asset) => {
      const floorId = asset.floorId?._id || asset.floorId;
      const floorName = getFloorName(asset);

      if (
        floorId &&
        floorName &&
        floorName !== "N/A" &&
        !floorIds.has(floorId)
      ) {
        floorIds.add(floorId);
        floorList.push({
          id: floorId,
          name: floorName,
        });
      }
    });

    return floorList.sort((a, b) => a.name.localeCompare(b.name));
  }, [assetsData?.data, floorMap]);

  // Get unique rooms for filter dropdown (across all floors)
  const uniqueRooms = React.useMemo(() => {
    const roomIds = new Set();
    const roomList = [];

    assetsData?.data?.forEach((asset) => {
      const roomId = asset.roomId?._id || asset.roomId;
      const roomNo = getRoomNo(asset);

      if (roomId && roomNo && roomNo !== "N/A" && !roomIds.has(roomId)) {
        roomIds.add(roomId);
        roomList.push({
          id: roomId,
          name: roomNo,
        });
      }
    });

    return roomList.sort((a, b) => a.name.localeCompare(b.name));
  }, [assetsData?.data, roomMap]);

  // Status options for filter
  const statusOptions = [
    {value: "", label: "All Status"},
    {value: "Active", label: "Active"},
    {value: "In-Repair", label: "In Repair"},
    {value: "Retired", label: "Retired"},
    {value: "Sold", label: "Sold"},
    {value: "In Inventory", label: "In Inventory"},
  ];

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 xl:px-12 lg:px-4 lg:pt-6 lg:pb-12 px-4 pt-4 pb-8">
        <PageHeader
          title="Asset Management"
          subtitle="Track and manage all your property assets"
        />
        <div className="bg-white rounded-lg shadow-sm p-6 text-center text-red-500">
          Error loading assets: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 xl:px-12 lg:px-4 lg:pt-6 lg:pb-12 px-4 pt-4 pb-8">
      <PageHeader
        title="Asset Management"
        subtitle="Track and manage all your property assets"
      />

      {/* Total Amount Summary */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <div className="text-sm text-blue-600 font-medium mb-1">
              Total Assets
            </div>
            <div className="text-2xl font-bold text-blue-800">
              {assetsData?.data?.length || 0}
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg border border-green-100">
            <div className="text-sm text-green-600 font-medium mb-1">
              Total Asset Value
            </div>
            <div className="text-2xl font-bold text-green-800">
              ₹ {originalTotalAmount.toLocaleString()}
            </div>
            <div className="text-xs text-green-600 mt-1">
              All assets in {selectedProperty?.name || "all properties"}
            </div>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
            <div className="text-sm text-purple-600 font-medium mb-1">
              Filtered Asset Value
            </div>
            <div className="text-2xl font-bold text-purple-800">
              ₹ {totalAmount.toLocaleString()}
            </div>
            <div className="text-xs text-purple-600 mt-1">
              {filteredAndSortedAssets.length} asset
              {filteredAndSortedAssets.length !== 1 ? "s" : ""} matching filters
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col gap-4">
          {/* Search and Clear Filters Row */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            <div className="flex-1 max-w-lg">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg
                             focus:outline-none focus:ring-1 focus:ring-[#059669] focus:border-[#059669]"
                  placeholder="Search assets by name, ID, category, vendor, room, floor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              {isAnyFilterActive() && (
                <button
                  onClick={handleClearFilters}
                  className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <FiFilter className="text-gray-500" />
                  <span>Clear Filters</span>
                </button>
              )}

              <button
                className="w-full sm:w-auto cursor-pointer flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                onClick={handleOpenDownloadModal}
                disabled={!assetsData?.data || assetsData.data.length === 0}
              >
                <FiDownload className="text-lg" />
                <span>Download Labels</span>
              </button>

              <button
                className="w-full sm:w-auto cursor-pointer flex items-center justify-center gap-2 px-4 py-2 bg-[#059669] text-white rounded-lg hover:bg-[#059669] transition-colors"
                onClick={handleAddAsset}
              >
                <FiPlus className="text-lg" />
                <span>Add Asset</span>
              </button>
            </div>
          </div>

          {/* Filter Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
            {/* Category Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                className="block w-full pl-3 pr-8 py-2 text-sm border border-gray-300 rounded-lg bg-white
                           focus:outline-none focus:ring-1 focus:ring-[#059669] focus:border-[#059669]"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="">All Categories</option>
                {uniqueCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                className="block w-full pl-3 pr-8 py-2 text-sm border border-gray-300 rounded-lg bg-white
                           focus:outline-none focus:ring-1 focus:ring-[#059669] focus:border-[#059669]"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                {statusOptions.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Floor Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Floor
              </label>
              <select
                className="block w-full pl-3 pr-8 py-2 text-sm border border-gray-300 rounded-lg bg-white
                           focus:outline-none focus:ring-1 focus:ring-[#059669] focus:border-[#059669]"
                value={floorFilter}
                onChange={(e) => handleFloorFilterChange(e.target.value)}
                disabled={!selectedProperty?.id}
              >
                <option value="">All Floors</option>
                {uniqueFloors.map((floor) => (
                  <option key={floor.id} value={floor.id}>
                    {floor.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Room Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Room
              </label>
              <select
                className="block w-full pl-3 pr-8 py-2 text-sm border border-gray-300 rounded-lg bg-white
                           focus:outline-none focus:ring-1 focus:ring-[#059669] focus:border-[#059669]"
                value={roomFilter}
                onChange={(e) => setRoomFilter(e.target.value)}
                disabled={floorFilter && roomsForFilter.length === 0}
              >
                <option value="">All Rooms</option>
                {floorFilter
                  ? // Show rooms for selected floor
                    roomsForFilter.map((room) => (
                      <option key={room._id} value={room._id}>
                        {room.roomNo}
                      </option>
                    ))
                  : // Show all rooms (from uniqueRooms)
                    uniqueRooms.map((room) => (
                      <option key={room.id} value={room.id}>
                        {room.name}
                      </option>
                    ))}
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Sort By
              </label>
              <select
                className="block w-full pl-3 pr-8 py-2 text-sm border border-gray-300 rounded-lg bg-white
                           focus:outline-none focus:ring-1 focus:ring-[#059669] focus:border-[#059669]"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="name">Name</option>
                <option value="date_added">Date Added</option>
                <option value="room">Room</option>
                <option value="floor">Floor</option>
                <option value="price_high_low">Price: High to Low</option>
                <option value="price_low_high">Price: Low to High</option>
                <option value="warranty_ends">Warranty End</option>
              </select>
            </div>

            {/* Active Filters Summary
            <div className="lg:col-span-1">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Active Filters
              </label>
              <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded border border-gray-200 h-full flex items-center">
                {isAnyFilterActive() ? (
                  <div>
                    {searchTerm && <div className="truncate">Search: "{searchTerm}"</div>}
                    {categoryFilter && <div>Category: {categoryMap[categoryFilter]}</div>}
                    {statusFilter && <div>Status: {statusFilter}</div>}
                    {floorFilter && <div>Floor: {floorMap[floorFilter]}</div>}
                    {roomFilter && <div>Room: {floorFilter ? roomsForFilter.find(r => r._id === roomFilter)?.roomNo : roomMap[roomFilter]}</div>}
                  </div>
                ) : (
                  <span className="text-gray-400">No filters applied</span>
                )}
              </div>
            </div> */}
          </div>
        </div>
      </div>

      {/* Asset Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#059669] mx-auto"></div>
              <p className="mt-4 text-gray-500">Loading assets...</p>
            </div>
          ) : filteredAndSortedAssets.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>No assets found.</p>
              {(searchTerm ||
                categoryFilter ||
                statusFilter ||
                floorFilter ||
                roomFilter) && (
                <div className="mt-2">
                  <p>Try adjusting your filters or search terms.</p>
                  <button
                    onClick={handleClearFilters}
                    className="mt-3 px-4 py-2 bg-[#059669] text-white rounded-lg hover:bg-[#059669] transition-colors"
                  >
                    Clear All Filters
                  </button>
                </div>
              )}
              {selectedProperty &&
                !searchTerm &&
                !categoryFilter &&
                !statusFilter &&
                !floorFilter &&
                !roomFilter && (
                  <p>No assets found for the selected property.</p>
                )}
            </div>
          ) : (
            <>
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div className="text-sm text-gray-600">
                    Showing{" "}
                    <span className="font-semibold">
                      {filteredAndSortedAssets.length}
                    </span>{" "}
                    of{" "}
                    <span className="font-semibold">
                      {assetsData?.data?.length || 0}
                    </span>{" "}
                    assets
                    {isAnyFilterActive() && (
                      <span className="ml-2">
                        <button
                          onClick={handleClearFilters}
                          className="text-[#059669] hover:text-[#059669] hover:underline"
                        >
                          Clear filters
                        </button>
                      </span>
                    )}
                  </div>
                  <div className="text-sm font-semibold text-purple-700">
                    Filtered Total: ₹{totalAmount.toLocaleString()}
                  </div>
                </div>
              </div>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                      S.No
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Asset Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Invoice
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Property & Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Purchase Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Warranty
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAndSortedAssets.map((asset, index) => {
                    const floorName = getFloorName(asset);
                    const roomNo = getRoomNo(asset);
                    const categoryName = getCategoryName(asset);

                    return (
                      <tr key={asset._id} className="hover:bg-gray-50">
                        {/* S.No Column */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                          {index + 1}
                        </td>

                        {/* Asset Details Column */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {asset.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {asset.assetId}
                            </div>
                            <div className="text-sm text-gray-500">
                              {categoryName}
                            </div>
                            {asset.description && (
                              <div className="text-sm text-gray-500 mt-1">
                                {asset.description}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Invoice Image Column */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          {asset.purchaseDetails?.invoiceUrl ? (
                            <div className="flex items-center">
                              <Image
                                width={50}
                                height={50}
                                src={asset.purchaseDetails.invoiceUrl}
                                alt={`Invoice for ${asset.name}`}
                                placeholder={
                                  <div className="w-12 h-12 bg-gray-200 flex items-center justify-center rounded">
                                    <EyeOutlined />
                                  </div>
                                }
                                preview={{
                                  mask: <EyeOutlined />,
                                }}
                                fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
                                className="rounded border border-gray-200 cursor-pointer"
                              />
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">
                              No Invoice
                            </span>
                          )}
                        </td>

                        {/* Property & Location Column */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {asset.propertyId?.propertyName ||
                              selectedProperty?.name ||
                              "N/A"}
                          </div>
                          <div className="text-sm text-gray-500">
                            Room: {roomNo}
                          </div>
                          <div className="text-sm text-gray-500">
                            Floor: {floorName}
                          </div>
                        </td>

                        {/* Purchase Details Column */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            ₹
                            {(
                              asset.purchaseDetails?.price || 0
                            ).toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-500">
                            {asset.purchaseDetails?.vendor || "N/A"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {asset.purchaseDetails?.purchaseDate
                              ? new Date(
                                  asset.purchaseDetails.purchaseDate,
                                ).toLocaleDateString()
                              : "N/A"}
                          </div>
                        </td>

                        {/* Warranty Column */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {asset.warrantyDetails?.provider || "N/A"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {asset.warrantyDetails?.expiryDate
                              ? new Date(
                                  asset.warrantyDetails.expiryDate,
                                ).toLocaleDateString()
                              : "N/A"}
                          </div>
                        </td>

                        {/* Status Dropdown */}
                        <td className="px-6 py-4 whitespace-nowrap relative status-dropdown">
                          <button
                            onClick={() => handleStatusClick(asset._id)}
                            className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(
                              asset.status,
                            )} hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#059669] disabled:opacity-50 cursor-pointer`}
                          >
                            {asset.status}
                            <FiChevronDown className="text-gray-500 text-sm" />
                          </button>

                          {openDropdownId === asset._id && (
                            <div className="absolute z-10 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg">
                              {[
                                "Active",
                                "In-Repair",
                                "Retired",
                                "Sold",
                                "In Inventory",
                              ].map((statusOption) => (
                                <button
                                  key={statusOption}
                                  onClick={() =>
                                    handleStatusChange(asset._id, statusOption)
                                  }
                                  disabled={updateStatusMutation.isLoading}
                                  className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                                    asset.status === statusOption
                                      ? "text-[#059669] font-semibold"
                                      : "text-gray-700"
                                  }`}
                                >
                                  {statusOption}
                                </button>
                              ))}
                            </div>
                          )}
                        </td>

                        {/* Actions Column */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <button
                              className="text-[#059669] hover:text-[#059669] transition-colors p-1 rounded hover:bg-gray-100 cursor-pointer"
                              title="Edit Asset"
                              onClick={() => handleEditAsset(asset)}
                            >
                              <FiEdit className="text-lg" />
                            </button>
                            <button
                              className="text-red-500 hover:text-red-700 transition-colors p-1 rounded hover:bg-gray-100 cursor-pointer"
                              title="Delete Asset"
                              onClick={() => handleDeleteClick(asset)}
                              disabled={deleteAssetMutation.isLoading}
                            >
                              <FiTrash2 className="text-lg" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </>
          )}
        </div>
      </div>

      {/* Add Asset Modal */}
      <AddAsset
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      {/* Update Asset Modal */}
      <UpdateAsset
        isOpen={isUpdateModalOpen}
        onClose={() => {
          setIsUpdateModalOpen(false);
          setSelectedAsset(null);
        }}
        assetData={selectedAsset}
      />

      {/* Download Labels Modal */}
      <Modal
        title="Download Asset Labels"
        open={downloadModalOpen}
        onCancel={handleCloseDownloadModal}
        footer={[
          <Button key="cancel" onClick={handleCloseDownloadModal}>
            Cancel
          </Button>,
          <Button
            key="download"
            type="primary"
            icon={<DownloadOutlined />}
            loading={downloadLabelsMutation.isLoading}
            onClick={handleDownloadLabels}
            className="bg-green-600 hover:bg-green-700"
          >
            Download Labels
          </Button>,
        ]}
        width={500}
      >
        <div className="space-y-4 py-4">
          <p className="text-gray-600">
            Download printable labels for your assets. You can filter by
            property, floor, or room to generate labels for specific assets.
          </p>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Floor
              </label>
              <Select
                placeholder={
                  downloadFilters.propertyId
                    ? "Select Floor"
                    : "Select property first"
                }
                value={downloadFilters.floorId || undefined}
                onChange={(value) => handleFilterChange("floorId", value)}
                className="w-full"
                allowClear
                disabled={!downloadFilters.propertyId}
                loading={loadingFloors}
              >
                {downloadFloors.map((floor) => (
                  <Option key={floor._id} value={floor._id}>
                    {floor.floorName}
                  </Option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Room
              </label>
              <Select
                placeholder={
                  downloadFilters.floorId ? "Select Room" : "Select floor first"
                }
                value={downloadFilters.roomId || undefined}
                onChange={(value) => handleFilterChange("roomId", value)}
                className="w-full"
                allowClear
                disabled={!downloadFilters.floorId}
                loading={loadingRooms}
              >
                {downloadRooms.map((room) => (
                  <Option key={room._id} value={room._id}>
                    {room.roomNo}
                  </Option>
                ))}
              </Select>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> The labels will include asset names and IDs
              in a printable format suitable for physical labeling.
              {!downloadFilters.propertyId &&
                !downloadFilters.floorId &&
                !downloadFilters.roomId &&
                selectedProperty?.id && (
                  <span className="block mt-1">
                    Using currently selected property:{" "}
                    <strong>{selectedProperty.name}</strong>
                  </span>
                )}
            </p>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal using custom ConfirmModal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Delete Asset"
        message={
          assetToDelete ? (
            <>
              Are you sure you want to delete the asset "
              <strong>{assetToDelete.name}</strong>"?
              <br />
              <br />
              <div className="text-sm text-gray-600">
                <div>
                  <strong>Asset ID:</strong> {assetToDelete.assetId}
                </div>
                <div>
                  <strong>Category:</strong> {getCategoryName(assetToDelete)}
                </div>
                <div>
                  <strong>Purchase Price:</strong> ₹
                  {(assetToDelete.purchaseDetails?.price || 0).toLocaleString()}
                </div>
                <div>
                  <strong>Location:</strong>{" "}
                  {assetToDelete.propertyId?.propertyName ||
                    selectedProperty?.name}{" "}
                  - Floor: {getFloorName(assetToDelete)} - Room:{" "}
                  {getRoomNo(assetToDelete)}
                </div>
              </div>
              <br />
              This action cannot be undone and all associated data will be
              permanently removed.
            </>
          ) : (
            "Are you sure you want to delete this asset?"
          )
        }
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
};

export default Assets;
