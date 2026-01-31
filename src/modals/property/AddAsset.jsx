import React, { useState } from "react";
import {
  Modal,
  Form,
  Input,
  InputNumber,
  DatePicker,
  Switch,
  Select,
  Button,
  Row,
  Col,
  message,
  Upload,
  Tag,
} from "antd";
import {
  PlusOutlined,
  UploadOutlined,
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { useSelector } from "react-redux";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Import your actual API functions
import {
  createAssetCategory,
  getAssetCategory,
  addAsset,
  addMultipleAsset,
  updateAssetCategory,
  deleteAssetCategory,
} from "../../hooks/property/useProperty.js";
import {
  getFloorsByPropertyId,
  getRoomsByFloorId,
} from "../../hooks/property/useProperty.js";

// Ant Design's Select component option
const { Option } = Select;
const { TextArea } = Input;

// Asset Status Options
const ASSET_STATUS_OPTIONS = [
  { value: "Active", label: "Active", color: "green" },
  { value: "In-Repair", label: "In Repair", color: "orange" },
  { value: "Retired", label: "Retired", color: "red" },
  { value: "Sold", label: "Sold", color: "purple" },
  { value: "In Inventory", label: "In Inventory", color: "blue" },
];

// Custom Hooks with TanStack Query v5
const useAssetCategories = () => {
  return useQuery({
    queryKey: ['assetCategories'],
    queryFn: async () => {
      const response = await getAssetCategory();
      let catsData = [];
      
      if (response && response.success && response.data) {
        catsData = response.data;
      } else if (Array.isArray(response)) {
        catsData = response;
      } else if (response && response.data) {
        catsData = response.data;
      }
      
      return Array.isArray(catsData) ? catsData : [];
    },
  });
};

const useCreateAssetCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createAssetCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assetCategories'] });
    },
  });
};

const useUpdateAssetCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => updateAssetCategory(data, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assetCategories'] });
    },
  });
};

const useDeleteAssetCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (categoryId) => deleteAssetCategory(categoryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assetCategories'] });
    },
    onError: (error) => {
      console.error('Delete category error:', error);
      // Error message will be handled in the handleDeleteCategory function
    },
  });
};

const useFloors = (propertyId) => {
  return useQuery({
    queryKey: ['floors', propertyId],
    queryFn: async () => {
      if (!propertyId) return [];
      
      const response = await getFloorsByPropertyId(propertyId);
      let floorsData = [];
      
      if (response && response.success && response.data) {
        floorsData = response.data;
      } else if (Array.isArray(response)) {
        floorsData = response;
      } else if (response && response.data) {
        floorsData = response.data;
      }
      
      return Array.isArray(floorsData) ? floorsData : [];
    },
    enabled: !!propertyId,
  });
};

const useRooms = (floorId) => {
  return useQuery({
    queryKey: ['rooms', floorId],
    queryFn: async () => {
      if (!floorId) return [];
      
      const response = await getRoomsByFloorId(floorId);
      let roomsData = [];
      
      if (response && response.success && response.data) {
        roomsData = response.data;
      } else if (Array.isArray(response)) {
        roomsData = response;
      } else if (response && response.data) {
        roomsData = response.data;
      }
      
      return Array.isArray(roomsData) ? roomsData : [];
    },
    enabled: !!floorId,
  });
};

const useCreateAsset = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: addAsset,
    onSuccess: () => {
      // Invalidate the assets query to trigger a refetch
      queryClient.invalidateQueries({ queryKey: ['assets'] });
    },
  });
};

const useCreateMultipleAssets = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: addMultipleAsset,
    onSuccess: () => {
      // Invalidate the assets query to trigger a refetch
      queryClient.invalidateQueries({ queryKey: ['assets'] });
    },
  });
};

// Category Modal Component
const CategoryModal = ({ 
  isOpen, 
  onClose, 
  editingCategory,
  onCategoryAdded 
}) => {
  const [form] = Form.useForm();
  
  const createMutation = useCreateAssetCategory();
  const updateMutation = useUpdateAssetCategory();

  const handleSubmit = async (values) => {
    try {
      if (editingCategory) {
        const response = await updateMutation.mutateAsync({
          id: editingCategory.id || editingCategory._id,
          data: values
        });
        
        if (response?.success) {
          message.success('Category updated successfully');
          handleClose();
        } else {
          throw new Error(response?.message || 'Failed to update category');
        }
      } else {
        const response = await createMutation.mutateAsync(values);
        if (response?.success) {
          message.success('Category added successfully');
          if (onCategoryAdded && response.data) {
            const newCategory = response.data;
            const categoryId = newCategory.id || newCategory._id;
            onCategoryAdded(categoryId);
          }
          handleClose();
        } else {
          throw new Error(response?.message || 'Failed to add category');
        }
      }
    } catch (error) {
      console.error('Failed to save category:', error);
      message.error(error.message || 'Failed to save category');
    }
  };

  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  React.useEffect(() => {
    if (isOpen && editingCategory) {
      form.setFieldsValue({
        name: editingCategory.name,
        description: editingCategory.description || ''
      });
    } else if (isOpen) {
      form.resetFields();
    }
  }, [isOpen, editingCategory, form]);

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Modal
      title={editingCategory ? "Edit Category" : "Add New Category"}
      open={isOpen}
      onCancel={handleClose}
      footer={[
        <Button key="cancel" onClick={handleClose}>
          Cancel
        </Button>,
        <Button 
          key="submit" 
          type="primary" 
          loading={isLoading}
          onClick={() => form.submit()}
        >
          {editingCategory ? "Update Category" : "Add Category"}
        </Button>,
      ]}
      width={400}
      centered
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Form.Item
          name="name"
          label="Category Name"
          rules={[
            { required: true, message: "Please enter category name" },
            { min: 2, message: "Category name must be at least 2 characters" }
          ]}
        >
          <Input placeholder="Enter category name" />
        </Form.Item>
        
        <Form.Item
          name="description"
          label="Description (Optional)"
        >
          <TextArea 
            rows={3} 
            placeholder="Enter category description" 
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

// Status Tag Component (for displaying selected status)
const StatusTag = ({ status }) => {
  const statusConfig = ASSET_STATUS_OPTIONS.find(option => option.value === status);
  return (
    <Tag color={statusConfig?.color || "default"}>
      {statusConfig?.label || status}
    </Tag>
  );
};

// Main Component
const AddAsset = ({ isOpen, onClose }) => {
  const [form] = Form.useForm();
  const [hasWarranty, setHasWarranty] = useState(false);
  const [invoiceFile, setInvoiceFile] = useState(null);
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [warningModalVisible, setWarningModalVisible] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');

  // Get selected property from Redux with safe access
  const selectedProperty = useSelector((state) => {
    return (
      state?.property?.selectedProperty ||
      state?.selectedProperty ||
      state?.properties?.selectedProperty ||
      null
    );
  });

  // TanStack Query hooks
  const { data: categories = [], isLoading: loadingCats } = useAssetCategories();
  const { data: floors = [], isLoading: loadingFloors } = useFloors(selectedProperty?.id);
  const [selectedFloorId, setSelectedFloorId] = useState(null);
  const { data: rooms = [], isLoading: loadingRooms } = useRooms(selectedFloorId);
  
  const createAssetMutation = useCreateAsset();
  const createMultipleAssetsMutation = useCreateMultipleAssets();
  const deleteCategoryMutation = useDeleteAssetCategory();

  // Watch the 'status' field
  const assetStatus = Form.useWatch("status", form);
  // Watch the 'category' field to know which category is selected
  const selectedCategoryId = Form.useWatch("category", form);

  // Handle file upload
  const handleFileUpload = (file) => {
    setInvoiceFile(file);
    return false;
  };

  // Convert file to base64 for backend processing
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = reader.result.split(",")[1];
        resolve({
          buffer: base64,
          originalname: file.name,
          mimetype: file.type,
        });
      };
      reader.onerror = (error) => reject(error);
    });
  };

  // Handle form submission for both normal and bulk modes
  const handleSave = async (values) => {
    if (!selectedProperty?.id) {
      message.error("Please select a property first");
      return;
    }

    try {
      console.log("Form values:", values);

      // Prepare the purchaseDetails object
      const purchaseDetails = {
        purchaseDate: values.purchasedDate
          ? values.purchasedDate.toDate()
          : new Date(),
        vendor: String(values.shopName || ""),
        price: Number(values.purchasedPrice || 0),
        invoiceUrl: "",
      };

      // Prepare the asset data for payload
      const payload = {
        name: String(values.assetName || ""),
        categoryId: String(values.category || ""),
        description: String(values.description || ""),
        propertyId: String(selectedProperty.id || ""),
        floorId: String(values.floorId || ""),
        purchaseDetails: purchaseDetails,
        status: values.status || "Active",
      };

      // Add roomId only if it exists (not required field)
      if (values.roomId) {
        payload.roomId = String(values.roomId || "");
      }

      // Add warranty details only if warranty is enabled
      if (hasWarranty && values.warrantyProvider) {
        payload.warrantyDetails = {
          provider: String(values.warrantyProvider || ""),
          expiryDate: values.warrantyTill
            ? values.warrantyTill.toDate()
            : new Date(),
          notes: String(values.warrantyNotes || ""),
        };
      }

      console.log("Prepared payload:", payload);

      // Prepare the final data object with ONLY payload and files
      const finalData = {
        ...payload, // This contains all the asset data
      };

      // Add files if invoice exists
      if (invoiceFile) {
        try {
          const invoiceBase64 = await fileToBase64(invoiceFile);
          finalData.files = {
            invoice: {
              buffer: invoiceBase64.buffer,
              originalname: invoiceFile.name,
            }
          };
          console.log("File attached to finalData");
        } catch (error) {
          console.error("Failed to process invoice file:", error);
          message.error("Failed to process invoice file");
          return;
        }
      }

      let response;

      if (isBulkMode) {
        // For bulk mode, add count to the finalData
        finalData.count = values.quantity || 1;
        
        console.log("Bulk finalData to backend:", finalData);
        response = await createMultipleAssetsMutation.mutateAsync(finalData);
      } else {
        // Single asset creation - send finalData with payload and files
        console.log("Single finalData to backend:", finalData);
        response = await createAssetMutation.mutateAsync(finalData);
      }

      console.log("API Response:", response);

      if (response.success) {
        message.success(
          response.message ||
            `Asset${isBulkMode ? "s" : ""} created successfully`
        );
        handleCancel();
      } else {
        throw new Error(
          response.message || `Failed to create asset${isBulkMode ? "s" : ""}`
        );
      }
    } catch (error) {
      console.error("Failed to save asset:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.details?.message ||
        error.message ||
        `Failed to save asset${isBulkMode ? "s" : ""}`;
      message.error(errorMessage);
    }
  };

  // Handle modal cancellation
  const handleCancel = () => {
    form.resetFields();
    setHasWarranty(false);
    setInvoiceFile(null);
    setIsBulkMode(false);
    setEditingCategory(null);
    setSelectedFloorId(null);
    onClose();
  };

  // Handle bulk mode toggle
  const handleBulkModeToggle = (checked) => {
    setIsBulkMode(checked);
  };

  // Handle floor selection change
  const onFloorChange = (value) => {
    setSelectedFloorId(value);
    form.setFieldsValue({
      roomId: null,
    });
  };

  // Handle opening category modal for adding new category
  const handleOpenCategoryModal = () => {
    setEditingCategory(null);
    setIsCategoryModalOpen(true);
  };

  // Handle opening category modal for editing
  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setIsCategoryModalOpen(true);
  };

  // Handle closing category modal
  const handleCloseCategoryModal = () => {
    setIsCategoryModalOpen(false);
    setEditingCategory(null);
  };

  // Handle category added callback
  const handleCategoryAdded = (categoryId) => {
    form.setFieldsValue({
      category: categoryId,
    });
  };

  // Show warning modal
  const showWarningModal = (message) => {
    setWarningMessage(message);
    setWarningModalVisible(true);
  };

  // Handle deleting category - Direct deletion without confirmation
  const handleDeleteCategory = async (category) => {
    const categoryId = category.id || category._id;

    try {
      console.log('Deleting category with ID:', categoryId);
      const response = await deleteCategoryMutation.mutateAsync(categoryId);
      console.log('Delete response:', response);

      if (response && response.success) {
        message.success(response.message || "Category deleted successfully");
        
        // If the deleted category was currently selected, clear the selection
        if (selectedCategoryId === categoryId) {
          form.setFieldsValue({
            category: null,
          });
        }
      } else {
        // Show error message only if it's about associated assets
        if (response?.message?.includes('associated with') || response?.message?.includes('asset')) {
          showWarningModal(response.message);
        } else {
          throw new Error(response?.message || "Failed to delete category");
        }
      }
    } catch (error) {
      console.error("Failed to delete category:", error);
      // Only show warning modal if it's about associated assets, otherwise show generic error
      if (error.message?.includes('associated with') || error.message?.includes('asset')) {
        showWarningModal(error.message);
      } else {
        message.error("Failed to delete category");
      }
    }
  };

  const saving = createAssetMutation.isPending || createMultipleAssetsMutation.isPending;

  return (
    <>
      <Modal
        title={`Add New ${isBulkMode ? "Bulk Assets" : "Asset"}`}
        open={isOpen}
        onCancel={handleCancel}
        footer={null}
        width={700}
      >
        {/* Bulk/Normal Mode Toggle */}
        <div
          style={{
            marginBottom: "16px",
            padding: "12px",
            backgroundColor: "#f0f8ff",
            borderRadius: "6px",
            border: "1px solid #1890ff",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>
            <strong>Mode:</strong>{" "}
            {isBulkMode ? "Bulk Asset Creation" : "Single Asset"}
          </span>
          <Switch
            checked={isBulkMode}
            onChange={handleBulkModeToggle}
            checkedChildren="Bulk"
            unCheckedChildren="Single"
          />
        </div>

        {/* Display selected property information */}
        {selectedProperty ? (
          <div
            style={{
              marginBottom: "16px",
              padding: "12px",
              backgroundColor: "#f5f5f5",
              borderRadius: "6px",
              border: "1px solid #d9d9d9",
            }}
          >
            <strong>Selected Property:</strong> {selectedProperty.name}
            {selectedProperty.address && (
              <div
                style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}
              >
                {selectedProperty.address}
              </div>
            )}
          </div>
        ) : (
          <div
            style={{
              marginBottom: "16px",
              padding: "12px",
              backgroundColor: "#fff2f0",
              borderRadius: "6px",
              border: "1px solid #ffccc7",
              color: "#a8071a",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span>⚠️</span>
            <span>Select any property to add assets</span>
          </div>
        )}

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          style={{ marginTop: "24px" }}
          initialValues={{ status: "Active", quantity: 1 }}
        >
          <Row gutter={16}>
            {/* Asset Name */}
            <Col span={24}>
              <Form.Item
                name="assetName"
                label="Asset Name"
                rules={[
                  { required: true, message: "Please enter the asset name" },
                ]}
              >
                <Input placeholder="e.g., 5-Star Air Conditioner" />
              </Form.Item>
            </Col>

            {/* Description */}
            <Col span={24}>
              <Form.Item name="description" label="Description">
                <TextArea
                  rows={3}
                  placeholder="Enter asset description (optional)"
                />
              </Form.Item>
            </Col>

            {/* Quantity - Only show in bulk mode */}
            {isBulkMode && (
              <Col span={8}>
                <Form.Item
                  name="quantity"
                  label="Quantity"
                  rules={[{ required: true, message: "Please enter quantity" }]}
                >
                  <InputNumber
                    min={1}
                    max={1000}
                    style={{ width: "100%" }}
                    placeholder="Number of assets"
                  />
                </Form.Item>
              </Col>
            )}

            {/* Purchased Price */}
            <Col span={isBulkMode ? 8 : 12}>
              <Form.Item
                name="purchasedPrice"
                label="Purchased Price"
                rules={[
                  {
                    required: true,
                    message: "Please enter the purchased price",
                  },
                ]}
              >
                <InputNumber
                  prefix="₹"
                  min={0}
                  style={{ width: "100%" }}
                  placeholder="45000"
                />
              </Form.Item>
            </Col>

            {/* Purchased Date */}
            <Col span={isBulkMode ? 8 : 12}>
              <Form.Item
                name="purchasedDate"
                label="Purchased Date"
                rules={[
                  {
                    required: true,
                    message: "Please select the purchased date",
                  },
                ]}
              >
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>

            {/* Shop Name (Vendor) */}
            <Col span={12}>
              <Form.Item
                name="shopName"
                label="Vendor/Shop Name"
                rules={[
                  { required: true, message: "Please enter vendor/shop name" },
                ]}
              >
                <Input placeholder="e.g., Reliance Digital" />
              </Form.Item>
            </Col>

            {/* Invoice Upload */}
            <Col span={12}>
              <Form.Item label="Purchase Invoice (Optional)">
                <Upload
                  beforeUpload={handleFileUpload}
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  showUploadList={false}
                >
                  <Button icon={<UploadOutlined />}>
                    {invoiceFile ? invoiceFile.name : "Upload Invoice"}
                  </Button>
                </Upload>
                {invoiceFile && (
                  <div style={{ marginTop: 8, color: "#52c41a" }}>
                    ✓ {invoiceFile.name}
                  </div>
                )}
              </Form.Item>
            </Col>

            {/* Warranty Toggle */}
            <Col span={12}>
              <Form.Item
                name="hasWarranty"
                label="Does this have a warranty?"
                valuePropName="checked"
              >
                <Switch onChange={setHasWarranty} />
              </Form.Item>
            </Col>

            {/* Asset Status Dropdown */}
            <Col span={12}>
              <Form.Item
                name="status"
                label="Asset Status"
                rules={[
                  { required: true, message: "Please select asset status" },
                ]}
              >
                <Select 
                  placeholder="Select asset status"
                >
                  {ASSET_STATUS_OPTIONS.map((status) => (
                    <Option 
                      key={status.value} 
                      value={status.value}
                    >
                      {status.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            {/* Category Field */}
            <Col span={12}>
              <Form.Item
                name="category"
                label={
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span>Category</span>
                    <Button
                      type="link"
                      icon={<PlusOutlined />}
                      size="small"
                      onClick={handleOpenCategoryModal}
                      style={{ padding: 0, height: "auto" }}
                    >
                      Add New
                    </Button>
                  </div>
                }
                rules={[
                  { required: true, message: "Please select a category" },
                ]}
              >
                <Select placeholder="Choose a category" loading={loadingCats}>
                  {categories.map((cat) => (
                    <Option key={cat.id || cat._id} value={cat.id || cat._id}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          width: "100%",
                        }}
                      >
                        <span>{cat.name}</span>
                        <div style={{ display: "flex", gap: "4px", marginLeft: "8px" }}>
                          <Button
                            type="text"
                            icon={<EditOutlined />}
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditCategory(cat);
                            }}
                            style={{ 
                              color: '#1890ff'
                            }}
                          />
                          <Button
                            type="text"
                            icon={<DeleteOutlined />}
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteCategory(cat);
                            }}
                            style={{ 
                              color: '#ff4d4f'
                            }}
                          />
                        </div>
                      </div>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            {/* Conditional Warranty Fields - Only show when warranty is enabled */}
            {hasWarranty && (
              <>
                {/* Warranty Provider - Only shown when warranty is enabled */}
                <Col span={12}>
                  <Form.Item
                    name="warrantyProvider"
                    label="Warranty Provider"
                    rules={[
                      {
                        required: true,
                        message: "Please enter warranty provider",
                      },
                    ]}
                  >
                    <Input placeholder="e.g., Manufacturer, Service Provider" />
                  </Form.Item>
                </Col>

                {/* Warranty End Date */}
                <Col span={12}>
                  <Form.Item
                    name="warrantyTill"
                    label="Warranty Till"
                    rules={[
                      {
                        required: true,
                        message: "Please select warranty end date",
                      },
                    ]}
                  >
                    <DatePicker style={{ width: "100%" }} />
                  </Form.Item>
                </Col>

                {/* Warranty Notes */}
                <Col span={24}>
                  <Form.Item
                    name="warrantyNotes"
                    label="Warranty Notes (Optional)"
                  >
                    <TextArea rows={2} placeholder="Enter any warranty notes" />
                  </Form.Item>
                </Col>
              </>
            )}

            {/* Select Floor */}
            <Col span={12}>
              <Form.Item
                name="floorId"
                label="Select Floor"
                rules={[{ required: true, message: "Please select a floor" }]}
              >
                <Select
                  placeholder={
                    selectedProperty?.id
                      ? "Choose a floor"
                      : "Select any property first"
                  }
                  loading={loadingFloors}
                  onChange={onFloorChange}
                  disabled={!selectedProperty?.id || loadingFloors}
                >
                  {floors.map((floor) => (
                    <Option
                      key={floor.id || floor._id}
                      value={floor.id || floor._id}
                    >
                      {floor.floorName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            {/* Select Room - NOT REQUIRED */}
            <Col span={12}>
              <Form.Item
                name="roomId"
                label="Select Room (Optional)"
              >
                <Select
                  placeholder={
                    selectedFloorId 
                      ? "Choose a room (optional)" 
                      : "Select a floor first"
                  }
                  loading={loadingRooms}
                  disabled={!selectedFloorId || loadingRooms}
                  allowClear
                >
                  {rooms.map((room) => (
                    <Option
                      key={room.id || room._id}
                      value={room.id || room._id}
                    >
                      {room.roomNo}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {/* Form Buttons */}
          <div
            style={{
              textAlign: "right",
              marginTop: "16px",
              borderTop: "1px solid #f0f0f0",
              paddingTop: "16px",
            }}
          >
            <Button onClick={handleCancel} style={{ marginRight: 8 }}>
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={saving}
              disabled={!selectedProperty?.id}
            >
              {saving ? "Saving..." : `Save ${isBulkMode ? "Assets" : "Asset"}`}
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Category Modal */}
      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={handleCloseCategoryModal}
        editingCategory={editingCategory}
        onCategoryAdded={handleCategoryAdded}
      />

      {/* Warning Modal for Associated Assets */}
      <Modal
        title={
          <div>
            <ExclamationCircleOutlined style={{ color: '#faad14', marginRight: 8 }} />
            Cannot Delete Category
          </div>
        }
        open={warningModalVisible}
        onCancel={() => setWarningModalVisible(false)}
        footer={[
          <Button key="ok" type="primary" onClick={() => setWarningModalVisible(false)}>
            OK
          </Button>,
        ]}
        width={500}
      >
        <div style={{ padding: '16px 0' }}>
          <p style={{ marginBottom: 8, fontSize: '16px' }}>
            <strong>This category cannot be deleted.</strong>
          </p>
          <p style={{ color: '#666', lineHeight: 1.5 }}>
            {warningMessage}
          </p>
          <p style={{ color: '#666', marginTop: 16, lineHeight: 1.5 }}>
            To delete this category, you must first remove or reassign all assets associated with it.
          </p>
        </div>
      </Modal>
    </>
  );
};

export default AddAsset;