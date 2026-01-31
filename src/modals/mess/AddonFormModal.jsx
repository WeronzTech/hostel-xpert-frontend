/* eslint-disable no-unused-vars */
import {useEffect, useMemo, useState} from "react";
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  message,
  Row,
  Col,
  Rate,
  Switch,
  Upload,
  Image,
} from "antd";
import {UploadOutlined} from "../../icons/index.js";
import {useQuery} from "@tanstack/react-query";
import {getAllRecipe} from "../../hooks/inventory/useInventory.js";

const mealTypes = ["Breakfast", "Lunch", "Snacks", "Dinner"];
const categories = ["Beverages", "Snacks", "Others"];

const AddonFormModal = ({
  visible,
  onClose,
  onSubmit,
  isSubmitting,
  initialValues,
  kitchenId,
}) => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState("");

  // console.log(`Kitchen ID from the addon form modal: `, kitchenId); // debug log

  // Fetch all addons for the dropdown using tanstack query
  const {data: recipeData, isLoading: recipesLoading} = useQuery({
    queryFn: () => getAllRecipe({kitchenId: kitchenId}),
    enabled: !!kitchenId,
    staleTime: Infinity,
  });

  // console.log(`Fetch all recipes for the kitchen: `, recipeData); // debug log
  // console.log(`Fetch all recipes for the kitchen: `, initialValues); // debug log

  // useEffect to populate form for editing
  useEffect(() => {
    // Only proceed if the modal is visible
    if (visible) {
      if (initialValues && recipeData) {
        // 1. Set all form fields from the initialValues prop
        form.setFieldsValue(initialValues);

        // 2. Set the image for the Upload component from the URL
        if (initialValues.itemImage) {
          setFileList([
            {
              uid: initialValues._id || "-1", // Use a unique ID
              name: "image.png",
              status: "done",
              url: initialValues.itemImage,
            },
          ]);
        } else {
          setFileList([]);
        }
      } else if (!initialValues) {
        // 3. If creating a new item, ensure the form and file list are empty
        form.resetFields();
        setFileList([]);
      }
    }
    // Wait for recipeData to be loaded before setting form values
  }, [initialValues, form, visible, recipeData]);

  // Format recipes for the Select component's `options` prop
  const recipeOptions = useMemo(() => {
    if (!recipeData) return [];
    return recipeData.map((recipe) => ({
      label: recipe.name,
      value: recipe._id,
    }));
  }, [recipeData]);

  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(file.originFileObj);
      });
    }
    setPreviewImage(file.url || file.preview);
    setPreviewVisible(true);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();

      if (fileList.length === 0) {
        message.error("Please upload an image.");
        return;
      }

      const file = fileList[0];
      const imageFile = file.originFileObj || file.url || null;

      if (!imageFile) {
        message.error("Invalid image file.");
        return;
      }

      // Clean up: remove keys with null, undefined, or empty string
      const cleanedValues = Object.fromEntries(
        Object.entries(values).map(([key, v]) => [
          key,
          v === undefined || v === "" ? null : v,
        ])
      );

      console.log("Form Data Submitted:", {...cleanedValues, imageFile}); // debug log

      // Pass both form values and the image file to the parent
      onSubmit({...cleanedValues, imageFile});

      // Reset state and fields correctly
      form.resetFields();
      setFileList([]);
      onClose();
    } catch (errorInfo) {
      // console.log("Validation Failed:", errorInfo);
      message.error("Please fill all required fields correctly.");
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setFileList([]);
    onClose();
  };

  return (
    <Modal
      open={visible}
      title={initialValues ? "Edit Addon" : "Add New Addon"}
      onOk={handleOk}
      onCancel={handleCancel}
      okText={initialValues ? "Edit" : "Add"}
      width={650}
      confirmLoading={isSubmitting}
      preserve={false}
      styles={{
        body: {
          maxHeight: "70vh",
          overflowY: "auto",
          paddingRight: 8,
        },
      }}
    >
      <Form form={form} layout="vertical" initialValues={{isAvailable: true}}>
        {/* Item Name */}
        <Form.Item
          label="Item Name"
          name="itemName"
          rules={[{required: true, message: "Please enter item name"}]}
        >
          <Input placeholder="e.g. Samosa" />
        </Form.Item>

        {/* Description */}
        <Form.Item
          label="Item Description"
          name="itemDescription"
          rules={[{required: true, message: "Please enter item description"}]}
        >
          <Input.TextArea rows={2} placeholder="Enter description" allowClear />
        </Form.Item>

        {/* Meal Type / Price / Discounted Price */}
        <Row gutter={16}>
          <Col span={10}>
            <Form.Item
              label="Meal Type"
              name="mealType"
              rules={[
                {required: true, message: "Select at least one meal type"},
              ]}
            >
              <Select
                mode="multiple"
                options={mealTypes.map((type) => ({
                  label: type,
                  value: type,
                }))}
                placeholder="Select meal type(s)"
              />
            </Form.Item>
          </Col>
          <Col span={7}>
            <Form.Item
              label="MRP (₹)"
              name="price"
              rules={[{required: true, message: "Please enter price"}]}
            >
              <InputNumber
                min={1}
                style={{width: "100%"}}
                placeholder="e.g. 20"
              />
            </Form.Item>
          </Col>
          <Col span={7}>
            <Form.Item label="Selling Price (₹)" name="discountedPrice">
              <InputNumber
                min={0}
                style={{width: "100%"}}
                placeholder="price"
                rules={[{required: true, message: "Please select a category"}]}
              />
            </Form.Item>
          </Col>
        </Row>

        {/* Category / Tag / Recipe */}
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              label="Category"
              name="category"
              rules={[{required: true, message: "Please select a category"}]}
            >
              <Select
                options={categories.map((cat) => ({label: cat, value: cat}))}
                placeholder="Select category"
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Tag" name="tag">
              <Input placeholder="e.g. Summer Special" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="Recipe"
              name="itemId"
              rules={[{required: true, message: "Please select a recipe"}]}
            >
              <Select
                loading={recipesLoading}
                options={recipeOptions}
                placeholder="Select recipe"
                showSearch
                filterOption={(input, option) =>
                  option?.label?.toLowerCase().includes(input.toLowerCase())
                }
              />
            </Form.Item>
          </Col>
        </Row>

        {/* Rating / Availability */}
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Rating" name="rating">
              <Rate count={5} allowHalf />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Availability"
              name="isAvailable"
              valuePropName="checked"
            >
              <Switch
                checkedChildren="Available"
                unCheckedChildren="Unavailable"
              />
            </Form.Item>
          </Col>
        </Row>

        {/* Image Upload */}
        <Form.Item
          label="Upload Image"
          name="itemImage"
          rules={[
            {
              validator: (_, value) =>
                fileList.length > 0
                  ? Promise.resolve()
                  : Promise.reject(new Error("Please upload an image")),
            },
          ]}
        >
          <Upload
            onChange={({fileList: newFileList}) => setFileList(newFileList)}
            beforeUpload={() => false}
            accept="image/*"
            listType="picture-card"
            maxCount={1}
            onPreview={handlePreview}
            fileList={fileList}
          >
            {fileList.length >= 1 ? null : (
              <div>
                <UploadOutlined />
                <div style={{marginTop: 8}}>Upload</div>
              </div>
            )}
          </Upload>
        </Form.Item>
      </Form>

      {/* AntD Image preview modal */}
      {previewImage && (
        <Image
          wrapperStyle={{display: "none"}}
          src={previewImage}
          preview={{
            visible: previewVisible,
            src: previewImage,
            onVisibleChange: (vis) => setPreviewVisible(vis),
          }}
        />
      )}
    </Modal>
  );
};

export default AddonFormModal;
