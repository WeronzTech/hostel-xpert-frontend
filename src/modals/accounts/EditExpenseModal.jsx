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
import {FiPlus, FiX, FiUpload, FiEdit} from "react-icons/fi";
import {useSelector} from "react-redux";
import {HomeOutlined} from "../../icons";
import {getKitchensForDropDown} from "../../hooks/inventory/useInventory";
import {useQuery, useMutation, useQueryClient} from "@tanstack/react-query";
import {
  addExpenseCategory,
  deleteCategory,
  getCategoryByMainCategory,
  getAllPettyCashes,
  updateExpense,
} from "../../hooks/accounts/useAccounts";
import moment from "moment";

const {Option} = Select;

const EditExpenseModal = ({visible, onCancel, expenseDoc}) => {
  const {properties, selectedProperty} = useSelector(
    (state) => state.properties,
  );
  console.log(expenseDoc);
  const {user} = useSelector((state) => state.auth);
  const adminName = user.name;

  const [form] = Form.useForm();

  const [newCategory, setNewCategory] = useState("");
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [handler, setHandler] = useState("");
  const [fileList, setFileList] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  const [currentCategoryType, setCurrentCategoryType] = useState("");
  const [currentProperty, setCurrentProperty] = useState(null);
  const [apiError, setApiError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingImageUrl, setExistingImageUrl] = useState("");

  const spentVia = Form.useWatch("spentVia", form);
  const selectedPaymentMethod = Form.useWatch("paymentMethod", form);

  const [messageApi, contextHolder] = message.useMessage();

  const queryClient = useQueryClient();

  // Fetch petty cash data
  const {data: pettyCashes = [], isLoading: pettyCashLoading} = useQuery({
    queryKey: ["pettyCashes", currentProperty?._id || selectedProperty?.id],
    queryFn: () =>
      getAllPettyCashes(currentProperty?._id || selectedProperty?.id),
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
    enabled: !!currentProperty?._id || !!selectedProperty?.id,
  });

  const paymentMethods = ["Cash", "UPI", "Bank Transfer", "Card", "Petty Cash"];

  // Fetch kitchens only for Mess expenses
  const {data: kitchens} = useQuery({
    queryKey: ["kitchens", expenseDoc?.property?.id || currentProperty?._id],
    queryFn: ({queryKey}) => {
      const [, propertyId] = queryKey;
      return getKitchensForDropDown(propertyId);
    },
    enabled: visible && expenseDoc?.type === "Mess",
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
          content: `${data.message}`,
          duration: 3,
        });
      }
    },
    onError: (error) => {
      message.error("Failed to delete category: " + error.message);
    },
  });

  // Update Expense Mutation
  const updateExpenseMutation = useMutation({
    mutationFn: (data) => updateExpense({expenseId: expenseDoc._id, ...data}),
    onMutate: () => {
      setIsSubmitting(true);
      setApiError("");
    },
    onSuccess: (data) => {
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
        message.error(data.message || "Failed to update expense");
        setApiError(data.message);
      }
    },
    onError: (error) => {
      console.error("Update expense error:", error);
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
        cat.mainCategory === categoryType,
    );

    if (categoryToDeleteObj) {
      deleteCategoryMutation.mutate(categoryToDeleteObj._id);
    } else {
      message.success("Category deleted successfully");
    }
  };

  // Load expense data into form when modal opens or expenseDoc changes
  useEffect(() => {
    if (expenseDoc && visible) {
      // Reset form first
      form.resetFields();

      // Set current category type
      setCurrentCategoryType(expenseDoc.type);

      // Find and set current property
      if (expenseDoc.property?.id) {
        const property = properties.find(
          (p) => p._id === expenseDoc.property.id,
        );
        setCurrentProperty(property);
      }

      // Set payment method
      setPaymentMethod(expenseDoc.paymentMethod);

      // Set handler if exists
      if (expenseDoc.handledBy) {
        setHandler(expenseDoc.handledBy);
      }

      // Set existing image if exists
      if (expenseDoc.billImage) {
        setExistingImageUrl(expenseDoc.billImage);
        setImagePreview(expenseDoc.billImage);
      }

      // Prepare form values
      const formValues = {
        title: expenseDoc.title,
        categoryType: expenseDoc.type,
        category: expenseDoc.category,
        amount: expenseDoc.amount,
        date: expenseDoc.date ? moment(expenseDoc.date) : null,
        description: expenseDoc.description || "",
        paymentMethod: expenseDoc.paymentMethod,
        transactionId: expenseDoc.transactionId || undefined,
        propertyId: expenseDoc.property?.id || undefined,
        handler: expenseDoc.handledBy || undefined,
        spentVia: expenseDoc.pettyCashType || undefined,
        kitchenId: expenseDoc.kitchenId || undefined,
      };

      // Set form values
      form.setFieldsValue(formValues);
    }
  }, [expenseDoc, form, properties, visible]);

  const handlePaymentMethodChange = (value) => {
    setPaymentMethod(value);
    if (value !== "Petty Cash") {
      setHandler("");
      form.setFieldsValue({handler: undefined, spentVia: undefined});
    } else {
      form.setFieldsValue({spentVia: undefined});
    }
  };

  const handleHandlerChange = (value) => {
    setHandler(value);
    const selectedHandler = pettyCashes.find((h) => h.manager === value);
    if (selectedHandler) {
      message.info(
        `Available - In-hand: ₹${
          selectedHandler.inHandAmount ?? 0
        }, In-account: ₹${selectedHandler.inAccountAmount ?? 0}`,
      );
    }
  };

  const compressImage = (file, options = {}) => {
    const {maxWidth = 1280, maxHeight = 1280, quality = 0.7} = options;

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      const img = new Image();

      reader.onload = (e) => {
        img.src = e.target.result;
      };

      reader.onerror = reject;
      reader.readAsDataURL(file);

      img.onload = () => {
        let {width, height} = img;

        const ratio = Math.min(maxWidth / width, maxHeight / height, 1);

        width *= ratio;
        height *= ratio;

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Compression failed"));
              return;
            }

            resolve(
              new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              }),
            );
          },
          file.type,
          quality,
        );
      };

      img.onerror = reject;
    });
  };

  const handleFileChange = async ({fileList: newFileList}) => {
    if (!newFileList.length) {
      setFileList([]);
      setImagePreview(null);
      setExistingImageUrl("");
      return;
    }

    const fileObj = newFileList[0].originFileObj;
    if (!fileObj) return;

    try {
      // Compress image
      const compressedFile = await compressImage(fileObj, {
        maxWidth: 1280,
        maxHeight: 1280,
        quality: 0.7,
      });

      // Replace file in fileList
      const updatedFileList = [
        {
          ...newFileList[0],
          originFileObj: compressedFile,
          size: compressedFile.size,
          type: compressedFile.type,
        },
      ];

      setFileList(updatedFileList);

      // Preview compressed image
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(compressedFile);
      setExistingImageUrl("");
    } catch (err) {
      message.error("Image compression failed");
    }
  };

  const handlePropertyChange = (propertyId) => {
    if (propertyId) {
      const property = properties.find((p) => p._id === propertyId);
      setCurrentProperty(property);
      setHandler("");
      form.setFieldsValue({handler: undefined});
      form.setFieldsValue({kitchenId: undefined});
    } else {
      setCurrentProperty({_id: null, name: ""});
    }
  };

  const removeImage = () => {
    setFileList([]);
    setImagePreview(null);
    setExistingImageUrl("");
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
        paymentMethod: values.paymentMethod,
        transactionId: values.transactionId || undefined,
        property: {
          id: values.propertyId || currentProperty?._id,
          name: currentProperty?.name || "",
        },
        handledBy: values.handler || undefined,
        pettyCashType: values.spentVia || undefined,
        actionPerformedBy: adminName || "",
        updatedBy: user?.id || undefined,
      };

      // Add bill image if new file uploaded
      if (fileList[0]?.originFileObj) {
        expenseData.billImage = fileList[0].originFileObj;
      } else if (!existingImageUrl && expenseDoc.billImage) {
        // If removing existing image
        expenseData.billImage = null;
      }

      // Add kitchen ID if it's a mess expense
      if (values.categoryType === "Mess" && values.kitchenId) {
        expenseData.kitchenId = values.kitchenId;
      }

      console.log("Updating expense data:", expenseData);

      // Call the mutation
      updateExpenseMutation.mutate(expenseData);
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
    setExistingImageUrl("");
    setPaymentMethod("");
    setHandler("");
    setShowAddCategory(false);
    setNewCategory("");
    setCurrentCategoryType("");
    setCurrentProperty(null);
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
      PG: "PG",
      Mess: "Mess",
      Others: "Others",
    };
    return names[type] || type;
  };

  // Clean the property name by removing "Heavens Living - " prefix
  const cleanPropertyName =
    currentProperty?.name?.replace(/^Heavens Living -\s*/, "") ||
    expenseDoc?.property?.name?.replace(/^Heavens Living -\s*/, "") ||
    "";

  // Build modal title
  const getModalTitle = () => {
    let title = "Edit Expense";

    if (expenseDoc?.title) {
      title += ` - ${expenseDoc.title}`;
    }

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

  // Combined loading state
  const isLoading = isSubmitting || updateExpenseMutation.isLoading;

  // If no expense data provided, show nothing
  if (!expenseDoc && visible) {
    return (
      <Modal
        title="Edit Expense"
        open={visible}
        onCancel={handleClose}
        footer={null}
        width={700}
        centered
      >
        <div style={{textAlign: "center", padding: "40px"}}>
          No expense data provided.
        </div>
      </Modal>
    );
  }

  return (
    <>
      {contextHolder}
      <Modal
        title={
          <div style={{display: "flex", alignItems: "center", gap: 8}}>
            <FiEdit />
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
          <Form form={form} layout="vertical" onFinish={onFinish}>
            {/* Property Selection for Mess Category */}
            {expenseDoc?.type === "Mess" && (
              <>
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
                      disabled={isLoading || !form.getFieldValue("propertyId")}
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
            {expenseDoc?.type !== "Mess" && (
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
                                        cat,
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

            {/* Amount and Payment Method */}
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={24} md={12}>
                <Form.Item
                  name="paymentMethod"
                  label="Payment Method"
                  rules={[
                    {required: true, message: "Please select payment method"},
                  ]}
                >
                  <Select
                    placeholder="Select payment method"
                    onChange={handlePaymentMethodChange}
                    disabled={isLoading}
                  >
                    {paymentMethods.map((method) => (
                      <Option key={method} value={method}>
                        {method}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

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
            </Row>

            {/* Handler Selection (for Petty Cash) */}
            {paymentMethod === "Petty Cash" && (
              <Row>
                <Col xs={24}>
                  <Form.Item
                    name="handler"
                    label="Select Handler"
                    rules={[{required: true, message: "Please select handler"}]}
                  >
                    <Select
                      placeholder="Select handler"
                      onChange={handleHandlerChange}
                      loading={pettyCashLoading}
                      allowClear
                      disabled={isLoading}
                    >
                      {pettyCashes.map((handlerItem) => (
                        <Option
                          key={handlerItem.manager}
                          value={handlerItem.manager}
                        >
                          {handlerItem.managerName}
                          (In-hand: ₹{handlerItem.inHandAmount ?? 0},
                          In-account: ₹{handlerItem.inAccountAmount ?? 0})
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            )}

            {/* Spent Via (for Petty Cash) */}
            {paymentMethod === "Petty Cash" && handler && (
              <Row>
                <Col xs={24}>
                  <Form.Item
                    name="spentVia"
                    label="Spent Via"
                    rules={[
                      {
                        required: true,
                        message: "Please select spent via method",
                      },
                    ]}
                  >
                    <Select
                      placeholder="Select spent via method"
                      disabled={isLoading}
                      onChange={() => {
                        // Force re-render to show/hide transaction ID field
                        form.setFieldsValue({transactionId: undefined});
                      }}
                    >
                      <Option value="inHand">Cash (inHand)</Option>
                      <Option value="inAccount">UPI (inAccount)</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            )}

            {/* Transaction ID - Fixed condition */}
            {(selectedPaymentMethod === "UPI" ||
              selectedPaymentMethod === "Bank Transfer" ||
              (selectedPaymentMethod === "Petty Cash" &&
                spentVia === "inAccount")) && (
              <Row>
                <Col xs={24}>
                  <Form.Item
                    name="transactionId"
                    label="Transaction ID"
                    rules={[
                      {required: true, message: "Please enter transaction ID"},
                    ]}
                  >
                    <Input
                      placeholder="Enter transaction ID"
                      disabled={isLoading}
                    />
                  </Form.Item>
                </Col>
              </Row>
            )}

            {/* Date and Description */}
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={24} md={12}>
                <Form.Item
                  name="date"
                  label="Date"
                  rules={[{required: true, message: "Please select date"}]}
                >
                  <DatePicker style={{width: "100%"}} disabled={isLoading} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={12}>
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
                <Form.Item label="Receipt Image">
                  <Upload {...uploadProps} disabled={isLoading}>
                    <Button icon={<FiUpload />} disabled={isLoading}>
                      {existingImageUrl ? "Change Receipt" : "Upload Receipt"}
                    </Button>
                  </Upload>

                  {(imagePreview || existingImageUrl) && (
                    <Card
                      size="small"
                      style={{marginTop: "16px", maxWidth: 200}}
                      cover={
                        <div style={{position: "relative"}}>
                          <img
                            alt="receipt preview"
                            src={imagePreview || existingImageUrl}
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
                      extra={
                        <div style={{fontSize: "12px", color: "#666"}}>
                          {existingImageUrl ? "Existing image" : "New image"}
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
                      {isLoading ? "Updating..." : "Update Expense"}
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

export default EditExpenseModal;
