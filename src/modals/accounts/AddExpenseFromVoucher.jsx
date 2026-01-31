import {useState, useEffect} from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  Button,
  Upload,
  Card,
  Tag,
  Space,
  Divider,
  message,
  Row,
  Col,
} from "antd";
import {FiPlus, FiX, FiUpload} from "react-icons/fi";
import {useSelector} from "react-redux";
import {HomeOutlined} from "../../icons";
import {getKitchensForDropDown} from "../../hooks/inventory/useInventory";
import {useQuery, useMutation, useQueryClient} from "@tanstack/react-query";
import {
  addExpenseCategory,
  deleteCategory,
  getCategoryByMainCategory,
  addExpense,
} from "../../hooks/accounts/useAccounts";

const {Option} = Select;

const AddExpenseFromVoucher = ({
  visible,
  onCancel,
  selectedCategory,
  voucherId,
}) => {
  const {properties, selectedProperty} = useSelector(
    (state) => state.properties
  );

  const {user} = useSelector((state) => state.auth);
  const adminName = user.name;

  const [form] = Form.useForm();

  const [newCategory, setNewCategory] = useState("");
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  const [currentCategoryType, setCurrentCategoryType] = useState("");
  const [currentProperty, setCurrentProperty] = useState(selectedProperty);
  const [apiError, setApiError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [messageApi, contextHolder] = message.useMessage();

  const queryClient = useQueryClient();

  // Fetch kitchens
  const {data: kitchens} = useQuery({
    queryKey: ["kitchens", selectedProperty?.id || currentProperty?._id],
    queryFn: ({queryKey}) => {
      const [, propertyId] = queryKey;
      return getKitchensForDropDown(propertyId);
    },
    enabled: selectedCategory === "Mess",
  });

  // Create category mutation
  const createCategoryMutation = useMutation({
    mutationFn: addExpenseCategory,
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries(["categories", currentCategoryType]);
        messageApi.success({
          content: `${data.message}`,
          duration: 3,
        });
        setNewCategory("");
        setShowAddCategory(false);
        setApiError("");
      } else {
        setApiError(data.message);
        message.error(data.message);
      }
    },
    onError: (error) => {
      console.log("Mutation error:", error);
      setApiError(error.message);
      messageApi.error({
        content: `${error.message}`,
        duration: 3,
      });
    },
  });

  // Fetch categories by mainCategory
  const {data: categoriesData, isLoading: categoriesLoading} = useQuery({
    queryKey: ["categories", currentCategoryType],
    queryFn: () =>
      getCategoryByMainCategory({mainCategory: currentCategoryType}),
    enabled: !!currentCategoryType,
  });

  const currentCategories = categoriesData?.success
    ? categoriesData.data.map((cat) => cat.subCategory)
    : [];

  // Delete category mutation
  const deleteCategoryMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries(["categories", currentCategoryType]);
        messageApi.success({
          content: `${data.message}`,
          duration: 3,
        });
      } else {
        messageApi.error({
          content: `${error.message}`,
          duration: 3,
        });
      }
    },
    onError: (error) => {
      message.error("Failed to delete category: " + error.message);
    },
  });

  // Add Expense Mutation - UPDATED with better loading handling
  const addExpenseMutation = useMutation({
    mutationFn: addExpense,
    onMutate: () => {
      console.log("Mutation started - setting loading state");
      setIsSubmitting(true);
      setApiError("");
    },
    onSuccess: (data) => {
      console.log("Mutation success:", data);
      if (data.success) {
        messageApi.success({
          content: `${data.message}`,
          duration: 3,
        });
        queryClient.invalidateQueries(["expenses"]);
        queryClient.invalidateQueries(["pettyCash"]);
        queryClient.invalidateQueries({
          queryKey: ["availableCash"],
        });
        handleClose();
      } else {
        setIsSubmitting(false);
        message.error(data.message || "Failed to add expense");
        setApiError(data.message);
      }
    },
    onError: (error) => {
      console.error("Add expense error:", error);
      setIsSubmitting(false);
      messageApi.error({
        content: `${error.message}`,
        duration: 3,
      });
      setApiError(error.message);
    },
  });

  const handleAddCategory = () => {
    if (!newCategory.trim()) {
      message.error("Please enter a category name");
      return;
    }

    const categoryData = {
      mainCategory: currentCategoryType,
      subCategory: newCategory.trim(),
    };

    createCategoryMutation.mutate(categoryData);
  };

  const handleDeleteCategory = (categoryType, categoryToDelete) => {
    const categoryToDeleteObj = categoriesData?.data?.find(
      (cat) =>
        cat.subCategory === categoryToDelete &&
        cat.mainCategory === categoryType
    );

    if (categoryToDeleteObj) {
      deleteCategoryMutation.mutate(categoryToDeleteObj._id);
    } else {
      message.success("Category deleted successfully");
    }
  };

  useEffect(() => {
    if (selectedCategory) {
      setCurrentCategoryType(selectedCategory);
      form.setFieldsValue({categoryType: selectedCategory});
    }
  }, [selectedCategory, form]);

  useEffect(() => {
    if (selectedProperty && selectedProperty.id) {
      setCurrentProperty(selectedProperty);
    } else {
      setCurrentProperty({id: null, name: ""});
    }
  }, [selectedProperty]);

  const handleFileChange = ({fileList: newFileList}) => {
    setFileList(newFileList);

    if (newFileList.length > 0 && newFileList[0].originFileObj) {
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(newFileList[0].originFileObj);
    } else {
      setImagePreview(null);
    }
  };

  const handlePropertyChange = (propertyId) => {
    if (propertyId) {
      const property = properties.find((p) => p._id === propertyId);
      setCurrentProperty(property);
      form.setFieldsValue({kitchenId: undefined});
    } else {
      setCurrentProperty({_id: null, name: ""});
    }
  };

  const removeImage = () => {
    setFileList([]);
    setImagePreview(null);
  };

  const onFinish = async (values) => {
    try {
      const expenseData = {
        title: values.title,
        type: values.categoryType,
        category: values.category,
        amount: values.amount,
        date:
          values.date?.format?.("YYYY-MM-DD") ||
          new Date().toISOString().split("T")[0],
        description: values.description || "",
        paymentMethod: "Cash",
        property: {
          id: values.propertyId || currentProperty?._id,
          name: currentProperty?.name || "",
        },
        billImage: fileList[0]?.originFileObj || undefined,
        actionPerformedBy: adminName || "",
        createdBy: user?.id || undefined,
        fromVoucher: true,
        voucherId,
      };

      // Add kitchen ID if it's a mess expense
      if (selectedCategory === "Mess" && values.kitchenId) {
        expenseData.kitchenId = values.kitchenId;
      }

      //   console.log("Submitting expense data:", expenseData);

      // Call the mutation
      addExpenseMutation.mutate(expenseData);
    } catch (error) {
      console.error("Error preparing expense data:", error);
      setIsSubmitting(false);
      message.error("Failed to prepare expense data");
    }
  };

  const handleClose = () => {
    // Reset form state
    form.resetFields();
    setFileList([]);
    setImagePreview(null);
    setShowAddCategory(false);
    setNewCategory("");
    setCurrentCategoryType("");
    setCurrentProperty(selectedProperty || {id: null, name: ""});
    setApiError("");
    setIsSubmitting(false);

    // Close modal
    onCancel();
  };

  const uploadProps = {
    beforeUpload: (file) => {
      const isImage = file.type.startsWith("image/");
      if (!isImage) {
        message.error("You can only upload image files!");
        return false;
      }
      return false;
    },
    fileList,
    onChange: handleFileChange,
    multiple: false,
  };

  // Format category type for display
  const getCategoryDisplayName = (type) => {
    const names = {
      pg: "PG",
      mess: "Mess",
      others: "Others",
    };
    return names[type] || type;
  };

  // Check if a property is selected
  const hasSelectedProperty = selectedProperty && selectedProperty.id;

  // Clean the property name by removing "Heavens Living - " prefix
  const cleanPropertyName =
    currentProperty?.name?.replace(/^Heavens Living -\s*/, "") || "";

  // Build modal title
  const getModalTitle = () => {
    let title = "Add New Expense";

    if (cleanPropertyName) {
      title += ` - ${cleanPropertyName}`;
    }

    if (currentCategoryType) {
      title += cleanPropertyName
        ? ` (${getCategoryDisplayName(currentCategoryType)})`
        : ` - ${getCategoryDisplayName(currentCategoryType)}`;
    }

    return title;
  };

  // Combined loading state for better UX
  const isLoading = isSubmitting || addExpenseMutation.isLoading;

  return (
    <>
      {contextHolder}
      <Modal
        title={
          <div style={{display: "flex", alignItems: "center", gap: 8}}>
            {getModalTitle()}
          </div>
        }
        open={visible}
        onCancel={handleClose}
        footer={null}
        width={700}
        centered
        maskClosable={false}
        closable={!isLoading}
        style={{pointerEvents: isLoading ? "none" : "auto"}}
      >
        <div style={{position: "relative"}}>
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            initialValues={{date: null}}
          >
            {/* Property Selection for Mess Category when no property is selected */}
            {selectedCategory === "Mess" && !hasSelectedProperty && (
              <Card size="small" style={{marginBottom: 16}}>
                <Form.Item
                  label="Select Property"
                  name="propertyId"
                  rules={[
                    {required: true, message: "Please select a property"},
                  ]}
                >
                  <Select
                    placeholder="Choose a property"
                    onChange={handlePropertyChange}
                    suffixIcon={<HomeOutlined />}
                    allowClear
                    disabled={isLoading}
                  >
                    {properties
                      .filter((property) => property._id !== null)
                      .map((property) => (
                        <Option key={property._id} value={property._id}>
                          {property.name}
                        </Option>
                      ))}
                  </Select>
                </Form.Item>
              </Card>
            )}

            {/* Kitchen Selection for Mess Category */}
            {selectedCategory === "Mess" && (
              <>
                {hasSelectedProperty && (
                  <Form.Item
                    name="propertyId"
                    initialValue={selectedProperty.id}
                    style={{display: "none"}}
                  >
                    <Input type="hidden" />
                  </Form.Item>
                )}

                <Card
                  size="small"
                  style={{marginBottom: 16}}
                  title="Select Kitchen"
                  extra={
                    <span style={{fontSize: "12px", color: "#888"}}>
                      Available kitchens for the chosen property
                    </span>
                  }
                >
                  <Form.Item
                    name="kitchenId"
                    rules={[
                      {required: true, message: "Please select a kitchen"},
                    ]}
                  >
                    <Select
                      placeholder="Choose a kitchen"
                      suffixIcon={<HomeOutlined />}
                      allowClear
                      disabled={
                        isLoading ||
                        (!hasSelectedProperty &&
                          !form.getFieldValue("propertyId"))
                      }
                    >
                      {kitchens?.map((kitchen) => (
                        <Option key={kitchen._id} value={kitchen._id}>
                          {kitchen.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Card>
              </>
            )}

            {/* Property Selection for Non-Mess Categories */}
            {selectedCategory !== "Mess" && (
              <>
                {!hasSelectedProperty && (
                  <Card size="small" style={{marginBottom: 16}}>
                    <Form.Item
                      label="Select Property"
                      name="propertyId"
                      rules={[
                        {required: true, message: "Please select a property"},
                      ]}
                    >
                      <Select
                        placeholder="Choose a property"
                        onChange={handlePropertyChange}
                        suffixIcon={<HomeOutlined />}
                        allowClear
                        disabled={isLoading}
                      >
                        {properties
                          .filter((property) => property._id !== null)
                          .map((property) => (
                            <Option key={property._id} value={property._id}>
                              {property.name}
                            </Option>
                          ))}
                      </Select>
                    </Form.Item>
                  </Card>
                )}

                {hasSelectedProperty && (
                  <Form.Item
                    name="propertyId"
                    initialValue={selectedProperty.id}
                    style={{display: "none"}}
                  >
                    <Input type="hidden" />
                  </Form.Item>
                )}
              </>
            )}

            {/* Category Type - Hidden */}
            <Form.Item name="categoryType" style={{display: "none"}}>
              <Input type="hidden" />
            </Form.Item>

            {/* Title and Category - Responsive row */}
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={24} md={12}>
                <Form.Item
                  name="title"
                  label="Expense Title"
                  rules={[
                    {required: true, message: "Please enter expense title"},
                  ]}
                >
                  <Input
                    placeholder="Enter expense title"
                    disabled={isLoading}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={12}>
                <Form.Item
                  name="category"
                  label="Category"
                  rules={[{required: true, message: "Please select category"}]}
                >
                  <Select
                    placeholder="Select or add category"
                    loading={
                      categoriesLoading || createCategoryMutation.isLoading
                    }
                    disabled={isLoading}
                    dropdownRender={(menu) => (
                      <div>
                        {menu}
                        <Divider style={{margin: "8px 0"}} />
                        <div style={{padding: "8px"}}>
                          {showAddCategory ? (
                            <Space.Compact style={{width: "100%"}}>
                              <Input
                                placeholder="Enter new category"
                                value={newCategory}
                                onChange={(e) => setNewCategory(e.target.value)}
                                onPressEnter={handleAddCategory}
                                disabled={
                                  createCategoryMutation.isLoading || isLoading
                                }
                                status={apiError ? "error" : ""}
                              />
                              <Button
                                type="primary"
                                onClick={handleAddCategory}
                                loading={createCategoryMutation.isLoading}
                                disabled={isLoading}
                              >
                                <FiPlus />
                              </Button>
                              <Button
                                onClick={() => {
                                  setShowAddCategory(false);
                                  setNewCategory("");
                                  setApiError("");
                                }}
                                disabled={
                                  createCategoryMutation.isLoading || isLoading
                                }
                              >
                                <FiX />
                              </Button>
                            </Space.Compact>
                          ) : (
                            <Button
                              type="dashed"
                              block
                              icon={<FiPlus />}
                              onClick={() => {
                                setShowAddCategory(true);
                                setApiError("");
                              }}
                              disabled={isLoading}
                            >
                              Add New Category
                            </Button>
                          )}

                          {apiError && (
                            <div
                              style={{
                                color: "#ff4d4f",
                                fontSize: "12px",
                                marginTop: "4px",
                                fontStyle: "italic",
                              }}
                            >
                              {apiError}
                            </div>
                          )}
                        </div>

                        {currentCategoryType && (
                          <div
                            style={{
                              padding: "8px",
                              borderTop: "1px solid #f0f0f0",
                            }}
                          >
                            <div
                              style={{
                                fontSize: "12px",
                                color: "#666",
                                marginBottom: "8px",
                              }}
                            >
                              Available categories:
                            </div>
                            <div
                              style={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: "4px",
                              }}
                            >
                              {currentCategories.length > 0 ? (
                                currentCategories.map((cat) => (
                                  <Tag
                                    key={cat}
                                    closable={!isLoading}
                                    onClose={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      handleDeleteCategory(
                                        currentCategoryType,
                                        cat
                                      );
                                    }}
                                    style={{marginBottom: "4px"}}
                                  >
                                    {cat}
                                  </Tag>
                                ))
                              ) : (
                                <div
                                  style={{
                                    fontSize: "12px",
                                    color: "#999",
                                    fontStyle: "italic",
                                  }}
                                >
                                  {categoriesLoading
                                    ? "Loading categories..."
                                    : "No categories found. Add a new one above."}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  >
                    {currentCategories.length > 0
                      ? currentCategories.map((category) => (
                          <Option key={category} value={category}>
                            {category}
                          </Option>
                        ))
                      : !categoriesLoading && (
                          <Option disabled value="no-categories">
                            No categories available
                          </Option>
                        )}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            {/* Amount */}
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={24} md={12}>
                <Form.Item
                  name="amount"
                  label="Amount"
                  rules={[{required: true, message: "Please enter amount"}]}
                >
                  <InputNumber
                    style={{width: "100%"}}
                    placeholder="Enter amount"
                    prefix="₹"
                    min={0}
                    step={100}
                    disabled={isLoading}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={12}>
                <Form.Item
                  name="date"
                  label="Date"
                  rules={[{required: true, message: "Please select date"}]}
                >
                  <DatePicker style={{width: "100%"}} disabled={isLoading} />
                </Form.Item>
              </Col>
            </Row>

            {/* Date and Description */}
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={24} md={24}>
                <Form.Item
                  name="description"
                  label="Description"
                  rules={[
                    {
                      required: false,
                      message: "Enter expense description (optional)",
                    },
                  ]}
                >
                  <Input
                    placeholder="Enter expense description (optional)"
                    disabled={isLoading}
                  />
                </Form.Item>
              </Col>
            </Row>

            {/* Image Upload */}
            <Row>
              <Col xs={24}>
                <Form.Item label="Receipt Image (Optional)">
                  <Upload {...uploadProps} disabled={isLoading}>
                    <Button icon={<FiUpload />} disabled={isLoading}>
                      Click to Upload Receipt
                    </Button>
                  </Upload>

                  {imagePreview && (
                    <Card
                      size="small"
                      style={{marginTop: "16px", maxWidth: 200}}
                      cover={
                        <div style={{position: "relative"}}>
                          <img
                            alt="receipt preview"
                            src={imagePreview}
                            style={{
                              width: "100%",
                              height: "150px",
                              objectFit: "cover",
                            }}
                          />
                          <Button
                            type="text"
                            danger
                            icon={<FiX />}
                            onClick={removeImage}
                            style={{position: "absolute", top: 4, right: 4}}
                            disabled={isLoading}
                          />
                        </div>
                      }
                    />
                  )}
                </Form.Item>
              </Col>
            </Row>

            {/* Actions */}
            <Row>
              <Col xs={24}>
                <Form.Item style={{marginBottom: 0, textAlign: "right"}}>
                  <Space>
                    <Button onClick={handleClose} disabled={isLoading}>
                      Cancel
                    </Button>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={isLoading}
                      disabled={isLoading}
                    >
                      {isLoading ? "Submitting..." : "Add Expense"}
                    </Button>
                  </Space>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </div>
      </Modal>
    </>
  );
};

export default AddExpenseFromVoucher;
