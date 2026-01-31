import React, { useState } from 'react';
import {
  FiHome,
  FiEdit2,
  FiTrash2,
  FiCheckCircle,
  FiXCircle,
  FiTool,
  FiLock,
  FiAlertTriangle,
} from "../../../icons";
import ConfirmModal from '../../../modals/common/ConfirmModal'; 
import { deleteFloor } from '../../../hooks/property/useProperty'; 
import { Modal, Button, Typography } from "antd";

const { Text } = Typography;

const FloorCard = ({ floor, onEdit, onDelete }) => {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const safeFloor = {
    floorName: floor?.floorName || "Unnamed Floor",
    floorNo: floor?.floorNo || 0,
    status: floor?.status?.toLowerCase() || "active",
    description: floor?.description || "",
    roomCapacity: floor?.roomCapacity || 0,
    vacantSlot: floor?.vacantSlot || 0,
    isHeavens: floor?.isHeavens || false,
    _id: floor?._id || Math.random().toString(36).substr(2, 9),
    propertyId: floor?.propertyId,
  };

  const getOccupancyRate = (vacant, capacity) => {
    if (!capacity || capacity === 0) return 0;
    return ((capacity - vacant) / capacity) * 100;
  };

  const getStatusConfig = (status, isVacant, vacancyCount) => {
    const statusMap = {
      maintenance: {
        color: "bg-amber-100 text-amber-800 border-amber-200",
        icon: <FiTool className="mr-1.5" size={14} />,
        label: "Maintenance",
      },
      inactive: {
        color: "bg-gray-100 text-gray-800 border-gray-200",
        icon: <FiLock className="mr-1.5" size={14} />,
        label: "Inactive",
      },
      active: isVacant
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
    
    return statusMap[status] || statusMap.active;
  };

  const isVacant = safeFloor.vacantSlot > 0;
  const vacancyCount = safeFloor.vacantSlot;
  const occupiedCount = safeFloor.roomCapacity - safeFloor.vacantSlot;
  const occupancyRate = getOccupancyRate(safeFloor.vacantSlot, safeFloor.roomCapacity);
  
  const status = getStatusConfig(safeFloor.status, isVacant, vacancyCount);

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    console.log('🗑️ Delete button clicked for floor:', safeFloor.floorName);
    setDeleteModalOpen(true);
  };

  const handleEditClick = (e) => {
    e.stopPropagation();
    console.log('✏️ Edit button clicked for floor:', safeFloor.floorName);
    
    if (onEdit) {
      onEdit(safeFloor);
    } else {
      console.warn('⚠️ No onEdit handler provided');
    }
  };
  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      console.log('Deleting floor with ID:', safeFloor._id);
      
      const result = await deleteFloor(safeFloor._id);

      if (result.success) {
        console.log('✅ Floor deleted successfully');
        // Call the onDelete prop to update parent state
        if (onDelete) {
          onDelete(safeFloor);
        }
        setDeleteModalOpen(false);
      } else {
        console.error('❌ Failed to delete floor:', result.message);
        setErrorMessage(result.message || 'Failed to delete floor');
        setErrorModalOpen(true);
      }
    } catch (error) {
      console.error('❌ Error deleting floor:', error);
      setErrorMessage(error.message || 'Failed to delete floor');
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
    setErrorMessage('');
  };

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer">
        {/* Header with floor name and quick actions */}
        <div 
          className="flex justify-between items-center p-4 bg-gray-50 border-b"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 text-[#4d44b5] rounded-lg">
              <FiHome size={18} />
            </div>
            <h3 className="font-semibold text-gray-800">
              Floor <span className="text-[#4d44b5]">{safeFloor.floorName}</span>
            </h3>
          </div>
          <div className="flex gap-2">
            <button
              className="cursor-pointer p-1.5 text-gray-500 hover:text-[#4d44b5] hover:bg-indigo-50 rounded transition-colors"
              onClick={handleEditClick}
              aria-label="Edit Floor"
              title="Edit Floor"
            >
              <FiEdit2 size={16} />
            </button>
            <button
              className="cursor-pointer p-1 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
              onClick={handleDeleteClick}
              aria-label="Delete Floor"
              title="Delete Floor"
              disabled={isDeleting}
            >
              <FiTrash2 size={16} />
            </button>
          </div>
        </div>

        {/* Main content - clickable area */}
        <div className="p-4 space-y-4">
          {/* Status Badge and Floor Number */}
          <div className="flex justify-between items-center">
            <div
              className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium border ${status.color}`}
            >
              {status.icon}
              <span>{status.label}</span>
            </div>
            {safeFloor.isHeavens && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Heavens Floor
              </span>
            )}
          </div>

          {/* Floor Number */}
          <div className="text-center">
            <span className="text-xs text-gray-500 font-medium">Floor Number</span>
            <p className="text-2xl font-bold text-[#4d44b5] mt-1">
              {safeFloor.floorNo}
            </p>
          </div>

          {/* Statistics Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-500 font-medium">Total Capacity</p>
              <p className="font-semibold text-gray-800 text-lg mt-1">
                {safeFloor.roomCapacity}
              </p>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-500 font-medium">Occupied</p>
              <p className="font-semibold text-gray-800 text-lg mt-1">
                {occupiedCount}
              </p>
            </div>
          </div>

          {/* Occupancy Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-gray-600">
              <span>Occupancy Rate</span>
              <span className="font-semibold">{occupancyRate.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${occupancyRate}%`,
                  backgroundColor: 
                    occupancyRate >= 80 ? '#ef4444' :
                    occupancyRate >= 50 ? '#f59e0b' : '#10b981'
                }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>Vacant: {vacancyCount}</span>
              <span>Occupied: {occupiedCount}</span>
            </div>
          </div>
        </div>
      </div>

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
            <span className="text-lg font-semibold text-gray-800">Cannot Delete Floor</span>
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
            {errorMessage || 'An error occurred while trying to delete the floor.'}
          </Text>
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-800">
              <strong>Note:</strong> Please remove all rooms from this floor before attempting to delete it.
            </p>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default FloorCard;