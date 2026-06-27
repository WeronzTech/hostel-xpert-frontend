import {useState, useEffect, useMemo} from "react";
import {useSelector} from "react-redux";
import {useQuery, useMutation, useQueryClient} from "@tanstack/react-query";
import {Row, Col, Card, Button, Input, Select, Empty, Tooltip, Modal, Typography, Badge, message} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  FilterOutlined,
  ExclamationCircleFilled,
  EditOutlined,
  DeleteOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import {
  FiCheckCircle,
  FiXCircle,
  FiEdit2,
  FiTrash2,
  FiHome,
  FiUsers,
  FiLock,
  FiAlertCircle,
} from "../../../icons/index.js";
import {FaBed} from "../../../icons/index.js";
import PageHeader from "../../../components/common/PageHeader.jsx";
import BedModal from "./BedModal.jsx";
import ConvertToAssetModal from "./ConvertToAssetModal.jsx";
import {
  getFloorsByPropertyId,
  getRoomsByFloorId,
  getBedsByRoom,
  deleteBed,
} from "../../../hooks/property/useProperty.js";

const {Option} = Select;
const {Text, Title} = Typography;

const BedManagement = () => {
  const {user} = useSelector((state) => state.auth);
  const {selectedProperty} = useSelector((state) => state.properties);
  const queryClient = useQueryClient();
  const [messageApi, contextHolder] = message.useMessage();

  // Filters State
  const [selectedFloorId, setSelectedFloorId] = useState(null);
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All"); // All, Available, Assigned, Inactive

  // Modal States
  const [isBedModalOpen, setIsBedModalOpen] = useState(false);
  const [editingBed, setEditingBed] = useState(null);
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
  const [bedToDelete, setBedToDelete] = useState(null);
  const [showAssignedWarning, setShowAssignedWarning] = useState(false);

  // Invalidate filters when property changes
  useEffect(() => {
    setSelectedFloorId(null);
    setSelectedRoomId(null);
    setSearchTerm("");
  }, [selectedProperty?.id]);

  // Invalidate room selection when floor changes
  useEffect(() => {
    setSelectedRoomId(null);
  }, [selectedFloorId]);

  // Query: Get Floors for Selected Property
  const {data: floors = [], isLoading: loadingFloors} = useQuery({
    queryKey: ["floors", selectedProperty?.id],
    queryFn: async () => {
      if (!selectedProperty?.id) return [];
      const response = await getFloorsByPropertyId(selectedProperty.id);
      return Array.isArray(response) ? response : response?.data || [];
    },
    enabled: !!selectedProperty?.id,
  });

  // Query: Get Rooms for Selected Floor
  const {data: rooms = [], isLoading: loadingRooms} = useQuery({
    queryKey: ["rooms", selectedFloorId],
    queryFn: async () => {
      if (!selectedFloorId) return [];
      const response = await getRoomsByFloorId(selectedFloorId);
      return Array.isArray(response) ? response : response?.data || [];
    },
    enabled: !!selectedFloorId,
  });

  // Query: Get Beds for Selected Room
  const {data: beds = [], isLoading: loadingBeds, refetch: refetchBeds} = useQuery({
    queryKey: ["beds", selectedRoomId],
    queryFn: () => getBedsByRoom(selectedRoomId),
    enabled: !!selectedRoomId,
  });

  // Mutation: Delete Bed
  const deleteMutation = useMutation({
    mutationFn: (id) => deleteBed(id),
    onSuccess: () => {
      messageApi.success("Bed deleted successfully");
      queryClient.invalidateQueries(["beds", selectedRoomId]);
      setBedToDelete(null);
    },
    onError: (error) => {
      messageApi.error(error.message || "Failed to delete bed");
      setBedToDelete(null);
    },
  });

  // Filtered beds list
  const filteredBeds = useMemo(() => {
    return beds.filter((bed) => {
      const matchesSearch = bed.name?.toLowerCase().includes(searchTerm.toLowerCase());
      
      let matchesStatus = true;
      if (statusFilter !== "All") {
        if (statusFilter === "Available") {
          matchesStatus = bed.status === "Active" && !bed.assignedTo;
        } else if (statusFilter === "Assigned") {
          matchesStatus = bed.status === "Active" && !!bed.assignedTo;
        } else if (statusFilter === "Inactive") {
          matchesStatus = bed.status === "Inactive";
        }
      }

      return matchesSearch && matchesStatus;
    });
  }, [beds, searchTerm, statusFilter]);

  const unconvertedBedsCount = useMemo(() => {
    return beds.filter((b) => !b.isConvertedToAsset).length;
  }, [beds]);

  const handleAddBed = () => {
    if (!selectedRoomId) {
      messageApi.warning("Please select a room first");
      return;
    }
    setEditingBed(null);
    setIsBedModalOpen(true);
  };

  const handleEditBed = (bed) => {
    setEditingBed(bed);
    setIsBedModalOpen(true);
  };

  const handleDeleteClick = (bed) => {
    if (bed.assignedTo) {
      setShowAssignedWarning(true);
    } else {
      setBedToDelete(bed);
    }
  };

  const handleConfirmDelete = () => {
    if (bedToDelete) {
      deleteMutation.mutate(bedToDelete._id);
    }
  };

  const handleModalSuccess = () => {
    setIsBedModalOpen(false);
    setIsConvertModalOpen(false);
    refetchBeds();
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("All");
  };

  return (
    <div className="min-h-screen bg-gray-50 xl:px-12 lg:px-4 lg:pt-6 lg:pb-12 px-4 pt-4 pb-8">
      {contextHolder}

      <PageHeader
        title={
          !selectedProperty?.id || selectedProperty.id === "null" || selectedProperty?.name === ""
            ? "Bed Management"
            : `Bed Management - ${selectedProperty.name.replace(`${user.companyName} - `, "")}`
        }
        subtitle="Manage room beds, occupancy state, and asset conversions"
      />

      {/* Filters Section */}
      <Card className="mb-6 shadow-sm" bodyStyle={{padding: "16px"}}>
        <Row gutter={[16, 16]} align="middle">
          {/* Floor Selection */}
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="Select Floor"
              style={{width: "100%"}}
              value={selectedFloorId}
              onChange={setSelectedFloorId}
              loading={loadingFloors}
              disabled={!selectedProperty?.id}
              allowClear
            >
              {floors.map((floor) => (
                <Option key={floor._id} value={floor._id}>
                  {floor.floorName || `Floor ${floor.floorNo}`}
                </Option>
              ))}
            </Select>
          </Col>

          {/* Room Selection */}
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="Select Room"
              style={{width: "100%"}}
              value={selectedRoomId}
              onChange={setSelectedRoomId}
              loading={loadingRooms}
              disabled={!selectedFloorId}
              allowClear
            >
              {rooms.map((room) => (
                <Option key={room._id} value={room._id}>
                  Room {room.roomNo}
                </Option>
              ))}
            </Select>
          </Col>

          {/* Search bar */}
          <Col xs={24} sm={12} md={6}>
            <Input
              placeholder="Search by Bed Name"
              prefix={<SearchOutlined className="text-gray-400" />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={!selectedRoomId}
              allowClear
            />
          </Col>

          {/* Status Filter */}
          <Col xs={24} sm={12} md={6}>
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              style={{width: "100%"}}
              disabled={!selectedRoomId}
            >
              <Option value="All">All Statuses</Option>
              <Option value="Available">Available</Option>
              <Option value="Assigned">Assigned</Option>
              <Option value="Inactive">Inactive</Option>
            </Select>
          </Col>

          {/* Action Buttons */}
          {selectedRoomId && (
            <Col span={24}>
              <div style={{display: "flex", gap: "12px", justifyContent: "flex-end"}}>
                <Tooltip title={unconvertedBedsCount === 0 ? "All beds in this room are already converted" : ""}>
                  <Button
                    type="default"
                    icon={<SettingOutlined />}
                    disabled={unconvertedBedsCount === 0}
                    onClick={() => setIsConvertModalOpen(true)}
                  >
                    Convert to Assets ({unconvertedBedsCount})
                  </Button>
                </Tooltip>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleAddBed}
                  style={{backgroundColor: "#059669", borderColor: "#059669"}}
                >
                  Add Bed
                </Button>
              </div>
            </Col>
          )}
        </Row>
      </Card>

      {/* Main Grid / Display Area */}
      <div style={{marginTop: 16}}>
        {!selectedFloorId ? (
          <Card style={{textAlign: "center", py: 12}}>
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Please select a floor first" />
          </Card>
        ) : !selectedRoomId ? (
          <Card style={{textAlign: "center", py: 12}}>
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Please select a room to view beds" />
          </Card>
        ) : loadingBeds ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[1, 2, 3].map((i) => (
              <Card key={i} loading={true} style={{borderRadius: 8}} />
            ))}
          </div>
        ) : filteredBeds.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredBeds.map((bed) => {
              const isAssigned = !!bed.assignedTo;
              const isActive = bed.status === "Active";
              
              // Status Config
              let statusLabel = "Inactive";
              let statusClass = "bg-gray-100 text-gray-800 border-gray-200";
              let statusIcon = <FiXCircle className="mr-1.5" size={14} />;

              if (isActive) {
                if (isAssigned) {
                  statusLabel = "Assigned";
                  statusClass = "bg-blue-100 text-blue-800 border-blue-200";
                  statusIcon = <FiUsers className="mr-1.5" size={14} />;
                } else {
                  statusLabel = "Available";
                  statusClass = "bg-emerald-100 text-emerald-800 border-emerald-200";
                  statusIcon = <FiCheckCircle className="mr-1.5" size={14} />;
                }
              }

              return (
                <div
                  key={bed._id}
                  className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col"
                >
                  {/* Card Header */}
                  <div className="flex justify-between items-center p-4 bg-gray-50 border-b">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-50 text-[#059669] rounded-lg">
                        <FaBed size={18} />
                      </div>
                      <h3 className="font-semibold text-gray-800">
                        {bed.name}
                      </h3>
                    </div>
                    <div className="flex gap-2">
                      <button
                        className="cursor-pointer p-1.5 text-gray-500 hover:text-[#059669] hover:bg-emerald-50 rounded transition-colors"
                        onClick={() => handleEditBed(bed)}
                        aria-label="Edit Bed"
                      >
                        <FiEdit2 size={15} />
                      </button>
                      <button
                        className="cursor-pointer p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        onClick={() => handleDeleteClick(bed)}
                        aria-label="Delete Bed"
                      >
                        <FiTrash2 size={15} />
                      </button>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Status Badges Row */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${statusClass}`}>
                          {statusIcon}
                          {statusLabel}
                        </span>

                        {bed.isConvertedToAsset ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border bg-amber-50 text-amber-800 border-amber-200">
                            ⭐ Asset Created
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border bg-slate-50 text-slate-500 border-slate-200">
                            Unconverted
                          </span>
                        )}
                      </div>

                      {/* Occupant Detail */}
                      {isAssigned && (
                        <div className="bg-blue-50/50 p-2.5 rounded-lg border border-blue-100/50">
                          <Text type="secondary" className="block text-xs">Resident Assigned</Text>
                          <Text strong className="text-sm text-blue-900">
                            {typeof bed.assignedTo === "object" ? bed.assignedTo.name : `ID: ${bed.assignedTo}`}
                          </Text>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <Card style={{textAlign: "center", py: 12}}>
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={searchTerm ? "No beds match your search term" : "No beds created in this room yet"}
            />
          </Card>
        )}
      </div>

      {/* Bed CRUD Modal */}
      <BedModal
        open={isBedModalOpen}
        editingBed={editingBed}
        selectedPropertyId={selectedProperty?.id}
        selectedFloorId={selectedFloorId}
        selectedRoomId={selectedRoomId}
        onSuccess={handleModalSuccess}
        onCancel={() => setIsBedModalOpen(false)}
      />

      {/* Conversion Modal */}
      <ConvertToAssetModal
        open={isConvertModalOpen}
        roomId={selectedRoomId}
        selectedPropertyId={selectedProperty?.id}
        unconvertedBeds={beds.filter((b) => !b.isConvertedToAsset)}
        onSuccess={handleModalSuccess}
        onCancel={() => setIsConvertModalOpen(false)}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        title="Delete Bed"
        open={!!bedToDelete}
        onOk={handleConfirmDelete}
        onCancel={() => setBedToDelete(null)}
        okText="Delete"
        okType="danger"
        cancelText="Cancel"
        confirmLoading={deleteMutation.isPending}
      >
        <p>Are you sure you want to delete <Text strong>{bedToDelete?.name}</Text>? This action cannot be undone.</p>
      </Modal>

      {/* Assigned Bed Warning Modal */}
      <Modal
        title={
          <span style={{display: "flex", alignItems: "center", gap: 8}}>
            <ExclamationCircleFilled style={{color: "#faad14", fontSize: 20}} />
            Bed Occupied
          </span>
        }
        open={showAssignedWarning}
        onOk={() => setShowAssignedWarning(false)}
        onCancel={() => setShowAssignedWarning(false)}
        okText="OK"
        cancelButtonProps={{style: {display: "none"}}}
        centered
      >
        <p>This bed is currently assigned to a resident. Please vacate or change the room/bed of the resident before deleting this bed.</p>
      </Modal>
    </div>
  );
};

export default BedManagement;
