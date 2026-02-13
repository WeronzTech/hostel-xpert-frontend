import React, {useState, useEffect} from "react";
import {useParams, useNavigate} from "react-router-dom";
import {Button, Input, Select, Row, Col, Empty, Alert, Spin} from "antd";
import {ArrowLeftOutlined, SearchOutlined} from "@ant-design/icons";
import {getRoomsByFloorId} from "../../../hooks/property/useProperty";

// Import icons
import {
  FiHome,
  FiEdit2,
  FiTrash2,
  FiCheckCircle,
  FiXCircle,
  FiTool,
  FiLock,
  FiUsers,
} from "../../../icons";

const {Option} = Select;

// RoomCard Component (Integrated)
const RoomCard = ({room, onUpdate, onDelete}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const safeRoom = {
    roomNumber: room?.roomNo || room?.roomNumber || "N/A",
    status: room?.status?.toLowerCase() || "unknown",
    roomType: room?.roomType || "Unknown",
    sharingType: room?.sharingType || "N/A",
    occupant: room?.occupant || 0,
    occupantIds: Array.isArray(room?.roomOccupants) ? room.roomOccupants : [],
    roomCapacity: room?.roomCapacity || 0,
    description: room?.description || "",
    isHeavens: room?.isHeavens || false,
    _id: room?._id || Math.random().toString(36).substr(2, 9),
  };

  const isVacant = safeRoom.occupant < safeRoom.roomCapacity;
  const vacancyCount = Math.max(safeRoom.roomCapacity - safeRoom.occupant, 0);

  const statusConfig = {
    maintenance: {
      color: "bg-amber-100 text-amber-800 border-amber-200",
      icon: <FiTool className="mr-1.5" size={14} />,
      label: "Maintenance",
    },
    unavailable: {
      color: "bg-gray-100 text-gray-800 border-gray-200",
      icon: <FiLock className="mr-1.5" size={14} />,
      label: "Unavailable",
    },
    available: isVacant
      ? {
          color: "bg-emerald-100 text-emerald-800 border-emerald-200",
          icon: <FiCheckCircle className="mr-1.5" size={14} />,
          label: `Vacant (${vacancyCount})`,
        }
      : {
          color: "bg-rose-100 text-rose-800 border-rose-200",
          icon: <FiXCircle className="mr-1.5" size={14} />,
          label: "Fully Occupied",
        },
  };

  const status = statusConfig[safeRoom.status] || statusConfig.available;

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Header with room number and quick actions */}
      <div className="flex justify-between items-center p-4 bg-gray-50 border-b">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 text-[#059669] rounded-lg">
            <FiHome size={18} />
          </div>
          <h3 className="font-semibold text-gray-800">
            Room <span className="text-[#059669]">{safeRoom.roomNumber}</span>
          </h3>
        </div>
        <div className="flex gap-2">
          <button
            className="cursor-pointer p-1.5 text-gray-500 hover:text-[#059669] hover:bg-indigo-50 rounded"
            onClick={() => onUpdate && onUpdate(safeRoom)}
            aria-label="Update Room"
          >
            <FiEdit2 size={16} />
          </button>
          <button
            className="cursor-pointer p-1 text-gray-500 hover:text-[#059669] hover:bg-indigo-50 rounded"
            aria-label="Delete Room"
            onClick={() => onDelete && onDelete(room)}
          >
            <FiTrash2 size={16} />
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="p-4 space-y-4">
        {/* Status Badge */}
        <div
          className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium border ${status.color}`}
        >
          {status.icon}
          <span>{status.label}</span>
        </div>

        {/* Special tags */}
        <div className="flex gap-2">
          {safeRoom.isHeavens && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Heavens Room
            </span>
          )}
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-gray-50 p-2 rounded">
            <p className="text-xs text-gray-500 font-medium">Type</p>
            <p className="font-semibold text-gray-800 text-sm mt-1">
              {safeRoom.sharingType}
            </p>
          </div>

          <div className="bg-gray-50 p-2 rounded">
            <p className="text-xs text-gray-500 font-medium">Capacity</p>
            <p className="font-semibold text-gray-800 text-sm mt-1">
              {safeRoom.roomCapacity}
            </p>
          </div>

          <div className="bg-gray-50 p-2 rounded">
            <p className="text-xs text-gray-500 font-medium">Occupants</p>
            <p
              className={`font-semibold text-sm mt-1 ${
                safeRoom.occupant > 0 ? "text-blue-600" : "text-gray-600"
              }`}
            >
              {safeRoom.occupant}
            </p>
          </div>
        </div>

        {/* Occupancy Progress Bar */}
        {safeRoom.roomCapacity > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-gray-600">
              <span>Occupancy</span>
              <span className="font-semibold">
                {((safeRoom.occupant / safeRoom.roomCapacity) * 100).toFixed(1)}
                %
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${(safeRoom.occupant / safeRoom.roomCapacity) * 100}%`,
                  backgroundColor:
                    safeRoom.occupant / safeRoom.roomCapacity >= 0.8
                      ? "#ef4444"
                      : safeRoom.occupant / safeRoom.roomCapacity >= 0.5
                        ? "#f59e0b"
                        : "#10b981",
                }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>Vacant: {vacancyCount}</span>
              <span>Occupied: {safeRoom.occupant}</span>
            </div>
          </div>
        )}

        {/* Description */}
        {safeRoom.description && (
          <div className="pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-500 font-medium mb-1">
              Description
            </p>
            <p className="text-sm text-gray-700 line-clamp-2">
              {safeRoom.description}
            </p>
          </div>
        )}
      </div>

      {/* Footer with view occupants */}
      <div className="px-4 py-3 bg-gray-50 border-t">
        <button
          className="cursor-pointer w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-medium text-[#059669] hover:text-[#059669] transition-colors"
          onClick={() => setIsModalOpen(true)}
        >
          <FiUsers size={16} />
          View Occupants
        </button>
      </div>
    </div>
  );
};

// Main FloorRoomsPage Component
const FloorRoomsPage = () => {
  const {floorId} = useParams();
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [floor, setFloor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Fetch rooms for the floor
  const fetchRooms = async () => {
    if (!floorId) {
      setError("Floor ID is required");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log(`🔄 Fetching rooms for floor ID: ${floorId}`);
      const response = await getRoomsByFloorId(floorId);
      console.log("✅ Complete API Response:", response);

      // The API returns an array directly, so use it as rooms data
      const roomsData = Array.isArray(response) ? response : [];

      console.log("✅ Final rooms data:", roomsData);
      console.log(`📊 Loaded ${roomsData.length} rooms`);

      setRooms(roomsData);

      // Extract floor info from first room if available
      if (roomsData.length > 0 && roomsData[0].floorId) {
        // You might want to fetch floor details separately if needed
        setFloor({
          floorName: `Floor ${roomsData[0].floorId.substring(0, 8)}...`,
          floorNo: "N/A", // You can get this from floor details if available
        });
      }
    } catch (err) {
      console.error("❌ Error fetching rooms:", err);
      console.error("❌ Error details:", err);
      setError(err.message || "Failed to fetch rooms");
      setRooms([]);
      setFloor(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (floorId) {
      console.log(`🏢 FloorRoomsPage mounted for floor ID: ${floorId}`);
      fetchRooms();
    } else {
      console.warn("⚠️ No floor ID provided in URL parameters");
      setError("No floor ID provided");
    }
  }, [floorId]);

  // Filtered rooms
  const filteredRooms = rooms.filter((room) => {
    const matchesSearch =
      room.roomNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.sharingType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.status?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || room.status?.toLowerCase() === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleUpdateRoom = (room) => {
    console.log("✏️ Update room requested:", room);
  };

  const handleDeleteRoom = (room) => {
    console.log("🗑️ Delete room requested:", room);
    fetchRooms();
  };

  const handleSearchChange = (value) => {
    setSearchTerm(value);
  };

  const handleStatusFilterChange = (value) => {
    setStatusFilter(value);
  };

  if (loading && rooms.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <Spin size="large" tip="Loading rooms..." />
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
            className="flex items-center"
          >
            Back to Floors
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert
          message="Error Loading Rooms"
          description={error}
          type="error"
          showIcon
          closable
          onClose={() => setError(null)}
          className="mb-6"
        />
      )}

      {/* Filters Section - Only show if we have rooms */}
      {rooms.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} md={8}>
              <Input
                placeholder="Search rooms by number, type, or status..."
                prefix={<SearchOutlined />}
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                size="large"
                allowClear
              />
            </Col>
            <Col xs={24} md={6}>
              <Select
                value={statusFilter}
                onChange={handleStatusFilterChange}
                style={{width: "100%"}}
                size="large"
                placeholder="Filter by status"
              >
                <Option value="all">All Status</Option>
                <Option value="available">Available</Option>
                <Option value="maintenance">Maintenance</Option>
                <Option value="unavailable">Unavailable</Option>
              </Select>
            </Col>
            <Col xs={24} md={4}>
              <div className="text-gray-600">
                {filteredRooms.length} room(s) found
              </div>
            </Col>
          </Row>
        </div>
      )}

      {/* Rooms Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredRooms.length > 0 ? (
          filteredRooms.map((room) => (
            <RoomCard
              key={room._id}
              room={room}
              onUpdate={handleUpdateRoom}
              onDelete={handleDeleteRoom}
            />
          ))
        ) : (
          <div className="col-span-full">
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
              <Empty
                description={
                  loading
                    ? "Loading rooms..."
                    : rooms.length === 0
                      ? `No rooms found for this floor.`
                      : "No rooms match your search filters"
                }
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FloorRoomsPage;
