// components/property/floor/FloorSection.jsx
import {FiChevronDown, FiChevronRight} from "../../../icons/index.js";
import RoomCard from "../../../components/property/room/RoomCard.jsx"; // Your existing room card component

function FloorSection({floor, isExpanded, onToggle, onUpdateRoom, onDeleteRoom}) {
  return (
    <div className="bg-white rounded-lg shadow-sm mb-4 overflow-hidden">
      {/* Floor Header - Clickable */}
      <div 
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center gap-3">
          {isExpanded ? (
            <FiChevronDown className="text-gray-500 text-lg" />
          ) : (
            <FiChevronRight className="text-gray-500 text-lg" />
          )}
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              {floor.floorName}
            </h3>
            <p className="text-sm text-gray-500">
              {floor.rooms.length} rooms • {floor.occupiedBeds || 0} / {floor.totalBeds || 0} beds occupied
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            floor.rooms.some(room => room.status === 'available') 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-800'
          }`}>
            {floor.rooms.some(room => room.status === 'available') ? 'Available' : 'Full'}
          </span>
        </div>
      </div>

      {/* Rooms - Expandable */}
      {isExpanded && (
        <div className="border-t border-gray-200">
          {floor.rooms.length > 0 ? (
            <div className="p-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {floor.rooms.map((room) => (
                <RoomCard
                  key={room._id}
                  room={room}
                  onUpdate={onUpdateRoom}
                  onDelete={onDeleteRoom}
                />
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              No rooms available on this floor
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default FloorSection;