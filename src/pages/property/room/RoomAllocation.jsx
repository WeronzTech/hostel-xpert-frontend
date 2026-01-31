// import {useState, useEffect} from "react";
// import PageHeader from "../../../components/common/PageHeader.jsx";
// import BuildingSection from "../../../components/property/room/RoomCard.jsx";
// import {FiFilter, FiSearch, MdMeetingRoom} from "../../../icons/index.js";
// import RoomModal from "../../../modals/property/room/RoomModal.jsx"; // unified modal
// import {getAllHeavensRooms} from "../../../hooks/property/useProperty.js";
// import LoadingSpinner from "../../../ui/loadingSpinner/LoadingSpinner.jsx";
// import {useSelector} from "react-redux";
// import {Modal, message, Typography} from "antd";
// import {ExclamationCircleFilled} from "@ant-design/icons";
// import {deleteRooms} from "../../../hooks/property/useProperty.js";

// const {Text} = Typography;

// function RoomAllocation() {
//   const {user} = useSelector((state) => state.auth);
//   const {selectedProperty} = useSelector((state) => state.properties);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [statusFilter, setStatusFilter] = useState("All");
//   const [availableSharingTypes, setAvailableSharingTypes] = useState(["All"]);
//   const [sharingType, setSharingType] = useState("All");
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [modalMode, setModalMode] = useState("add"); // 'add' or 'update'
//   const [roomToEdit, setRoomToEdit] = useState(null);
//   const [deleteModalVisible, setDeleteModalVisible] = useState(false);
//   const [roomToDelete, setRoomToDelete] = useState(null);
//   const [showOccupantWarning, setShowOccupantWarning] = useState(false);

//   const [buildings, setBuildings] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   // Fetch rooms from DB afresh
//   const fetchRooms = async () => {
//     try {
//       setLoading(true);
//       setError(null);
//       const response = await getAllHeavensRooms({
//         propertyId: selectedProperty?.id || null,
//       });
//       const buildingsData = transformApiResponse(response);
//       setBuildings(buildingsData);
//     } catch (err) {
//       setError(err.message || "Failed to load room data");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchRooms();
//   }, [selectedProperty?.id]);

//   const transformApiResponse = (apiData) => {
//     // Add validation to ensure apiData is an array
//     if (!apiData || !Array.isArray(apiData)) {
//       console.warn("Invalid API response format:", apiData);
//       return []; // Return an empty array instead of crashing
//     }

//     const buildingsMap = {};

//     apiData.forEach((room) => {
//       // Add null checks for room properties
//       if (!room) return; // Skip if room is null/undefined

//       const buildingName = room.propertyName || "Unknown Building";
//       if (!buildingsMap[buildingName]) {
//         buildingsMap[buildingName] = {
//           buildingName,
//           rooms: [],
//         };
//       }

//       buildingsMap[buildingName].rooms.push({
//         _id: room._id,
//         roomNumber: room.roomNo || "N/A",
//         roomType: room.sharingType || "Unknown",
//         roomCapacity: room.roomCapacity || 0,
//         occupant: room.occupant || 0,
//         status: room.status || "available",
//         sharingType: room.sharingType || "Unknown",
//         roomOccupants: room.roomOccupants || [],
//       });
//     });

//     return Object.values(buildingsMap);
//   };

//   // Update sharingType options when buildings change
//   useEffect(() => {
//     if (buildings.length > 0) {
//       const allSharingTypes = buildings.flatMap((building) =>
//         building.rooms
//           .map((room) => room.sharingType)
//           .filter((type) => type !== undefined && type !== null)
//       );
//       const uniqueSharingTypes = ["All", ...new Set(allSharingTypes)];
//       setAvailableSharingTypes(uniqueSharingTypes);
//     }
//   }, [buildings]);

//   const getFilteredBuildings = () => {
//     return buildings
//       .map((building) => ({
//         ...building,
//         rooms: building.rooms.filter((room) => {
//           const matchesSearch =
//             searchTerm === "" ||
//             room.roomNumber.toLowerCase().includes(searchTerm.toLowerCase());

//           let matchesStatus = true;
//           if (statusFilter !== "All") {
//             const isVacant = room.roomCapacity > room.occupant;
//             const isFull = room.roomCapacity === room.occupant;
//             switch (statusFilter.toLowerCase()) {
//               case "vacant":
//                 matchesStatus = isVacant && room.status === "available";
//                 break;
//               case "occupied":
//                 matchesStatus = isFull && room.status === "available";
//                 break;
//               case "unavailable":
//                 matchesStatus = room.status === "unavailable";
//                 break;
//               case "maintenance":
//                 matchesStatus = room.status === "maintenance";
//                 break;
//               default:
//                 matchesStatus = true;
//             }
//           }

//           let matchesSharing = true;
//           if (sharingType !== "All") {
//             matchesSharing = room.sharingType === sharingType;
//           }

//           return matchesSearch && matchesStatus && matchesSharing;
//         }),
//       }))
//       .filter((building) => building.rooms.length > 0);
//   };

//   const handleOpenAddModal = () => {
//     setModalMode("add");
//     setRoomToEdit(null);
//     setIsModalOpen(true);
//   };

//   const handleOpenUpdateModal = (room) => {
//     setModalMode("update");
//     setRoomToEdit(room);
//     setIsModalOpen(true);
//   };

//   const handleCloseModal = () => {
//     setIsModalOpen(false);
//     setRoomToEdit(null);
//   };

//   // After add or update, reload rooms from DB
//   const handleModalSubmit = async () => {
//     await fetchRooms(); // re-fetch to reflect new data
//     handleCloseModal();
//   };

//   const handleDeleteClick = (room) => {
//     const occupantsArray = Array.isArray(room.roomOccupants)
//       ? room.roomOccupants
//       : [];

//     if (occupantsArray.length > 0) {
//       setRoomToDelete(room);
//       setShowOccupantWarning(true);
//     } else {
//       setRoomToDelete(room);
//       setDeleteModalVisible(true);
//     }
//   };

//   const handleConfirmDelete = async () => {
//     try {
//       await deleteRooms({roomId: roomToDelete._id, adminName: user.name});
//       message.success("Room deleted successfully");
//       await fetchRooms();
//     } catch (error) {
//       message.error(error.message || "Failed to delete room");
//     } finally {
//       setDeleteModalVisible(false);
//       setRoomToDelete(null);
//     }
//   };

//   if (loading) return <LoadingSpinner />;
//   if (error)
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="text-center text-red-500">
//           <p>Error loading rooms: {error}</p>
//           <button
//             onClick={() => window.location.reload()}
//             className="mt-4 px-4 py-2 bg-[#4d44b5] text-white rounded hover:bg-[#3a32a0]"
//           >
//             Retry
//           </button>
//         </div>
//       </div>
//     );

//   return (
//     <div className="min-h-screen bg-gray-50 xl:px-12 lg:px-4 lg:pt-6 lg:pb-12 px-4 pt-4 pb-8">
//       <PageHeader
//         title={
//           !selectedProperty?.id ||
//           selectedProperty.id === "null" ||
//           selectedProperty?.name === ""
//             ? "Room Allocation Overview"
//             : `Room Allocation - ${selectedProperty.name.replace(
//                 "Heavens Living - ",
//                 ""
//               )}`
//         }
//         subtitle={
//           !selectedProperty?.id ||
//           selectedProperty.id === "null" ||
//           selectedProperty?.name === ""
//             ? "Manage all rooms across properties"
//             : `Manage rooms for ${selectedProperty.name.replace(
//                 "Heavens Living - ",
//                 ""
//               )}`
//         }
//       />

//       {/* Filter Section */}
//       <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
//         {/* Desktop */}
//         <div className="hidden lg:flex justify-between items-center gap-4">
//           <div className="flex-1 max-w-md">
//             <div className="relative">
//               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                 <FiSearch className="text-gray-400" />
//               </div>
//               <input
//                 type="text"
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg
//                 focus:outline-none focus:ring-1 focus:ring-[#4d44b5] focus:border-[#4d44b5]"
//                 placeholder="Search by Room Number"
//               />
//             </div>
//           </div>

//           <div className="flex items-center gap-3">
//             <div className="relative w-40">
//               <select
//                 value={statusFilter}
//                 onChange={(e) => setStatusFilter(e.target.value)}
//                 className="cursor-pointer appearance-none border border-gray-300 rounded-lg px-3 py-2 pr-8 w-full
//                 focus:outline-none focus:ring-1 focus:ring-[#4d44b5] focus:border-[#4d44b5]"
//               >
//                 <option value="All">All Rooms</option>
//                 <option value="vacant">Vacant</option>
//                 <option value="occupied">Occupied</option>
//                 <option value="unavailable">Unavailable</option>
//                 <option value="maintenance">Maintenance</option>
//               </select>
//               <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
//                 <FiFilter className="text-gray-400" />
//               </div>
//             </div>

//             <div className="relative w-40">
//               <select
//                 value={sharingType}
//                 onChange={(e) => setSharingType(e.target.value)}
//                 className="cursor-pointer appearance-none border border-gray-300 rounded-lg px-3 py-2 pr-8 w-full
//                 focus:outline-none focus:ring-1 focus:ring-[#4d44b5] focus:border-[#4d44b5]"
//               >
//                 {availableSharingTypes.map((type) => {
//                   if (!type) return null;
//                   let displayText = type;
//                   if (type === "All") displayText = "All Sharing";
//                   else if (type === "Private") displayText = "Private";
//                   else if (typeof type === "string" && type.includes("Sharing"))
//                     displayText = type.replace(" Sharing", " Sharing");
//                   return (
//                     <option key={type} value={type}>
//                       {displayText}
//                     </option>
//                   );
//                 })}
//               </select>
//               <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
//                 <FiFilter className="text-gray-400" />
//               </div>
//             </div>

//             {/* Add Room Button */}
//             <button
//               onClick={handleOpenAddModal}
//               className="cursor-pointer flex items-center justify-center gap-2 px-4 py-2 bg-[#4d44b5] text-white rounded-lg hover:bg-[#3a32a0] transition-colors"
//             >
//               <MdMeetingRoom className="text-lg" />
//               Add Room
//             </button>
//           </div>
//         </div>

//         {/* Mobile */}
//         <div className="lg:hidden space-y-3">
//           <div className="relative">
//             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//               <FiSearch className="text-gray-400" />
//             </div>
//             <input
//               type="text"
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg
//               focus:outline-none focus:ring-1 focus:ring-[#4d44b5] focus:border-[#4d44b5]"
//               placeholder="Search by Room Number"
//             />
//           </div>

//           <div className="flex gap-3">
//             <div className="relative flex-1">
//               <select
//                 value={statusFilter}
//                 onChange={(e) => setStatusFilter(e.target.value)}
//                 className="cursor-pointer appearance-none border border-gray-300 rounded-lg px-3 py-2 pr-8 w-full
//                 focus:outline-none focus:ring-1 focus:ring-[#4d44b5] focus:border-[#4d44b5]"
//               >
//                 <option value="All">All Rooms</option>
//                 <option value="vacant">Vacant</option>
//                 <option value="occupied">Occupied</option>
//               </select>
//               <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
//                 <FiFilter className="text-gray-400" />
//               </div>
//             </div>

//             <div className="relative flex-1">
//               <select
//                 value={sharingType}
//                 onChange={(e) => setSharingType(e.target.value)}
//                 className="cursor-pointer appearance-none border border-gray-300 rounded-lg px-3 py-2 pr-8 w-full
//                 focus:outline-none focus:ring-1 focus:ring-[#4d44b5] focus:border-[#4d44b5]"
//               >
//                 <option value="All">All Sharing</option>
//                 <option value="Private">Single</option>
//                 <option value="Shared">2 Sharing</option>
//                 <option value="3">3 Sharing</option>
//                 <option value="4">4 Sharing</option>
//               </select>
//               <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
//                 <FiFilter className="text-gray-400" />
//               </div>
//             </div>
//           </div>

//           <button
//             onClick={handleOpenAddModal}
//             className="cursor-pointer w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#4d44b5] text-white rounded-lg hover:bg-[#3a32a0] transition-colors"
//           >
//             <MdMeetingRoom className="text-lg" />
//             Add Room
//           </button>
//         </div>
//       </div>

//       {/* Room Sections */}
//       {getFilteredBuildings().length > 0 ? (
//         getFilteredBuildings().map((building) => (
//           <BuildingSection
//             key={building.buildingName}
//             building={building}
//             onUpdateRoom={handleOpenUpdateModal}
//             onDeleteRoom={handleDeleteClick} // <-- pass the delete handler here
//           />
//         ))
//       ) : (
//         <div className="text-center py-8 bg-white rounded-lg shadow-sm">
//           <div className="flex flex-col items-center justify-center">
//             <MdMeetingRoom className="text-4xl mb-2 text-gray-400" />
//             <p className="text-gray-500">
//               {selectedProperty?.id
//                 ? `No rooms found for ${selectedProperty.name.replace(
//                     "Heavens Living - ",
//                     ""
//                   )}`
//                 : "No rooms available"}
//             </p>
//           </div>
//         </div>
//       )}

//       <RoomModal
//         open={isModalOpen}
//         onClose={handleCloseModal}
//         onSubmit={handleModalSubmit}
//         mode={modalMode}
//         roomData={roomToEdit}
//         selectedProperty={selectedProperty}
//       />

//       <Modal
//         title={`Delete Room ${roomToDelete?.roomNumber}?`}
//         visible={deleteModalVisible}
//         onOk={handleConfirmDelete}
//         onCancel={() => setDeleteModalVisible(false)}
//         okText="Delete"
//         okType="danger"
//         cancelText="Cancel"
//         centered
//       >
//         <p>
//           Are you sure you want to delete this room? This action cannot be
//           undone.
//         </p>
//       </Modal>

//       <Modal
//         title={
//           <span style={{display: "flex", alignItems: "center", gap: 8}}>
//             <ExclamationCircleFilled style={{color: "#faad14", fontSize: 20}} />
//             Clear Occupants Required
//           </span>
//         }
//         open={showOccupantWarning}
//         onOk={() => setShowOccupantWarning(false)}
//         onCancel={() => setShowOccupantWarning(false)}
//         okText="OK"
//         centered
//       >
//         <Text>
//           Room <Text strong>{roomToDelete?.roomNumber}</Text> has occupants.
//           Please clear all occupants before you can delete the room.
//         </Text>
//       </Modal>
//     </div>
//   );
// }

// export default RoomAllocation;
import {useState, useEffect} from "react";
import PageHeader from "../../../components/common/PageHeader.jsx";
import BuildingSection from "../../../components/property/room/RoomCard.jsx";
import {FiFilter, FiSearch, MdMeetingRoom} from "../../../icons/index.js";
import RoomModal from "../../../modals/property/room/RoomModal.jsx";
import {getAllHeavensRooms} from "../../../hooks/property/useProperty.js";
import LoadingSpinner from "../../../ui/loadingSpinner/LoadingSpinner.jsx";
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
} from "antd";
import {
  ExclamationCircleFilled,
  FilterOutlined,
  SearchOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import {deleteRooms} from "../../../hooks/property/useProperty.js";
import usePersistentState from "../../../hooks/usePersistentState"; // Import the hook

const {Text} = Typography;
const {Option} = Select;

function RoomAllocation() {
  const {user} = useSelector((state) => state.auth);
  const {selectedProperty} = useSelector((state) => state.properties);

  // Use persistent state for filter data
  const [searchTerm, setSearchTerm] = usePersistentState(
    `room-allocation-search-${selectedProperty?.id || "global"}`,
    ""
  );
  const [statusFilter, setStatusFilter] = usePersistentState(
    `room-allocation-status-${selectedProperty?.id || "global"}`,
    "All"
  );
  const [sharingType, setSharingType] = usePersistentState(
    `room-allocation-sharing-${selectedProperty?.id || "global"}`,
    "All"
  );

  const [availableSharingTypes, setAvailableSharingTypes] = useState(["All"]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [roomToEdit, setRoomToEdit] = useState(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState(null);
  const [showOccupantWarning, setShowOccupantWarning] = useState(false);

  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch rooms from DB afresh
  const fetchRooms = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllHeavensRooms({
        propertyId: selectedProperty?.id || null,
      });
      const buildingsData = transformApiResponse(response);
      setBuildings(buildingsData);
    } catch (err) {
      setError(err.message || "Failed to load room data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [selectedProperty?.id]);

  // Reset filters when property changes (optional - uncomment if needed)
  // useEffect(() => {
  //   // Clear filters when property changes
  //   setSearchTerm("");
  //   setStatusFilter("All");
  //   setSharingType("All");
  // }, [selectedProperty?.id, setSearchTerm, setStatusFilter, setSharingType]);

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
      });
    });

    return Object.values(buildingsMap);
  };

  // Update sharingType options when buildings change
  useEffect(() => {
    if (buildings.length > 0) {
      const allSharingTypes = buildings.flatMap((building) =>
        building.rooms
          .map((room) => room.sharingType)
          .filter((type) => type !== undefined && type !== null)
      );
      const uniqueSharingTypes = ["All", ...new Set(allSharingTypes)];
      setAvailableSharingTypes(uniqueSharingTypes);
    }
  }, [buildings]);

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

          return matchesSearch && matchesStatus && matchesSharing;
        }),
      }))
      .filter((building) => building.rooms.length > 0);
  };

  const handleOpenAddModal = () => {
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

  // After add or update, reload rooms from DB
  const handleModalSubmit = async () => {
    await fetchRooms();
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
    try {
      await deleteRooms({roomId: roomToDelete._id, adminName: user.name});
      message.success("Room deleted successfully");
      await fetchRooms();
    } catch (error) {
      message.error(error.message || "Failed to delete room");
    } finally {
      setDeleteModalVisible(false);
      setRoomToDelete(null);
    }
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
    message.success("Filters cleared");
  };

  if (loading) return <LoadingSpinner />;
  if (error)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-red-500">
          <p>Error loading rooms: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-[#4d44b5] text-white rounded hover:bg-[#3a32a0]"
          >
            Retry
          </button>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 xl:px-12 lg:px-4 lg:pt-6 lg:pb-12 px-4 pt-4 pb-8">
      <PageHeader
        title={
          !selectedProperty?.id ||
          selectedProperty.id === "null" ||
          selectedProperty?.name === ""
            ? "Room Allocation Overview"
            : `Room Allocation - ${selectedProperty.name.replace(
                "Heavens Living - ",
                ""
              )}`
        }
        subtitle={
          !selectedProperty?.id ||
          selectedProperty.id === "null" ||
          selectedProperty?.name === ""
            ? "Manage all rooms across properties"
            : `Manage rooms for ${selectedProperty.name.replace(
                "Heavens Living - ",
                ""
              )}`
        }
      />

      {/* Filter Section - Updated with Ant Design */}
      <Card className="mb-6 shadow-sm" bodyStyle={{padding: "10px"}}>
        {/* Desktop Layout */}
        <div className="hidden lg:block">
          <Row gutter={[16, 16]} align="middle">
            {/* Search Input */}
            <Col xs={24} md={8}>
              <Input
                placeholder="Search by Room Number"
                prefix={<SearchOutlined className="text-gray-400" />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                allowClear
                size="medium"
              />
            </Col>

            {/* Filter Dropdowns and Button */}
            <Col xs={24} md={16}>
              <Row gutter={[12, 12]} justify="end">
                {/* Status Filter */}
                <Col xs={12} sm={6}>
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
                <Col xs={12} sm={6}>
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
                <Col
                  xs={24}
                  sm={
                    sharingType !== "All" ||
                    statusFilter !== "All" ||
                    searchTerm !== ""
                      ? 3
                      : 6
                  }
                >
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleOpenAddModal}
                    size="medium"
                    block
                    style={{backgroundColor: "#4d44b5", borderColor: "#4d44b5"}}
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

            {/* Add Room Button */}
            <Col xs={24}>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleOpenAddModal}
                size="medium"
                block
                style={{backgroundColor: "#4d44b5", borderColor: "#4d44b5"}}
              >
                Add Room
              </Button>
            </Col>
          </Row>
        </div>
      </Card>

      {/* Room Sections */}
      {getFilteredBuildings().length > 0 ? (
        getFilteredBuildings().map((building) => (
          <BuildingSection
            key={building.buildingName}
            building={building}
            onUpdateRoom={handleOpenUpdateModal}
            onDeleteRoom={handleDeleteClick}
          />
        ))
      ) : (
        <Card className="text-center py-8">
          <div className="flex flex-col items-center justify-center">
            <PlusOutlined className="text-4xl mb-2 text-gray-400" />
            <Text type="secondary">
              {selectedProperty?.id
                ? `No rooms found for ${selectedProperty.name.replace(
                    "Heavens Living - ",
                    ""
                  )}${
                    searchTerm !== "" ||
                    statusFilter !== "All" ||
                    sharingType !== "All"
                      ? " with current filters"
                      : ""
                  }`
                : "No rooms available"}
            </Text>
            {(searchTerm !== "" ||
              statusFilter !== "All" ||
              sharingType !== "All") && (
              <Button type="link" onClick={handleClearFilters} className="mt-2">
                Clear filters to see all rooms
              </Button>
            )}
          </div>
        </Card>
      )}

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
        visible={deleteModalVisible}
        onOk={handleConfirmDelete}
        onCancel={() => setDeleteModalVisible(false)}
        okText="Delete"
        okType="danger"
        cancelText="Cancel"
        centered
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
