import {useState, useEffect} from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  Upload,
  Button,
  message,
  Row,
  Col,
  Card,
  Divider,
  Space,
  Typography,
} from "antd";
import {
  UploadOutlined,
  PictureOutlined,
  VideoCameraOutlined,
} from "@ant-design/icons";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {addCommonMediaContent} from "../../hooks/property/useWebsite";

const {Option} = Select;
const {Text} = Typography;

const CommonMediaForm = ({visible, onClose, onSuccess, category = null}) => {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const [fileList, setFileList] = useState([]);
  const [mediaTitles, setMediaTitles] = useState([]);
  const [mediaKeys, setMediaKeys] = useState([]);
  const [mediaTypes, setMediaTypes] = useState([]);
  const [uploading, setUploading] = useState(false);

  const [messageApi, contextHolder] = message.useMessage();

  // Reset form when modal opens/closes
  useEffect(() => {
    if (visible) {
      form.resetFields();
      setFileList([]);
      setMediaTitles([]);
      setMediaKeys([]);
      setMediaTypes([]);

      if (category) {
        form.setFieldsValue({category});
      }
    }
  }, [visible, form, category]);

  // Mutation for adding common media
  const mutation = useMutation({
    mutationFn: (formData) => addCommonMediaContent(formData),
    onSuccess: (data) => {
      messageApi.success({
        content: `${data.message}`,
        duration: 3,
      });
      queryClient.invalidateQueries(["common-media"]);
      onSuccess?.();
      onClose();
    },
    onError: (error) => {
      messageApi.error({
        content: `${error.message}`,
        duration: 3,
      });
    },
  });

  const handleSubmit = async (values) => {
    if (fileList.length === 0) {
      message.warning("Please upload at least one media file");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();

      // Add category
      formData.append("category", values.category);

      // Add files - extract actual file objects from Upload component
      fileList.forEach((file) => {
        // The actual file is in originFileObj
        const actualFile = file.originFileObj || file;
        formData.append("media", actualFile);
      });

      // Add media titles as array - append ALL titles
      mediaTitles.forEach((title, index) => {
        // Use empty string if title is undefined/null
        formData.append("mediaTitles", title || "");
      });

      // Add media keys as array - append ALL keys
      mediaKeys.forEach((key, index) => {
        // Use empty string if key is undefined/null
        formData.append("mediaKeys", key || "");
      });

      // Add media types as array - append ALL types
      mediaTypes.forEach((type, index) => {
        // Use file type as fallback
        const finalType =
          type ||
          (fileList[index]?.type?.startsWith("video/") ? "video" : "image");
        formData.append("mediaTypes", finalType);
      });

      await mutation.mutateAsync(formData);
    } catch (error) {
      console.error("Submission error:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = ({fileList: newFileList}) => {
    // Only allow images and videos
    const filteredFileList = newFileList.filter((file) => {
      const isImage = file.type?.startsWith("image/");
      const isVideo = file.type?.startsWith("video/");
      return isImage || isVideo;
    });

    setFileList(filteredFileList);

    // Initialize titles, keys and types for new files
    const newTitles = [...mediaTitles];
    const newKeys = [...mediaKeys];
    const newTypes = [...mediaTypes];

    filteredFileList.forEach((file, index) => {
      // Only initialize if not already set (to preserve user input when reordering)
      if (newTitles[index] === undefined && file.name) {
        // Remove extension from filename for default title
        newTitles[index] = file.name.replace(/\.[^/.]+$/, "");
      }
      if (newKeys[index] === undefined) {
        newKeys[index] = ""; // Initialize with empty string
      }
      if (newTypes[index] === undefined) {
        newTypes[index] = file.type?.startsWith("video/") ? "video" : "image";
      }
    });

    // Trim arrays to match fileList length
    setMediaTitles(newTitles.slice(0, filteredFileList.length));
    setMediaKeys(newKeys.slice(0, filteredFileList.length));
    setMediaTypes(newTypes.slice(0, filteredFileList.length));
  };

  const handleTitleChange = (index, value) => {
    const newTitles = [...mediaTitles];
    newTitles[index] = value;
    setMediaTitles(newTitles);
  };

  const handleKeyChange = (index, value) => {
    const newKeys = [...mediaKeys];
    newKeys[index] = value;
    setMediaKeys(newKeys);
  };

  const handleTypeChange = (index, value) => {
    const newTypes = [...mediaTypes];
    newTypes[index] = value;
    setMediaTypes(newTypes);
  };

  const beforeUpload = (file) => {
    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");

    if (!isImage && !isVideo) {
      message.error("You can only upload image or video files!");
      return Upload.LIST_IGNORE;
    }

    // Check file size (10MB for images, 100MB for videos)
    const isLtSize = isImage
      ? file.size / 1024 / 1024 < 10
      : file.size / 1024 / 1024 < 100;
    if (!isLtSize) {
      message.error(`File must be smaller than ${isImage ? "10MB" : "100MB"}!`);
      return Upload.LIST_IGNORE;
    }

    return false; // Return false to prevent automatic upload
  };

  const getFileTypeIcon = (fileType) => {
    return fileType?.startsWith("video/") ? (
      <VideoCameraOutlined className="text-red-500" />
    ) : (
      <PictureOutlined className="text-blue-500" />
    );
  };

  const getFileTypeFromMediaTypes = (index) => {
    return (
      mediaTypes[index] ||
      (fileList[index]?.type?.startsWith("video/") ? "video" : "image")
    );
  };

  const categoryOptions = [
    {value: "homePage", label: "Home Page"},
    {value: "mobileApp", label: "Mobile App"},
    {value: "gallery", label: "Gallery"},
    {value: "other", label: "Other"},
  ];

  return (
    <>
      {contextHolder}
      <Modal
        title={category ? `Edit ${category} Media` : "Add Common Media"}
        open={visible}
        onCancel={onClose}
        footer={null}
        width={800}
        style={{top: 20}}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            category: category || "homePage",
          }}
        >
          {/* Category Selection */}
          <Form.Item
            name="category"
            label="Category"
            rules={[{required: true, message: "Please select a category"}]}
          >
            <Select placeholder="Select category" disabled={!!category}>
              {categoryOptions.map((option) => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Divider>Media Upload</Divider>

          {/* File Upload */}
          <Form.Item label="Upload Media">
            <Upload
              listType="picture"
              fileList={fileList}
              onChange={handleFileChange}
              beforeUpload={beforeUpload}
              multiple
              accept="image/*,video/*"
              showUploadList={{
                showRemoveIcon: true,
              }}
            >
              <Button icon={<UploadOutlined />} size="large" block>
                Click to Upload Images/Videos
              </Button>
            </Upload>
            <Text type="secondary" className="text-xs block mt-2">
              formats: Images (JPEG, PNG, WebP) and Videos (MP4, MOV, AVI). Max
              size: 10MB for images, 100MB for videos.
            </Text>
          </Form.Item>

          {/* Media Details */}
          {fileList.length > 0 && (
            <Card
              title={`Media Details (${fileList.length} files)`}
              size="small"
              className="mt-4"
            >
              <Space direction="vertical" size="middle" style={{width: "100%"}}>
                {fileList.map((file, index) => (
                  <Card
                    key={file.uid}
                    size="small"
                    type="inner"
                    className="border-l-4 border-l-blue-200"
                  >
                    <Row gutter={[16, 8]} align="middle" className="mb-2">
                      <Col span={22}>
                        <Text strong className="block truncate">
                          {file.name}
                        </Text>
                      </Col>
                    </Row>

                    <Row gutter={[16, 8]}>
                      {/* 🖊 Title Field */}
                      <Col xs={24} sm={12} md={8}>
                        <Form.Item label="Title" className="mb-2">
                          <Input
                            placeholder="Enter title"
                            onChange={(e) =>
                              handleTitleChange(index, e.target.value)
                            }
                            size="small"
                          />
                        </Form.Item>
                      </Col>

                      {/* 🧩 Key Field */}
                      <Col xs={24} sm={12} md={8}>
                        <Form.Item label="Key" className="mb-2">
                          <Input
                            placeholder="Enter key"
                            onChange={(e) =>
                              handleKeyChange(index, e.target.value)
                            }
                            size="small"
                          />
                        </Form.Item>
                      </Col>

                      {/* 🎞 Media Type Dropdown */}
                      <Col xs={24} sm={12} md={8}>
                        <Form.Item label="Media Type" className="mb-2">
                          <Select
                            value={getFileTypeFromMediaTypes(index)}
                            onChange={(value) => handleTypeChange(index, value)}
                            size="small"
                            style={{width: "100%"}}
                          >
                            <Option value="image">Image</Option>
                            <Option value="video">Video</Option>
                          </Select>
                        </Form.Item>
                      </Col>
                    </Row>
                  </Card>
                ))}
              </Space>
            </Card>
          )}

          {/* Submit Buttons */}
          <Form.Item className="mt-6 mb-0">
            <Space
              size="middle"
              style={{width: "100%", justifyContent: "flex-end"}}
            >
              <Button onClick={onClose} disabled={uploading}>
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={uploading}
                disabled={fileList.length === 0}
                icon={<UploadOutlined />}
              >
                {uploading ? "Uploading..." : "Upload Media"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default CommonMediaForm;
