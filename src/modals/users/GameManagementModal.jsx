import React, { useState } from "react";
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Upload,
  Button,
  Card,
  Row,
  Col,
  Space,
  message,
  Tag,
  Select,
  Popconfirm,
  Spin,
  Switch,
} from "antd";
import {
  PlusOutlined,
  UploadOutlined,
  EditOutlined,
  DeleteOutlined,
  PoweroffOutlined,
} from "@ant-design/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createGameItem,
  getAllGameItems,
  updateGamingItem,
  updateGamingItemStatus,
  deleteGamingItem,
  updateGameActiveStatusForAllUsers,
} from "../../hooks/users/useUser.js";

const { Option } = Select;

const GameManagementModal = ({ isOpen, onClose }) => {
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [statusUpdatingId, setStatusUpdatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [isGameActive, setIsGameActive] = useState(false);
  const queryClient = useQueryClient();

  // ✅ Fetch all items using Tanstack Query
  const {
    data: items = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["gameItems"],
    queryFn: getAllGameItems,
    enabled: isOpen,
  });

  // ✅ Mutation for updating game active status
  const updateGameStatusMutation = useMutation({
    mutationFn: updateGameActiveStatusForAllUsers,
    onSuccess: (data) => {
      const newStatus = !isGameActive;
      setIsGameActive(newStatus);
      message.success(
        newStatus 
          ? "🎮 Game activated for all users!" 
          : "🔴 Game deactivated for all users!"
      );
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to update game status";
      message.error(`Game status update failed: ${errorMessage}`);
    },
  });

  // ✅ Handle game status toggle
  const handleGameStatusToggle = (checked) => {
    updateGameStatusMutation.mutate(checked);
  };

  // ✅ Mutation for adding new item
  const createItemMutation = useMutation({
    mutationFn: createGameItem,
    onSuccess: (data) => {
      message.success("🎮 Item added successfully!");
      queryClient.invalidateQueries({ queryKey: ["gameItems"] });
      form.resetFields();
      setShowAddForm(false);
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || error.message || "Failed to add item";
      message.error(`Add failed: ${errorMessage}`);
    },
  });

  // ✅ Mutation for updating item
  const updateItemMutation = useMutation({
    mutationFn: ({ itemId, formData }) => updateGamingItem(itemId, formData),
    onSuccess: (data) => {
      message.success("🎮 Item updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["gameItems"] });
      setEditingItem(null);
      editForm.resetFields();
    },
    onError: (error) => {
      console.error("Update error:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to update item";
      message.error(`Update failed: ${errorMessage}`);

      if (errorMessage.includes("image") || error.response?.status === 400) {
        message.warning("Please check if image is required for updates");
      }
    },
  });

  // ✅ Mutation for updating item status
  const updateStatusMutation = useMutation({
    mutationFn: ({ itemId, status }) => updateGamingItemStatus(itemId, status),
    onMutate: ({ itemId }) => {
      setStatusUpdatingId(itemId);
    },
    onSuccess: (data) => {
      message.success("✅ Status updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["gameItems"] });
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to update status";
      message.error(`Status update failed: ${errorMessage}`);
    },
    onSettled: () => {
      setStatusUpdatingId(null);
    },
  });

  // ✅ Mutation for deleting item
  const deleteItemMutation = useMutation({
    mutationFn: deleteGamingItem,
    onMutate: (itemId) => {
      setDeletingId(itemId);
    },
    onSuccess: (data) => {
      message.success("🗑️ Item deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["gameItems"] });
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to delete item";
      message.error(`Delete failed: ${errorMessage}`);
    },
    onSettled: () => {
      setDeletingId(null);
    },
  });

  // ✅ Handle Add New Item
  const handleAddItem = (values) => {
    if (!values.itemImage?.[0]?.originFileObj) {
      message.error("Please upload an item image");
      return;
    }

    const formData = new FormData();
    formData.append("itemName", values.itemName);
    formData.append("price", values.price.toString());
    formData.append("itemImage", values.itemImage[0].originFileObj);

    createItemMutation.mutate(formData);
  };

  // ✅ Handle Edit Item
  const handleEditItem = (values) => {
    if (!editingItem) return;

    const formData = new FormData();
    formData.append("itemName", values.itemName);
    formData.append("price", values.price.toString());

    if (values.itemImage?.[0]?.originFileObj) {
      formData.append("itemImage", values.itemImage[0].originFileObj);
    }

    updateItemMutation.mutate({
      itemId: editingItem._id,
      formData: formData,
    });
  };

  // ✅ Handle Status Change
  const handleStatusChange = (itemId, newStatus) => {
    updateStatusMutation.mutate({
      itemId,
      status: newStatus,
    });
  };

  // ✅ Handle Delete Item
  const handleDeleteItem = (itemId) => {
    deleteItemMutation.mutate(itemId);
  };

  // ✅ Start editing an item
  const handleStartEdit = (item) => {
    setEditingItem(item);
    editForm.setFieldsValue({
      itemName: item.itemName,
      price: item.price,
      itemImage: item.itemImage
        ? [
            {
              uid: "-1",
              name: "current-image",
              status: "done",
              url: item.itemImage,
            },
          ]
        : undefined,
    });
  };

  // ✅ Close edit form
  const handleCloseEdit = () => {
    setEditingItem(null);
    editForm.resetFields();
  };

  // ✅ Close add form
  const handleCloseAdd = () => {
    setShowAddForm(false);
    form.resetFields();
  };

  const getStatusColor = (status) =>
    status === "Available" ? "#52c41a" : "#ff4d4f";

  // ✅ Custom upload props
  const uploadProps = {
    beforeUpload: () => false,
    maxCount: 1,
    accept: "image/*",
    listType: "picture-card",
  };

  // ✅ Custom norm function for file handling
  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };

  const GameItemCard = ({ item }) => (
    <Card
      style={{
        height: "100%",
        borderRadius: 16,
        border: "1px solid #f0f0f0",
        background: "#ffffff",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
        position: "relative",
        overflow: "hidden",
      }}
      bodyStyle={{
        padding: 0,
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      {/* Status Tag */}
      <div
        style={{
          position: "absolute",
          top: 12,
          right: 12,
          zIndex: 10,
        }}
      >
        <Tag
          color={getStatusColor(item.status)}
          style={{
            borderRadius: 12,
            padding: "4px 12px",
            fontWeight: "bold",
            margin: 0,
          }}
        >
          {item.status === "Available" ? "✓ In Stock" : "✗ Out of Stock"}
        </Tag>
      </div>

      {/* Image Container */}
      <div
        style={{
          height: 160,
          overflow: "hidden",
          position: "relative",
        }}
      >
        <img
          src={item.itemImage}
          alt={item.itemName}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transition: "transform 0.3s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        />
      </div>

      {/* Content */}
      <div style={{ padding: 16, flex: 1 }}>
        <h3 style={{ fontSize: 16, fontWeight: "bold", marginBottom: 8 }}>
          {item.itemName}
        </h3>
        <div style={{ color: "#52c41a", fontSize: 18, fontWeight: "bold" }}>
          ₹{item.price}
        </div>
        <Space direction="vertical" style={{ width: "100%", marginTop: 12 }}>
          {/* Status Select with Loading */}
          <Select
            value={item.status}
            style={{ width: "100%" }}
            size="small"
            onChange={(value) => handleStatusChange(item._id, value)}
            loading={statusUpdatingId === item._id}
            disabled={
              statusUpdatingId === item._id ||
              deletingId === item._id ||
              updateItemMutation.isPending
            }
          >
            <Option value="Available">Available</Option>
            <Option value="OutOfStock">Out of Stock</Option>
          </Select>

          <Space style={{ width: "100%", justifyContent: "space-between" }}>
            {/* Edit Button with Loading */}
            <Button
              icon={
                updateItemMutation.isPending &&
                editingItem?._id === item._id ? null : (
                  <EditOutlined />
                )
              }
              size="small"
              type="primary"
              ghost
              style={{ borderRadius: 8, flex: 1 }}
              onClick={() => handleStartEdit(item)}
              loading={
                updateItemMutation.isPending && editingItem?._id === item._id
              }
              disabled={
                statusUpdatingId === item._id ||
                deletingId === item._id ||
                (updateItemMutation.isPending && editingItem?._id !== item._id)
              }
            >
              {updateItemMutation.isPending && editingItem?._id === item._id
                ? "Editing..."
                : "Edit"}
            </Button>

            {/* Delete Button with Loading */}
            <Popconfirm
              title="Delete this item?"
              description="Are you sure you want to delete this item?"
              onConfirm={() => handleDeleteItem(item._id)}
              okText="Yes"
              cancelText="No"
              okButtonProps={{
                loading: deletingId === item._id,
              }}
              disabled={
                deletingId === item._id ||
                statusUpdatingId === item._id ||
                updateItemMutation.isPending
              }
            >
              <Button
                danger
                size="small"
                icon={deletingId === item._id ? null : <DeleteOutlined />}
                style={{ borderRadius: 8, flex: 1 }}
                loading={deletingId === item._id}
                disabled={
                  statusUpdatingId === item._id ||
                  deletingId === item._id ||
                  updateItemMutation.isPending
                }
              >
                {deletingId === item._id ? "Deleting..." : "Delete"}
              </Button>
            </Popconfirm>
          </Space>
        </Space>
      </div>
    </Card>
  );

  return (
    <Modal
      title="🎮 Gaming Manager"
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={1200}
      style={{ maxWidth: "95vw" }}
      closable={!createItemMutation.isPending && !updateItemMutation.isPending}
    >
      {/* Header */}
      <div
        style={{
          padding: 24,
          borderBottom: "1px solid #f0f0f0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h3 style={{ margin: 0 }}>Manage your Offer items</h3>
          <p style={{ color: "#8c8c8c" }}>
            {isLoading ? "Loading..." : `${items.length} items in inventory`}
          </p>
        </div>
        
        <Space>
          {/* Game Activation Toggle */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <PoweroffOutlined 
              style={{ 
                color: isGameActive ? "#52c41a" : "#ff4d4f",
                fontSize: 16 
              }} 
            />
            <span style={{ fontWeight: 500 }}>
              {isGameActive ? "Game Active" : "Game Inactive"}
            </span>
            <Switch
              checked={isGameActive}
              onChange={handleGameStatusToggle}
              loading={updateGameStatusMutation.isPending}
              disabled={updateGameStatusMutation.isPending}
              style={{
                backgroundColor: isGameActive ? "#52c41a" : "#d9d9d9",
              }}
            />
          </div>

          {/* Add New Item Button */}
          <Button
            type="primary"
            icon={createItemMutation.isPending ? null : <PlusOutlined />}
            onClick={() => setShowAddForm(true)}
            disabled={
              showAddForm ||
              editingItem ||
              createItemMutation.isPending ||
              updateItemMutation.isPending
            }
            loading={createItemMutation.isPending}
            style={{
              background: "linear-gradient(135deg, #ff6b35, #ff8e35)",
              border: "none",
              borderRadius: 8,
              fontWeight: "bold",
            }}
          >
            {createItemMutation.isPending ? "Adding Item..." : "Add New Item"}
          </Button>
        </Space>
      </div>

      {/* Add Item Form */}
      {showAddForm && (
        <div style={{ padding: 24, background: "#fafafa" }}>
          <Card
            title="🎯 Add New Gaming Item"
            extra={
              <Button
                type="text"
                onClick={handleCloseAdd}
                disabled={createItemMutation.isPending}
              >
                ✕ Close
              </Button>
            }
          >
            <Form form={form} layout="vertical" onFinish={handleAddItem}>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="itemName"
                    label="Item Name"
                    rules={[{ required: true, message: "Enter item name" }]}
                  >
                    <Input
                      size="large"
                      placeholder="Enter item name"
                      disabled={createItemMutation.isPending}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="price"
                    label="Price (₹)"
                    rules={[{ required: true, message: "Enter price" }]}
                  >
                    <InputNumber
                      size="large"
                      placeholder="Enter price"
                      min={1}
                      style={{ width: "100%" }}
                      disabled={createItemMutation.isPending}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="itemImage"
                    label="Item Image"
                    rules={[
                      { required: true, message: "Please upload an image" },
                    ]}
                    valuePropName="fileList"
                    getValueFromEvent={normFile}
                  >
                    <Upload
                      {...uploadProps}
                      disabled={createItemMutation.isPending}
                    >
                      <div>
                        <UploadOutlined />
                        <div>Upload</div>
                      </div>
                    </Upload>
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item>
                <Space>
                  <Button
                    type="primary"
                    htmlType="submit"
                    icon={
                      createItemMutation.isPending ? null : <PlusOutlined />
                    }
                    size="large"
                    loading={createItemMutation.isPending}
                    style={{
                      background: "linear-gradient(135deg, #52c41a, #73d13d)",
                      border: "none",
                      borderRadius: 8,
                      fontWeight: "bold",
                    }}
                  >
                    {createItemMutation.isPending
                      ? "Adding Item..."
                      : "Add Item"}
                  </Button>
                  <Button
                    onClick={handleCloseAdd}
                    size="large"
                    disabled={createItemMutation.isPending}
                  >
                    Cancel
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </div>
      )}

      {/* Edit Item Form */}
      {editingItem && (
        <div style={{ padding: 24, background: "#fafafa" }}>
          <Card
            title="✏️ Edit Gaming Item"
            extra={
              <Button
                type="text"
                onClick={handleCloseEdit}
                disabled={updateItemMutation.isPending}
              >
                ✕ Close
              </Button>
            }
          >
            <Form form={editForm} layout="vertical" onFinish={handleEditItem}>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="itemName"
                    label="Item Name"
                    rules={[{ required: true, message: "Enter item name" }]}
                  >
                    <Input
                      size="large"
                      placeholder="Enter item name"
                      disabled={updateItemMutation.isPending}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="price"
                    label="Price (₹)"
                    rules={[{ required: true, message: "Enter price" }]}
                  >
                    <InputNumber
                      size="large"
                      placeholder="Enter price"
                      min={1}
                      style={{ width: "100%" }}
                      disabled={updateItemMutation.isPending}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="itemImage"
                    label="Item Image"
                    valuePropName="fileList"
                    getValueFromEvent={normFile}
                    extra="Upload new image only if you want to change it"
                  >
                    <Upload
                      {...uploadProps}
                      disabled={updateItemMutation.isPending}
                    >
                      <div>
                        <UploadOutlined />
                        <div>Upload New Image</div>
                      </div>
                    </Upload>
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item>
                <Space>
                  <Button
                    type="primary"
                    htmlType="submit"
                    icon={
                      updateItemMutation.isPending ? null : <EditOutlined />
                    }
                    size="large"
                    loading={updateItemMutation.isPending}
                    style={{
                      background: "linear-gradient(135deg, #1890ff, #40a9ff)",
                      border: "none",
                      borderRadius: 8,
                      fontWeight: "bold",
                    }}
                  >
                    {updateItemMutation.isPending
                      ? "Updating Item..."
                      : "Update Item"}
                  </Button>
                  <Button
                    onClick={handleCloseEdit}
                    size="large"
                    disabled={updateItemMutation.isPending}
                  >
                    Cancel
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </div>
      )}

      {/* Items Grid */}
      <div style={{ padding: 24 }}>
        {isLoading ? (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <Spin size="large" tip="Loading items..." />
          </div>
        ) : isError ? (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <p style={{ color: "red", fontSize: "16px" }}>
              Failed to load items. Please try again.
            </p>
            <Button
              type="primary"
              onClick={() =>
                queryClient.invalidateQueries({ queryKey: ["gameItems"] })
              }
              loading={isLoading}
            >
              {isLoading ? "Retrying..." : "Retry"}
            </Button>
          </div>
        ) : items.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <p style={{ color: "#8c8c8c", fontSize: "16px" }}>
              No items found. Add your first gaming item!
            </p>
          </div>
        ) : (
          <Row gutter={[20, 20]}>
            {items.map((item) => (
              <Col key={item._id} xs={24} sm={12} md={8} lg={6}>
                <GameItemCard item={item} />
              </Col>
            ))}
          </Row>
        )}
      </div>
    </Modal>
  );
};

export default GameManagementModal;