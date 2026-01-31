import React, { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import {
  Row,
  Col,
  Card,
  Button,
  Input,
  Select,
  Pagination,
  Empty,
  Alert,
  Spin,
  Modal,
  message
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  ReloadOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { getFloorsByPropertyId } from '../../../hooks/property/useProperty';
import FloorStatistics from '../../../components/property/floor/FloorStatistics';
import FloorModal from '../../../modals/property/FloorModal';
import FloorCard from '../../../components/property/floor/FloorCard';

const { Option } = Select;
const { confirm } = Modal;
const FloorManagement = () => {
  const { user } = useSelector((state) => state.auth);
  const { selectedProperty } = useSelector((state) => state.properties);
  const [floors, setFloors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingFloor, setEditingFloor] = useState(null);

  // Fetch floors data
  const fetchFloors = async () => {
    console.log('Fetching floors for property:', selectedProperty);
    
    if (!selectedProperty?.id) {
      setError('No property selected. Please select a property first.');
      setFloors([]);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await getFloorsByPropertyId(selectedProperty.id);
      setFloors(response.data || []);
    } catch (err) {
      console.error('Error fetching floors:', err);
      setError(err.message || 'Failed to fetch floors');
      setFloors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedProperty?.id) {
      fetchFloors();
    } else {
      setFloors([]);
      setError('Please select a property first');
    }
  }, [selectedProperty?.id]);

  // Filtered and searched floors
  const filteredFloors = useMemo(() => {
    return floors.filter(floor => {
      const matchesSearch = floor.floorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           floor.floorNo?.toString().includes(searchTerm) ||
                           floor.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || floor.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [floors, searchTerm, statusFilter]);

  // Paginated floors
  const paginatedFloors = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredFloors.slice(startIndex, startIndex + pageSize);
  }, [filteredFloors, currentPage, pageSize]);

  // Handle page change to prevent empty pages after deletion
  useEffect(() => {
    if (paginatedFloors.length === 0 && currentPage > 1) {
      setCurrentPage(prev => Math.max(1, prev - 1));
    }
  }, [paginatedFloors.length, currentPage]);

  const handleAddFloor = () => {
    if (!selectedProperty?.id) {
      message.warning('Please select a property first');
      return;
    }
    setEditingFloor(null);
    setIsModalVisible(true);
  };

  const handleEditFloor = (floor) => {
    setEditingFloor(floor);
    setIsModalVisible(true);
  };

  // Updated delete handler to remove floor from state immediately
  const handleDeleteFloor = (deletedFloor) => {
    // Remove the floor from local state immediately for instant UI update
    setFloors(prevFloors => prevFloors.filter(floor => floor._id !== deletedFloor._id));
    
    // Show success message
    message.success(`Floor "${deletedFloor.floorName}" deleted successfully`);
  };

  const handleModalSuccess = () => {
    setIsModalVisible(false);
    fetchFloors(); // Refresh data after add/edit
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setEditingFloor(null);
  };

  // Refresh floors data
  const handleRefresh = () => {
    fetchFloors();
    message.info('Refreshing floors data...');
  };

  if (loading && floors.length === 0) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Spin size="large" tip="Loading floors..." />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      {/* Header Section */}
      <Row justify="space-between" align="middle" style={{ marginBottom: '24px' }}>
        <Col>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>Floor Management</h1>
          {selectedProperty?.id ? (
            <p style={{ color: '#666', margin: '4px 0 0 0' }}>
              Property: <strong>{selectedProperty.name}</strong>
            </p>
          ) : (
            <p style={{ color: '#ff4d4f', margin: '4px 0 0 0' }}>
              No property selected. Please select a property from the properties list.
            </p>
          )}
        </Col>
      </Row>

      {/* Statistics Cards */}
      <FloorStatistics floors={floors} selectedProperty={selectedProperty} />

      {/* Property Selection Alert */}
      {!selectedProperty?.id && (
        <Alert
          message="Property Not Selected"
          description="Please select a property from the properties page to manage its floors."
          type="warning"
          showIcon
          style={{ marginBottom: '24px' }}
        />
      )}

      {/* Filters Section */}
      {selectedProperty?.id && (
        <Card style={{ marginBottom: '24px' }}>
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} md={8}>
              <Input
                placeholder="Search floors by name, number, or description..."
                prefix={<SearchOutlined />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                size="large"
                allowClear
              />
            </Col>
            <Col xs={24} md={6}>
              <Select
                value={statusFilter}
                onChange={setStatusFilter}
                style={{ width: '100%' }}
                size="large"
                placeholder="Filter by status"
              >
                <Option value="all">All Status</Option>
                <Option value="Active">Active</Option>
                <Option value="Inactive">Inactive</Option>
                <Option value="Maintenance">Maintenance</Option>
              </Select>
            </Col>
            <Col xs={24} md={4}>
              <div style={{ color: '#666' }}>
                {filteredFloors.length} floor(s) found
              </div>
            </Col>
            <Col xs={24} md={6}>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleAddFloor}
                  size="large"
                >
                  Add Floor
                </Button>
              </div>
            </Col>
          </Row>
        </Card>
      )}

      {/* Error Alert */}
      {error && (
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          closable
          onClose={() => setError(null)}
          style={{ marginBottom: '24px' }}
        />
      )}

      {/* Floors Grid */}
      {selectedProperty?.id ? (
        <>
          <Row gutter={[16, 16]}>
            {paginatedFloors.length > 0 ? (
              paginatedFloors.map((floor) => (
                <Col xs={24} sm={12} lg={8} xl={6} key={floor._id}>
                  <FloorCard
                    floor={floor}
                    onEdit={handleEditFloor}
                    onDelete={handleDeleteFloor} // Pass the delete handler
                  />
                </Col>
              ))
            ) : (
              <Col span={24}>
                <Card>
                  <Empty
                    description={
                      loading 
                        ? 'Loading floors...' 
                        : floors.length === 0 
                          ? `No floors found for ${selectedProperty.name}. Click "Add Floor" to create the first floor.`
                          : 'No floors match your search filters'
                    }
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  >
                    {floors.length === 0 && (
                      <Button type="primary" onClick={handleAddFloor}>
                        Add First Floor
                      </Button>
                    )}
                  </Empty>
                </Card>
              </Col>
            )}
          </Row>

          {/* Pagination */}
          {filteredFloors.length > 0 && (
            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'center' }}>
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={filteredFloors.length}
                onChange={(page, size) => {
                  setCurrentPage(page);
                  setPageSize(size);
                }}
                showSizeChanger
                showQuickJumper
                showTotal={(total, range) => 
                  `${range[0]}-${range[1]} of ${total} items`
                }
              />
            </div>
          )}
        </>
      ) : (
        // Show when no property is selected
        <Card>
          <Empty
            description="No property selected. Please select a property from the properties list to manage floors."
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </Card>
      )}

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