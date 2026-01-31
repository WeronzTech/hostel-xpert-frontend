import {useState, useEffect} from "react";
import {useQuery, useMutation, useQueryClient} from "@tanstack/react-query";
import {
  Table,
  Typography,
  Spin,
  Button,
  Alert,
  DatePicker,
  Space,
  Select,
  InputNumber,
  Modal,
  Form,
  message,
  Popconfirm,
  Card,
  Row,
  Col,
  Tag,
} from "antd";
import {
  ReloadOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  SaveOutlined,
  CloseOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import {messApiService} from "../../hooks/mess/messApiService";
import dayjs from "dayjs";
import {PageHeader} from "../../components";
import {getKitchensForDropDown} from "../../hooks/inventory/useInventory";
import usePersistentState from "../../hooks/usePersistentState";

const {Text} = Typography;
const {Option} = Select;

// Helper functions
const getTomorrowDate = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split("T")[0];
};

const getYesterdayDate = () => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split("T")[0];
};

const getTodayDate = () => {
  return new Date().toISOString().split("T")[0];
};

const formatDateForDisplay = (dateString) => {
  return dayjs(dateString).format("DD MMM YYYY");
};

// Transform backend data to frontend format
const transformCookingData = (backendData) => {
  if (!backendData || !Array.isArray(backendData)) return [];

  return backendData.flatMap((dailyRequirement) => {
    if (!dailyRequirement.items || !Array.isArray(dailyRequirement.items))
      return [];

    return dailyRequirement.items.map((item, index) => ({
      key: `${dailyRequirement._id}-${index}`,
      item: item.productName,
      requiredQuantity: item.quantityRequired,
      unit: item.unit,
      inventoryId: item.inventoryId,
      originalData: item,
      dailyRequirementId: dailyRequirement._id,
      status: dailyRequirement.status,
      isEditable: dailyRequirement.status === "Pending",
    }));
  });
};

// Custom hooks
const useCookingItems = (selectedKitchenId, selectedDate) => {
  return useQuery({
    queryKey: ["cookingItems", selectedKitchenId, selectedDate],
    queryFn: () =>
      messApiService.getDailyRequirements(selectedKitchenId, selectedDate),
    select: (data) => ({
      ...data,
      transformedData: transformCookingData(data.data?.data || []),
      rawData: data.data?.data || [],
      requirementStatus: data.data?.data?.[0]?.status || "Pending",
    }),
    staleTime: 5 * 60 * 1000,
    enabled: !!selectedKitchenId,
  });
};

const useInventoryItemsList = (selectedKitchenId, requirementId) => {
  return useQuery({
    queryKey: [
      "inventoryItemsForRequirements",
      selectedKitchenId,
      requirementId,
    ],
    queryFn: () =>
      messApiService.getInventoryItemsForRequirements(
        selectedKitchenId,
        requirementId
      ),
    enabled: !!selectedKitchenId && !!requirementId,
    select: (data) =>
      data?.data?.map((item) => ({
        label: `${item.productName} (Available Qty: ${item.stockQuantity}${item.quantityType})`,
        value: item._id,
        productName: item.productName,
        unit: item.quantityType,
      })) || [],
  });
};

// Date filter options
const dateFilterOptions = [
  {label: "Yesterday", value: "yesterday"},
  {label: "Today", value: "today"},
  // {label: "Tomorrow", value: "tomorrow"},
  {label: "Custom Date", value: "custom"},
];

// Main Component
const CookingRequirements = () => {
  const [selectedItemUnit, setSelectedItemUnit] = useState(null);
  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [dateFilter, setDateFilter] = useState("today");
  const [customDate, setCustomDate] = useState(null);

  // ✅ Use persistent state for kitchen selection
  const [selectedKitchenId, setSelectedKitchenId] = usePersistentState(
    "cooking-requirements-kitchen",
    null
  );

  const [requirementId, setRequirementId] = useState(null);
  const [editingKey, setEditingKey] = useState("");
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [addItemForm] = Form.useForm();

  const [messageApi, contextHolder] = message.useMessage();

  const queryClient = useQueryClient();

  // Fetch data
  const {data: kitchens, isLoading: kitchensLoading} = useQuery({
    queryKey: ["kitchens"],
    queryFn: getKitchensForDropDown,
  });

  const {
    data: queryData,
    isLoading: cookingItemsLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useCookingItems(selectedKitchenId, selectedDate);

  // ✅ Set requirementId when data loads
  useEffect(() => {
    if (queryData?.rawData?.length > 0) {
      const firstRequirement = queryData.rawData[0];
      setRequirementId(firstRequirement._id);
    } else {
      setRequirementId(null);
    }
  }, [queryData]);

  const {data: inventoryItems, isLoading: inventoryLoading} =
    useInventoryItemsList(selectedKitchenId, requirementId);

  // Mutations (same as before)
  const addItemMutation = useMutation({
    mutationFn: ({requirementId, inventoryId, quantityRequired, unit}) =>
      messApiService.addItemToRequirement(
        requirementId,
        inventoryId,
        quantityRequired,
        unit
      ),
    onSuccess: (data) => {
      messageApi.success(data.message);
      queryClient.invalidateQueries(["cookingItems"]);
    },
    onError: (error) => {
      message.error(error.message || "Failed to add item");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({requirementId, items}) =>
      messApiService.updateDailyRequirements(requirementId, items),
    onSuccess: (data) => {
      messageApi.success(data.message);
      queryClient.invalidateQueries(["cookingItems"]);
      setEditingKey("");
    },
    onError: (error) => {
      message.error(error.message || "Failed to update requirements");
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: ({requirementId, inventoryId}) =>
      messApiService.removeItemFromRequirement(requirementId, inventoryId),
    onSuccess: (data) => {
      messageApi.success(data.message);
      queryClient.invalidateQueries(["cookingItems"]);
    },
    onError: (error) => {
      message.error(error.message || "Failed to remove item");
    },
  });

  const confirmMutation = useMutation({
    mutationFn: (requirementId) =>
      messApiService.confirmDailyRequirements(requirementId),
    onSuccess: (data) => {
      messageApi.success(data.message);
      queryClient.invalidateQueries(["cookingItems"]);
    },
    onError: (error) => {
      message.error(error.message || "Failed to confirm requirements");
    },
  });

  // Transform data
  const kitchenOptions =
    kitchens?.map((kitchen) => ({
      label: kitchen.name,
      value: kitchen._id,
    })) || [];

  const cookingData = queryData?.transformedData || [];
  const rawRequirements = queryData?.rawData || [];
  const requirementStatus = queryData?.requirementStatus || "Pending";

  // ✅ Check if requirements are approved
  const isApproved = requirementStatus === "Approved";
  const isPending = requirementStatus === "Pending";

  // Handlers
  const handleDateFilterChange = (value) => {
    setDateFilter(value);
    if (value === "today") {
      setSelectedDate(getTodayDate());
      setCustomDate(null);
    } else if (value === "tomorrow") {
      setSelectedDate(getTomorrowDate());
      setCustomDate(null);
    } else if (value === "yesterday") {
      setSelectedDate(getYesterdayDate());
      setCustomDate(null);
    } else if (value === "custom" && customDate) {
      setSelectedDate(customDate.format("YYYY-MM-DD"));
    }
  };

  const handleInventoryItemSelect = (value) => {
    const selectedItem = inventoryItems?.find((item) => item.value === value);
    setSelectedItemUnit(selectedItem?.unit || null);
  };

  const handleCustomDateChange = (date) => {
    setCustomDate(date);
    if (date) setSelectedDate(date.format("YYYY-MM-DD"));
  };

  const handleKitchenChange = (kitchenId) => {
    setSelectedKitchenId(kitchenId); // ✅ This will automatically persist to localStorage
    setRequirementId(null);
    setEditingKey("");
  };

  const isEditing = (record) => record.key === editingKey;

  const edit = (record) => {
    if (!isPending) return;
    form.setFieldsValue({
      quantity: record.requiredQuantity,
      unit: record.unit,
    });
    setEditingKey(record.key);
  };

  const cancel = () => {
    setEditingKey("");
  };

  const save = async (key) => {
    if (!isPending) return;
    try {
      const row = await form.validateFields();
      const record = cookingData.find((item) => item.key === key);

      if (record && requirementId) {
        const dailyRequirement = rawRequirements.find((dr) =>
          dr.items.some((item) => item.inventoryId === record.inventoryId)
        );

        if (dailyRequirement) {
          const updatedItems = dailyRequirement.items.map((item) =>
            item.inventoryId === record.inventoryId
              ? {...item, quantityRequired: row.quantity}
              : item
          );

          updateMutation.mutate({
            requirementId: requirementId,
            items: updatedItems,
          });
        }
      }
    } catch (err) {
      console.error("Save failed:", err);
    }
  };

  const removeItem = (key) => {
    if (!isPending) return;
    const record = cookingData.find((item) => item.key === key);
    if (record && requirementId) {
      removeItemMutation.mutate({
        requirementId: requirementId,
        inventoryId: record.inventoryId,
      });
    }
  };

  const handleAddItem = async () => {
    if (!isPending) return;
    try {
      const values = await addItemForm.validateFields();

      if (!requirementId) {
        message.error("No requirement found to add item to");
        return;
      }

      if (!selectedItemUnit) {
        message.error("Please select an item first");
        return;
      }

      addItemMutation.mutate({
        requirementId: requirementId,
        inventoryId: values.inventoryItem,
        quantityRequired: values.quantity,
        unit: selectedItemUnit, // ✅ Correct variable
      });

      setIsAddModalVisible(false);
      addItemForm.resetFields();
      setSelectedItemUnit(null); // ✅ Reset unit
    } catch (error) {
      console.error("Add item failed:", error);
    }
  };

  const handleConfirmRequirements = () => {
    if (requirementId) {
      confirmMutation.mutate(requirementId);
    } else {
      message.error("No requirement found to confirm");
    }
  };

  const getDisplayDate = () => {
    if (dateFilter === "today") return formatDateForDisplay(getTodayDate());
    if (dateFilter === "tomorrow")
      return formatDateForDisplay(getTomorrowDate());
    if (dateFilter === "custom" && customDate)
      return formatDateForDisplay(selectedDate);
    return formatDateForDisplay(selectedDate);
  };

  // Check if we have requirements data
  const hasRequirements = cookingData.length > 0 && requirementId;

  // Table columns with conditional actions (same as before)
  const columns = [
    {
      title: "#",
      key: "sno",
      width: 60,
      render: (_, record, index) => <Text strong>{index + 1}</Text>,
    },
    {
      title: "Item Name",
      dataIndex: "item",
      key: "item",
      width: 160,
      render: (item, record) => (
        <div>
          <Text strong>{item}</Text>
        </div>
      ),
    },
    {
      title: "Required Quantity",
      dataIndex: "requiredQuantity",
      key: "requiredQuantity",
      width: 160,
      render: (quantity, record) => {
        const editable = isEditing(record) && isPending;
        return editable ? (
          <Form form={form} component={false}>
            <Form.Item name="quantity" style={{margin: 0}}>
              <InputNumber
                min={0}
                step={0.1}
                style={{width: "100%"}}
                addonAfter={record.unit}
              />
            </Form.Item>
          </Form>
        ) : (
          <Text strong style={{color: isApproved ? "#52c41a" : "#1890ff"}}>
            {quantity} {record.unit}
          </Text>
        );
      },
    },
    {
      title: "Status",
      key: "status",
      width: 120,
      render: (_, record) => (
        <Tag
          color={isApproved ? "success" : "processing"}
          icon={isApproved ? <CheckCircleOutlined /> : null}
        >
          {isApproved ? "Stock Deducted" : "Pending"}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 100,
      render: (_, record) => {
        if (isApproved) {
          return (
            <Space>
              <Button
                type="link"
                icon={<EditOutlined />}
                size="small"
                disabled
                style={{cursor: "not-allowed", color: "#ccc"}}
                title="Cannot edit approved requirements"
              />
              <Button
                type="link"
                danger
                icon={<DeleteOutlined />}
                size="small"
                disabled
                style={{cursor: "not-allowed", color: "#ffa39e"}}
                title="Cannot delete from approved requirements"
              />
            </Space>
          );
        }

        const editable = isEditing(record);
        return editable ? (
          <Space>
            <Button
              type="link"
              icon={<SaveOutlined />}
              onClick={() => save(record.key)}
              loading={updateMutation.isPending}
              size="small"
            />
            <Button
              type="link"
              icon={<CloseOutlined />}
              onClick={cancel}
              size="small"
            />
          </Space>
        ) : (
          <Space>
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => edit(record)}
              size="small"
            />
            <Popconfirm
              title="Are you sure to delete this item?"
              onConfirm={() => removeItem(record.key)}
              okText="Yes"
              cancelText="No"
            >
              <Button
                type="link"
                danger
                icon={<DeleteOutlined />}
                size="small"
              />
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  // Loading states
  if (kitchensLoading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <Spin size="large" tip="Loading kitchens..." />
      </div>
    );
  }

  if (cookingItemsLoading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <Spin
          size="large"
          tip={`Loading cooking requirements for ${getDisplayDate()}...`}
        />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6">
        <Alert
          message="Error Loading Data"
          description={error?.message || "Failed to load cooking requirements"}
          type="error"
          showIcon
          action={
            <Button size="small" onClick={refetch} icon={<ReloadOutlined />}>
              Retry
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <>
      {contextHolder}
      <div className="min-h-screen bg-gray-50 xl:px-12 lg:px-4 lg:pt-6 lg:pb-12 px-4 pt-4 pb-8">
        <PageHeader
          title="Cooking Requirements"
          subtitle={`Items needed for cooking meals on ${getDisplayDate()}`}
        />

        {/* Filters Section */}
        <Card className="mb-6">
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={12} md={8}>
              <Space>
                <Text strong>Kitchen:</Text>
                <Select
                  value={selectedKitchenId}
                  onChange={handleKitchenChange}
                  style={{width: 200}}
                  options={kitchenOptions}
                  placeholder="Select Kitchen"
                />
              </Space>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Space>
                <Select
                  value={dateFilter}
                  onChange={handleDateFilterChange}
                  style={{width: 120}}
                  options={dateFilterOptions}
                />
                {dateFilter === "custom" && (
                  <DatePicker
                    value={customDate}
                    onChange={handleCustomDateChange}
                    format="DD MMM YYYY"
                    placeholder="Select date"
                    style={{width: 140}}
                  />
                )}
              </Space>
            </Col>
            {hasRequirements && (
              <Col xs={24} sm={24} md={8} className="text-right">
                <Space>
                  {isPending ? (
                    <>
                      <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => setIsAddModalVisible(true)}
                        loading={inventoryLoading}
                      >
                        Add Item
                      </Button>
                      <Popconfirm
                        title={
                          <div style={{textAlign: "left"}}>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                marginBottom: "8px",
                              }}
                            >
                              <ExclamationCircleOutlined
                                style={{color: "#faad14", fontSize: "16px"}}
                              />
                              <Text
                                strong
                                style={{color: "#d46b08", fontSize: "16px"}}
                              >
                                Final Confirmation Required
                              </Text>
                            </div>
                            <div style={{marginLeft: "24px"}}>
                              <Text
                                type="warning"
                                style={{display: "block", marginBottom: "4px"}}
                              >
                                • <Text strong>Verify</Text> all required
                                quantities
                              </Text>
                              <Text
                                type="warning"
                                style={{display: "block", marginBottom: "4px"}}
                              >
                                • This will{" "}
                                <Text strong>permanently reduce</Text> stock
                              </Text>
                              <Text
                                type="warning"
                                style={{display: "block", marginBottom: "4px"}}
                              >
                                • This operation{" "}
                                <Text strong>cannot be undone</Text>
                              </Text>
                              <Text type="secondary" style={{fontSize: "12px"}}>
                                Are you sure you want to proceed?
                              </Text>
                            </div>
                          </div>
                        }
                        onConfirm={handleConfirmRequirements}
                        okText="Yes, Confirm & Deduct Stocks"
                        cancelText="Cancel"
                        okType="danger"
                        icon={null}
                        overlayStyle={{maxWidth: "400px"}}
                        okButtonProps={{
                          danger: true,
                          type: "primary",
                          style: {
                            background: "#ff4d4f",
                            borderColor: "#ff4d4f",
                          },
                        }}
                      >
                        <Button
                          type="primary"
                          danger
                          loading={confirmMutation.isPending}
                        >
                          <ExclamationCircleOutlined />
                          Confirm Requirements
                        </Button>
                      </Popconfirm>
                    </>
                  ) : (
                    <Tag
                      color="success"
                      style={{
                        padding: "6px 12px",
                        fontSize: "14px",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <CheckCircleOutlined />
                      Inventory Updated
                    </Tag>
                  )}
                </Space>
              </Col>
            )}
          </Row>
        </Card>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={cookingData.slice().reverse()}
          scroll={{x: "max-content"}}
          size="middle"
          loading={isFetching || updateMutation.isPending}
          pagination={false}
          locale={{
            emptyText: "No cooking requirements found for the selected date",
          }}
        />

        {/* Add Item Modal - Only show for pending requirements */}
        {isPending && (
          <Modal
            centered
            title="Add New Item"
            open={isAddModalVisible}
            onOk={handleAddItem}
            onCancel={() => {
              setIsAddModalVisible(false);
              addItemForm.resetFields();
              setSelectedItemUnit(null);
            }}
            confirmLoading={addItemMutation.isPending}
            okButtonProps={{disabled: !requirementId || !selectedItemUnit}}
          >
            <Form form={addItemForm} layout="vertical">
              <Form.Item
                name="inventoryItem"
                label="Select Item"
                rules={[{required: true, message: "Please select an item"}]}
              >
                <Select
                  placeholder="Choose from inventory"
                  loading={inventoryLoading}
                  options={inventoryItems}
                  showSearch
                  optionFilterProp="label"
                  disabled={!requirementId}
                  onChange={handleInventoryItemSelect}
                />
              </Form.Item>
              <Form.Item
                name="quantity"
                label={`Quantity ${
                  selectedItemUnit ? `(${selectedItemUnit})` : ""
                }`}
                rules={[{required: true, message: "Please enter quantity"}]}
              >
                <InputNumber
                  min={0}
                  step={0.1}
                  style={{width: "100%"}}
                  placeholder={`Enter quantity${
                    selectedItemUnit ? ` in ${selectedItemUnit}` : ""
                  }`}
                  disabled={!requirementId}
                  addonAfter={selectedItemUnit} // ✅ Show unit as addon
                />
              </Form.Item>
              {!requirementId && (
                <Alert
                  message="No requirement found"
                  description="Please wait for requirements to load before adding items."
                  type="warning"
                  showIcon
                />
              )}
            </Form>
          </Modal>
        )}
      </div>
    </>
  );
};

export default CookingRequirements;
