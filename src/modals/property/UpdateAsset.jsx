// modals/property/UpdateAsset.js
import React, { useState, useEffect } from "react";
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
  Image,
} from "antd";
import {
  UploadOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { useSelector } from "react-redux";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";

// Import your actual API functions
import {
  getAssetCategory,
  updateAsset,
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

const useUpdateAsset = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateAsset,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
    },
  });
};

// Helper function to safely convert to dayjs
const safeDayjs = (date) => {
  if (!date) return null;
  try {
    return dayjs(date);
  } catch (error) {
    console.error('Invalid date:', date, error);
    return null;
  }
};

// Main Update Asset Modal Component
const UpdateAsset = ({ isOpen, onClose, assetData }) => {
  const [form] = Form.useForm();
  const [hasWarranty, setHasWarranty] = useState(false);
  const [invoiceFile, setInvoiceFile] = useState(null);
  const [selectedFloorId, setSelectedFloorId] = useState(null);
  const [isWarrantyChanged, setIsWarrantyChanged] = useState(false);

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
  const { data: rooms = [], isLoading: loadingRooms } = useRooms(selectedFloorId);
  
  const updateAssetMutation = useUpdateAsset();

  // Initialize form with asset data when modal opens or assetData changes
  useEffect(() => {
    if (isOpen && assetData) {
      console.log("Asset Data for form initialization:", assetData);
      
      // Extract floorId from asset data
      const floorId = assetData.floorId?._id || assetData.floorId;
      
      const initialValues = {
        assetName: assetData.name,
        description: assetData.description || '',
        purchasedPrice: assetData.purchaseDetails?.price || 0,
        purchasedDate: assetData.purchaseDetails?.purchaseDate ? 
          safeDayjs(assetData.purchaseDetails.purchaseDate) : null,
        shopName: assetData.purchaseDetails?.vendor || '',
        warrantyProvider: assetData.warrantyDetails?.provider || '',
        status: assetData.status || 'Active',
        category: assetData.categoryId?._id || assetData.categoryId,
        floorId: floorId,
        roomId: assetData.roomId?._id || assetData.roomId,
        warrantyTill: assetData.warrantyDetails?.expiryDate ? 
          safeDayjs(assetData.warrantyDetails.expiryDate) : null,
        warrantyNotes: assetData.warrantyDetails?.notes || '',
        hasWarranty: !!(assetData.warrantyDetails?.provider || assetData.warrantyDetails?.expiryDate),
      };

      console.log("Initial form values:", initialValues);
      
      setHasWarranty(initialValues.hasWarranty);
      setSelectedFloorId(floorId);
      
      // Set form values
      form.setFieldsValue(initialValues);
    }
  }, [isOpen, assetData, form]);

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

  // Handle warranty toggle change
  const handleWarrantyToggle = (checked) => {
    setHasWarranty(checked);
    setIsWarrantyChanged(true);
    
    // Clear warranty fields if turning off warranty
    if (!checked) {
      form.setFieldsValue({
        warrantyProvider: '',
        warrantyTill: null,
        warrantyNotes: '',
      });
    }
  };

  // Handle form submission
  const handleSave = async (values) => {
    if (!selectedProperty?.id) {
      message.error("Please select a property first");
      return;
    }

    try {
      console.log("Form values:", values);
      console.log("Original asset data:", assetData);

      // Check if assetData has an ID
      if (!assetData?._id) {
        message.error("Asset ID is missing. Cannot update asset.");
        return;
      }

      // Prepare the data in the exact structure backend expects
      const updateData = {
        id: assetData._id, // Asset ID at top level
        payload: { // Asset data goes here
          name: String(values.assetName || ""),
          categoryId: String(values.category || ""),
          description: String(values.description || ""),
          propertyId: String(selectedProperty.id || ""),
          floorId: String(values.floorId || ""),
          purchaseDetails: {
            purchaseDate: values.purchasedDate
              ? values.purchasedDate.toDate()
              : assetData?.purchaseDetails?.purchaseDate || new Date(),
            vendor: String(values.shopName || ""),
            price: Number(values.purchasedPrice || 0),
            // Keep existing invoiceUrl - it will be updated if new file is provided
            invoiceUrl: assetData?.purchaseDetails?.invoiceUrl || ""
          },
          status: values.status || "Active",
        }
      };

      // Add roomId only if it exists (not required field)
      if (values.roomId) {
        updateData.payload.roomId = String(values.roomId || "");
      }

      // Handle warranty details
      if (hasWarranty && values.warrantyProvider) {
        updateData.payload.warrantyDetails = {
          provider: String(values.warrantyProvider || ""),
          expiryDate: values.warrantyTill
            ? values.warrantyTill.toDate()
            : assetData?.warrantyDetails?.expiryDate || new Date(),
          notes: String(values.warrantyNotes || ""),
        };
      } else if (isWarrantyChanged && !hasWarranty) {
        // If warranty was turned off, explicitly remove warranty details
        updateData.payload.warrantyDetails = null;
      }
      // If warranty wasn't changed and is disabled, don't include warrantyDetails at all

      // Handle file upload - SEPARATE from payload, at top level
      if (invoiceFile) {
        try {
          const invoiceBase64 = await fileToBase64(invoiceFile);
          // Files go at the TOP LEVEL, separate from payload
          updateData.files = {
            invoice: {
              buffer: invoiceBase64.buffer,
              originalname: invoiceFile.name,
              mimetype: invoiceFile.type,
            }
          };
          console.log("Invoice file attached to updateData (TOP LEVEL)");
        } catch (error) {
          console.error("Failed to process invoice file:", error);
          message.error("Failed to process invoice file");
          return;
        }
      }

      console.log("Final update data to backend:", updateData);

      const response = await updateAssetMutation.mutateAsync(updateData);

      console.log("API Response:", response);

      if (response && response.success) {
        message.success(response.message || "Asset updated successfully");
        handleCancel();
      } else {
        throw new Error(response?.message || "Failed to update asset");
      }
    } catch (error) {
      console.error("Failed to update asset:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.details?.message ||
        error.message ||
        "Failed to update asset";
      message.error(errorMessage);
    }
  };

  // Handle modal cancellation
  const handleCancel = () => {
    form.resetFields();
    setHasWarranty(false);
    setInvoiceFile(null);
    setSelectedFloorId(null);
    setIsWarrantyChanged(false);
    onClose();
  };

  // Handle floor selection change
  const onFloorChange = (value) => {
    setSelectedFloorId(value);
    form.setFieldsValue({
      roomId: null,
    });
  };

  const saving = updateAssetMutation.isPending;

  return (
    <Modal
      title={`Update Asset - ${assetData?.name || ''}`}
      open={isOpen}
      onCancel={handleCancel}
      footer={null}
      width={700}
      destroyOnClose
    >
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
          <span>Select any property to update assets</span>
        </div>
      )}

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSave}
        style={{ marginTop: "24px" }}
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

          {/* Purchased Price */}
          <Col span={12}>
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
          <Col span={12}>
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
              <DatePicker 
                style={{ width: "100%" }}
                format="YYYY-MM-DD"
              />
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
                maxCount={1}
              >
                <Button icon={<UploadOutlined />}>
                  {invoiceFile ? invoiceFile.name : "Upload New Invoice"}
                </Button>
              </Upload>
              {invoiceFile && (
                <div style={{ marginTop: 8, color: "#52c41a" }}>
                  ✓ New file selected: {invoiceFile.name}
                </div>
              )}
              
              {/* Show current invoice if exists */}
              {assetData?.purchaseDetails?.invoiceUrl && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ marginBottom: 4, color: "#1890ff" }}>
                    📄 Current Invoice:
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Image
                      width={50}
                      height={50}
                      src={assetData.purchaseDetails.invoiceUrl}
                      alt="Current Invoice"
                      placeholder={
                        <div className="w-12 h-12 bg-gray-200 flex items-center justify-center rounded">
                          <EyeOutlined />
                        </div>
                      }
                      preview={{
                        mask: <EyeOutlined />,
                      }}
                      fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
                      className="rounded border border-gray-200 cursor-pointer"
                    />
                    <span style={{ fontSize: '12px', color: '#666' }}>
                      {assetData.purchaseDetails.invoiceUrl.split('/').pop()}
                    </span>
                  </div>
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
              <Switch onChange={handleWarrantyToggle} />
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
              <Select placeholder="Select asset status">
                {ASSET_STATUS_OPTIONS.map((status) => (
                  <Option key={status.value} value={status.value}>
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
              label="Category"
              rules={[
                { required: true, message: "Please select a category" },
              ]}
            >
              <Select placeholder="Choose a category" loading={loadingCats}>
                {categories.map((cat) => (
                  <Option key={cat.id || cat._id} value={cat.id || cat._id}>
                    {cat.name}
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
                  <DatePicker 
                    style={{ width: "100%" }}
                    format="YYYY-MM-DD"
                  />
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

          {/* Select Room - OPTIONAL */}
          <Col span={12}>
            <Form.Item
              name="roomId"
              label="Select Room (Optional)"
            >
              <Select
                placeholder={
                  selectedFloorId ? "Choose a room (optional)" : "Select a floor first"
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
            {saving ? "Updating..." : "Update Asset"}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default UpdateAsset;