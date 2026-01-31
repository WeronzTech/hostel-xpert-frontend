import {useState} from "react";
import {
  FiCheckCircle,
  FiEdit2,
  FiTrash2,
  FiHome,
  FiLock,
  FiTool,
  FiUsers,
  FiXCircle,
} from "../../../icons/index.js";
import RoomOccupantsModal from "../../../modals/property/room/RoomOccupantsModel.jsx";

// RoomCard Component
const RoomCard = ({room, onUpdate, onDelete}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const safeRoom = {
    roomNumber: room?.roomNumber || "N/A",
    status: room?.status?.toLowerCase() || "unknown",
    roomType: room?.roomType || "Unknown",
    sharingType: room?.sharingType || "N/A",
    occupant: room?.occupant || 0,
    occupantIds: Array.isArray(room?.occupantIds) ? room.occupantIds : [],
    roomCapacity: room?.roomCapacity || 0,
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
          <div className="p-2 bg-indigo-100 text-[#4d44b5] rounded-lg">
            <FiHome size={18} />
          </div>
          <h3 className="font-semibold text-gray-800">
            Room <span className="text-[#4d44b5]">{safeRoom.roomNumber}</span>
          </h3>
        </div>
        <div className="flex gap-2">
          <button
            className="cursor-pointer p-1.5 text-gray-500 hover:text-[#4d44b5] hover:bg-indigo-50 rounded"
            onClick={() => onUpdate && onUpdate(safeRoom)}
            aria-label="Update Room"
          >
            <FiEdit2 size={16} />
          </button>
          <button
            className="cursor-pointer p-1 text-gray-500 hover:text-[#4d44b5] hover:bg-indigo-50 rounded"
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
      </div>

      {/* Footer with view occupants */}
      <div className="px-4 py-3 bg-gray-50 border-t">
        <button
          className="cursor-pointer w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-medium text-[#4d44b5] hover:text-[#3a32a0] transition-colors"
          onClick={() => {
            setIsModalOpen(true);
          }}
        >
          <FiUsers size={16} />
          View Occupants
        </button>
      </div>

      {/* Occupants Modal */}
      <RoomOccupantsModal
        roomId={safeRoom._id}
        visible={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        centered
      />
    </div>
  );
};

// BuildingSection Component
const BuildingSection = ({building, onUpdateRoom, onDeleteRoom}) => {
  const safeBuilding = {
    buildingName: building?.buildingName || "Unknown Building",
    rooms: Array.isArray(building?.rooms) ? building.rooms : [],
  };

  return (
    <div className="mb-10 mt-2">
      <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900">
          {safeBuilding.buildingName}
        </h2>
        <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
          {safeBuilding.rooms.length}{" "}
          {safeBuilding.rooms.length === 1 ? "Room" : "Rooms"}
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {safeBuilding.rooms.length > 0 ? (
          safeBuilding.rooms.map((room) => (
            <RoomCard
              key={room._id || Math.random().toString(36).substr(2, 9)}
              room={room}
              onUpdate={onUpdateRoom}
              onDelete={onDeleteRoom}
            />
          ))
        ) : (
          <div className="col-span-full text-center text-gray-500 py-4">
            No rooms available in this building
          </div>
        )}
      </div>
    </div>
  );
};

export default BuildingSection;
