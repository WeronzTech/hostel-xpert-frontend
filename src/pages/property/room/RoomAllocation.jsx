import {useState, useEffect} from "react";
import {useQuery, useMutation, useQueryClient} from "@tanstack/react-query";
import PageHeader from "../../../components/common/PageHeader.jsx";
import BuildingSection from "../../../components/property/room/RoomCard.jsx";
import RoomModal from "../../../modals/property/room/RoomModal.jsx";
import {
  getAllRooms,
  deleteRooms,
  getFloorsByPropertyId,
} from "../../../hooks/property/useProperty.js";
import {useSelector} from "react-redux";
import {
  Modal,
  message,
  Typography,
  Input,
  Select,
  Button,
  Row,
  Col,
  Card,
  Empty,
  Tooltip,
} from "antd";
import {
  ExclamationCircleFilled,
  FilterOutlined,
  SearchOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import usePersistentState from "../../../hooks/usePersistentState";

const {Text} = Typography;
const {Option} = Select;

function RoomAllocation() {
  const {user} = useSelector((state) => state.auth);
  const {selectedProperty} = useSelector((state) => state.properties);
  const queryClient = useQueryClient();
  const [messageApi, contextHolder] = message.useMessage();

  // Use persistent state for filter data
  const [searchTerm, setSearchTerm] = usePersistentState(
    `room-allocation-search-${selectedProperty?.id || "global"}`,
    "",
  );
  const [statusFilter, setStatusFilter] = usePersistentState(
    `room-allocation-status-${selectedProperty?.id || "global"}`,
    "All",
  );
  const [sharingType, setSharingType] = usePersistentState(
    `room-allocation-sharing-${selectedProperty?.id || "global"}`,
    "All",
  );
  const [floorFilter, setFloorFilter] = usePersistentState(
    `room-allocation-floor-${selectedProperty?.id || "global"}`,
    "All",
  );

  const [availableSharingTypes, setAvailableSharingTypes] = useState(["All"]);
  const [availableFloors, setAvailableFloors] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [roomToEdit, setRoomToEdit] = useState(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState(null);
  const [showOccupantWarning, setShowOccupantWarning] = useState(false);

  // TanStack Query for fetching rooms
  const {
    data: roomsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["rooms", selectedProperty?.id],
    queryFn: () => getAllRooms({propertyId: selectedProperty?.id || null}),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
    onError: (err) => {
      message.error(err.message || "Failed to load room data");
    },
  });

  // TanStack Query for fetching floors
  const {data: floorsData, isLoading: loadingFloors} = useQuery({
    queryKey: ["floors", selectedProperty?.id],
    queryFn: () => getFloorsByPropertyId(selectedProperty?.id),
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    enabled: !!selectedProperty?.id,
    onError: (err) => {
      message.error("Failed to load floors");
    },
  });

  // Update available floors when floorsData changes or property changes
  useEffect(() => {
    // Reset floor filter when property changes
    setFloorFilter("All");

    if (floorsData && Array.isArray(floorsData) && floorsData.length > 0) {
      // Deduplicate floors by ID
      const uniqueFloorsMap = new Map();

      floorsData.forEach((floor) => {
        if (!uniqueFloorsMap.has(floor._id)) {
          uniqueFloorsMap.set(floor._id, {
            _id: floor._id,
            floorName: floor.floorName || `Floor ${floor.floorNo}`,
            floorNo: floor.floorNo ? parseInt(floor.floorNo) : 999,
          });
        }
      });

      // Convert Map values to array and sort by floor number
      const floors = Array.from(uniqueFloorsMap.values()).sort(
        (a, b) => a.floorNo - b.floorNo,
      );

      setAvailableFloors([{_id: "All", floorName: "All Floors"}, ...floors]);
    } else {
      // Set default when no floors or no property selected
      setAvailableFloors([{_id: "All", floorName: "All Floors"}]);
    }
  }, [floorsData, selectedProperty?.id]); // Add selectedProperty?.id as dependency

  // TanStack Mutation for deleting rooms
  const deleteMutation = useMutation({
    mutationFn: deleteRooms,
    onSuccess: () => {
      messageApi.success("Room deleted successfully");
      // Invalidate and refetch rooms query
      queryClient.invalidateQueries(["rooms", selectedProperty?.id]);
      setDeleteModalVisible(false);
      setRoomToDelete(null);
    },
    onError: (error) => {
      messageApi.error(error.message || "Failed to delete room");
      setDeleteModalVisible(false);
      setRoomToDelete(null);
    },
  });

  const transformApiResponse = (apiData) => {
    if (!apiData || !Array.isArray(apiData)) {
      console.warn("Invalid API response format:", apiData);
      return [];
    }

    const buildingsMap = {};

    apiData.forEach((room) => {
      if (!room) return;

      const buildingName = room.propertyName || "Unknown Building";
      if (!buildingsMap[buildingName]) {
        buildingsMap[buildingName] = {
          buildingName,
          rooms: [],
        };
      }

      buildingsMap[buildingName].rooms.push({
        _id: room._id,
        roomNumber: room.roomNo || "N/A",
        roomType: room.sharingType || "Unknown",
        roomCapacity: room.roomCapacity || 0,
        occupant: room.occupant || 0,
        status: room.status || "available",
        sharingType: room.sharingType || "Unknown",
        roomOccupants: room.roomOccupants || [],
        floorId: room.floorId || null,
        propertyId: room.propertyId,
      });
    });

    return Object.values(buildingsMap);
  };

  const buildings = roomsData ? transformApiResponse(roomsData) : [];

  // Update sharingType options when buildings change
  useEffect(() => {
    if (buildings?.length > 0) {
      const allSharingTypes = buildings.flatMap((building) =>
        building.rooms
          .map((room) => room.sharingType)
          .filter((type) => type !== undefined && type !== null),
      );
      const uniqueSharingTypes = ["All", ...new Set(allSharingTypes)];
      setAvailableSharingTypes(uniqueSharingTypes);
    }
  }, [roomsData]);

  const getFilteredBuildings = () => {
    return buildings
      .map((building) => ({
        ...building,
        rooms: building.rooms.filter((room) => {
          const matchesSearch =
            searchTerm === "" ||
            room.roomNumber.toLowerCase().includes(searchTerm.toLowerCase());

          let matchesStatus = true;
          if (statusFilter !== "All") {
            const isVacant = room.roomCapacity > room.occupant;
            const isFull = room.roomCapacity === room.occupant;
            switch (statusFilter.toLowerCase()) {
              case "vacant":
                matchesStatus = isVacant && room.status === "available";
                break;
              case "occupied":
                matchesStatus = isFull && room.status === "available";
                break;
              case "unavailable":
                matchesStatus = room.status === "unavailable";
                break;
              case "maintenance":
                matchesStatus = room.status === "maintenance";
                break;
              default:
                matchesStatus = true;
            }
          }

          let matchesSharing = true;
          if (sharingType !== "All") {
            matchesSharing = room.sharingType === sharingType;
          }

          // Updated floor filter logic
          let matchesFloor = true;
          if (floorFilter !== "All") {
            // Check if room.floorId exists and compare IDs
            matchesFloor = room.floorId?._id === floorFilter;
          }

          return (
            matchesSearch && matchesStatus && matchesSharing && matchesFloor
          );
        }),
      }))
      .filter((building) => building.rooms.length > 0);
  };

  const handleOpenAddModal = () => {
    if (!selectedProperty?.id) {
      messageApi.warning("Please select a property first");
      return;
    }
    setModalMode("add");
    setRoomToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenUpdateModal = (room) => {
    setModalMode("update");
    setRoomToEdit(room);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setRoomToEdit(null);
  };

  // After add or update, refetch rooms
  const handleModalSubmit = async () => {
    await refetch();
    handleCloseModal();
  };

  const handleDeleteClick = (room) => {
    const occupantsArray = Array.isArray(room.roomOccupants)
      ? room.roomOccupants
      : [];

    if (occupantsArray.length > 0) {
      setRoomToDelete(room);
      setShowOccupantWarning(true);
    } else {
      setRoomToDelete(room);
      setDeleteModalVisible(true);
    }
  };

  const handleConfirmDelete = async () => {
    deleteMutation.mutate({roomId: roomToDelete._id, adminName: user.name});
  };

  // Function to format sharing type for display
  const formatSharingType = (type) => {
    if (type === "All") return "All Sharing";
    if (type === "Private") return "Private";
    if (typeof type === "string" && type.includes("Sharing")) {
      return type.replace(" Sharing", " Sharing");
    }
    return type;
  };

  // Function to clear all filters
  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("All");
    setSharingType("All");
    setFloorFilter("All");
    messageApi.success("Filters cleared");
  };

  // Show clear filters button if any filter is active
  const showClearButton =
    searchTerm !== "" ||
    statusFilter !== "All" ||
    sharingType !== "All" ||
    floorFilter !== "All";

  return (
    <div className="min-h-screen bg-gray-50 xl:px-12 lg:px-4 lg:pt-6 lg:pb-12 px-4 pt-4 pb-8">
      {contextHolder}
      <PageHeader
        title={
          !selectedProperty?.id ||
          selectedProperty.id === "null" ||
          selectedProperty?.name === ""
            ? "Room Allocation Overview"
            : `Room Allocation - ${selectedProperty.name.replace(`${user.companyName} - `, "")}`
        }
        subtitle={
          !selectedProperty?.id ||
          selectedProperty.id === "null" ||
          selectedProperty?.name === ""
            ? "Manage all rooms across properties"
            : `Manage rooms for ${selectedProperty.name.replace(
                `${user.companyName} - `,
                "",
              )}`
        }
      />

      {/* Filter Section */}
      <Card className="mb-6 shadow-sm" bodyStyle={{padding: "10px"}}>
        {/* Desktop Layout */}
        <div className="hidden lg:block">
          <Row gutter={[16, 16]} align="middle">
            {/* Search Input */}
            <Col xs={24} md={6}>
              <Input
                placeholder="Search by Room Number"
                prefix={<SearchOutlined className="text-gray-400" />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                allowClear
                size="medium"
              />
            </Col>

            {/* Filter Dropdowns and Buttons */}
            <Col xs={24} md={18}>
              <Row gutter={[12, 12]} justify="end">
                <Col xs={12} sm={4}>
                  <Tooltip
                    title={
                      !selectedProperty?.id
                        ? "Please select a property first"
                        : ""
                    }
                  >
                    <Select
                      value={floorFilter}
                      onChange={setFloorFilter}
                      placeholder="Floor"
                      style={{width: "100%"}}
                      size="medium"
                      suffixIcon={<FilterOutlined className="text-gray-400" />}
                      loading={loadingFloors}
                      disabled={!selectedProperty?.id}
                    >
                      {availableFloors.map((floor) => (
                        <Option key={floor._id} value={floor._id}>
                          {floor.floorName}
                        </Option>
                      ))}
                    </Select>
                  </Tooltip>
                </Col>

                {/* Status Filter */}
                <Col xs={12} sm={4}>
                  <Select
                    value={statusFilter}
                    onChange={setStatusFilter}
                    placeholder="Status"
                    style={{width: "100%"}}
                    size="medium"
                    suffixIcon={<FilterOutlined className="text-gray-400" />}
                  >
                    <Option value="All">All Rooms</Option>
                    <Option value="vacant">Vacant</Option>
                    <Option value="occupied">Occupied</Option>
                    <Option value="unavailable">Unavailable</Option>
                    <Option value="maintenance">Maintenance</Option>
                  </Select>
                </Col>

                {/* Sharing Type Filter */}
                <Col xs={12} sm={5}>
                  <Select
                    value={sharingType}
                    onChange={setSharingType}
                    placeholder="Sharing Type"
                    style={{width: "100%"}}
                    size="medium"
                    suffixIcon={<FilterOutlined className="text-gray-400" />}
                  >
                    {availableSharingTypes.map((type) => {
                      if (!type) return null;
                      return (
                        <Option key={type} value={type}>
                          {formatSharingType(type)}
                        </Option>
                      );
                    })}
                  </Select>
                </Col>

                {/* Add Room Button */}
                <Col xs={24} sm={3}>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleOpenAddModal}
                    size="medium"
                    block
                    style={{backgroundColor: "#059669", borderColor: "#059669"}}
                  >
                    Add Room
                  </Button>
                </Col>
              </Row>
            </Col>
          </Row>
        </div>

        {/* Mobile Layout */}
        <div className="lg:hidden">
          <Row gutter={[8, 8]}>
            {/* Search Input */}
            <Col xs={24}>
              <Input
                placeholder="Search by Room Number"
                prefix={<SearchOutlined className="text-gray-400" />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                allowClear
                size="medium"
              />
            </Col>

            {/* Filter Dropdowns */}
            <Col xs={12}>
              <Select
                value={floorFilter}
                onChange={setFloorFilter}
                placeholder="Floor"
                style={{width: "100%"}}
                size="medium"
                suffixIcon={<FilterOutlined className="text-gray-400" />}
                loading={loadingFloors}
                disabled={!selectedProperty?.id}
              >
                {availableFloors.map((floor) => (
                  <Option key={floor._id} value={floor._id}>
                    {floor.floorName}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col xs={12}>
              <Select
                value={statusFilter}
                onChange={setStatusFilter}
                placeholder="Status"
                style={{width: "100%"}}
                size="medium"
                suffixIcon={<FilterOutlined className="text-gray-400" />}
              >
                <Option value="All">All Rooms</Option>
                <Option value="vacant">Vacant</Option>
                <Option value="occupied">Occupied</Option>
                <Option value="unavailable">Unavailable</Option>
                <Option value="maintenance">Maintenance</Option>
              </Select>
            </Col>

            <Col xs={12}>
              <Select
                value={sharingType}
                onChange={setSharingType}
                placeholder="Sharing Type"
                style={{width: "100%"}}
                size="medium"
                suffixIcon={<FilterOutlined className="text-gray-400" />}
              >
                {availableSharingTypes.map((type) => {
                  if (!type) return null;
                  return (
                    <Option key={type} value={type}>
                      {formatSharingType(type)}
                    </Option>
                  );
                })}
              </Select>
            </Col>

            {/* Clear Filters Button - Mobile */}
            {showClearButton && (
              <Col xs={12}>
                <Button onClick={handleClearFilters} size="medium" block>
                  Clear Filters
                </Button>
              </Col>
            )}

            {/* Add Room Button */}
            <Col xs={24}>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleOpenAddModal}
                size="medium"
                block
                style={{backgroundColor: "#059669", borderColor: "#059669"}}
              >
                Add Room
              </Button>
            </Col>
          </Row>
        </div>
      </Card>

      {/* Rest of your component remains the same... */}
      {isLoading && (
        <div className="space-y-8 mt-2">
          {/* Building Section 1 */}
          <div className="mb-10 mt-2">
            {/* Header exactly matching your UI */}
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                <div className="h-7 w-64 bg-gray-200 rounded animate-pulse"></div>
              </h2>
              <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                <div className="h-5 w-16 bg-gray-200 rounded animate-pulse"></div>
              </span>
            </div>

            {/* Grid exactly matching your UI */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="bg-white rounded-lg border border-gray-200 overflow-hidden h-full"
                >
                  {/* Room Card - matches your RoomCard component */}
                  <div className="flex justify-between items-center p-4 bg-gray-50 border-b">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
                      <div className="h-5 w-32 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                    <div className="flex gap-2">
                      <div className="w-7 h-7 bg-gray-200 rounded-full animate-pulse"></div>
                      <div className="w-7 h-7 bg-gray-200 rounded-full animate-pulse"></div>
                    </div>
                  </div>

                  <div className="p-4 space-y-4">
                    {/* Status badge */}
                    <div className="h-7 w-24 bg-gray-200 rounded-full animate-pulse"></div>

                    {/* Stats grid */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-gray-50 p-2 rounded">
                        <div className="h-4 w-12 bg-gray-200 rounded animate-pulse mb-2"></div>
                        <div className="h-5 w-16 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                      <div className="bg-gray-50 p-2 rounded">
                        <div className="h-4 w-12 bg-gray-200 rounded animate-pulse mb-2"></div>
                        <div className="h-5 w-10 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                      <div className="bg-gray-50 p-2 rounded">
                        <div className="h-4 w-12 bg-gray-200 rounded animate-pulse mb-2"></div>
                        <div className="h-5 w-10 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                    </div>
                  </div>

                  {/* Footer button */}
                  <div className="px-4 py-3 bg-gray-50 border-t">
                    <div className="h-9 w-full bg-gray-200 rounded-lg animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <Card className="text-center py-8">
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <Text type="danger">
                {error?.message || "Failed to load rooms"}
              </Text>
            }
          />
        </Card>
      )}

      {/* Room Sections */}
      {!isLoading && !error && getFilteredBuildings().length > 0 ? (
        getFilteredBuildings().map((building) => (
          <BuildingSection
            key={building.buildingName}
            building={building}
            onUpdateRoom={handleOpenUpdateModal}
            onDeleteRoom={handleDeleteClick}
          />
        ))
      ) : !isLoading && !error ? (
        <Card className="text-center py-8">
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <Text type="secondary">
                {searchTerm !== "" ||
                statusFilter !== "All" ||
                sharingType !== "All" ||
                floorFilter !== "All"
                  ? "No rooms found with current filters"
                  : !selectedProperty?.id
                    ? "Please select a property to view rooms"
                    : "No rooms available"}
              </Text>
            }
          />
        </Card>
      ) : null}

      <RoomModal
        open={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleModalSubmit}
        mode={modalMode}
        roomData={roomToEdit}
        selectedProperty={selectedProperty}
      />

      <Modal
        title={`Delete Room ${roomToDelete?.roomNumber}?`}
        open={deleteModalVisible}
        onOk={handleConfirmDelete}
        onCancel={() => setDeleteModalVisible(false)}
        okText="Delete"
        okType="danger"
        cancelText="Cancel"
        centered
        confirmLoading={deleteMutation.isLoading}
      >
        <p>
          Are you sure you want to delete this room? This action cannot be
          undone.
        </p>
      </Modal>

      <Modal
        title={
          <span style={{display: "flex", alignItems: "center", gap: 8}}>
            <ExclamationCircleFilled style={{color: "#faad14", fontSize: 20}} />
            Clear Occupants Required
          </span>
        }
        open={showOccupantWarning}
        onOk={() => setShowOccupantWarning(false)}
        onCancel={() => setShowOccupantWarning(false)}
        okText="OK"
        centered
      >
        <Text>
          Room <Text strong>{roomToDelete?.roomNumber}</Text> has occupants.
          Please clear all occupants before you can delete the room.
        </Text>
      </Modal>
    </div>
  );
}

export default RoomAllocation;
