import {useState} from "react";
import {
  FiHome,
  FiEdit2,
  FiTrash2,
  FiAlertTriangle,
  FiInfo,
  FiGrid,
} from "../../../icons";
import ConfirmModal from "../../../modals/common/ConfirmModal";
import {deleteFloor} from "../../../hooks/property/useProperty";
import {Modal, Button, Typography, Tooltip} from "antd";

const {Text} = Typography;

const FloorCard = ({floor, onEdit, onDelete}) => {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [roomDetailsModalOpen, setRoomDetailsModalOpen] = useState(false);

  const safeFloor = {
    floorName: floor?.floorName || "Unnamed Floor",
    floorNo: floor?.floorNo || 0,
    description: floor?.description || "",
    roomCapacity: floor?.roomCapacity || 0,
    _id: floor?._id || Math.random().toString(36).substr(2, 9),
    propertyId: floor?.propertyId,
    rooms: floor?.rooms || floor?.roomIds || [],
  };

  // Calculate room statistics
  const totalRooms = safeFloor.rooms?.length || 0;
  const availableRooms =
    safeFloor.rooms?.filter((room) => room.status === "available").length || 0;
  const occupiedRooms =
    safeFloor.rooms?.filter(
      (room) => room.occupant > 0 || room.status === "occupied",
    ).length || 0;
  const maintenanceRooms =
    safeFloor.rooms?.filter((room) => room.status === "maintenance").length ||
    0;

  // Get unique sharing types
  const sharingTypes = [
    ...new Set(
      safeFloor.rooms?.map((room) => room.sharingType).filter(Boolean),
    ),
  ];

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    setDeleteModalOpen(true);
  };

  const handleEditClick = (e) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(safeFloor);
    }
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteFloor(safeFloor._id);

      if (result.success) {
        if (onDelete) {
          onDelete(safeFloor);
        }
        setDeleteModalOpen(false);
      } else {
        setErrorMessage(result.message || "Failed to delete floor");
        setErrorModalOpen(true);
      }
    } catch (error) {
      setErrorMessage(error.message || "Failed to delete floor");
      setErrorModalOpen(true);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setDeleteModalOpen(false);
  };

  const handleCloseErrorModal = () => {
    setErrorModalOpen(false);
    setErrorMessage("");
  };

  const openRoomDetailsModal = () => {
    setRoomDetailsModalOpen(true);
  };

  const closeRoomDetailsModal = () => {
    setRoomDetailsModalOpen(false);
  };

  // Function to get status badge color
  const getStatusBadge = (status, occupant) => {
    if (status === "available" && occupant === 0) {
      return "bg-green-100 text-green-700";
    } else if (status === "maintenance") {
      return "bg-amber-100 text-amber-700";
    } else if (status === "unavailable") {
      return "bg-gray-100 text-gray-700";
    } else {
      return "bg-blue-100 text-blue-700";
    }
  };

  // Function to get status text
  const getStatusText = (status, occupant) => {
    if (status === "available" && occupant === 0) return "Vacant";
    if (status === "available" && occupant > 0) return "Occupied";
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow h-full flex flex-col">
        {/* Header - compact */}
        <div className="flex justify-between items-center p-3 bg-gray-50 border-b">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-100 text-[#059669] rounded-lg">
              <FiHome size={16} />
            </div>
            <h3 className="font-semibold text-gray-800 text-sm">
              Floor{" "}
              <span className="text-[#059669]">{safeFloor.floorName}</span>
            </h3>
          </div>
          <div className="flex gap-1">
            <button
              className="cursor-pointer p-1 text-gray-500 hover:text-[#059669] hover:bg-indigo-50 rounded transition-colors"
              onClick={handleEditClick}
              aria-label="Edit Floor"
              title="Edit Floor"
            >
              <FiEdit2 size={14} />
            </button>
            <button
              className="cursor-pointer p-1 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
              onClick={handleDeleteClick}
              aria-label="Delete Floor"
              title="Delete Floor"
              disabled={isDeleting}
            >
              <FiTrash2 size={14} />
            </button>
          </div>
        </div>

        {/* Main content - compact */}
        <div className="p-3 space-y-3 flex-1">
          {/* Floor Number - prominent display */}
          <div className="flex items-center justify-between bg-gray-50 p-2 rounded-lg">
            <span className="text-xs text-gray-500">Floor Number</span>
            <span className="text-2xl font-bold text-[#059669]">
              {safeFloor.floorNo}
            </span>
          </div>

          {/* Room Statistics - 2x2 grid */}
          <div className="grid grid-cols-2 gap-2">
            <Tooltip title="Total rooms on this floor">
              <div className="bg-gray-50 p-2 rounded">
                <p className="text-xs text-gray-500 font-medium">Total Rooms</p>
                <p className="font-semibold text-gray-800 text-base mt-0.5">
                  {totalRooms}
                </p>
              </div>
            </Tooltip>

            <Tooltip title="Available rooms">
              <div className="bg-gray-50 p-2 rounded">
                <p className="text-xs text-gray-500 font-medium">Available</p>
                <p className="font-semibold text-green-600 text-base mt-0.5">
                  {availableRooms}
                </p>
              </div>
            </Tooltip>

            <Tooltip title="Occupied rooms">
              <div className="bg-gray-50 p-2 rounded">
                <p className="text-xs text-gray-500 font-medium">Occupied</p>
                <p className="font-semibold text-blue-600 text-base mt-0.5">
                  {occupiedRooms}
                </p>
              </div>
            </Tooltip>

            <Tooltip title="Rooms under maintenance">
              <div className="bg-gray-50 p-2 rounded">
                <p className="text-xs text-gray-500 font-medium">Maintenance</p>
                <p className="font-semibold text-amber-600 text-base mt-0.5">
                  {maintenanceRooms}
                </p>
              </div>
            </Tooltip>
          </div>

          {/* Sharing Types - if available */}
          {sharingTypes.length > 0 && (
            <div className="bg-gray-50 p-2 rounded">
              <p className="text-xs text-gray-500 font-medium mb-1">
                Room Types
              </p>
              <div className="flex flex-wrap gap-1">
                {sharingTypes.map((type, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                  >
                    {type}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Description - compact, only if exists */}
          {safeFloor.description && (
            <div className="bg-gray-50 p-2 rounded">
              <p className="text-xs text-gray-500 font-medium mb-0.5">
                Description
              </p>
              <p className="text-xs text-gray-700 line-clamp-2">
                {safeFloor.description}
              </p>
            </div>
          )}
        </div>

        {/* Footer - View Details button */}
        <div className="px-3 py-2 bg-gray-50 border-t">
          <button
            className="cursor-pointer w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-medium text-[#059669] hover:bg-indigo-50 transition-colors"
            onClick={openRoomDetailsModal}
          >
            <FiInfo size={14} />
            View Room Details ({totalRooms})
          </button>
        </div>
      </div>

      {/* Room Details Modal */}
      <Modal
        open={roomDetailsModalOpen}
        onCancel={closeRoomDetailsModal}
        footer={null}
        width={700}
        centered
        title={
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FiHome className="text-[#059669]" size={20} />
              <span className="text-lg font-semibold text-gray-800">
                Floor {safeFloor.floorName} - Room Details
              </span>
            </div>
          </div>
        }
      >
        <div className="py-4">
          {/* Floor Summary */}
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <div className="grid grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-gray-500">Floor Number</p>
                <p className="text-lg font-bold text-[#059669]">
                  {safeFloor.floorNo}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Total Rooms</p>
                <p className="text-lg font-bold text-gray-800">{totalRooms}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Available</p>
                <p className="text-lg font-bold text-green-600">
                  {availableRooms}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Occupied</p>
                <p className="text-lg font-bold text-blue-600">
                  {occupiedRooms}
                </p>
              </div>
            </div>
          </div>

          {/* Rooms List */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">
              Rooms on this Floor
            </h4>
            {safeFloor.rooms && safeFloor.rooms.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {safeFloor.rooms.map((room, index) => (
                  <div
                    key={room._id || index}
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:border-[#059669] hover:shadow-sm transition-all"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <FiGrid className="text-[#059669]" size={16} />
                        <span className="font-semibold text-gray-800">
                          Room {room.roomNo}
                        </span>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                          room.status,
                          room.occupant,
                        )}`}
                      >
                        {getStatusText(room.status, room.occupant)}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-gray-500">Room Type</p>
                        <p className="text-sm font-medium text-gray-800">
                          {room.sharingType || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Capacity</p>
                        <p className="text-sm font-medium text-gray-800">
                          {room.roomCapacity || 0}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">
                          Current Occupants
                        </p>
                        <p className="text-sm font-medium text-gray-800">
                          {room.occupant || 0}
                        </p>
                      </div>
                    </div>

                    {room.description && (
                      <div className="mt-2 pt-2 border-t border-gray-100">
                        <p className="text-xs text-gray-500">Description</p>
                        <p className="text-sm text-gray-700">
                          {room.description}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <FiHome className="mx-auto text-gray-400 mb-2" size={32} />
                <p className="text-gray-500">No rooms on this floor</p>
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Delete Floor"
        message={`Are you sure you want to delete floor "${safeFloor.floorName}"? This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />

      {/* Error Modal */}
      <Modal
        open={errorModalOpen}
        title={
          <div className="flex items-center gap-2">
            <FiAlertTriangle className="text-amber-500" size={20} />
            <span className="text-lg font-semibold text-gray-800">
              Cannot Delete Floor
            </span>
          </div>
        }
        onCancel={handleCloseErrorModal}
        footer={[
          <Button key="ok" type="primary" onClick={handleCloseErrorModal}>
            OK
          </Button>,
        ]}
        centered
        maskClosable={false}
      >
        <div className="py-4">
          <Text
            type="secondary"
            className="text-base text-gray-700 block leading-relaxed"
          >
            {errorMessage ||
              "An error occurred while trying to delete the floor."}
          </Text>
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-800">
              <strong>Note:</strong> Please remove all rooms from this floor
              before attempting to delete it.
            </p>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default FloorCard;
