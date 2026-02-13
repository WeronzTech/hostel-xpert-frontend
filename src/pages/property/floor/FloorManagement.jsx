import {useState, useMemo} from "react";
import {useSelector} from "react-redux";
import {useQuery, useQueryClient} from "@tanstack/react-query";
import {Row, Col, Card, Button, Input, Empty, message} from "antd";
import {PlusOutlined, SearchOutlined} from "@ant-design/icons";
import {getFloorsByPropertyId} from "../../../hooks/property/useProperty";
import FloorModal from "../../../modals/property/FloorModal";
import FloorCard from "../../../components/property/floor/FloorCard";
import {PageHeader} from "../../../components";

const FloorManagement = () => {
  const {user} = useSelector((state) => state.auth);
  const {selectedProperty} = useSelector((state) => state.properties);
  const queryClient = useQueryClient();
  const [messageApi, contextHolder] = message.useMessage();

  const [searchTerm, setSearchTerm] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingFloor, setEditingFloor] = useState(null);

  // TanStack Query for fetching floors
  const {
    data: floorsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["floors", selectedProperty?.id],
    queryFn: () => getFloorsByPropertyId(selectedProperty.id),
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    retry: 1,
    onError: (err) => {
      message.error(err.message || "Failed to load floors");
    },
  });

  const floors = floorsData || [];

  // Filtered and searched floors
  const filteredFloors = useMemo(() => {
    return floors.filter((floor) => {
      const matchesSearch =
        floor.floorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        floor.floorNo?.toString().includes(searchTerm) ||
        floor.description?.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesSearch;
    });
  }, [floors, searchTerm]);

  const handleAddFloor = () => {
    if (!selectedProperty?.id) {
      messageApi.warning("Please select a property first");
      return;
    }
    setEditingFloor(null);
    setIsModalVisible(true);
  };

  const handleEditFloor = (floor) => {
    setEditingFloor(floor);
    setIsModalVisible(true);
  };

  const handleDeleteFloor = (deletedFloor) => {
    queryClient.setQueryData(["floors", selectedProperty?.id], (oldData) => {
      if (!oldData) return oldData;
      return oldData.filter((floor) => floor._id !== deletedFloor._id);
    });

    messageApi.success(
      `Floor "${deletedFloor.floorName}" deleted successfully`,
    );
  };

  const handleModalSuccess = () => {
    setIsModalVisible(false);
    queryClient.invalidateQueries(["floors", selectedProperty?.id]);
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setEditingFloor(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 xl:px-12 lg:px-4 lg:pt-6 lg:pb-12 px-4 pt-4 pb-8">
      {contextHolder}

      <PageHeader
        title={
          !selectedProperty?.id ||
          selectedProperty.id === "null" ||
          selectedProperty?.name === ""
            ? "Floor Management"
            : `Floor Management - ${selectedProperty.name.replace(`${user.companyName} - `, "")}`
        }
        subtitle={
          !selectedProperty?.id ||
          selectedProperty.id === "null" ||
          selectedProperty?.name === ""
            ? "Manage all floors across properties"
            : `Manage floor for ${selectedProperty.name.replace(
                `${user.companyName} - `,
                "",
              )}`
        }
      />

      {/* Filters Section */}
      <Card className="mb-6 shadow-sm" bodyStyle={{padding: "10px"}}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={8}>
            <Input
              placeholder="Search floors by name, number, or description..."
              prefix={<SearchOutlined />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="medium"
              allowClear
            />
          </Col>

          <Col xs={24} md={4}>
            <div style={{color: isLoading ? "#999" : "#666"}}>
              {!isLoading && `${filteredFloors.length} floor(s) found`}
            </div>
          </Col>
          <Col xs={24} md={12} style={{textAlign: "right"}}>
            <div
              style={{
                display: "flex",
                gap: "8px",
                justifyContent: "flex-end",
              }}
            >
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAddFloor}
                size="medium"
                style={{backgroundColor: "#059669", borderColor: "#059669"}}
              >
                Add Floor
              </Button>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Floors Grid */}
      <Row gutter={[16, 16]} style={{marginTop: 16}}>
        {isLoading ? (
          <Col span={24}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="bg-white rounded-lg border border-gray-200 overflow-hidden h-full flex flex-col"
                >
                  {/* Header - matches FloorCard header */}
                  <div className="flex justify-between items-center p-3 bg-gray-50 border-b">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
                      <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                    <div className="flex gap-1">
                      <div className="w-7 h-7 bg-gray-200 rounded-full animate-pulse"></div>
                      <div className="w-7 h-7 bg-gray-200 rounded-full animate-pulse"></div>
                    </div>
                  </div>

                  {/* Body - matches FloorCard content */}
                  <div className="p-3 space-y-3 flex-1">
                    {/* Floor Number skeleton */}
                    <div className="flex items-center justify-between bg-gray-50 p-2 rounded-lg">
                      <div className="h-3 w-16 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                    </div>

                    {/* Statistics Grid - 2x2 */}
                    <div className="grid grid-cols-2 gap-2">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="bg-gray-50 p-2 rounded">
                          <div className="h-3 w-16 bg-gray-200 rounded animate-pulse mb-1"></div>
                          <div className="h-6 w-8 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                      ))}
                    </div>

                    {/* Room Types skeleton */}
                    <div className="bg-gray-50 p-2 rounded">
                      <div className="h-3 w-20 bg-gray-200 rounded animate-pulse mb-2"></div>
                      <div className="flex gap-1">
                        <div className="h-5 w-16 bg-gray-200 rounded-full animate-pulse"></div>
                        <div className="h-5 w-16 bg-gray-200 rounded-full animate-pulse"></div>
                      </div>
                    </div>

                    {/* Description skeleton - optional */}
                    <div className="bg-gray-50 p-2 rounded">
                      <div className="h-3 w-20 bg-gray-200 rounded animate-pulse mb-1"></div>
                      <div className="h-3 w-full bg-gray-200 rounded animate-pulse mb-1"></div>
                      <div className="h-3 w-3/4 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </div>

                  {/* Footer - matches FloorCard footer */}
                  <div className="px-3 py-2 bg-gray-50 border-t">
                    <div className="h-8 w-full bg-gray-200 rounded-lg animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          </Col>
        ) : error ? (
          <Col span={24}>
            <Card>
              <Empty
                description={
                  <span style={{color: "red"}}>{error?.message}</span>
                }
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            </Card>
          </Col>
        ) : filteredFloors.length > 0 ? (
          filteredFloors.map((floor) => (
            <Col xs={24} sm={12} lg={8} xl={6} key={floor._id}>
              <FloorCard
                floor={floor}
                onEdit={handleEditFloor}
                onDelete={handleDeleteFloor}
              />
            </Col>
          ))
        ) : (
          <Col span={24}>
            <Card>
              <Empty
                description={
                  searchTerm
                    ? "No floors match your search criteria"
                    : "No floors available."
                }
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              ></Empty>
            </Card>
          </Col>
        )}
      </Row>

      {/* Floor Modal */}
      <FloorModal
        visible={isModalVisible}
        editingFloor={editingFloor}
        selectedProperty={selectedProperty}
        onSuccess={handleModalSuccess}
        onCancel={handleModalCancel}
      />
    </div>
  );
};

export default FloorManagement;
